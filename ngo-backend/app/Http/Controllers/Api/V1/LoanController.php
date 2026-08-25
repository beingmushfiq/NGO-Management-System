<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\LoanResource;
use App\Models\Customer;
use App\Models\Loan;
use App\Services\LoanScheduleGenerator;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LoanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Loan::with(['customer', 'branch', 'staff']);

        if ($user && $user->role === 'staff') {
            $query->where('branch_id', $user->branch_id);
        } elseif ($request->filled('branch_id')) {
            $query->where('branch_id', $request->query('branch_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->query('customer_id'));
        }

        if ($request->filled('search')) {
            $term = $request->query('search');
            $query->where(function ($q) use ($term) {
                $q->where('loan_number', 'LIKE', "%{$term}%")
                  ->orWhereHas('customer', function ($cq) use ($term) {
                      $cq->where('name', 'LIKE', "%{$term}%")
                         ->orWhere('customer_code', 'LIKE', "%{$term}%")
                         ->orWhere('phone', 'LIKE', "%{$term}%");
                  });
            });
        }

        $loans = $query->orderBy('id', 'desc')->paginate($request->query('per_page', 50));

        return response()->json([
            'success' => true,
            'data'    => LoanResource::collection($loans->items()),
            'meta'    => [
                'currentPage' => $loans->currentPage(),
                'lastPage'    => $loans->lastPage(),
                'total'       => $loans->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id'       => 'required|exists:customers,id',
            'principal_amount'  => 'required|numeric|min:1000|max:500000',
            'service_charge_pct'=> 'nullable|numeric|min:0|max:50',
            'duration_weeks'    => 'nullable|integer|in:44,45,46,48,50,52',
            'start_date'        => 'nullable|date',
            'purpose'           => 'nullable|string|max:255',
        ]);

        $customer = Customer::findOrFail($validated['customer_id']);

        // Check if customer already has an active loan
        $existingActive = Loan::where('customer_id', $customer->id)
            ->whereIn('status', ['active', 'overdue'])
            ->first();

        if ($existingActive) {
            return response()->json([
                'success' => false,
                'message' => "Customer {$customer->name} already has an active loan ({$existingActive->loan_number}) with outstanding balance ৳{$existingActive->cached_outstanding}.",
                'code'    => 'ACTIVE_LOAN_EXISTS',
            ], 422);
        }

        $principal = (float) $validated['principal_amount'];
        $chargePct = (float) ($validated['service_charge_pct'] ?? 10.0);
        $durationWeeks = (int) ($validated['duration_weeks'] ?? 50);
        $startDate = $validated['start_date'] ? Carbon::parse($validated['start_date']) : Carbon::now('Asia/Dhaka');
        $endDate = $startDate->copy()->addWeeks($durationWeeks);

        // Formulas (FI-04, FI-05)
        $serviceCharge = round(($principal * $chargePct) / 100, 2);
        $totalPayable = $principal + $serviceCharge;
        $installmentAmount = round($totalPayable / $durationWeeks, 2);

        $loan = DB::transaction(function () use (
            $customer,
            $principal,
            $serviceCharge,
            $totalPayable,
            $installmentAmount,
            $durationWeeks,
            $startDate,
            $endDate,
            $validated,
            $request
        ) {
            $year = $startDate->format('Y');
            $lastId = DB::table('loans')->max('id') ?? 0;
            $loanNumber = "LN-{$year}-" . str_pad((string) ($lastId + 1001), 5, '0', STR_PAD_LEFT);

            $newLoan = Loan::create([
                'loan_number'            => $loanNumber,
                'customer_id'            => $customer->id,
                'branch_id'              => $customer->branch_id,
                'staff_id'               => $customer->staff_id,
                'principal_amount'       => $principal,
                'service_charge_amount'  => $serviceCharge,
                'total_payable_amount'   => $totalPayable,
                'installment_amount'     => $installmentAmount,
                'number_of_installments' => $durationWeeks,
                'frequency'              => 'weekly',
                'start_date'             => $startDate->format('Y-m-d'),
                'end_date'               => $endDate->format('Y-m-d'),
                'disbursed_at'           => Carbon::now('Asia/Dhaka'),
                'cached_outstanding'     => $totalPayable,
                'cached_total_paid'      => 0.00,
                'status'                 => 'active',
                'purpose'                => $validated['purpose'] ?? null,
                'created_by'             => $request->user()?->id,
            ]);

            // Generate 50-week schedule
            LoanScheduleGenerator::generate($newLoan);

            return $newLoan;
        });

        return response()->json([
            'success' => true,
            'message' => 'Loan disbursed successfully and 50-week installment schedule generated.',
            'data'    => new LoanResource($loan->load(['customer', 'branch', 'staff', 'installments'])),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $loan = Loan::with(['customer', 'branch', 'staff', 'installments.allocations'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => new LoanResource($loan),
        ]);
    }

    public function schedule(int $id): JsonResponse
    {
        $loan = Loan::with('installments.allocations')->findOrFail($id);

        $schedule = $loan->installments->map(function ($inst) {
            return [
                'id'            => $inst->id,
                'installmentNo' => $inst->installment_number,
                'dueDate'       => $inst->due_date?->format('Y-m-d'),
                'expected'      => (string) $inst->expected_amount,
                'paid'          => (string) $inst->paid_amount,
                'remaining'     => (string) $inst->remaining_amount,
                'status'        => $inst->status,
                'paidAt'        => $inst->paid_at?->toIso8601String(),
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => [
                'loanNumber'   => $loan->loan_number,
                'totalPayable' => (string) $loan->total_payable_amount,
                'outstanding'  => (string) $loan->cached_outstanding,
                'totalPaid'    => (string) $loan->cached_total_paid,
                'installments' => $schedule,
            ],
        ]);
    }
}
