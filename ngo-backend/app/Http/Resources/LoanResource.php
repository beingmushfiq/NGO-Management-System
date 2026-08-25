<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'loanId'               => $this->loan_number,
            'customerId'           => $this->customer_id,
            'customerName'         => $this->relationLoaded('customer') ? $this->customer?->name : null,
            'customerCode'         => $this->relationLoaded('customer') ? $this->customer?->customer_code : null,
            'branchId'             => $this->branch_id,
            'branchName'           => $this->relationLoaded('branch') ? $this->branch?->name : null,
            'staffId'              => $this->staff_id,
            'staffName'            => $this->relationLoaded('staff') ? $this->staff?->name : null,
            'principal'            => (string) $this->principal_amount,
            'serviceCharge'        => (string) $this->service_charge_amount,
            'totalPayable'         => (string) $this->total_payable_amount,
            'installmentAmount'    => (string) $this->installment_amount,
            'durationWeeks'        => (int) $this->number_of_installments,
            'frequency'            => $this->frequency,
            'startDate'            => $this->start_date?->format('Y-m-d'),
            'endDate'              => $this->end_date?->format('Y-m-d'),
            'outstanding'          => (string) $this->cached_outstanding,
            'totalPaid'            => (string) $this->cached_total_paid,
            'status'               => $this->status,
            'purpose'              => $this->purpose,
            'disbursedAt'          => $this->disbursed_at?->toIso8601String(),
            'createdAt'            => $this->created_at?->toIso8601String(),
            'installments'         => $this->whenLoaded('installments', function () {
                return $this->installments->map(function ($inst) {
                    return [
                        'id'            => $inst->id,
                        'installmentNo' => $inst->installment_number,
                        'dueDate'       => $inst->due_date?->format('Y-m-d'),
                        'expected'      => (string) $inst->expected_amount,
                        'paid'          => (string) $inst->paid_amount,
                        'remaining'     => (string) $inst->remaining_amount,
                        'status'        => $inst->status,
                        'paidAt'        => $inst->paid_at?->toIso8601String(),
                    ];
                });
            }),
        ];
    }
}
