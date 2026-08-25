<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'name_bn',
        'address',
        'phone',
        'email',
        'status',
    ];

    public function staff(): HasMany
    {
        return $this->hasMany(User::class, 'branch_id');
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class, 'branch_id');
    }

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class, 'branch_id');
    }

    public function savingsAccounts(): HasMany
    {
        return $this->hasMany(SavingsAccount::class, 'branch_id');
    }

    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class, 'branch_id');
    }
}
