<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('org_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('name_bn', 150)->nullable();
            $table->string('tagline', 255)->nullable();
            $table->string('registration_no', 100);
            $table->string('phone', 50);
            $table->string('email', 100);
            $table->text('address');
            $table->string('primary_color', 20)->default('#0f766e');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('org_settings');
    }
};
