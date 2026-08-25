<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Collection extends Model
{
    use HasFactory;

    protected $fillable = [
        'receipt_number',
        'customer_id',
        'branch_id',
        'staff_id',
        'total_amount',
        'payment_method',
        'payment_reference',
        'collection_date',
        'status',
        'loan_balance_before',
        'loan_balance_after',
        'savings_balance_before',
        'savings_balance_after',
        'idempotency_key',
    ];

    protected function casts(): array
    {
        return [
            'total_amount'           => 'decimal:2',
            'loan_balance_before'    => 'decimal:2',
            'loan_balance_after'     => 'decimal:2',
            'savings_balance_before' => 'decimal:2',
            'savings_balance_after'  => 'decimal:2',
            'collection_date'        => 'date',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(CollectionAllocation::class, 'collection_id');
    }

    public function loanAllocation()
    {
        return $this->hasOne(CollectionAllocation::class, 'collection_id')->where('type', 'loan');
    }

    public function savingsAllocation()
    {
        return $this->hasOne(CollectionAllocation::class, 'collection_id')->where('type', 'savings');
    }
}
