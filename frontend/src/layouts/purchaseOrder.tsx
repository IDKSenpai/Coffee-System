import { AddOrder } from "@/components/add-purchase-order";
import { CalendarQuery } from "@/components/calendar";
import { PurchaseTable } from "@/components/data-purchase";
import { TotalPurchase } from "@/components/purchase-order";
import { useState } from "react";

function PurchaseOrder() {
  const [dateRange, setDateRange] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const handleOrderCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };
  return (
    <>
      <main>
        <aside>
          <div className="flex gap-4">
            <CalendarQuery onDateRangeChange={handleDateRangeChange} />
            <AddOrder onOrderCreated={handleOrderCreated} />
          </div>
          <TotalPurchase dateRange={dateRange} key={refreshTrigger} />
          <div className="my-4 border-1 inline-block px-4 py-1 rounded-sm bg-gray-200">
            Overview
          </div>
        </aside>
        <aside>
          <div>
            <PurchaseTable
              dateRange={dateRange}
              key={refreshTrigger}
              onOrderDeleted={handleRefresh}
            />
          </div>
        </aside>
      </main>
    </>
  );
}

export default PurchaseOrder;
