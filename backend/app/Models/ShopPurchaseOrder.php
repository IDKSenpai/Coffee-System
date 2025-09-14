<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShopPurchaseOrder extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'supplier_id',
        'purchase_date',
        'expected_delivery',
        'status',
        'total_price',
        'invoice_no',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class, 'purchase_order_id');
    }


    protected static function boot()
    {
        parent::boot();

        static::creating(function ($po) {
            if (empty($po->invoice_no)) {
                $lastOrder = self::latest('id')->first();
                $number = $lastOrder ? $lastOrder->id + 1 : 1;
                $po->invoice_no = 'PO-' . str_pad($number, 4, '0', STR_PAD_LEFT);
            }
        });
    }

}
