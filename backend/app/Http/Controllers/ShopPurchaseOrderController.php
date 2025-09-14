<?php

namespace App\Http\Controllers;

use App\Models\ShopPurchaseOrder;
use Illuminate\Http\Request;
class ShopPurchaseOrderController extends Controller
{
  public function index(Request $request)
  {
      $query = ShopPurchaseOrder::with(['user', 'supplier']);

      if ($request->has('start_date')) {
          $query->whereDate('purchase_date', '>=', $request->start_date);
      }

      if ($request->has('end_date')) {
          $query->whereDate('purchase_date', '<=', $request->end_date);
      }

      $orders = $query->get();

      return response()->json($orders);
  }
    public function store(Request $request)
  {
    $request->validate([
      'supplier_id' => 'required|exists:suppliers,id',
      'purchase_date' => 'required|date',
      'delivery_date' => 'nullable|date',
      'status' => 'in:pending,complete,cancel',
      'items' => 'required|array',
      'items.*.name' => 'required|string',
      'items.*.quantity' => 'required|integer|min:1',
      'items.*.price' => 'required|numeric|min:0',
    ]);

    $totalPrice = collect($request->items)->sum(function ($item) {
      return $item['quantity'] * $item['price'];
    });

    $order = ShopPurchaseOrder::create([
      'user_id' => auth()->id(), 
      'supplier_id' => $request->supplier_id,
      'purchase_date' => $request->purchase_date,
      'expected_delivery' => $request->delivery_date, 
      'total_price' => $totalPrice,
    ]);

    foreach ($request->items as $item) {
      $order->items()->create([
        'name' => $item['name'],
        'quantity' => $item['quantity'],
        'price' => $item['price'],
      ]);
    }

    return response()->json(['message' => 'Order created successfully'], 201);
  }

    public function show(ShopPurchaseOrder $shopPurchaseOrder)
    {
        return response()->json($shopPurchaseOrder->load(['tbl_users','supplier']));
    }

    public function update(Request $request, ShopPurchaseOrder $shopPurchaseOrder)
    {
        $request->validate([
            'total_price' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:pending,complete,cancel',
            'expected_delivery' => 'nullable|date',
        ]);

        $shopPurchaseOrder->update($request->only('total_price','status','expected_delivery'));
        return response()->json($shopPurchaseOrder);
    }

    public function destroy(ShopPurchaseOrder $shopPurchaseOrder)
    {
        $shopPurchaseOrder->delete();
        return response()->json(null, 204);
    }
}
