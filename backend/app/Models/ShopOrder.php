<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShopOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'total_pay',
        'payment_method',
        'currency',
        'invoice_no',
        'paid_by',
    ];

    public static function boot()
    {
        parent::boot();

        static::creating(function($order){
            if(!$order->invoice_no){
                $last = self::latest('id')->first();
                $number = $last ? $last->id + 1 : 1;
                $order->invoice_no = 'INV-' . str_pad($number, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'user_id');
    }
}
