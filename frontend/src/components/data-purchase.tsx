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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import api from "@/services/api";

export function PurchaseTable({
  onOrderDeleted = () => {},
  dateRange = undefined,
}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const orderToDeleteId = useRef(null); // Fix: Declare the ref here

  useEffect(() => {
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
        console.error("Failed to fetch purchase orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [dateRange, onOrderDeleted]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const totalPurchaseAmount = orders.reduce(
    (sum, order) => sum + parseFloat(order.total_price),
    0
  );

  const handleDelete = async () => {
    try {
      if (orderToDeleteId.current) {
        await api.delete(`/shop-purchase-orders/${orderToDeleteId.current}`);
        onOrderDeleted();
      }
    } catch (error) {
      console.error("Failed to delete the order:", error);
      alert("Failed to delete the order.");
    } finally {
      setOpenDeleteDialog(false);
      orderToDeleteId.current = null;
    }
  };

  const handleOpenDeleteDialog = (id) => {
    orderToDeleteId.current = id;
    setOpenDeleteDialog(true);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-0">
      <h2 className="text-xl font-bold mb-4">Purchase Orders</h2>
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
          {orders.length > 0 ? (
            orders.map((order) => (
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
                    onClick={() => handleOpenDeleteDialog(order.id)}
                    className="text-red-500 hover:text-red-700 font-medium cursor-pointer"
                  >
                    Delete
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

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              purchase order from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
