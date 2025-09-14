<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_order_id')->constrained('shop_orders')->onDelete('cascade');
            $table->enum('method', ['cash', 'khqr', 'card']);
            $table->decimal('amount', 12, 2);
            $table->enum('status', ['pending', 'success', 'failed'])->default('pending');
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
