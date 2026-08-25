<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StaffResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'staffCode'   => $this->staff_code,
            'name'        => $this->name,
            'phone'       => $this->phone,
            'email'       => $this->email,
            'role'        => $this->role,
            'branchId'    => $this->branch_id,
            'branchName'  => $this->relationLoaded('branch') ? $this->branch?->name : null,
            'status'      => $this->status,
            'memberCount' => $this->assignedCustomers()->count(),
            'joinedAt'    => $this->created_at?->toIso8601String(),
        ];
    }
}
