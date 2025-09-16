"use client";
import { useState } from "react";
import * as React from "react";
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
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import api from "@/services/api";
import Invoice from "@/layouts/invoice";

export function DataTable({ data, isLoading, error, refreshData }) {
  const orders = data;
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const handleDelete = async (orderId: number) => {
    try {
      await api.delete(`/shop-orders/${orderId}`);
      refreshData();
    } catch (err) {
      console.error("Failed to delete order:", err);
    }
  };

  const totalAmount = React.useMemo(() => {
    return orders.reduce((sum, order) => sum + Number(order.total_pay), 0);
  }, [orders]);

  if (isLoading) {
    return <p>Loading orders...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      <Table>
        <TableCaption className="mb-3">
          A list of your recent shop orders.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Order ID</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.payment_method}</TableCell>
              <TableCell>{order.creator_name}</TableCell>
              <TableCell className="text-right">
                ${Number(order.total_pay).toLocaleString()}
              </TableCell>
              <TableCell className="text-center flex justify-center gap-2">
                {/* View Button */}
                <Button
                  className="text-green-500 bg-transparent hover:text-green-600 hover:bg-transparent"
                  size="sm"
                  onClick={() => setSelectedOrder(order)}
                >
                  View
                </Button>

                {/* Delete AlertDialog */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="text-red-500 bg-transparent hover:bg-transparent"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the order from your records.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(order.id)}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell colSpan={1} className="text-right font-bold">
              ${totalAmount.toLocaleString()}
            </TableCell>
            <TableCell colSpan={2} className="text-center font-bold">
              -
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {/* Invoice Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-auto pt-10">
          <div className="bg-white py-8 px-2 rounded-2xl relative shadow-lg">
            <Invoice
              data={selectedOrder}
              onBack={() => setSelectedOrder(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
