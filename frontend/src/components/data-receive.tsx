import { useEffect, useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import api from "@/services/api";

const status = [
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "complete",
    label: "Complete",
  },
  {
    value: "cancel",
    label: "Cancel",
  },
];

export function ReceiveTable({ orders = [], onOrderUpdated = () => {} }) {
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const orderToUpdateId = useRef(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(
        orders.filter((order) => order.status === filterStatus)
      );
    }
  }, [orders, filterStatus]);

  // Handle status update
  const handleUpdateStatus = async () => {
    if (!selectedStatus || !orderToUpdateId.current) {
      return;
    }
    try {
      await api.patch(`/shop-purchase-orders/${orderToUpdateId.current}`, {
        status: selectedStatus,
      });
      onOrderUpdated();
    } catch (error) {
      console.error("Failed to update the order status:", error);
      alert("Failed to update the order status.");
    } finally {
      setOpenUpdateDialog(false);
      orderToUpdateId.current = null;
      setSelectedStatus(null);
    }
  };

  const handleOpenUpdateDialog = (id, currentStatus) => {
    orderToUpdateId.current = id;
    setSelectedStatus(currentStatus);
    setOpenUpdateDialog(true);
  };

  const totalPurchaseAmount = filteredOrders.reduce(
    (sum, order) => sum + parseFloat(order.total_price),
    0
  );

  return (
    <div className="bg-white p-6 rounded-lg border shadow-md mt-0">
      <h2 className="text-xl text-center font-bold mb-4">Purchase Orders</h2>
      <div className="flex justify-end mb-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px] cursor-pointer">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="cursor-pointer" value="all">
              All
            </SelectItem>
            {status.map((s) => (
              <SelectItem
                className="cursor-pointer"
                key={s.value}
                value={s.value}
              >
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableCaption>A list of your recent purchase orders.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice No.</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Purchase Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.invoice_no}
                </TableCell>
                <TableCell>{order.supplier?.name || "N/A"}</TableCell>
                <TableCell>{order.purchase_date}</TableCell>
                <TableCell
                  className={`capitalize font-medium ${
                    order.status === "pending"
                      ? "text-yellow-500"
                      : order.status === "complete"
                      ? "text-black"
                      : order.status === "cancel"
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {order.status}
                </TableCell>
                <TableCell className="text-right">
                  {order.total_price != null &&
                  !isNaN(parseFloat(order.total_price))
                    ? `$${parseFloat(order.total_price).toFixed(2)}`
                    : "$0.00"}
                </TableCell>
                <TableCell className="text-center space-x-2">
                  <button
                    onClick={() =>
                      handleOpenUpdateDialog(order.id, order.status)
                    }
                    className="text-blue-500 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Edit
                  </button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                No purchase orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>Total</TableCell>
            <TableCell className="text-right font-bold">
              ${totalPurchaseAmount.toFixed(2)}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <Dialog open={openUpdateDialog} onOpenChange={setOpenUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Select a new status for the order.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              onValueChange={setSelectedStatus}
              value={selectedStatus || ""}
            >
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {status.map((s) => (
                  <SelectItem
                    className="cursor-pointer"
                    key={s.value}
                    value={s.value}
                  >
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenUpdateDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={!selectedStatus}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
