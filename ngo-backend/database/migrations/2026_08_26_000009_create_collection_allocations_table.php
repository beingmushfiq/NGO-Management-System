<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collection_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('collection_id')->constrained('collections')->cascadeOnDelete();
            $table->enum('type', ['loan', 'savings'])->index();
            $table->decimal('amount', 15, 2);
            $table->foreignId('loan_id')->nullable()->constrained('loans')->restrictOnDelete();
            $table->foreignId('loan_installment_id')->nullable()->constrained('loan_installments')->restrictOnDelete();
            $table->foreignId('savings_account_id')->nullable()->constrained('savings_accounts')->restrictOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collection_allocations');
    }
};
