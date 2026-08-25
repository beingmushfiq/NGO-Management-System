<?php

namespace App\Console\Commands;

use App\Models\Loan;
use App\Models\SavingsAccount;
use App\Services\LoanBalanceService;
use App\Services\SavingsBalanceService;
use Illuminate\Console\Command;

class VerifyFinancialIntegrity extends Command
{
    protected $signature = 'ngo:verify-financial-integrity {--fix : Automatically repair cached balances if discrepancies are found}';
    protected $description = 'Audit all loans and savings accounts to verify that cached balance columns strictly match immutable ledger sums (FI-01 through FI-13)';

    public function handle(): int
    {
        $this->info('Starting NGO Financial Integrity Verification Audit...');
        $errorsCount = 0;

        // 1. Audit Loans
        $loans = Loan::all();
        $this->line("Auditing {$loans->count()} loan accounts...");

        foreach ($loans as $loan) {
            $derivedOutstanding = LoanBalanceService::getOutstanding($loan);
            $cachedOutstanding = (string) $loan->cached_outstanding;

            if (bccomp($derivedOutstanding, $cachedOutstanding, 2) !== 0) {
                $this->error("LOAN MISMATCH [{$loan->loan_number}]: Derived Outstanding = ৳{$derivedOutstanding}, Cached = ৳{$cachedOutstanding}");
                $errorsCount++;

                if ($this->option('fix')) {
                    $loan->cached_outstanding = $derivedOutstanding;
                    $loan->cached_total_paid = LoanBalanceService::getTotalPaid($loan);
                    $loan->save();
                    $this->warn("  -> Repaired cached balances for loan {$loan->loan_number}");
                }
            }
        }

        // 2. Audit Savings Accounts
        $savings = SavingsAccount::all();
        $this->line("Auditing {$savings->count()} savings vault accounts...");

        foreach ($savings as $acc) {
            $derivedBalance = SavingsBalanceService::getBalance($acc);
            $cachedBalance = (string) $acc->cached_balance;

            if (bccomp($derivedBalance, $cachedBalance, 2) !== 0) {
                $this->error("SAVINGS MISMATCH [{$acc->account_number}]: Derived Balance = ৳{$derivedBalance}, Cached = ৳{$cachedBalance}");
                $errorsCount++;

                if ($this->option('fix')) {
                    $acc->cached_balance = $derivedBalance;
                    $acc->save();
                    $this->warn("  -> Repaired cached balance for account {$acc->account_number}");
                }
            }
        }

        if ($errorsCount === 0) {
            $this->info('✓ FINANCIAL INTEGRITY VERIFIED: 100% of loan portfolios and savings vaults are mathematically consistent with immutable ledgers.');
            return Command::SUCCESS;
        }

        $this->error("✗ AUDIT FAILED: {$errorsCount} balance inconsistencies detected.");
        return Command::FAILURE;
    }
}
