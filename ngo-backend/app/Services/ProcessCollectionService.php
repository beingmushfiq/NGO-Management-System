<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Collection;
use App\Models\CollectionAllocation;
use App\Models\Customer;
use App\Models\Loan;
use App\Models\LoanInstallment;
use App\Models\SavingsAccount;
use App\Models\SavingsTransaction;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class ProcessCollectionService
{
    /**
     * Process a collection (Combined, Loan-Only, or Savings-Only) atomically.
     *
     * @throws Exception
     */
    public function execute(array $data, User $staff): Collection
    {
        $idempotencyKey = $data['idempotency_key'] ?? null;

        // 1. Idempotency Check (Pre-Transaction)
        if ($idempotencyKey) {
            $existing = Collection::with(['customer', 'branch', 'staff', 'allocations.loan', 'allocations.installment', 'allocations.savingsAccount'])
                ->where('idempotency_key', $idempotencyKey)
                ->first();

            if ($existing) {
                return $existing;
            }
        }

        $customerId    = (int) $data['customer_id'];
        $loanAmount    = number_format((float) ($data['loan_amount'] ?? 0), 2, '.', '');
        $savingsAmount = number_format((float) ($data['savings_amount'] ?? 0), 2, '.', '');
        $paymentMethod = $data['payment_method'] ?? 'cash';
        $paymentRef    = $data['payment_reference'] ?? null;
        $collectionDate= $data['collection_date'] ?? Carbon::now('Asia/Dhaka')->format('Y-m-d');
        $loanId        = isset($data['loan_id']) ? (int) $data['loan_id'] : null;
        $installmentId = isset($data['installment_id']) ? (int) $data['installment_id'] : null;

        // Invariant: At least one amount must be > 0
        $hasLoan = bccomp($loanAmount, '0.00', 2) > 0;
        $hasSavings = bccomp($savingsAmount, '0.00', 2) > 0;

        if (!$hasLoan && !$hasSavings) {
            throw new InvalidArgumentException("Collection must specify a loan installment payment or savings deposit greater than 0.00.");
        }

        // 2. Atomic Transaction Block
        return DB::transaction(function () use (
            $customerId,
            $loanAmount,
            $savingsAmount,
            $hasLoan,
            $hasSavings,
            $loanId,
            $installmentId,
            $paymentMethod,
            $paymentRef,
            $collectionDate,
            $idempotencyKey,
            $staff
        ) {
            $customer = Customer::findOrFail($customerId);
            $branchId = $customer->branch_id;

            $loan = null;
            $installment = null;
            $savingsAccount = null;

            $loanBalanceBefore = null;
            $loanBalanceAfter = null;
            $savingsBalanceBefore = null;
            $savingsBalanceAfter = null;

            // 3. Pessimistic Row Locking & Loan Validations
            if ($hasLoan) {
                if ($installmentId) {
                    $installment = LoanInstallment::where('id', $installmentId)->lockForUpdate()->firstOrFail();
                    $loan = Loan::where('id', $installment->loan_id)->lockForUpdate()->firstOrFail();
                } elseif ($loanId) {
                    $loan = Loan::where('id', $loanId)->lockForUpdate()->firstOrFail();
                    $installment = LoanInstallment::where('loan_id', $loan->id)
                        ->whereIn('status', ['pending', 'partial', 'overdue'])
                        ->orderBy('installment_number', 'asc')
                        ->lockForUpdate()
                        ->firstOrFail();
                } else {
                    $loan = Loan::where('customer_id', $customer->id)
                        ->whereIn('status', ['active', 'overdue'])
                        ->lockForUpdate()
                        ->firstOrFail();

                    $installment = LoanInstallment::where('loan_id', $loan->id)
                        ->whereIn('status', ['pending', 'partial', 'overdue'])
                        ->orderBy('installment_number', 'asc')
                        ->lockForUpdate()
                        ->firstOrFail();
                }

                $loanBalanceBefore = (string) $loan->cached_outstanding;

                // Check installment remaining amount inside lock
                $installmentPaidSoFar = LoanBalanceService::getInstallmentPaid($installment);
                $installmentRemaining = bcsub((string) $installment->expected_amount, $installmentPaidSoFar, 2);

                if (bccomp($loanAmount, $installmentRemaining, 2) > 0) {
                    throw new InvalidArgumentException("Loan repayment amount (৳{$loanAmount}) exceeds remaining installment balance (৳{$installmentRemaining}).");
                }

                if (bccomp($loanAmount, $loanBalanceBefore, 2) > 0) {
                    throw new InvalidArgumentException("Loan repayment amount (৳{$loanAmount}) exceeds total loan outstanding (৳{$loanBalanceBefore}).");
                }
            }

            // 4. Pessimistic Row Locking & Savings Validations
            if ($hasSavings) {
                $savingsAccount = SavingsAccount::where('customer_id', $customer->id)->lockForUpdate()->firstOrFail();
                $savingsBalanceBefore = (string) $savingsAccount->cached_balance;
            }

            // 5. Calculate Total Amount
            $totalAmount = bcadd($loanAmount, $savingsAmount, 2);

            // 6. Create Collection Master Record
            $receiptNumber = ReceiptNumberService::generate(Carbon::parse($collectionDate));

            $collection = Collection::create([
                'receipt_number'         => $receiptNumber,
                'customer_id'            => $customer->id,
                'branch_id'              => $branchId,
                'staff_id'               => $staff->id,
                'total_amount'           => $totalAmount,
                'payment_method'         => $paymentMethod,
                'payment_reference'      => $paymentRef,
                'collection_date'        => $collectionDate,
                'status'                 => 'completed',
                'loan_balance_before'    => $loanBalanceBefore,
                'loan_balance_after'     => null, // updated below
                'savings_balance_before' => $savingsBalanceBefore,
                'savings_balance_after'  => null, // updated below
                'idempotency_key'        => $idempotencyKey,
            ]);

            // 7. Process Loan Side (if applicable)
            if ($hasLoan && $loan && $installment) {
                CollectionAllocation::create([
                    'collection_id'       => $collection->id,
                    'type'                => 'loan',
                    'amount'              => $loanAmount,
                    'loan_id'             => $loan->id,
                    'loan_installment_id' => $installment->id,
                    'savings_account_id'  => null,
                ]);

                // Update installment state
                $newInstallmentPaid = bcadd(LoanBalanceService::getInstallmentPaid($installment), '0.00', 2);
                if (bccomp($newInstallmentPaid, (string) $installment->expected_amount, 2) >= 0) {
                    $installment->status = 'paid';
                    $installment->paid_at = Carbon::now('Asia/Dhaka');
                } else {
                    $installment->status = 'partial';
                }
                $installment->save();

                // Update loan cache columns & status
                $newOutstanding = bcsub($loanBalanceBefore, $loanAmount, 2);
                $newTotalPaid = bcadd((string) $loan->cached_total_paid, $loanAmount, 2);

                $loan->cached_outstanding = $newOutstanding;
                $loan->cached_total_paid = $newTotalPaid;

                if (bccomp($newOutstanding, '0.00', 2) <= 0) {
                    $loan->status = 'completed';
                    $loan->cached_outstanding = '0.00';
                }

                $loan->save();
                $loanBalanceAfter = (string) $loan->cached_outstanding;
            }

            // 8. Process Savings Side (if applicable)
            if ($hasSavings && $savingsAccount) {
                CollectionAllocation::create([
                    'collection_id'       => $collection->id,
                    'type'                => 'savings',
                    'amount'              => $savingsAmount,
                    'loan_id'             => null,
                    'loan_installment_id' => null,
                    'savings_account_id'  => $savingsAccount->id,
                ]);

                $newSavingsBalance = bcadd($savingsBalanceBefore, $savingsAmount, 2);

                SavingsTransaction::create([
                    'savings_account_id' => $savingsAccount->id,
                    'type'               => 'deposit',
                    'amount'             => $savingsAmount,
                    'balance_before'     => $savingsBalanceBefore,
                    'balance_after'      => $newSavingsBalance,
                    'reference_type'     => 'collection',
                    'reference_id'       => $collection->id,
                    'transaction_date'   => $collectionDate,
                    'note'               => "Weekly savings deposit via receipt {$receiptNumber}",
                    'created_by'         => $staff->id,
                ]);

                $savingsAccount->cached_balance = $newSavingsBalance;
                $savingsAccount->save();
                $savingsBalanceAfter = $newSavingsBalance;
            }

            // 9. Update Collection Balance Snapshots
            $collection->loan_balance_after = $loanBalanceAfter;
            $collection->savings_balance_after = $savingsBalanceAfter;
            $collection->save();

            // 10. Audit Log
            AuditLog::create([
                'user_id'     => $staff->id,
                'branch_id'   => $branchId,
                'action'      => 'collection.created',
                'entity_type' => Collection::class,
                'entity_id'   => $collection->id,
                'new_values'  => [
                    'receipt_number' => $receiptNumber,
                    'total_amount'   => $totalAmount,
                    'loan_amount'    => $loanAmount,
                    'savings_amount' => $savingsAmount,
                ],
                'created_at'  => Carbon::now('Asia/Dhaka'),
            ]);

            return $collection->load(['customer', 'branch', 'staff', 'allocations.loan', 'allocations.installment', 'allocations.savingsAccount']);
        });
    }
}
