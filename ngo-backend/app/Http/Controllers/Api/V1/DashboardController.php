<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\CollectionAllocation;
use App\Models\Customer;
use App\Models\Loan;
use App\Models\SavingsAccount;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $branchId = $request->query('branch_id');
        $user = $request->user();

        // Enforce staff branch isolation
        if ($user && $user->role === 'staff') {
            $branchId = $user->branch_id;
        }

        $today = Carbon::now('Asia/Dhaka')->format('Y-m-d');

        // 1. Total Outstanding Portfolio
        $loanQuery = Loan::whereIn('status', ['active', 'overdue']);
        if ($branchId) {
            $loanQuery->where('branch_id', $branchId);
        }
        $totalOutstanding = (string) ($loanQuery->sum('cached_outstanding') ?? '0.00');
        $totalDisbursed = (string) ($loanQuery->sum('principal_amount') ?? '0.00');
        $totalPayable = (string) ($loanQuery->sum('total_payable_amount') ?? '0.00');
        $totalPaid = (string) ($loanQuery->sum('cached_total_paid') ?? '0.00');
        $activeLoansCount = $loanQuery->count();

        // 2. Total Savings Vault
        $savingsQuery = SavingsAccount::where('status', 'active');
        if ($branchId) {
            $savingsQuery->where('branch_id', $branchId);
        }
        $totalSavings = (string) ($savingsQuery->sum('cached_balance') ?? '0.00');
        $totalSavingsAccounts = $savingsQuery->count();

        // 3. Today's Collections
        $collQuery = Collection::where('collection_date', $today);
        if ($branchId) {
            $collQuery->where('branch_id', $branchId);
        }
        $todayCollection = (string) ($collQuery->sum('total_amount') ?? '0.00');
        $todayReceiptsCount = $collQuery->count();

        // 4. Total Customers
        $customerQuery = Customer::query();
        if ($branchId) {
            $customerQuery->where('branch_id', $branchId);
        }
        $totalCustomers = $customerQuery->count();
        $activeCustomers = (clone $customerQuery)->where('status', 'active')->count();

        // 5. Recovery Rate
        $recoveryRate = '0.00';
        if ((float) $totalPayable > 0) {
            $rate = ((float) $totalPaid / (float) $totalPayable) * 100;
            $recoveryRate = number_format($rate, 2, '.', '');
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'totalOutstanding'      => $totalOutstanding,
                'totalSavings'          => $totalSavings,
                'todayCollection'       => $todayCollection,
                'todayReceiptsCount'    => $todayReceiptsCount,
                'totalDisbursed'        => $totalDisbursed,
                'totalPaid'             => $totalPaid,
                'activeLoansCount'      => $activeLoansCount,
                'totalCustomers'        => $totalCustomers,
                'activeCustomers'       => $activeCustomers,
                'totalSavingsAccounts'  => $totalSavingsAccounts,
                'recoveryRate'          => $recoveryRate,
            ],
        ]);
    }

    public function trends(Request $request): JsonResponse
    {
        $branchId = $request->query('branch_id');
        $days = (int) ($request->query('days', 14));
        $user = $request->user();

        if ($user && $user->role === 'staff') {
            $branchId = $user->branch_id;
        }

        $startDate = Carbon::now('Asia/Dhaka')->subDays($days - 1)->startOfDay();
        $endDate = Carbon::now('Asia/Dhaka')->endOfDay();

        // Daily Collections
        $collections = DB::table('collections')
            ->select('collection_date', DB::raw('SUM(total_amount) as total'))
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereBetween('collection_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->groupBy('collection_date')
            ->pluck('total', 'collection_date');

        // Daily Disbursements
        $disbursements = DB::table('loans')
            ->select(DB::raw('DATE(disbursed_at) as disb_date'), DB::raw('SUM(principal_amount) as total'))
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereBetween('disbursed_at', [$startDate, $endDate])
            ->groupBy('disb_date')
            ->pluck('total', 'disb_date');

        $trendData = [];
        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i)->format('Y-m-d');
            $trendData[] = [
                'date'         => $date,
                'collection'   => (float) ($collections[$date] ?? 0),
                'disbursement' => (float) ($disbursements[$date] ?? 0),
            ];
        }

        return response()->json([
            'success' => true,
            'data'    => $trendData,
        ]);
    }
}
