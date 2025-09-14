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
        Schema::create('receive_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained('shop_purchase_orders')->onDelete('cascade')->index();
            $table->enum('status', ['pending','cancel', 'complete'])->default('pending');
            $table->dateTime('receive_at')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('tbl_users')->onDelete('no action');
            $table->unique('purchase_order_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receive_orders');
    }
};
