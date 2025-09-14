<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReceiveOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_order_id',
        'status',
        'receive_at',
        'user_id',
        'note'
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(ShopPurchaseOrder::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function receiveOrders()
    {
        return $this->hasMany(ReceiveOrder::class, 'purchase_order_id');
    }

     public function employee()
    {
        return $this->belongsTo(Employee::class, 'user_id');
    }

}
