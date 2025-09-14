import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useEffect, useState } from "react";
import api from "@/services/api";

export function TotalPurchase({ dateRange = undefined }) {
  const [totalOrders, setTotalOrders] = useState(0);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const params = {};
        if (dateRange?.from) {
          params.start_date = dateRange.from.toISOString().split("T")[0];
        }
        if (dateRange?.to) {
          params.end_date = dateRange.to.toISOString().split("T")[0];
        }
        const response = await api.get("/shop-purchase-orders", { params });
        const orders = response.data;
        setTotalOrders(orders.length);
      } catch (error) {
        console.error("Failed to fetch purchase orders:", error);
        setTotalOrders(0);
      }
    };

    fetchOrders();
  }, [dateRange]);
  return (
    <div className="mt-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Purchase Order</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalOrders}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
