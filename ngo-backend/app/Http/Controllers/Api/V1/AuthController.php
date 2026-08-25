<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'phone'    => 'required|string',
            'password' => 'required|string',
        ]);

        $rawPhone = $request->phone;
        $cleanPhone = str_replace(['-', ' ', '+88'], '', $rawPhone);

        $user = User::with('branch')
            ->where(function ($q) use ($rawPhone, $cleanPhone) {
                $q->where('phone', $rawPhone)
                  ->orWhere('phone', $cleanPhone)
                  ->orWhere(DB::raw("REPLACE(REPLACE(phone, '-', ''), ' ', '')"), $cleanPhone);
            })
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'The provided phone or password does not match our records.',
                'code'    => 'INVALID_CREDENTIALS',
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This account has been deactivated. Please contact administration.',
                'code'    => 'ACCOUNT_INACTIVE',
            ], 403);
        }

        $user->last_login_at = Carbon::now('Asia/Dhaka');
        $user->save();

        $token = $user->createToken('auth-token')->plainTextToken;

        $customerId = null;
        if ($user->role === 'customer') {
            $cust = \App\Models\Customer::where('phone', $user->phone)->orWhere('name', $user->name)->first();
            $customerId = $cust?->customer_id ?? $cust?->id ?? 'CUS-1024';
        }

        return response()->json([
            'success' => true,
            'message' => 'Authentication successful.',
            'data'    => [
                'token' => $token,
                'user'  => [
                    'id'         => (string) $user->id,
                    'name'       => $user->name,
                    'email'      => $user->email,
                    'phone'      => $user->phone,
                    'role'       => $user->role,
                    'branchId'   => (string) $user->branch_id,
                    'branchName' => $user->branch?->name,
                    'staffCode'  => $user->staff_code,
                    'customerId' => (string) $customerId,
                ],
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('branch');

        $customerId = null;
        if ($user->role === 'customer') {
            $cust = \App\Models\Customer::where('phone', $user->phone)->orWhere('name', $user->name)->first();
            $customerId = $cust?->customer_id ?? $cust?->id ?? 'CUS-1024';
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'id'         => (string) $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
                'role'       => $user->role,
                'branchId'   => (string) $user->branch_id,
                'branchName' => $user->branch?->name,
                'staffCode'  => $user->staff_code,
                'customerId' => (string) $customerId,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Successfully logged out.',
        ]);
    }
}
