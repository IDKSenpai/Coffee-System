<?php

namespace App\Http\Controllers;

use App\Models\ShopOrder;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\ShopPurchaseOrder;

class ShopOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = ShopOrder::with(['user', 'items.item']);

        if ($request->has('from') && $request->has('to')) {
            $query->whereBetween('created_at', [$request->from, $request->to]);
        }

        $orders = $query->get();

        $orders = $orders->map(function ($order) {
            $creator = null;
            if ($order->user) {
                $creator = $order->user->username;
            }
            $order->creator_name = $creator;
            $order->total_pay = (float) $order->total_pay; 
            return $order;
        });

        return response()->json($orders);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|in:cash,khqr',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.discount' => 'nullable|numeric|min:0|max:100',
            'items.*.options' => 'nullable|array',
            'currency' => 'nullable|in:USD,KHR',
        ]);

        $total = 0;
        foreach ($request->items as $i) {
            $total += ($i['price'] * $i['quantity']) * (1 - ($i['discount'] ?? 0)/100);
        }

        $user = Auth::user();

        $order = ShopOrder::create([
            'user_id' => $user->id,  
            'payment_method' => $request->payment_method,
            'paid_by' => $user->username,
            'total_pay' => $total,
            'currency' => $request->currency,
        ]);

        foreach ($request->items as $i) {
            $order->items()->create([
                'item_id' => $i['item_id'],
                'quantity' => $i['quantity'],
                'price' => $i['price'],
                'discount' => $i['discount'] ?? 0,
                'options' => $i['options'] ?? [],
            ]);
        }

        return response()->json($order->load('items.item', 'user'), 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\ShopOrder  $shopOrder
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(ShopOrder $shopOrder)
    {
        return response()->json($shopOrder->load('user', 'items.item'));
    }

    /**
     * Get chart data for revenue, expense, and profit.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getChartData(Request $request)
    {
        $revenueQuery = ShopOrder::query();
        $expenseQuery = ShopPurchaseOrder::query()->where('status', 'complete');

        // Check for date range parameters and apply to both queries
        if ($request->has('from') && $request->has('to')) {
            $revenueQuery->whereBetween('created_at', [$request->from, $request->to]);
            $expenseQuery->whereBetween('purchase_date', [$request->from, $request->to]);
        }

        // Step 1: Get daily revenue data with the applied filter
        $revenueData = $revenueQuery->select(
            DB::raw('CAST(created_at AS DATE) as date'),
            DB::raw('SUM(total_pay) as total_revenue')
        )
        ->groupBy(DB::raw('CAST(created_at AS DATE)'))
        ->orderBy('date')
        ->get();

        // Step 2: Get daily expense data with the applied filter
        $expenseData = $expenseQuery->select(
            DB::raw('CAST(COALESCE(purchase_date, GETDATE()) AS DATE) as date'),
            DB::raw('COALESCE(SUM(total_price), 0) as total_expense')
        )
        ->groupBy(DB::raw('CAST(COALESCE(purchase_date, GETDATE()) AS DATE)'))
        ->orderBy('date')
        ->get();

        // Step 3: Merge and process data
        $mergedData = [];

        foreach ($revenueData as $revenue) {
            $date = $revenue->date;
            $mergedData[$date] = [
                'date' => $date,
                'revenue' => (float) $revenue->total_revenue, 
                'expense' => 0, 
                'profit' => 0
            ];
        }

        foreach ($expenseData as $expense) {
            $date = $expense->date;
            if (!isset($mergedData[$date])) {
                $mergedData[$date] = [
                    'date' => $date,
                    'revenue' => 0, 
                    'expense' => (float) $expense->total_expense,
                    'profit' => 0
                ];
            } else {
                $mergedData[$date]['expense'] = (float) $expense->total_expense;
            }
        }

        // Step 4: Calculate final profit
        foreach ($mergedData as $date => $data) {
            $mergedData[$date]['profit'] = $data['revenue'] - $data['expense'];
        }
        
        if (empty($mergedData)) {
            return response()->json([]);
        }

        return response()->json(array_values($mergedData));
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\ShopOrder  $shopOrder
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(ShopOrder $shopOrder)
    {
        try {
            // Delete all related order items first
            $shopOrder->items()->delete();
            
            // Now delete the order itself
            $shopOrder->delete();

            return response()->json(['message' => 'Order and related items deleted successfully'], 200);

        } catch (\Exception $e) {
            // Log the error for debugging purposes
            \Log::error('Failed to delete order: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete the order.'], 500);
        }
    }
}