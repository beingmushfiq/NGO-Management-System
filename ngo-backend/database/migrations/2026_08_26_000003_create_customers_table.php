<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('customer_code', 30)->unique();
            $table->string('name', 100)->index();
            $table->string('name_bn', 100)->nullable();
            $table->string('phone', 30)->index();
            $table->string('alternate_phone', 30)->nullable();
            $table->string('nid', 30)->index();
            $table->text('address');
            $table->foreignId('branch_id')->constrained('branches')->restrictOnDelete();
            $table->foreignId('staff_id')->constrained('users')->restrictOnDelete();
            $table->enum('status', ['active', 'inactive', 'blacklisted'])->default('active')->index();
            $table->string('occupation', 100)->nullable();
            $table->string('emergency_contact', 100)->nullable();
            $table->timestamp('registered_at')->useCurrent()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
