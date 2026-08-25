<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Collection;
use App\Models\CollectionAllocation;
use App\Models\Customer;
use App\Models\Loan;
use App\Models\SavingsAccount;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function dailyCollection(Request $request): JsonResponse
    {
        $date = $request->query('date', Carbon::now('Asia/Dhaka')->format('Y-m-d'));
        $branchId = $request->query('branch_id');

        $query = Collection::with(['customer', 'branch', 'staff', 'allocations'])
            ->where('collection_date', $date);

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        $collections = $query->orderBy('id', 'desc')->get();

        $rows = $collections->map(function ($col) {
            $loanAmt = (string) ($col->allocations->firstWhere('type', 'loan')?->amount ?? '0.00');
            $savAmt  = (string) ($col->allocations->firstWhere('type', 'savings')?->amount ?? '0.00');

            return [
                'receiptNo'      => $col->receipt_number,
                'customerName'   => $col->customer->name,
                'customerCode'   => $col->customer->customer_code,
                'branch'         => $col->branch->name,
                'staff'          => $col->staff->name,
                'loanAmount'     => $loanAmt,
                'savingsAmount'  => $savAmt,
                'totalAmount'    => (string) $col->total_amount,
                'paymentMethod'  => strtoupper($col->payment_method),
                'collectedAt'    => $col->created_at?->format('h:i A'),
            ];
        });

        $totalLoan = (string) $collections->sum(fn($c) => $c->allocations->firstWhere('type', 'loan')?->amount ?? 0);
        $totalSavings = (string) $collections->sum(fn($c) => $c->allocations->firstWhere('type', 'savings')?->amount ?? 0);
        $totalCollected = (string) $collections->sum('total_amount');

        return response()->json([
            'success' => true,
            'data'    => [
                'date'           => $date,
                'records'        => $rows,
                'summary'        => [
                    'totalCount'     => $collections->count(),
                    'totalLoan'      => number_format((float) $totalLoan, 2, '.', ''),
                    'totalSavings'   => number_format((float) $totalSavings, 2, '.', ''),
                    'totalCollected' => number_format((float) $totalCollected, 2, '.', ''),
                ],
            ],
        ]);
    }

    public function loanPortfolio(Request $request): JsonResponse
    {
        $branchId = $request->query('branch_id');
        $status = $request->query('status');

        $query = Loan::with(['customer', 'branch', 'staff']);

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $loans = $query->orderBy('id', 'desc')->get();

        $rows = $loans->map(function ($l) {
            return [
                'loanNumber'        => $l->loan_number,
                'customerName'      => $l->customer->name,
                'customerCode'      => $l->customer->customer_code,
                'branch'            => $l->branch->name,
                'principal'         => (string) $l->principal_amount,
                'serviceCharge'     => (string) $l->service_charge_amount,
                'totalPayable'      => (string) $l->total_payable_amount,
                'totalPaid'         => (string) $l->cached_total_paid,
                'outstanding'       => (string) $l->cached_outstanding,
                'status'            => $l->status,
                'startDate'         => $l->start_date?->format('Y-m-d'),
                'endDate'           => $l->end_date?->format('Y-m-d'),
            ];
        });

        $totalPrincipal = (string) $loans->sum('principal_amount');
        $totalPayable = (string) $loans->sum('total_payable_amount');
        $totalPaid = (string) $loans->sum('cached_total_paid');
        $totalOutstanding = (string) $loans->sum('cached_outstanding');

        return response()->json([
            'success' => true,
            'data'    => [
                'records' => $rows,
                'summary' => [
                    'totalLoans'       => $loans->count(),
                    'totalPrincipal'   => number_format((float) $totalPrincipal, 2, '.', ''),
                    'totalPayable'     => number_format((float) $totalPayable, 2, '.', ''),
                    'totalPaid'        => number_format((float) $totalPaid, 2, '.', ''),
                    'totalOutstanding' => number_format((float) $totalOutstanding, 2, '.', ''),
                ],
            ],
        ]);
    }

    public function savingsLedger(Request $request): JsonResponse
    {
        $branchId = $request->query('branch_id');

        $query = SavingsAccount::with(['customer', 'branch']);

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        $accounts = $query->orderBy('id', 'asc')->get();

        $rows = $accounts->map(function ($acc) {
            $totalDep = DB::table('savings_transactions')->where('savings_account_id', $acc->id)->where('type', 'deposit')->sum('amount');
            $totalWdl = DB::table('savings_transactions')->where('savings_account_id', $acc->id)->where('type', 'withdrawal')->sum('amount');

            return [
                'accountNumber'   => $acc->account_number,
                'customerName'    => $acc->customer->name,
                'customerCode'    => $acc->customer->customer_code,
                'branch'          => $acc->branch->name,
                'balance'         => (string) $acc->cached_balance,
                'totalDeposited'  => number_format((float) $totalDep, 2, '.', ''),
                'totalWithdrawn'  => number_format((float) $totalWdl, 2, '.', ''),
                'status'          => $acc->status,
                'openedAt'        => $acc->opened_at?->format('Y-m-d'),
            ];
        });

        $totalBalance = (string) $accounts->sum('cached_balance');

        return response()->json([
            'success' => true,
            'data'    => [
                'records' => $rows,
                'summary' => [
                    'totalAccounts' => $accounts->count(),
                    'totalBalance'  => number_format((float) $totalBalance, 2, '.', ''),
                ],
            ],
        ]);
    }

    public function branchAudit(Request $request): JsonResponse
    {
        $branches = Branch::with(['staff', 'customers', 'loans', 'savingsAccounts'])->get();

        $rows = $branches->map(function ($br) {
            $disbursed = (float) $br->loans()->sum('principal_amount');
            $payable = (float) $br->loans()->sum('total_payable_amount');
            $paid = (float) $br->loans()->sum('cached_total_paid');
            $outstanding = (float) $br->loans()->whereIn('status', ['active', 'overdue'])->sum('cached_outstanding');
            $savings = (float) $br->savingsAccounts()->sum('cached_balance');

            $recoveryRate = $payable > 0 ? ($paid / $payable) * 100 : 0;

            return [
                'branchCode'      => $br->code,
                'branchName'      => $br->name,
                'staffCount'      => $br->staff()->count(),
                'memberCount'     => $br->customers()->count(),
                'totalDisbursed'  => number_format($disbursed, 2, '.', ''),
                'outstanding'     => number_format($outstanding, 2, '.', ''),
                'savingsBalance'  => number_format($savings, 2, '.', ''),
                'recoveryRate'    => number_format($recoveryRate, 2, '.', ''),
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $rows,
        ]);
    }
}
