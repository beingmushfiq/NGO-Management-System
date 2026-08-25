<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Customer;
use App\Models\Loan;
use App\Models\SavingsAccount;
use App\Models\User;
use App\Services\LoanScheduleGenerator;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NgoApiFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $staff;
    protected Branch $branch;

    protected function setUp(): void
    {
        parent::setUp();

        $this->branch = Branch::create([
            'code'    => 'BR-DHAKA',
            'name'    => 'Dhaka Main Branch',
            'address' => 'Dhanmondi, Dhaka',
            'phone'   => '01711000000',
            'status'  => 'active',
        ]);

        $this->admin = User::create([
            'name'       => 'Nurul Islam',
            'email'      => 'admin@asha.org',
            'phone'      => '01711000001',
            'password'   => bcrypt('password123'),
            'branch_id'  => $this->branch->id,
            'role'       => 'admin',
            'staff_code' => 'STF-001',
            'status'     => 'active',
        ]);

        $this->staff = User::create([
            'name'       => 'Kamal Hossain',
            'email'      => 'kamal@asha.org',
            'phone'      => '01711000002',
            'password'   => bcrypt('password123'),
            'branch_id'  => $this->branch->id,
            'role'       => 'staff',
            'staff_code' => 'STF-002',
            'status'     => 'active',
        ]);
    }

    public function test_user_can_login_and_receive_token(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'phone'    => '01711000001',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'token',
                    'user' => ['id', 'name', 'phone', 'role', 'branchId'],
                ],
            ]);
    }

    public function test_customer_registration_creates_savings_vault(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/api/v1/customers', [
            'name'      => 'Amina Khatun',
            'name_bn'   => 'আমিনা খাতুন',
            'phone'     => '01799887766',
            'nid'       => '19951234567890123',
            'address'   => 'Rayerbazar, Dhaka',
            'branch_id' => $this->branch->id,
            'staff_id'  => $this->staff->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => ['id', 'customerId', 'name', 'savingsBalance'],
            ]);

        $customer = Customer::where('phone', '01799887766')->first();
        $this->assertNotNull($customer);
        $this->assertNotNull($customer->savingsAccount);
        $this->assertEquals('0.00', (string) $customer->savingsAccount->cached_balance);
    }

    public function test_loan_disbursement_creates_50_week_schedule(): void
    {
        $customer = Customer::create([
            'customer_code' => 'CUS-2001',
            'name'          => 'Borrower 1',
            'phone'         => '01788776655',
            'nid'           => '1990123456789',
            'address'       => 'Dhaka',
            'branch_id'     => $this->branch->id,
            'staff_id'      => $this->staff->id,
            'status'        => 'active',
        ]);

        SavingsAccount::create([
            'customer_id'          => $customer->id,
            'branch_id'            => $this->branch->id,
            'account_number'       => 'SAV-2001',
            'cached_balance'       => '0.00',
            'monthly_contribution' => '800.00',
            'status'               => 'active',
        ]);

        $response = $this->actingAs($this->admin)->postJson('/api/v1/loans', [
            'customer_id'        => $customer->id,
            'principal_amount'   => 50000,
            'service_charge_pct' => 10,
            'duration_weeks'     => 50,
            'start_date'         => Carbon::now('Asia/Dhaka')->format('Y-m-d'),
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data'    => [
                    'principal'     => '50000.00',
                    'serviceCharge' => '5000.00',
                    'totalPayable'  => '55000.00',
                    'outstanding'   => '55000.00',
                    'durationWeeks' => 50,
                ],
            ]);

        $loan = Loan::where('customer_id', $customer->id)->first();
        $this->assertEquals(50, $loan->installments()->count());
    }

    public function test_full_combined_collection_api_flow(): void
    {
        $customer = Customer::create([
            'customer_code' => 'CUS-3001',
            'name'          => 'Rahima Begum',
            'phone'         => '01712345678',
            'nid'           => '1987123456789',
            'address'       => 'Dhaka',
            'branch_id'     => $this->branch->id,
            'staff_id'      => $this->staff->id,
            'status'        => 'active',
        ]);

        $savingsAccount = SavingsAccount::create([
            'customer_id'          => $customer->id,
            'branch_id'            => $this->branch->id,
            'account_number'       => 'SAV-3001',
            'cached_balance'       => '1000.00',
            'monthly_contribution' => '800.00',
            'status'               => 'active',
        ]);

        $loan = Loan::create([
            'loan_number'            => 'LN-2026-3001',
            'customer_id'            => $customer->id,
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

        $installments = LoanScheduleGenerator::generate($loan);
        $firstInstallment = $installments[0];

        // Process collection via API
        $response = $this->actingAs($this->staff)->postJson('/api/v1/collections', [
            'customer_id'       => $customer->id,
            'loan_id'           => $loan->id,
            'installment_id'    => $firstInstallment->id,
            'loan_amount'       => '1100.00',
            'savings_amount'    => '200.00',
            'payment_method'    => 'cash',
            'idempotency_key'   => 'HTTP-TEST-RECEIPT-01',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data'    => [
                    'loanAmount'           => '1100.00',
                    'savingsAmount'        => '200.00',
                    'totalAmount'          => '1300.00',
                    'loanBalanceBefore'    => '55000.00',
                    'loanBalanceAfter'     => '53900.00',
                    'savingsBalanceBefore' => '1000.00',
                    'savingsBalanceAfter'  => '1200.00',
                ],
            ]);

        $collectionId = $response->json('data.id');

        // Test Receipt View API
        $receiptResponse = $this->actingAs($this->staff)->getJson("/api/v1/collections/{$collectionId}/receipt");
        $receiptResponse->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'organization' => ['name', 'registrationNo', 'helpline'],
                    'receipt'      => ['receiptNo', 'customerName', 'totalAmount', 'loanBalanceAfter', 'savingsBalanceAfter'],
                ],
            ]);
    }

    public function test_reports_api_endpoints(): void
    {
        $response = $this->actingAs($this->admin)->getJson('/api/v1/reports/daily-collection');
        $response->assertStatus(200)->assertJsonStructure(['success', 'data' => ['records', 'summary']]);

        $response2 = $this->actingAs($this->admin)->getJson('/api/v1/reports/loan-portfolio');
        $response2->assertStatus(200)->assertJsonStructure(['success', 'data' => ['records', 'summary']]);

        $response3 = $this->actingAs($this->admin)->getJson('/api/v1/reports/savings');
        $response3->assertStatus(200)->assertJsonStructure(['success', 'data' => ['records', 'summary']]);

        $response4 = $this->actingAs($this->admin)->getJson('/api/v1/reports/branch-audit');
        $response4->assertStatus(200)->assertJsonStructure(['success', 'data']);
    }
}
