<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shop_orders', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_no')->unique();
            $table->foreignId('user_id')->constrained('tbl_users')->onDelete('cascade');
            $table->decimal('total_pay', 12, 2);
            $table->enum('payment_method', ['cash', 'khqr'])->default('cash');
            $table->enum('currency', ['USD', 'KHR'])->nullable(); // for KHQR
            $table->string('paid_by')->nullable();
            $table->timestamps(); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shop_orders');
    }
};
