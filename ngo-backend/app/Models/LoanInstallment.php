<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoanInstallment extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_id',
        'installment_number',
        'due_date',
        'expected_amount',
        'status',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'expected_amount' => 'decimal:2',
            'due_date'        => 'date',
            'paid_at'         => 'datetime',
        ];
    }

    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class, 'loan_id');
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(CollectionAllocation::class, 'loan_installment_id');
    }

    public function getPaidAmountAttribute(): string
    {
        $sum = $this->allocations()->sum('amount');
        return number_format((float) ($sum ?? 0), 2, '.', '');
    }

    public function getRemainingAmountAttribute(): string
    {
        $paid = (float) $this->paid_amount;
        $expected = (float) $this->expected_amount;
        return number_format(max(0, $expected - $paid), 2, '.', '');
    }
}
