<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_order_id',
        'name',
        'quantity',
        'price'
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(ShopPurchaseOrder::class, 'purchase_order_id');
    }

}
