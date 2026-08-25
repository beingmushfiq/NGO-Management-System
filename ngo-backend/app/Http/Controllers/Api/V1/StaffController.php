<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\StaffResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with('branch')->whereIn('role', ['admin', 'staff']);

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->query('branch_id'));
        }

        if ($request->filled('role')) {
            $query->where('role', $request->query('role'));
        }

        if ($request->filled('search')) {
            $term = $request->query('search');
            $query->where(function ($q) use ($term) {
                $q->where('name', 'LIKE', "%{$term}%")
                  ->orWhere('phone', 'LIKE', "%{$term}%")
                  ->orWhere('staff_code', 'LIKE', "%{$term}%")
                  ->orWhere('email', 'LIKE', "%{$term}%");
            });
        }

        $staffList = $query->orderBy('id', 'asc')->get();

        return response()->json([
            'success' => true,
            'data'    => StaffResource::collection($staffList),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:100',
            'phone'      => 'required|string|max:30|unique:users,phone',
            'email'      => 'nullable|email|max:100|unique:users,email',
            'password'   => 'required|string|min:6',
            'branch_id'  => 'nullable|exists:branches,id',
            'role'       => 'required|in:admin,staff',
            'staff_code' => 'nullable|string|max:20|unique:users,staff_code',
        ]);

        if (empty($validated['staff_code'])) {
            $lastId = User::max('id') ?? 0;
            $validated['staff_code'] = 'STF-' . str_pad((string) ($lastId + 1), 3, '0', STR_PAD_LEFT);
        }

        $validated['password'] = Hash::make($validated['password']);
        $validated['status'] = 'active';

        $staff = User::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Staff appointed successfully.',
            'data'    => new StaffResource($staff->load('branch')),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $staff = User::with(['branch', 'assignedCustomers'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => new StaffResource($staff),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $staff = User::findOrFail($id);

        $validated = $request->validate([
            'name'      => 'sometimes|required|string|max:100',
            'phone'     => 'sometimes|required|string|max:30|unique:users,phone,' . $staff->id,
            'email'     => 'nullable|email|max:100|unique:users,email,' . $staff->id,
            'branch_id' => 'nullable|exists:branches,id',
            'role'      => 'sometimes|required|in:admin,staff',
            'status'    => 'sometimes|required|in:active,inactive',
        ]);

        if ($request->filled('password')) {
            $validated['password'] = Hash::make($request->password);
        }

        $staff->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Staff updated successfully.',
            'data'    => new StaffResource($staff->load('branch')),
        ]);
    }
}
