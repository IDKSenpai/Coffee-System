"use client";

import * as React from "react";
import { CalendarQuery } from "@/components/calendar";
import { DataChart } from "@/components/chart";
import { DataTable } from "@/components/data-table";

import api from "@/services/api";

function Dashboard() {
  const [dateRange, setDateRange] = React.useState({
    from: undefined,
    to: undefined,
  });
  const [orders, setOrders] = React.useState([]);
  const [chartData, setChartData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const fetchData = async (range) => {
    try {
      setIsLoading(true);
      setError(null);

      let queryString = "";
      if (range?.from) {
        queryString = `?from=${range.from.toISOString()}`;
        if (range.to) {
          queryString += `&to=${range.to.toISOString()}`;
        }
      }

      const [ordersResponse, chartResponse] = await Promise.all([
        api.get(`/shop-orders${queryString}`),
        api.get(`/chart-data${queryString}`),
      ]);

      setOrders(ordersResponse.data);
      setChartData(chartResponse.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData(dateRange);
  }, [dateRange]);

  return (
    <>
      <aside className="grid gap-2">
        <CalendarQuery onDateRangeChange={setDateRange} />
        <DataChart data={chartData} isLoading={isLoading} error={error} />
      </aside>
      <aside className="mt-10 border-1 rounded-md">
        <p className="text-center my-4 font-bold">Invoice Table</p>
        <DataTable
          data={orders}
          isLoading={isLoading}
          error={error}
          refreshData={() => fetchData(dateRange)}
        />
      </aside>
    </>
  );
}

export default Dashboard;
