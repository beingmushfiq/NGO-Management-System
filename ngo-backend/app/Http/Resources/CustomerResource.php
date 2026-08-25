<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'customerId'     => $this->customer_code,
            'name'           => $this->name,
            'nameBn'         => $this->name_bn,
            'phone'          => $this->phone,
            'alternatePhone' => $this->alternate_phone,
            'nid'            => $this->nid,
            'address'        => $this->address,
            'branchId'       => $this->branch_id,
            'branchName'     => $this->relationLoaded('branch') ? $this->branch?->name : null,
            'staffId'        => $this->staff_id,
            'staffName'      => $this->relationLoaded('staff') ? $this->staff?->name : null,
            'status'         => $this->status,
            'occupation'     => $this->occupation,
            'loanOutstanding'=> (string) ($this->cached_outstanding ?? ($this->activeLoan?->cached_outstanding ?? '0.00')),
            'savingsBalance' => (string) ($this->savingsAccount?->cached_balance ?? '0.00'),
            'registeredAt'   => $this->registered_at?->toIso8601String(),
            'createdAt'      => $this->created_at?->toIso8601String(),
        ];
    }
}
