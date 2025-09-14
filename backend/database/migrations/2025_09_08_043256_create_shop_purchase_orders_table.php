<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // ... in your up() method for shop_purchase_orders
public function up(): void
{
    Schema::create('shop_purchase_orders', function (Blueprint $table) {
        $table->id();
        $table->string('invoice_no')->unique();
        $table->foreignId('user_id')->constrained('tbl_users')->onDelete('cascade');
        $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('cascade');
        $table->decimal('total_price',12,2)->nullable(); // Make it nullable if you calculate it after
        $table->enum('status', ['pending', 'cancel', 'complete'])->default('pending');
        $table->date('purchase_date')->nullable(); // <-- Add this line
        $table->date('expected_delivery')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shop_purchase_orders');
    }
};
