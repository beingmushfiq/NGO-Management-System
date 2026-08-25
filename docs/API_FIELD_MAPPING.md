# API FIELD MAPPING SPECIFICATION

This document provides the standard mapping rules between backend `snake_case` Eloquent representations and frontend `camelCase` TypeScript interfaces.

---

## 1. Automated CamelCase Translation Layer

All Laravel API Resources implement clean translation to match the frontend contracts:

```php
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
            'branchName'     => $this->whenLoaded('branch', fn() => $this->branch->name),
            'staffId'        => $this->staff_id,
            'staffName'      => $this->whenLoaded('staff', fn() => $this->staff->name),
            'status'         => $this->status,
            'occupation'     => $this->occupation,
            'loanOutstanding'=> (string) ($this->cached_outstanding ?? '0.00'),
            'savingsBalance' => (string) ($this->savingsAccount->cached_balance ?? '0.00'),
            'registeredAt'   => $this->registered_at?->toIso8601String(),
            'createdAt'      => $this->created_at?->toIso8601String(),
        ];
    }
}
```

---

## 2. Collection Resource Mapping

```php
class CollectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'receiptNo'            => $this->receipt_number,
            'customerId'           => $this->customer_id,
            'customerName'         => $this->customer->name,
            'customerCode'         => $this->customer->customer_code,
            'branchId'             => $this->branch_id,
            'branchName'           => $this->branch->name,
            'staffId'              => $this->staff_id,
            'staffName'            => $this->staff->name,
            'loanAmount'           => (string) $this->allocations->where('type', 'loan')->sum('amount'),
            'savingsAmount'        => (string) $this->allocations->where('type', 'savings')->sum('amount'),
            'totalAmount'          => (string) $this->total_amount,
            'paymentMethod'        => $this->payment_method,
            'paymentReference'     => $this->payment_reference,
            'loanBalanceBefore'    => (string) $this->loan_balance_before,
            'loanBalanceAfter'     => (string) $this->loan_balance_after,
            'savingsBalanceBefore' => (string) $this->savings_balance_before,
            'savingsBalanceAfter'  => (string) $this->savings_balance_after,
            'installmentNo'        => $this->allocations->where('type', 'loan')->first()?->installment?->installment_number ?? 1,
            'collectedAt'          => $this->created_at?->toIso8601String(),
        ];
    }
}
```
