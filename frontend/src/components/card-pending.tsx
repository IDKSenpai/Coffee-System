import { CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CardPending({ orders = [] }) {
  const totalPendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  return (
    <div className="mt-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Pending Order</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalPendingOrders}
          </CardTitle>
          <CardAction>
            <Badge className="bg-white">
              <CircleAlert className="text-gray-600" />
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  );
}
