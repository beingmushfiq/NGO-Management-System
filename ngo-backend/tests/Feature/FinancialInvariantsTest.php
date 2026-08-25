<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Collection;
use App\Models\Customer;
use App\Models\Loan;
use App\Models\LoanInstallment;
use App\Models\SavingsAccount;
use App\Models\SavingsTransaction;
use App\Models\User;
use App\Services\LoanBalanceService;
use App\Services\LoanScheduleGenerator;
use App\Services\ProcessCollectionService;
use App\Services\SavingsBalanceService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\TestCase;

class FinancialInvariantsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $staff;
    protected Branch $branch;
    protected Customer $customer;
    protected SavingsAccount $savingsAccount;
    protected Loan $loan;
    protected ProcessCollectionService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(ProcessCollectionService::class);

        $this->branch = Branch::create([
            'code'    => 'BR-TEST',
            'name'    => 'Test Branch',
            'address' => 'Test Address',
            'phone'   => '01700000000',
            'status'  => 'active',
        ]);

        $this->admin = User::create([
            'name'       => 'Admin User',
            'email'      => 'admin@test.com',
            'phone'      => '01711000001',
            'password'   => bcrypt('password'),
            'branch_id'  => $this->branch->id,
            'role'       => 'admin',
            'status'     => 'active',
        ]);

        $this->staff = User::create([
            'name'       => 'Field Officer',
            'email'      => 'staff@test.com',
            'phone'      => '01711000002',
            'password'   => bcrypt('password'),
            'branch_id'  => $this->branch->id,
            'role'       => 'staff',
            'status'     => 'active',
        ]);

        $this->customer = Customer::create([
            'customer_code' => 'CUS-TEST-01',
            'name'          => 'Test Borrower',
            'phone'         => '01711999999',
            'nid'           => '1234567890123',
            'address'       => 'Test Village',
            'branch_id'     => $this->branch->id,
            'staff_id'      => $this->staff->id,
            'status'        => 'active',
        ]);

        $this->savingsAccount = SavingsAccount::create([
            'customer_id'          => $this->customer->id,
            'branch_id'            => $this->branch->id,
            'account_number'       => 'SAV-TEST-01',
            'cached_balance'       => '5000.00',
            'monthly_contribution' => '800.00',
            'status'               => 'active',
        ]);

        SavingsTransaction::create([
            'savings_account_id' => $this->savingsAccount->id,
            'type'               => 'deposit',
            'amount'             => '5000.00',
            'balance_before'     => '0.00',
            'balance_after'      => '5000.00',
            'reference_type'     => 'opening',
            'transaction_date'   => Carbon::now('Asia/Dhaka')->format('Y-m-d'),
            'created_by'         => $this->staff->id,
        ]);

        // Create 50-week loan: Principal = 50,000, Service Charge (10%) = 5,000, Total Payable = 55,000, Installment = 1,100
        $this->loan = Loan::create([
            'loan_number'            => 'LN-TEST-01',
            'customer_id'            => $this->customer->id,
            'branch_id'              => $this->branch->id,
            'staff_id'               => $this->staff->id,
            'principal_amount'       => '50000.00',
            'service_charge_amount'  => '5000.00',
            'total_payable_amount'   => '55000.00',
            'installment_amount'     => '1100.00',
            'number_of_installments' => 50,
            'frequency'              => 'weekly',
            'start_date'             => Carbon::now('Asia/Dhaka')->format('Y-m-d'),
            'end_date'               => Carbon::now('Asia/Dhaka')->addWeeks(50)->format('Y-m-d'),
            'disbursed_at'           => Carbon::now('Asia/Dhaka'),
            'cached_outstanding'     => '55000.00',
            'cached_total_paid'      => '0.00',
            'status'                 => 'active',
            'created_by'             => $this->admin->id,
        ]);

        LoanScheduleGenerator::generate($this->loan);
    }

    /**
     * FI-01: Loan Outstanding Invariant
     * Total Outstanding = Total Payable - Sum(Loan Allocations)
     */
    public function test_fi_01_loan_outstanding_matches_sum_of_allocations(): void
    {
        $installment = $this->loan->installments()->first();

        $this->service->execute([
            'customer_id'     => $this->customer->id,
            'loan_id'         => $this->loan->id,
            'installment_id'  => $installment->id,
            'loan_amount'     => '1100.00',
            'savings_amount'  => '200.00',
            'payment_method'  => 'cash',
            'idempotency_key' => 'FI01-TEST-1',
        ], $this->staff);

        $this->loan->refresh();

        $derivedOutstanding = LoanBalanceService::getOutstanding($this->loan);
        $this->assertEquals('53900.00', $derivedOutstanding);
        $this->assertEquals('53900.00', (string) $this->loan->cached_outstanding);
        $this->assertEquals('1100.00', (string) $this->loan->cached_total_paid);
    }

    /**
     * FI-02: Savings Balance Non-Negative Invariant
     * Savings balance must never be negative, and withdrawals cannot exceed balance.
     */
    public function test_fi_02_savings_withdrawal_cannot_exceed_available_balance(): void
    {
        $response = $this->actingAs($this->staff)->postJson("/api/v1/savings/{$this->savingsAccount->id}/withdraw", [
            'amount' => 6000.00, // available is 5000
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'code'    => 'INSUFFICIENT_SAVINGS_BALANCE',
            ]);

        $this->savingsAccount->refresh();
        $this->assertEquals('5000.00', (string) $this->savingsAccount->cached_balance);
    }

    /**
     * FI-03: Collection Allocation Sum Invariant
     * Total Amount = Loan Allocation + Savings Allocation
     */
    public function test_fi_03_collection_total_matches_sum_of_allocations(): void
    {
        $installment = $this->loan->installments()->first();

        $collection = $this->service->execute([
            'customer_id'     => $this->customer->id,
            'loan_id'         => $this->loan->id,
            'installment_id'  => $installment->id,
            'loan_amount'     => '1100.00',
            'savings_amount'  => '350.00',
            'payment_method'  => 'cash',
            'idempotency_key' => 'FI03-TEST-1',
        ], $this->staff);

        $allocSum = number_format((float) $collection->allocations->sum('amount'), 2, '.', '');
        $this->assertEquals('1450.00', (string) $collection->total_amount);
        $this->assertEquals('1450.00', $allocSum);
    }

    /**
     * FI-04: Loan Total Payable Formula Invariant
     * Total Payable = Principal + Service Charge
     */
    public function test_fi_04_loan_total_payable_formula(): void
    {
        $expectedPayable = bcadd((string) $this->loan->principal_amount, (string) $this->loan->service_charge_amount, 2);
        $this->assertEquals((string) $this->loan->total_payable_amount, $expectedPayable);
    }

    /**
     * FI-05: Weekly Installment Calculation Invariant
     * Sum of installment expected amounts must equal total payable amount.
     */
    public function test_fi_05_installment_schedule_sums_to_total_payable(): void
    {
        $sum = $this->loan->installments()->sum('expected_amount');
        $this->assertEquals((string) $this->loan->total_payable_amount, number_format((float) $sum, 2, '.', ''));
    }

    /**
     * FI-06: Partial Installment Repayment Support
     * When paying less than scheduled, status becomes 'partial', remaining remains on same installment.
     */
    public function test_fi_06_partial_installment_payment_sets_partial_status(): void
    {
        $installment = $this->loan->installments()->first(); // expected 1100

        $this->service->execute([
            'customer_id'     => $this->customer->id,
            'loan_id'         => $this->loan->id,
            'installment_id'  => $installment->id,
            'loan_amount'     => '500.00',
            'savings_amount'  => '0.00',
            'payment_method'  => 'cash',
            'idempotency_key' => 'FI06-TEST-PARTIAL',
        ], $this->staff);

        $installment->refresh();
        $this->assertEquals('partial', $installment->status);
        $this->assertEquals('500.00', $installment->paid_amount);
        $this->assertEquals('600.00', $installment->remaining_amount);
    }

    /**
     * FI-08: Offline / Network Retry Idempotency
     * Submitting duplicate idempotency_key returns existing receipt without double write.
     */
    public function test_fi_08_idempotency_key_prevents_duplicate_collections(): void
    {
        $installment = $this->loan->installments()->first();

        $first = $this->service->execute([
            'customer_id'     => $this->customer->id,
            'loan_id'         => $this->loan->id,
            'installment_id'  => $installment->id,
            'loan_amount'     => '1100.00',
            'savings_amount'  => '200.00',
            'payment_method'  => 'cash',
            'idempotency_key' => 'RETRY-UUID-9999',
        ], $this->staff);

        $second = $this->service->execute([
            'customer_id'     => $this->customer->id,
            'loan_id'         => $this->loan->id,
            'installment_id'  => $installment->id,
            'loan_amount'     => '1100.00',
            'savings_amount'  => '200.00',
            'payment_method'  => 'cash',
            'idempotency_key' => 'RETRY-UUID-9999',
        ], $this->staff);

        $this->assertEquals($first->id, $second->id);
        $this->assertEquals($first->receipt_number, $second->receipt_number);
        $this->assertEquals(1, Collection::where('idempotency_key', 'RETRY-UUID-9999')->count());
    }

    /**
     * FI-13: Installment Non-Overpayment Invariant
     * Payment amount cannot exceed remaining installment balance.
     */
    public function test_fi_13_repayment_cannot_exceed_remaining_installment(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $installment = $this->loan->installments()->first(); // expected 1100

        $this->service->execute([
            'customer_id'     => $this->customer->id,
            'loan_id'         => $this->loan->id,
            'installment_id'  => $installment->id,
            'loan_amount'     => '1500.00', // exceeds 1100
            'savings_amount'  => '0.00',
            'payment_method'  => 'cash',
        ], $this->staff);
    }
}
