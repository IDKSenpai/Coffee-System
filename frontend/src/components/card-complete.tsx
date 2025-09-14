import { CircleCheckBig } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CardComplete({ orders = [] }) {
  const totalCompleteOrders = orders.filter(
    (order) => order.status === "complete"
  ).length;

  return (
    <div className="mt-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Complete Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalCompleteOrders}
          </CardTitle>
          <CardAction>
            <Badge className="bg-white">
              <CircleCheckBig className="text-green-500" />
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  );
}
