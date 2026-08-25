<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LoanInstallment;
use App\Services\LoanBalanceService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DueController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $date = $request->query('date', Carbon::now('Asia/Dhaka')->format('Y-m-d'));

        $query = LoanInstallment::with([
            'loan.customer.savingsAccount',
            'loan.branch',
            'loan.staff',
        ])
        ->whereIn('status', ['pending', 'partial', 'overdue'])
        ->where('due_date', '<=', $date);

        if ($user && $user->role === 'staff') {
            $query->whereHas('loan', fn($lq) => $lq->where('branch_id', $user->branch_id));
        } elseif ($request->filled('branch_id')) {
            $query->whereHas('loan', fn($lq) => $lq->where('branch_id', $request->query('branch_id')));
        }

        if ($request->filled('search')) {
            $term = $request->query('search');
            $query->whereHas('loan.customer', function ($cq) use ($term) {
                $cq->where('name', 'LIKE', "%{$term}%")
                   ->orWhere('customer_code', 'LIKE', "%{$term}%")
                   ->orWhere('phone', 'LIKE', "%{$term}%");
            });
        }

        $installments = $query->orderBy('due_date', 'asc')->paginate($request->query('per_page', 50));

        $data = collect($installments->items())->map(function ($inst) {
            $loan = $inst->loan;
            $customer = $loan->customer;
            $remaining = LoanBalanceService::getInstallmentRemaining($inst);

            return [
                'installmentId'      => $inst->id,
                'installmentNo'      => $inst->installment_number,
                'dueDate'            => $inst->due_date?->format('Y-m-d'),
                'expectedAmount'     => (string) $inst->expected_amount,
                'remainingAmount'    => $remaining,
                'status'             => $inst->status,
                'loanId'             => $loan->id,
                'loanNumber'         => $loan->loan_number,
                'loanOutstanding'    => (string) $loan->cached_outstanding,
                'customerId'         => $customer->id,
                'customerCode'       => $customer->customer_code,
                'customerName'       => $customer->name,
                'customerNameBn'     => $customer->name_bn,
                'phone'              => $customer->phone,
                'address'            => $customer->address,
                'branchId'           => $loan->branch_id,
                'branchName'         => $loan->branch?->name,
                'staffId'            => $loan->staff_id,
                'staffName'          => $loan->staff?->name,
                'savingsBalance'     => (string) ($customer->savingsAccount?->cached_balance ?? '0.00'),
                'suggestedSavings'   => '200.00',
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $data,
            'meta'    => [
                'currentPage' => $installments->currentPage(),
                'lastPage'    => $installments->lastPage(),
                'total'       => $installments->total(),
            ],
        ]);
    }
}
