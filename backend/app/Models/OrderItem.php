<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_order_id',
        'item_id',
        'quantity',
        'price',
        'discount',
        'options',
    ];

    protected $casts = [
        'options' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(ShopOrder::class, 'shop_order_id');
    }

    public function item()
    {
        return $this->belongsTo(Items::class);
    }
}
