<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_code',
        'name',
        'name_bn',
        'phone',
        'alternate_phone',
        'nid',
        'address',
        'branch_id',
        'staff_id',
        'status',
        'occupation',
        'emergency_contact',
        'registered_at',
    ];

    protected function casts(): array
    {
        return [
            'registered_at' => 'datetime',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class, 'customer_id');
    }

    public function activeLoan(): HasOne
    {
        return $this->hasOne(Loan::class, 'customer_id')->whereIn('status', ['active', 'overdue']);
    }

    public function savingsAccount(): HasOne
    {
        return $this->hasOne(SavingsAccount::class, 'customer_id');
    }

    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class, 'customer_id');
    }
}
