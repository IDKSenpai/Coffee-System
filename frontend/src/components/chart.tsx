"use client";

import * as React from "react";
import { AreaChart, Area, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  revenue: { label: "Total Revenue", color: "rgba(20,184,166)" },
  expense: { label: "Total Expense", color: "rgba(79,70,229)" },
  profit: { label: "Total Profit", color: "rgba(100,100,100)" },
} satisfies ChartConfig;

export function DataChart({ data, isLoading, error }) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("revenue");
  const chartData = data;

  const total: Record<keyof typeof chartConfig, number> = React.useMemo(
    () => ({
      revenue: chartData.reduce((acc, curr) => acc + curr.revenue, 0),
      expense: chartData.reduce((acc, curr) => acc + curr.expense, 0),
      profit: chartData.reduce((acc, curr) => acc + curr.profit, 0),
    }),
    [chartData]
  );

  if (isLoading) {
    return (
      <Card className="flex h-[400px] items-center justify-center">
        Loading chart data...
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex h-[400px] items-center justify-center text-red-500">
        Error: {error}
      </Card>
    );
  }

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          {/* Display Total Profit as the main card title */}
          <CardTitle className="text-gray-500">Total Profit</CardTitle>
          <CardDescription className="text-2xl font-bold text-black">
            {total.profit.toLocaleString()} $
          </CardDescription>
        </div>
        <div className="flex">
          {["revenue", "expense"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="cursor-pointer data-[active=true]:bg-muted/50 w-38 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-md">
                  {total[chart].toLocaleString()} $
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              {/* Correct fill IDs and colors */}
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="rgba(20,184,166,0.3)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="rgba(20,184,166,0.3)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="rgba(79,70,229,0.3)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="rgba(79,70,229,0.3)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              stroke="rgba(20,184,166)"
              hide={activeChart !== "revenue"}
            />
            <Area
              dataKey="expense"
              type="natural"
              fill="url(#fillExpense)"
              stroke="rgba(79,70,229)"
              hide={activeChart !== "expense"}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
