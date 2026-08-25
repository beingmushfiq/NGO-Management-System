<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->string('loan_number', 30)->unique();
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->restrictOnDelete();
            $table->foreignId('staff_id')->constrained('users')->restrictOnDelete();
            $table->decimal('principal_amount', 15, 2);
            $table->decimal('service_charge_amount', 15, 2)->default(0.00);
            $table->decimal('total_payable_amount', 15, 2);
            $table->decimal('installment_amount', 15, 2);
            $table->unsignedInteger('number_of_installments')->default(50);
            $table->enum('frequency', ['weekly', 'biweekly', 'monthly'])->default('weekly');
            $table->date('start_date');
            $table->date('end_date');
            $table->timestamp('disbursed_at')->nullable();
            $table->decimal('cached_outstanding', 15, 2)->index();
            $table->decimal('cached_total_paid', 15, 2)->default(0.00);
            $table->enum('status', ['pending', 'active', 'completed', 'overdue', 'cancelled'])->default('pending')->index();
            $table->text('purpose')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};
