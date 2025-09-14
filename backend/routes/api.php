<?php

use App\Http\Controllers\ItemsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PurchaseOrderItemController;
use App\Http\Controllers\ReceiveOrderController;
use App\Http\Controllers\ShopOrderController;
use App\Http\Controllers\SupplierController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ShopPurchaseOrderController;
use App\Http\Controllers\EmployeeController;

Route::post('/login', [AuthController::class, 'login']); 
Route::middleware(['auth:sanctum'])->group(function () { 
    Route::get('/user', [AuthController::class, 'user']); 
    Route::post('/logout', [AuthController::class, 'logout']); 
    Route::put('/user/update', [AuthController::class, 'update']);
    Route::apiResource('/employee', EmployeeController::class); 
    Route::apiResource('items', ItemsController::class); 
    Route::apiResource('shop-orders', ShopOrderController::class); 
    Route::apiResource('shop-purchase-orders', ShopPurchaseOrderController::class); 
    Route::apiResource('suppliers', SupplierController::class); 
    Route::apiResource('purchase-order-items', PurchaseOrderItemController::class); 
    Route::apiResource('receive-orders', ReceiveOrderController::class); 
    Route::get('/chart-data', [ShopOrderController::class, 'getChartData']); 
});