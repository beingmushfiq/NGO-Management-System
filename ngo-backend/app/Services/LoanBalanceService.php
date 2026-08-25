<?php

namespace App\Services;

use App\Models\Loan;
use App\Models\LoanInstallment;
use Illuminate\Support\Facades\DB;

class LoanBalanceService
{
    public static function getOutstanding(Loan $loan): string
    {
        $totalPaid = self::getTotalPaid($loan);
        $totalPayable = (string) $loan->total_payable_amount;

        return bcsub($totalPayable, $totalPaid, 2);
    }

    public static function getTotalPaid(Loan $loan): string
    {
        $sum = DB::table('collection_allocations')
            ->where('type', 'loan')
            ->where('loan_id', $loan->id)
            ->sum('amount');

        return number_format((float) ($sum ?? 0), 2, '.', '');
    }

    public static function getInstallmentPaid(LoanInstallment $installment): string
    {
        $sum = DB::table('collection_allocations')
            ->where('type', 'loan')
            ->where('loan_installment_id', $installment->id)
            ->sum('amount');

        return number_format((float) ($sum ?? 0), 2, '.', '');
    }

    public static function getInstallmentRemaining(LoanInstallment $installment): string
    {
        $paid = self::getInstallmentPaid($installment);
        $expected = (string) $installment->expected_amount;

        return bcsub($expected, $paid, 2);
    }
}
