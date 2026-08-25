<?php

namespace App\Services;

use App\Models\Collection;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReceiptNumberService
{
    public static function generate(?Carbon $date = null): string
    {
        $targetDate = $date ?? Carbon::now('Asia/Dhaka');
        $datePrefix = $targetDate->format('Ymd');
        $prefix = "COL-{$datePrefix}-";

        // Find last receipt number for today
        $lastReceipt = DB::table('collections')
            ->where('receipt_number', 'LIKE', "{$prefix}%")
            ->orderBy('id', 'desc')
            ->value('receipt_number');

        if ($lastReceipt) {
            $lastSequence = (int) substr($lastReceipt, strlen($prefix));
            $nextSequence = $lastSequence + 1;
        } else {
            $nextSequence = 1;
        }

        return $prefix . str_pad((string) $nextSequence, 5, '0', STR_PAD_LEFT);
    }
}
