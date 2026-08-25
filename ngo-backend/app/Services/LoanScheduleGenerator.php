<?php

namespace App\Services;

use App\Models\Loan;
use App\Models\LoanInstallment;
use Carbon\Carbon;

class LoanScheduleGenerator
{
    /**
     * Generate weekly installment schedule for a loan.
     * Absorbs any remainder into the final installment.
     */
    public static function generate(Loan $loan): array
    {
        $totalPayable = (float) $loan->total_payable_amount;
        $numInstallments = (int) $loan->number_of_installments;
        $frequency = $loan->frequency; // weekly

        // Base integer amount per installment
        $baseInstallmentAmount = floor($totalPayable / $numInstallments);
        $totalBaseAllocated = $baseInstallmentAmount * ($numInstallments - 1);
        $lastInstallmentAmount = $totalPayable - $totalBaseAllocated;

        $startDate = Carbon::parse($loan->start_date);
        $installments = [];

        for ($i = 1; $i <= $numInstallments; $i++) {
            $daysToAdd = match ($frequency) {
                'biweekly' => $i * 14,
                'monthly'  => $i * 30,
                default    => $i * 7,
            };

            $dueDate = $startDate->copy()->addDays($daysToAdd);
            $expectedAmount = ($i === $numInstallments) ? $lastInstallmentAmount : $baseInstallmentAmount;

            $installments[] = LoanInstallment::create([
                'loan_id'            => $loan->id,
                'installment_number' => $i,
                'due_date'           => $dueDate->format('Y-m-d'),
                'expected_amount'    => number_format((float) $expectedAmount, 2, '.', ''),
                'status'             => 'pending',
                'paid_at'            => null,
            ]);
        }

        return $installments;
    }
}
