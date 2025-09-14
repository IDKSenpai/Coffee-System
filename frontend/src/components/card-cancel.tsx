import { CircleX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CardCancel({ orders = [] }) {
  const totalCanceledOrders = orders.filter(
    (order) => order.status === "cancel"
  ).length;

  return (
    <div className="mt-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Canceled Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalCanceledOrders}
          </CardTitle>
          <CardAction>
            <Badge className="bg-white">
              <CircleX className="text-red-600" />
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  );
}
