<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BranchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'code'        => $this->code,
            'name'        => $this->name,
            'nameBn'      => $this->name_bn,
            'address'     => $this->address,
            'phone'       => $this->phone,
            'email'       => $this->email,
            'status'      => $this->status,
            'staffCount'  => $this->staff()->count(),
            'memberCount' => $this->customers()->count(),
            'totalDisbursed' => (string) $this->loans()->sum('principal_amount'),
            'totalOutstanding' => (string) $this->loans()->whereIn('status', ['active', 'overdue'])->sum('cached_outstanding'),
            'totalSavings' => (string) $this->savingsAccounts()->sum('cached_balance'),
            'createdAt'   => $this->created_at?->toIso8601String(),
        ];
    }
}
