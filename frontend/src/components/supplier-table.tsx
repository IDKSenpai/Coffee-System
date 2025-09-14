import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";

import { Label } from "@radix-ui/react-label";
import { Switch } from "@/components/ui/switch";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/services/api";

export type Shop = {
  id: string;
  name: string;
  contact: string;
  email: string;
  status?: "active" | "inactive";
};

interface TableSupplierProps {
  data: Shop[];
  onDeleted?: () => void;
}
export function TableSupplier({ data, onDeleted }: TableSupplierProps) {
  const [deleteShop, setDeleteShop] = React.useState<Shop | null>(null);
  const [editShop, setEditShop] = React.useState<Shop | null>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    contact: "",
    email: "",
    status: "active",
  });

  const handleDelete = async (shop: Shop) => {
    try {
      await api.delete(`/suppliers/${shop.id}`);
      setDeleteShop(null);
      onDeleted?.();
    } catch (err) {
      console.error(err);
      alert("Failed to delete supplier");
    }
  };

  const columns: ColumnDef<Shop>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Shop Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => row.getValue("contact") ?? "-",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) =>
        (row.getValue("email") as string | undefined)?.toLowerCase() ?? "-",
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const shop = row.original;

        return (
          <div className="flex gap-2 justify-center">
            <Button
              variant="green"
              size="sm"
              onClick={() => {
                setEditShop(shop);
                setFormData({
                  name: shop.name,
                  contact: shop.contact,
                  email: shop.email,
                  status: shop.status ?? "active",
                });
              }}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteShop(shop)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by email..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {editShop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-lg font-semibold mb-4">Update Supplier</h2>

            <div className="space-y-4">
              <Input
                placeholder="Shop Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                placeholder="Contact"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
              />
              <Input
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={formData.status === "active"}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      status: checked ? "active" : "inactive",
                    })
                  }
                />
                <Label htmlFor="status">Active</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditShop(null)}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={async () => {
                  try {
                    await api.put(`/suppliers/${editShop.id}`, formData);
                    setEditShop(null);
                    onDeleted?.(); // refresh table
                  } catch (error) {
                    console.error(error);
                    alert("Failed to update supplier.");
                  }
                }}
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteShop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-lg font-semibold mb-4">
              Delete {deleteShop.name}?
            </h2>
            <p className="mb-6">
              Are you sure you want to delete this supplier?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteShop(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    await api.delete(`/suppliers/${deleteShop.id}`);
                    setDeleteShop(null);
                    onDeleted?.();
                  } catch (error) {
                    console.error(error);
                    alert("Failed to delete supplier.");
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
