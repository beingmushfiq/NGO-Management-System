<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BranchResource;
use App\Models\Branch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $branches = Branch::with(['staff', 'customers', 'loans', 'savingsAccounts'])
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => BranchResource::collection($branches),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code'    => 'required|string|max:20|unique:branches,code',
            'name'    => 'required|string|max:100',
            'name_bn' => 'nullable|string|max:100',
            'address' => 'required|string|max:255',
            'phone'   => 'required|string|max:30',
            'email'   => 'nullable|email|max:100',
        ]);

        $branch = Branch::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Branch established successfully.',
            'data'    => new BranchResource($branch),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $branch = Branch::with(['staff', 'customers', 'loans', 'savingsAccounts'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => new BranchResource($branch),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $branch = Branch::findOrFail($id);

        $validated = $request->validate([
            'name'    => 'sometimes|required|string|max:100',
            'name_bn' => 'nullable|string|max:100',
            'address' => 'sometimes|required|string|max:255',
            'phone'   => 'sometimes|required|string|max:30',
            'email'   => 'nullable|email|max:100',
            'status'  => 'sometimes|required|in:active,inactive',
        ]);

        $branch->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Branch details updated successfully.',
            'data'    => new BranchResource($branch),
        ]);
    }
}
