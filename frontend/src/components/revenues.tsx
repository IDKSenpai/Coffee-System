import { IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CardRevenue({ orders }) {
  const totalCompletedPurchase = orders
    .filter((order) => order.status === "complete")
    .reduce((sum, order) => sum + parseFloat(order.total_price), 0);

  return (
    <div className="mt-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Completed Purchase</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {`$${totalCompletedPurchase.toFixed(2)}`}
          </CardTitle>
          <CardAction>
            <Badge className="bg-white">
              <IconTrendingUp className="text-black" />
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  );
}
