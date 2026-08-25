<?php

namespace App\Services;

use App\Models\SavingsAccount;
use Illuminate\Support\Facades\DB;

class SavingsBalanceService
{
    public static function getBalance(SavingsAccount $account): string
    {
        $latestTx = DB::table('savings_transactions')
            ->where('savings_account_id', $account->id)
            ->orderBy('id', 'desc')
            ->first();

        if ($latestTx) {
            return number_format((float) $latestTx->balance_after, 2, '.', '');
        }

        return '0.00';
    }

    public static function getTotalDeposited(SavingsAccount $account): string
    {
        $sum = DB::table('savings_transactions')
            ->where('savings_account_id', $account->id)
            ->where('type', 'deposit')
            ->sum('amount');

        return number_format((float) ($sum ?? 0), 2, '.', '');
    }

    public static function getTotalWithdrawn(SavingsAccount $account): string
    {
        $sum = DB::table('savings_transactions')
            ->where('savings_account_id', $account->id)
            ->where('type', 'withdrawal')
            ->sum('amount');

        return number_format((float) ($sum ?? 0), 2, '.', '');
    }
}
