import { useState, useEffect } from "react";
import { CalendarQuery } from "@/components/calendar";
import { CardCancel } from "@/components/card-cancel";
import { CardComplete } from "@/components/card-complete";
import { CardPending } from "@/components/card-pending";
import { ReceiveTable } from "@/components/data-receive";
import { CardRevenue } from "@/components/revenues";
import api from "@/services/api";

function ReceiveOrder() {
  const [dateRange, setDateRange] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange?.from) {
        params.start_date = dateRange.from.toISOString().split("T")[0];
      }
      if (dateRange?.to) {
        params.end_date = dateRange.to.toISOString().split("T")[0];
      }
      const response = await api.get("/shop-purchase-orders", { params });
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [dateRange]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <>
      <main>
        <aside>
          <CalendarQuery onDateRangeChange={setDateRange} />
          <CardRevenue orders={orders} />
          <CardComplete orders={orders} />
          <CardPending orders={orders} />
          <CardCancel orders={orders} />
        </aside>
        <aside>
          <div className="my-4 border-1 inline-block px-4 py-1 rounded-sm bg-gray-200">
            Overview
          </div>
          <div>
            <ReceiveTable
              dateRange={dateRange}
              orders={orders}
              onOrderUpdated={fetchOrders}
            />
          </div>
        </aside>
      </main>
    </>
  );
}

export default ReceiveOrder;
