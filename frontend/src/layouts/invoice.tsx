import { ScrollArea } from "@/components/ui/scroll-area";
import ESCPOS from "esc-pos-encoder";

interface InvoiceProps {
  data: any;
  onBack: () => void;
}

export default function Invoice({ data, onBack }: InvoiceProps) {
  const printViaBluetooth = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          "000018f0-0000-1000-8000-00805f9b34fb", // printer service
          "00002af1-0000-1000-8000-00805f9b34fb", // printer characteristic
        ],
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(
        "000018f0-0000-1000-8000-00805f9b34fb"
      );
      const characteristic = await service.getCharacteristic(
        "00002af1-0000-1000-8000-00805f9b34fb"
      );

      const encoder = new ESCPOS();

      // Build receipt
      encoder
        .initialize()
        .align("center")
        .bold(true)
        .text("Coffee System")
        .text("")
        .align("left")
        .bold(false)
        .text("")
        .text(`Invoice No: ${data.invoice_no}`)
        .text("")
        .text(`Date: ${new Date(data.created_at).toLocaleString()}`)
        .text("")
        .text(`Payment Method: ${data.payment_method}`)
        .text("")
        .text(`Paid By: Customer`)
        .text("--------------------------------")
        .text("Items:");

      data.items.forEach((item: any) => {
        const itemPrice = parseFloat(item.price);
        const itemQuantity = parseFloat(item.quantity);
        const itemDiscount = parseFloat(item.discount ?? 0);
        const itemSubtotal = itemPrice * itemQuantity;
        const finalSubtotal =
          itemPrice * itemQuantity * (1 - itemDiscount / 100);

        encoder
          .text("")
          .text(`.${item.item?.name} = $${itemPrice.toFixed(2)}`)
          .text("")
          .text(
            `$${itemPrice.toFixed(
              2
            )} x ${itemQuantity} = $${itemSubtotal.toFixed(2)}`
          )
          .text("")
          .text(`Discount: ${itemDiscount}%`)
          .text("")
          .text(`Subtotal: $${finalSubtotal.toFixed(2)}`)
          .text("");
      });

      encoder
        .text("--------------------------------")
        .bold(true)
        .text(`Total:$${parseFloat(data.total_pay).toFixed(2)}`)
        .bold(false)
        .align("center")
        .text("")
        .text("")
        .text("Thank you! Come again!")
        .text("")
        .text("")
        .cut("partial");

      const printBuffer = encoder.encode();

      const chunkSize = 512;
      for (let i = 0; i < printBuffer.length; i += chunkSize) {
        const chunk = printBuffer.slice(i, i + chunkSize);
        await characteristic.writeValue(chunk);
        await new Promise((res) => setTimeout(res, 50));
      }
    } catch (error) {
      console.error("Printing failed:", error);
      alert("Printing failed: " + (error as Error).message);
    }
  };

  return (
    <div>
      <ScrollArea className="h-140">
        <h1 className="text-2xl font-bold mb-4 text-center">Coffee System</h1>
        <p>Invoice No: {data.invoice_no}</p>
        <p>Date: {new Date(data.created_at).toLocaleString()}</p>
        <p>Payment Method: {data.payment_method}</p>
        <p>Paid By: Customer</p>

        <h2 className="mt-4 font-semibold">Items</h2>
        <ul className="list-disc pl-5">
          {data.items.map((it: any, i: number) => {
            const itemPrice = parseFloat(it.price);
            const itemQuantity = parseFloat(it.quantity);
            const itemDiscount = parseFloat(it.discount ?? 0);

            const itemSubtotal = itemPrice * itemQuantity;
            const finalSubtotal =
              itemPrice * itemQuantity * (1 - itemDiscount / 100);

            return (
              <li key={i} className="mb-2">
                {it.item?.name} = ${itemPrice.toFixed(2)}
                <br />${itemPrice.toFixed(2)} x {itemQuantity} = $
                {itemSubtotal.toFixed(2)}
                {it.discount ? ` (Discount: ${itemDiscount}%)` : ""}
                <div>
                  <span className="font-bold">Subtotal: </span>$
                  {finalSubtotal.toFixed(2)}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="pt-2 font-bold">
          Total: ${parseFloat(data.total_pay).toFixed(2)}
        </p>
      </ScrollArea>

      <button
        className="mt-4 border px-4 py-2 rounded bg-green-500 text-white cursor-pointer"
        onClick={printViaBluetooth}
      >
        Print Invoice
      </button>
      <button
        className="mt-4 border px-4 py-2 rounded bg-blue-500 text-white cursor-pointer"
        onClick={onBack}
      >
        Back to Checkout
      </button>
    </div>
  );
}
