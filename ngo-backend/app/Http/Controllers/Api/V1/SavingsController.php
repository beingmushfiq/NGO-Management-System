<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\SavingsAccountResource;
use App\Models\AuditLog;
use App\Models\SavingsAccount;
use App\Models\SavingsTransaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SavingsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = SavingsAccount::with(['customer', 'branch']);

        if ($user && $user->role === 'staff') {
            $query->where('branch_id', $user->branch_id);
        } elseif ($request->filled('branch_id')) {
            $query->where('branch_id', $request->query('branch_id'));
        }

        if ($request->filled('search')) {
            $term = $request->query('search');
            $query->where(function ($q) use ($term) {
                $q->where('account_number', 'LIKE', "%{$term}%")
                  ->orWhereHas('customer', function ($cq) use ($term) {
                      $cq->where('name', 'LIKE', "%{$term}%")
                         ->orWhere('customer_code', 'LIKE', "%{$term}%")
                         ->orWhere('phone', 'LIKE', "%{$term}%");
                  });
            });
        }

        $accounts = $query->orderBy('id', 'desc')->paginate($request->query('per_page', 50));

        return response()->json([
            'success' => true,
            'data'    => SavingsAccountResource::collection($accounts->items()),
            'meta'    => [
                'currentPage' => $accounts->currentPage(),
                'lastPage'    => $accounts->lastPage(),
                'total'       => $accounts->total(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $account = SavingsAccount::with(['customer', 'branch', 'transactions'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => new SavingsAccountResource($account),
        ]);
    }

    public function deposit(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:10',
            'note'   => 'nullable|string|max:255',
        ]);

        $account = DB::transaction(function () use ($id, $validated, $request) {
            $acc = SavingsAccount::where('id', $id)->lockForUpdate()->firstOrFail();
            $amount = number_format((float) $validated['amount'], 2, '.', '');
            $balanceBefore = (string) $acc->cached_balance;
            $balanceAfter = bcadd($balanceBefore, $amount, 2);

            SavingsTransaction::create([
                'savings_account_id' => $acc->id,
                'type'               => 'deposit',
                'amount'             => $amount,
                'balance_before'     => $balanceBefore,
                'balance_after'      => $balanceAfter,
                'reference_type'     => 'counter_deposit',
                'reference_id'       => null,
                'transaction_date'   => Carbon::now('Asia/Dhaka')->format('Y-m-d'),
                'note'               => $validated['note'] ?? 'Direct counter deposit',
                'created_by'         => $request->user()->id,
            ]);

            $acc->cached_balance = $balanceAfter;
            $acc->save();

            AuditLog::create([
                'user_id'     => $request->user()->id,
                'branch_id'   => $acc->branch_id,
                'action'      => 'savings.deposit',
                'entity_type' => SavingsAccount::class,
                'entity_id'   => $acc->id,
                'new_values'  => ['amount' => $amount, 'balance_after' => $balanceAfter],
                'created_at'  => Carbon::now('Asia/Dhaka'),
            ]);

            return $acc;
        });

        return response()->json([
            'success' => true,
            'message' => 'Deposit recorded successfully.',
            'data'    => new SavingsAccountResource($account->load(['customer', 'branch', 'transactions'])),
        ]);
    }

    public function withdraw(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:10',
            'note'   => 'nullable|string|max:255',
        ]);

        $amount = number_format((float) $validated['amount'], 2, '.', '');

        try {
            $account = DB::transaction(function () use ($id, $amount, $validated, $request) {
                $acc = SavingsAccount::where('id', $id)->lockForUpdate()->firstOrFail();
                $balanceBefore = (string) $acc->cached_balance;

                // Invariant FI-02 check inside lock
                if (bccomp($amount, $balanceBefore, 2) > 0) {
                    throw new \InvalidArgumentException("Withdrawal amount (৳{$amount}) exceeds available savings balance (৳{$balanceBefore}).");
                }

                $balanceAfter = bcsub($balanceBefore, $amount, 2);

                SavingsTransaction::create([
                    'savings_account_id' => $acc->id,
                    'type'               => 'withdrawal',
                    'amount'             => $amount,
                    'balance_before'     => $balanceBefore,
                    'balance_after'      => $balanceAfter,
                    'reference_type'     => 'counter_withdrawal',
                    'reference_id'       => null,
                    'transaction_date'   => Carbon::now('Asia/Dhaka')->format('Y-m-d'),
                    'note'               => $validated['note'] ?? 'Member savings withdrawal',
                    'created_by'         => $request->user()->id,
                ]);

                $acc->cached_balance = $balanceAfter;
                $acc->save();

                AuditLog::create([
                    'user_id'     => $request->user()->id,
                    'branch_id'   => $acc->branch_id,
                    'action'      => 'savings.withdrawal',
                    'entity_type' => SavingsAccount::class,
                    'entity_id'   => $acc->id,
                    'new_values'  => ['amount' => $amount, 'balance_after' => $balanceAfter],
                    'created_at'  => Carbon::now('Asia/Dhaka'),
                ]);

                return $acc;
            });

            return response()->json([
                'success' => true,
                'message' => 'Withdrawal processed successfully.',
                'data'    => new SavingsAccountResource($account->load(['customer', 'branch', 'transactions'])),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'code'    => 'INSUFFICIENT_SAVINGS_BALANCE',
            ], 400);
        }
    }
}
