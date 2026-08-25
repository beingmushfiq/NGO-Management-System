<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BranchController;
use App\Http\Controllers\Api\V1\CollectionController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\DueController;
use App\Http\Controllers\Api\V1\LoanController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\SavingsController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\Api\V1\StaffController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // 1. Public Authentication & Info
    Route::post('/auth/login', [AuthController::class, 'login'])->name('login');
    Route::get('/settings', [SettingsController::class, 'show']);
    Route::get('/health', fn() => response()->json(['status' => 'ok', 'timestamp' => now()]));

    // 2. Protected Routes (Sanctum)
    Route::middleware('auth:sanctum')->group(function () {
        // Auth / Session
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Dashboard & Metrics
        Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
        Route::get('/dashboard/trends', [DashboardController::class, 'trends']);

        // Customers
        Route::get('/customers', [CustomerController::class, 'index']);
        Route::post('/customers', [CustomerController::class, 'store']);
        Route::get('/customers/{id}', [CustomerController::class, 'show']);
        Route::put('/customers/{id}', [CustomerController::class, 'update']);

        // Loans & Schedule
        Route::get('/loans', [LoanController::class, 'index']);
        Route::post('/loans', [LoanController::class, 'store']);
        Route::get('/loans/{id}', [LoanController::class, 'show']);
        Route::get('/loans/{id}/schedule', [LoanController::class, 'schedule']);

        // Due Installments Recovery Queue
        Route::get('/installments/due', [DueController::class, 'index']);

        // Collections & Receipts
        Route::get('/collections', [CollectionController::class, 'index']);
        Route::post('/collections', [CollectionController::class, 'store']);
        Route::get('/collections/{id}', [CollectionController::class, 'show']);
        Route::get('/collections/{id}/receipt', [CollectionController::class, 'receipt']);

        // Savings Vault Accounts & Ledgers
        Route::get('/savings', [SavingsController::class, 'index']);
        Route::get('/savings/{id}', [SavingsController::class, 'show']);
        Route::post('/savings/{id}/deposit', [SavingsController::class, 'deposit']);
        Route::post('/savings/{id}/withdraw', [SavingsController::class, 'withdraw']);

        // Branches
        Route::get('/branches', [BranchController::class, 'index']);
        Route::post('/branches', [BranchController::class, 'store']);
        Route::get('/branches/{id}', [BranchController::class, 'show']);
        Route::put('/branches/{id}', [BranchController::class, 'update']);

        // Staff
        Route::get('/staff', [StaffController::class, 'index']);
        Route::post('/staff', [StaffController::class, 'store']);
        Route::get('/staff/{id}', [StaffController::class, 'show']);
        Route::put('/staff/{id}', [StaffController::class, 'update']);

        // Reports
        Route::get('/reports/daily-collection', [ReportController::class, 'dailyCollection']);
        Route::get('/reports/loan-portfolio', [ReportController::class, 'loanPortfolio']);
        Route::get('/reports/savings', [ReportController::class, 'savingsLedger']);
        Route::get('/reports/branch-audit', [ReportController::class, 'branchAudit']);

        // Org Settings
        Route::put('/settings', [SettingsController::class, 'update']);
    });
});
