<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Employee extends Authenticatable
{
    use HasFactory, HasApiTokens;

    protected $table = 'employee';

    protected $fillable = [
        'username',
        'password',
        'roles',
    ];

    protected $casts = [
        'roles' => 'array', 
    ];

    protected $hidden = [
        'password',
    ];
}
