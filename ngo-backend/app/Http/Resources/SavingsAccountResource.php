<?php

namespace App\Http\Resources;

use App\Services\SavingsBalanceService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SavingsAccountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'customerId'           => $this->customer_id,
            'customerName'         => $this->relationLoaded('customer') ? $this->customer?->name : null,
            'customerCode'         => $this->relationLoaded('customer') ? $this->customer?->customer_code : null,
            'branchId'             => $this->branch_id,
            'branchName'           => $this->relationLoaded('branch') ? $this->branch?->name : null,
            'accountNumber'        => $this->account_number,
            'balance'              => (string) $this->cached_balance,
            'monthlyContribution' => (string) $this->monthly_contribution,
            'totalDeposited'       => SavingsBalanceService::getTotalDeposited($this->resource),
            'totalWithdrawn'       => SavingsBalanceService::getTotalWithdrawn($this->resource),
            'status'               => $this->status,
            'openedAt'             => $this->opened_at?->toIso8601String(),
            'transactions'         => $this->whenLoaded('transactions', function () {
                return $this->transactions->map(function ($tx) {
                    return [
                        'id'            => $tx->id,
                        'type'          => $tx->type,
                        'amount'        => (string) $tx->amount,
                        'balanceBefore' => (string) $tx->balance_before,
                        'balanceAfter'  => (string) $tx->balance_after,
                        'note'          => $tx->note,
                        'date'          => $tx->created_at?->toIso8601String(),
                    ];
                });
            }),
        ];
    }
}
