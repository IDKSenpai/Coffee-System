<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Items extends Model
{
    use HasFactory;

    protected $table = 'items';

    protected $fillable = ['name', 'price', 'image', 'options'];

    protected $casts = [
        'options' => 'array',
    ];

    public $timestamps = true;

    public function orders()
    {
        return $this->belongsToMany(ShopOrder::class, 'order_items')
                    ->withPivot('quantity', 'price')
                    ->withTimestamps();
    }
}
