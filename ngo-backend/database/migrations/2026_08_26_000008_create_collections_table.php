<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collections', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_number', 30)->unique()->index();
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->restrictOnDelete();
            $table->foreignId('staff_id')->constrained('users')->restrictOnDelete();
            $table->decimal('total_amount', 15, 2);
            $table->enum('payment_method', ['cash', 'mobile_banking', 'bank', 'other'])->default('cash');
            $table->string('payment_reference', 100)->nullable();
            $table->date('collection_date')->index();
            $table->enum('status', ['completed', 'reversed'])->default('completed')->index();
            $table->decimal('loan_balance_before', 15, 2)->nullable();
            $table->decimal('loan_balance_after', 15, 2)->nullable();
            $table->decimal('savings_balance_before', 15, 2)->nullable();
            $table->decimal('savings_balance_after', 15, 2)->nullable();
            $table->string('idempotency_key', 64)->nullable()->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collections');
    }
};
