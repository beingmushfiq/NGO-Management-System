<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Loan extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_number',
        'customer_id',
        'branch_id',
        'staff_id',
        'principal_amount',
        'service_charge_amount',
        'total_payable_amount',
        'installment_amount',
        'number_of_installments',
        'frequency',
        'start_date',
        'end_date',
        'disbursed_at',
        'cached_outstanding',
        'cached_total_paid',
        'status',
        'purpose',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'principal_amount'      => 'decimal:2',
            'service_charge_amount' => 'decimal:2',
            'total_payable_amount'  => 'decimal:2',
            'installment_amount'    => 'decimal:2',
            'cached_outstanding'    => 'decimal:2',
            'cached_total_paid'     => 'decimal:2',
            'start_date'            => 'date',
            'end_date'              => 'date',
            'disbursed_at'          => 'datetime',
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

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function installments(): HasMany
    {
        return $this->hasMany(LoanInstallment::class, 'loan_id')->orderBy('installment_number', 'asc');
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(CollectionAllocation::class, 'loan_id');
    }
}
