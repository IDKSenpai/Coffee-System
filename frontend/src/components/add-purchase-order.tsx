import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Calendar } from "@/components/ui/calendar";
import { ChevronDownIcon } from "lucide-react";
import { CircleX } from "lucide-react";

import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
export function AddOrder({ onOrderCreated = () => {} }) {
  const [openSupplier, setOpenSupplier] = React.useState(false);
  const [openStatus, setOpenStatus] = React.useState(false);
  const [valueStatus, setValueStatus] = React.useState(status[0].value);
  const [openDate, setOpenDate] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [dateDelivery, setDateDelivery] = React.useState(false);
  const [delivery, setDelivery] = React.useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = React.useState("item");
  const [isOpen, setIsOpen] = React.useState(false);
  const [suppliers, setSuppliers] = React.useState<
    { value: string; label: string }[]
  >([]);
  const [loadingSuppliers, setLoadingSuppliers] = React.useState(true);
  const [supplier, setSupplier] = React.useState<{
    value: string;
    label: string;
  } | null>(null);

  const [items, setItems] = React.useState([
    { id: 1, name: "", quantity: 1, price: 0 },
  ]);

  React.useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoadingSuppliers(true);
        const { data } = await api.get("/suppliers");
        setSuppliers(data.map((s: any) => ({ value: s.id, label: s.name })));
      } catch (err) {
        console.error("Failed to fetch suppliers", err);
      } finally {
        setLoadingSuppliers(false);
      }
    };

    fetchSuppliers();
  }, []);

  const resetForm = () => {
    // Reset the state of all form fields
    setSupplier(null);
    setDate(undefined);
    setDelivery(undefined);
    setValueStatus(status[0].value);
    setItems([{ id: 1, name: "", quantity: 1, price: 0 }]);
    setActiveTab("item");
  };

  // add new item
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now(), name: "", quantity: 1, price: 0 },
    ]);
  };

  // update field
  const handleChange = (id: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // remove item
  const handleRemoveItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const handleSubmit = async () => {
    if (!supplier) {
      alert("Please select a supplier");
      return;
    }

    const hasEmptyName = items.some((item) => item.name.trim() === "");
    if (hasEmptyName) {
      alert("Please provide a name for all items.");
      return;
    }

    if (!date) {
      alert("Please select a purchase date.");
      return;
    }

    try {
      const payload = {
        supplier_id: supplier.value,
        purchase_date: date?.toISOString().split("T")[0],
        delivery_date: delivery?.toISOString().split("T")[0] || null,
        status: valueStatus,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
      };

      const { data } = await api.post("/shop-purchase-orders", payload);

      onOrderCreated();

      setIsOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to save order:", err);
      alert("Failed to save order" + err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <form>
        <DialogTrigger asChild>
          <Button variant="black">Add Purchase Order</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
          </DialogHeader>
          <div className="flex w-full max-w-sm flex-col gap-6">
            <Tabs
              defaultValue="Order Item"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="item" className="cursor-pointer">
                  Add Item
                </TabsTrigger>
                <TabsTrigger value="detail" className="cursor-pointer">
                  Order Detail
                </TabsTrigger>
              </TabsList>
              <TabsContent value="item">
                <Card>
                  <CardHeader className="flex justify-between items-center">
                    <CardTitle>Order Items</CardTitle>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="bg-black text-white rounded-sm py-1 px-4 cursor-pointer"
                    >
                      Add Item
                    </button>
                  </CardHeader>

                  <ScrollArea className="h-120 w-full">
                    <CardContent className="grid gap-6">
                      {items.map((item, index) => (
                        <div
                          key={item.id}
                          className="border-2 border-gray-200 px-4 pt-6 pb-4 rounded-2xl relative"
                        >
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="absolute top-3 cursor-pointer right-6 text-red-500 hover:text-red-700"
                          >
                            <CircleX />
                          </button>

                          <div className="grid gap-3">
                            <Label>Item {index + 1}:</Label>
                            <Input
                              value={item.name}
                              onChange={(e) =>
                                handleChange(item.id, "name", e.target.value)
                              }
                            />
                          </div>

                          <div className="flex gap-3  mt-4">
                            <div>
                              <Label className="pb-2">Quantity:</Label>
                              <div className="flex">
                                <button
                                  className="bg-black border-0 cursor-pointer text-white px-4 rounded-l-sm"
                                  onClick={
                                    () =>
                                      handleChange(
                                        item.id,
                                        "quantity",
                                        Math.max(0, item.quantity - 0.01)
                                      ) // subtract decimal
                                  }
                                >
                                  -
                                </button>
                                <Input
                                  type="number"
                                  className="text-center rounded-none no-spinners w-20"
                                  value={item.quantity.toFixed(2)}
                                  step={0.01}
                                  onChange={(e) => {
                                    const value =
                                      parseFloat(e.target.value) || 0;
                                    handleChange(item.id, "quantity", value);
                                  }}
                                />

                                <button
                                  className="bg-black border-0 cursor-pointer text-white px-4 rounded-r-sm"
                                  onClick={() =>
                                    handleChange(
                                      item.id,
                                      "quantity",
                                      item.quantity + 0.01
                                    )
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div>
                              <Label className="pb-2">Price:</Label>
                              <Input
                                className="no-spinners"
                                type="number"
                                placeholder="$1.00"
                                value={item.price === 0 ? "" : item.price}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  handleChange(item.id, "price", value);
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex justify-between mt-4">
                            <p>Item Total:</p>
                            <p>{(item.quantity * item.price).toFixed(2)}$</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </ScrollArea>

                  <CardFooter className="flex justify-between ">
                    <p>Total: {total.toFixed(2)}$</p>
                    <div className="flex gap-2">
                      <DialogClose className="bg-red-500 hover:bg-red-600 rounded-sm text-white px-3 cursor-pointer">
                        Cancel
                      </DialogClose>
                      <Button onClick={() => setActiveTab("detail")}>
                        Next
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="detail">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Detail</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="tabs-demo-current">Supplier</Label>
                      <Popover
                        open={openSupplier}
                        onOpenChange={setOpenSupplier}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openSupplier}
                            className="w-[auto] justify-between"
                          >
                            {supplier?.label ?? "Select Supplier..."}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-[auto] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search Supplier..."
                              className="h-9"
                            />
                            <CommandList>
                              {loadingSuppliers && (
                                <p className="p-2">Loading...</p>
                              )}
                              {!loadingSuppliers && suppliers.length === 0 && (
                                <CommandEmpty>No Supplier found.</CommandEmpty>
                              )}
                              <CommandGroup>
                                {suppliers.map((s) => (
                                  <CommandItem
                                    className="cursor-pointer"
                                    key={s.value}
                                    value={s.value}
                                    onSelect={() => {
                                      setSupplier({
                                        value: s.value,
                                        label: s.label,
                                      });
                                      setOpenSupplier(false);
                                    }}
                                  >
                                    {s.label}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        supplier?.value === s.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="tabs-demo-new">Purchase Date</Label>
                      <div className="flex flex-col gap-3">
                        <Popover open={openDate} onOpenChange={setOpenDate}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              id="date"
                              className="w-auto justify-between font-normal"
                            >
                              {date ? date.toLocaleDateString() : "Select date"}
                              <ChevronDownIcon />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={date}
                              captionLayout="dropdown"
                              onSelect={(date) => {
                                setDate(date);
                                setOpenDate(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="tabs-demo-new">
                        Expect Delivery Date
                      </Label>
                      <div className="flex flex-col gap-3">
                        <Popover
                          open={dateDelivery}
                          onOpenChange={setDateDelivery}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              id="date"
                              className="w-auto justify-between font-normal"
                            >
                              {delivery
                                ? delivery.toLocaleDateString()
                                : "Select date"}
                              <ChevronDownIcon />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={delivery}
                              captionLayout="dropdown"
                              onSelect={(delivery) => {
                                setDelivery(delivery);
                                setOpenDate(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="tabs-demo-current">Status</Label>
                      <Popover open={openStatus} onOpenChange={setOpenStatus}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openStatus}
                            className="w-[auto] justify-between"
                          >
                            {valueStatus
                              ? status.find((s) => s.value === valueStatus)
                                  ?.label
                              : "Select Status..."}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[auto] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search Supplier..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>No Supplier found.</CommandEmpty>
                              <CommandGroup>
                                {status.map((s) => (
                                  <CommandItem
                                    className="cursor-pointer"
                                    key={s.value}
                                    value={s.value}
                                    onSelect={(currentValue) => {
                                      setValueStatus(
                                        currentValue === valueStatus
                                          ? ""
                                          : currentValue
                                      );
                                      setOpenStatus(false);
                                    }}
                                  >
                                    {s.label}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        valueStatus === s.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </CardContent>
                  <CardFooter className="grid grid-cols-1 ">
                    <div>
                      <div className="flex">
                        <p>Total: {total.toFixed(2)}$</p>
                      </div>
                    </div>
                    <div className="flex gap-1 justify-end mt-4">
                      <Button
                        variant={"outline"}
                        onClick={() => setActiveTab("item")}
                      >
                        Back
                      </Button>
                      <Button onClick={handleSubmit}>
                        Create Purchase Order
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
}
