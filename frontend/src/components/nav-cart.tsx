import { useState } from "react";
import { CircleX, ShoppingCart } from "lucide-react";

function NavCart() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="block md:hidden bg-black text-white p-3 rounded-full fixed bottom-10 right-6 cursor-pointer shadow-lg"
      >
        <ShoppingCart />
      </button>

      <aside
        className={`fixed right-0 top-0 w-full md:w-70 xl:w-120 h-full bg-white border-l-2 px-4 py-4 transform transition-transform duration-300
    ${isOpen ? "translate-x-0" : "translate-x-full"}
    md:translate-x-0 md:block`}
      >
        <div className="flex justify-between items-center border-b-2 pb-2">
          <h1 className="font-bold text-xl">Add to Cart</h1>
          <CircleX
            className="text-red-600 cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
        </div>

        <div className="flex gap-2 flex-col h-[calc(100%-48px)] items-center justify-center">
          <ShoppingCart className="text-gray-400 w-10 h-10" />
          <h1 className="text-gray-400">Your Cart is Empty</h1>
        </div>
      </aside>
    </>
  );
}

export default NavCart;
