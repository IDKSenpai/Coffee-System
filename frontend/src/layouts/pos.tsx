import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CircleX, ShoppingCart } from "lucide-react";
import Invoice from "./invoice";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/services/api";

interface Item {
  id: number;
  name: string;
  price: number;
  image?: string;
  options?: { name: string; values: string[] }[];
  discount: number;
}

interface CartItem extends Item {
  quantity: number;
  selectedOptions: { [key: string]: string };
}

interface SearchProps {
  onSearch: (query: string) => void;
}

export function Search({ onSearch }: SearchProps) {
  const [query, setQuery] = useState("");
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSearch(query);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex w-full max-w-sm items-center gap-2"
    >
      <Input
        type="text"
        placeholder="Search items..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button type="submit" variant="outline">
        Search
      </Button>
    </form>
  );
}

function Pos() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [totalUSD, setTotalUSD] = useState(0);
  const [totalKHR, setTotalKHR] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [currency, setCurrency] = useState<"USD" | "KHR" | null>(null);
  const [step, setStep] = useState<"pos" | "invoice">("pos");
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [currentUser, setCurrentUser] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Calculate the total number of items for the badge
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user");
        setCurrentUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, []);

  const handleSearch = (query: string) => {
    fetchItems(query);
  };

  useEffect(() => {
    const usd = cart.reduce(
      (sum, item) =>
        sum + item.price * item.quantity * (1 - (item.discount || 0) / 100),
      0
    );
    const khr = usd * 4100;
    setTotalUSD(usd);
    setTotalKHR(khr);
  }, [cart]);

  const handlePayment = async (method: string, currency?: "USD" | "KHR") => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    if (!currentUser) {
      alert("You must be logged in to pay");
      return;
    }

    setPaymentMethod(method);
    setCurrency(currency || null);

    const payload = {
      user_id: currentUser.id,
      payment_method:
        method === "cash"
          ? "cash"
          : method === "khqr_r"
          ? "khqr"
          : method === "khqr_d"
          ? "khqr"
          : "cash",
      currency: currency || null,
      paid_by: currentUser.name,
      items: cart.map((item) => ({
        item_id: item.id,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || 0,
        options: Object.entries(item.selectedOptions).map(([name, value]) => ({
          name,
          values: [value],
        })),
      })),
    };

    try {
      const res = await api.post("/shop-orders", payload);

      setInvoiceData(res.data);
      setCheckoutOpen(false);
      setShowInvoiceModal(true);
      setCart([]);
    } catch (err) {
      console.error("❌ Failed to save order:", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async (query = "") => {
    try {
      setLoading(true);
      const res = await api.get("/items", {
        params: query ? { search: query } : {},
      });
      setItems(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch items:", err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: Item) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      const defaultOptions: { [key: string]: string } = {};
      item.options?.forEach((opt) => {
        defaultOptions[opt.name] = opt.values[0];
      });
      setCart([
        ...cart,
        { ...item, quantity: 1, selectedOptions: defaultOptions, discount: 0 },
      ]);
    }
    // Removed setIsOpen(true) to prevent auto-opening on mobile
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((c) => c.id !== id));
  };

  const updateQuantity = (id: number, qty: number) => {
    setCart(
      cart.map((c) => (c.id === id ? { ...c, quantity: Math.max(1, qty) } : c))
    );
  };

  const updateOption = (id: number, optionName: string, value: string) => {
    setCart(
      cart.map((c) =>
        c.id === id
          ? {
              ...c,
              selectedOptions: { ...c.selectedOptions, [optionName]: value },
            }
          : c
      )
    );
  };

  const updateDiscount = (id: number, value: number) => {
    setCart(
      cart.map((c) =>
        c.id === id ? { ...c, discount: Math.max(0, value) } : c
      )
    );
  };

  const totalPrice = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity * (1 - (item.discount || 0) / 100),
    0
  );

  const subTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (step === "invoice" && invoiceData) {
    return <Invoice data={invoiceData} onBack={() => setStep("pos")} />;
  }

  return (
    <main className="flex gap-4">
      <aside className="grid">
        <div className="border-b pb-4">
          <Search onSearch={handleSearch} />
        </div>

        {loading ? (
          <p className="mt-4">Loading...</p>
        ) : items.length === 0 ? (
          <p className="mt-4">No items found</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <Card
                key={item.id}
                className="w-60"
                onClick={(e) => {
                  // Prevent clicks on interactive children like buttons/selects from triggering this
                  const target = e.target as HTMLElement;
                  if (
                    target.tagName !== "BUTTON" &&
                    target.tagName !== "SELECT" &&
                    target.tagName !== "OPTION"
                  ) {
                    addToCart(item);
                  }
                }}
              >
                <CardHeader>
                  <CardTitle className="border h-40 rounded-xl overflow-hidden">
                    {item.image ? (
                      <img
                        src={`http://localhost:8000/storage/${item.image}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No Image
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-red-500">${item.price}</p>

                  {item.options?.length ? (
                    <div className="mt-2">
                      <p className="font-semibold">Options:</p>
                      <ul className="list-disc list-inside ml-4">
                        {item.options.map((opt, i) => (
                          <li key={i}>
                            {opt.name}: {opt.values.join(", ")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No options</p>
                  )}
                </CardContent>
                <CardFooter className="justify-end">
                  <button
                    className="bg-black cursor-pointer text-white rounded-sm px-8 py-2"
                    onClick={() => addToCart(item)}
                  >
                    Add
                  </button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </aside>

      <aside className="lg:w-1/3">
        <button
          onClick={() => setIsOpen(true)}
          className="block md:hidden bg-black text-white p-3 rounded-full bottom-10 right-6 cursor-pointer shadow-lg fixed"
        >
          <ShoppingCart />
          {/* Badge for total items */}
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {totalItems}
            </span>
          )}
        </button>

        <div
          className={`fixed right-0 top-0 w-full md:w-70 xl:w-120 h-full bg-white border-l-2 px-4 py-4 transform transition-transform duration-300
            ${isOpen ? "translate-x-0" : "translate-x-full"}
            md:translate-x-0 md:block`}
        >
          <div className="flex justify-between items-center border-b-2 pb-2 mb-4">
            <h1 className="font-bold text-xl">Add to Cart</h1>
            <CircleX
              className="text-red-600 cursor-pointer xl:hidden 2xl:hidden md:hidden lg:hidden"
              onClick={() => setIsOpen(false)}
            />
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[calc(100%-80px)] pb-18">
            {cart.length === 0 ? (
              <p className="text-gray-400 text-center">Your cart is empty</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="p-4 space-y-2 border rounded-xl">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{item.name}</p>
                    <HoverCard>
                      <HoverCardTrigger>
                        <CircleX
                          className="text-red-600 cursor-pointer"
                          onClick={() => removeFromCart(item.id)}
                        />
                      </HoverCardTrigger>
                      <HoverCardContent>Remove</HoverCardContent>
                    </HoverCard>
                  </div>

                  {item.options?.length > 0 && (
                    <div className="space-y-2">
                      {item.options.map((opt) => (
                        <div
                          key={opt.name}
                          className="flex items-center justify-between"
                        >
                          <p className="text-sm">{opt.name}</p>
                          <select
                            className="border rounded px-2 py-1 cursor-pointer"
                            value={item.selectedOptions[opt.name]}
                            onChange={(e) =>
                              updateOption(item.id, opt.name, e.target.value)
                            }
                          >
                            {opt.values.map((val) => (
                              <option key={val} value={val}>
                                {val}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="font-medium">Quantity:</p>
                    <div className="flex items-center border rounded-lg overflow-hidden">
                      <button
                        className="bg-black text-white px-4 py-2 hover:bg-gray-800"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, Number(e.target.value))
                        }
                        className="w-16 text-center border-x outline-none"
                      />
                      <button
                        className="bg-black text-white px-4 py-2 hover:bg-gray-800"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <label htmlFor="{`discount-${item.id}`}">Discount:</label>
                    <div>
                      <input
                        className="border-2 w-10 rounded-sm text-center no-spinners"
                        type="number"
                        placeholder="0"
                        id={`discount-${item.id}`}
                        value={item.discount === 0 ? "" : item.discount}
                        onChange={(e) =>
                          updateDiscount(item.id, Number(e.target.value) || 0)
                        }
                        min={0}
                        max={100}
                      />
                      <span>%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center font-semibold">
                    <p>Total Price:</p>
                    <p>
                      $
                      {(
                        item.price *
                        item.quantity *
                        (1 - (item.discount || 0) / 100)
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <footer className="fixed bottom-0 left-0 right-0 bg-black text-white px-4 py-3 flex justify-between items-center">
            <div className="grid grid-rows-2 items-center gap-4">
              <div className="flex items-center gap-8">
                <p>SubTotal:</p>
                <p>${subTotal.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-semibold border-b-2">Total Price:</p>
                <p className="text-lg font-bold">${totalPrice.toFixed(2)}</p>
              </div>
            </div>
            <div>
              <button
                className="bg-blue-500 px-4 py-2 rounded-sm cursor-pointer"
                onClick={() => {
                  if (cart.length === 0) {
                    alert("Your cart is empty");
                    return;
                  }
                  setCheckoutOpen(true);
                }}
              >
                Checkout
              </button>
            </div>
          </footer>
        </div>
      </aside>

      {checkoutOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-80">
            <div className="flex justify-end mb-4">
              <CircleX
                className="text-red-500 cursor-pointer"
                onClick={() => setCheckoutOpen(false)}
              />
            </div>
            <h2 className="text-xl text-black font-bold mb-4 text-center">
              Select Payment Method
            </h2>

            <div className="flex mb-4 justify-between">
              <h1 className="text-gray-500 font-bold text-2xl">Total:</h1>
              <div className="flex gap-1 pr-4">
                <p className="text-gray-500 font-bold text-2xl pr-2">
                  {totalUSD.toFixed(2)}
                </p>
                <span className="text-gray-500 font-bold text-2xl">$</span>
              </div>
            </div>

            <div className="flex mb-4 justify-between">
              <h1 className="text-gray-500 font-bold text-2xl">សរុប:</h1>
              <div className="flex gap-1 pr-4">
                <p className="text-gray-500 font-bold text-2xl ">
                  {totalKHR.toLocaleString()}
                </p>
                <span className="text-gray-500 font-bold text-2xl">៛</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                className="border px-4 py-2 rounded bg-black text-white cursor-pointer"
                onClick={() => handlePayment("cash")}
              >
                Cash
              </button>

              <button
                className="border px-4 py-2 rounded bg-blue-500 text-white cursor-pointer "
                onClick={() => handlePayment("khqr_r", "KHR")}
              >
                KHQR Riel
              </button>
              <button
                className="border px-4 py-2 rounded bg-green-500 text-white cursor-pointer "
                onClick={() => handlePayment("khqr_d", "USD")}
              >
                KHQR Dollar
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvoiceModal && invoiceData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white py-6 rounded-xl relative">
            <Invoice
              data={invoiceData}
              onBack={() => setShowInvoiceModal(false)}
            />
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Payment</h2>
            {paymentMethod === "cash" ? (
              <p>Pay with cash</p>
            ) : (
              <div>
                <p>
                  Scan QR for{" "}
                  {paymentMethod === "khqr_r"
                    ? currency === "KHR"
                      ? "Scan KHQR Riel"
                      : ""
                    : paymentMethod === "khqr_d"
                    ? currency === "USD"
                      ? "Scan KHQR Dollar"
                      : ""
                    : "Pay with cash"}
                </p>
                <div className="flex justify-between mt-2">
                  <span>Total USD:</span>
                  <span>${totalUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Total KHR:</span>
                  <span>៛{totalKHR.toLocaleString()}</span>
                </div>
              </div>
            )}
            <button
              className="mt-4 bg-black text-white px-4 py-2 rounded"
              onClick={() => setShowPaymentModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Pos;
