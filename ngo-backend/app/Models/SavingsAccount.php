<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SavingsAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'branch_id',
        'account_number',
        'cached_balance',
        'monthly_contribution',
        'status',
        'opened_at',
    ];

    protected function casts(): array
    {
        return [
            'cached_balance'       => 'decimal:2',
            'monthly_contribution' => 'decimal:2',
            'opened_at'            => 'datetime',
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

    public function transactions(): HasMany
    {
        return $this->hasMany(SavingsTransaction::class, 'savings_account_id')->orderBy('id', 'desc');
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(CollectionAllocation::class, 'savings_account_id');
    }
}
