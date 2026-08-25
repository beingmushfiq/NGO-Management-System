<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CollectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $loanAlloc = $this->allocations->firstWhere('type', 'loan');
        $savingsAlloc = $this->allocations->firstWhere('type', 'savings');

        return [
            'id'                   => $this->id,
            'receiptNo'            => $this->receipt_number,
            'customerId'           => $this->customer_id,
            'customerName'         => $this->relationLoaded('customer') ? $this->customer?->name : null,
            'customerCode'         => $this->relationLoaded('customer') ? $this->customer?->customer_code : null,
            'branchId'             => $this->branch_id,
            'branchName'           => $this->relationLoaded('branch') ? $this->branch?->name : null,
            'staffId'              => $this->staff_id,
            'staffName'            => $this->relationLoaded('staff') ? $this->staff?->name : null,
            'loanAmount'           => (string) ($loanAlloc?->amount ?? '0.00'),
            'savingsAmount'        => (string) ($savingsAlloc?->amount ?? '0.00'),
            'totalAmount'          => (string) $this->total_amount,
            'paymentMethod'        => $this->payment_method,
            'paymentReference'     => $this->payment_reference,
            'loanBalanceBefore'    => (string) ($this->loan_balance_before ?? '0.00'),
            'loanBalanceAfter'     => (string) ($this->loan_balance_after ?? '0.00'),
            'savingsBalanceBefore' => (string) ($this->savings_balance_before ?? '0.00'),
            'savingsBalanceAfter'  => (string) ($this->savings_balance_after ?? '0.00'),
            'installmentNo'        => $loanAlloc?->installment?->installment_number ?? 1,
            'collectionDate'       => $this->collection_date?->format('Y-m-d'),
            'collectedAt'          => $this->created_at?->toIso8601String(),
        ];
    }
}
