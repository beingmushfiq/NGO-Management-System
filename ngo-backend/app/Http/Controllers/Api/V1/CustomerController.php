<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Models\SavingsAccount;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Customer::with(['branch', 'staff', 'savingsAccount', 'activeLoan']);

        if ($user && $user->role === 'staff') {
            $query->where('branch_id', $user->branch_id);
        } elseif ($request->filled('branch_id')) {
            $query->where('branch_id', $request->query('branch_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $term = $request->query('search');
            $query->where(function ($q) use ($term) {
                $q->where('name', 'LIKE', "%{$term}%")
                  ->orWhere('name_bn', 'LIKE', "%{$term}%")
                  ->orWhere('customer_code', 'LIKE', "%{$term}%")
                  ->orWhere('phone', 'LIKE', "%{$term}%")
                  ->orWhere('nid', 'LIKE', "%{$term}%");
            });
        }

        $customers = $query->orderBy('id', 'desc')->paginate($request->query('per_page', 50));

        return response()->json([
            'success' => true,
            'data'    => CustomerResource::collection($customers->items()),
            'meta'    => [
                'currentPage' => $customers->currentPage(),
                'lastPage'    => $customers->lastPage(),
                'total'       => $customers->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:100',
            'name_bn'           => 'nullable|string|max:100',
            'phone'             => 'required|string|max:30|unique:customers,phone',
            'alternate_phone'   => 'nullable|string|max:30',
            'nid'               => 'required|string|max:30|unique:customers,nid',
            'address'           => 'required|string',
            'branch_id'         => 'required|exists:branches,id',
            'staff_id'          => 'required|exists:users,id',
            'occupation'        => 'nullable|string|max:100',
            'emergency_contact' => 'nullable|string|max:100',
        ]);

        $customer = DB::transaction(function () use ($validated) {
            // Generate customer code CUS-XXXX
            $lastId = DB::table('customers')->max('id') ?? 0;
            $code = 'CUS-' . str_pad((string) ($lastId + 1001), 4, '0', STR_PAD_LEFT);

            $cust = Customer::create([
                'customer_code'     => $code,
                'name'              => $validated['name'],
                'name_bn'           => $validated['name_bn'] ?? null,
                'phone'             => $validated['phone'],
                'alternate_phone'   => $validated['alternate_phone'] ?? null,
                'nid'               => $validated['nid'],
                'address'           => $validated['address'],
                'branch_id'         => $validated['branch_id'],
                'staff_id'          => $validated['staff_id'],
                'status'            => 'active',
                'occupation'        => $validated['occupation'] ?? null,
                'emergency_contact' => $validated['emergency_contact'] ?? null,
                'registered_at'     => Carbon::now('Asia/Dhaka'),
            ]);

            // Auto-create savings vault account SAV-XXXX
            $savCode = 'SAV-' . str_pad((string) ($lastId + 1001), 4, '0', STR_PAD_LEFT);
            SavingsAccount::create([
                'customer_id'          => $cust->id,
                'branch_id'            => $cust->branch_id,
                'account_number'       => $savCode,
                'cached_balance'       => 0.00,
                'monthly_contribution' => 800.00,
                'status'               => 'active',
                'opened_at'            => Carbon::now('Asia/Dhaka'),
            ]);

            return $cust;
        });

        return response()->json([
            'success' => true,
            'message' => 'Customer registered successfully and savings account created.',
            'data'    => new CustomerResource($customer->load(['branch', 'staff', 'savingsAccount'])),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $customer = Customer::with([
            'branch',
            'staff',
            'savingsAccount.transactions',
            'loans.installments',
            'collections' => fn($q) => $q->orderBy('id', 'desc')->take(20),
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => new CustomerResource($customer),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'name'              => 'sometimes|required|string|max:100',
            'name_bn'           => 'nullable|string|max:100',
            'phone'             => 'sometimes|required|string|max:30|unique:customers,phone,' . $customer->id,
            'alternate_phone'   => 'nullable|string|max:30',
            'address'           => 'sometimes|required|string',
            'occupation'        => 'nullable|string|max:100',
            'emergency_contact' => 'nullable|string|max:100',
            'status'            => 'sometimes|required|in:active,inactive,blacklisted',
        ]);

        $customer->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Customer profile updated successfully.',
            'data'    => new CustomerResource($customer->load(['branch', 'staff', 'savingsAccount'])),
        ]);
    }
}
