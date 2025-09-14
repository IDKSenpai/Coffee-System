<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = ['shop_order_id', 'method', 'amount', 'status', 'paid_at'];

    public function shopOrder()
    {
        return $this->belongsTo(ShopOrder::class);
    }
}
