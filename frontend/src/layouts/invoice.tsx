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
        filters: [
          {
            services: ["00002af1-0000-1000-8000-00805f9b34fb"],
          },
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
      encoder
        .initialize()
        .align("center")
        .bold(true)
        .text("Coffee System")
        .bold(false)
        .align("left")
        .text("")
        .text(`Invoice No: ${data.invoice_no}`)
        .text(`Date: ${new Date(data.created_at).toLocaleString()}`)
        .text("--------------------------------");

      data.items.forEach((item: any) => {
        const subtotal =
          item.price * item.quantity * (1 - (item.discount ?? 0) / 100);
        encoder.text(`${item.item?.name} x ${item.quantity}`);
        encoder.text(`  Subtotal: $${subtotal.toFixed(2)}`);
      });

      encoder
        .text("--------------------------------")
        .text("")
        .bold(true)
        .align("right")
        .text(`Total: $${data.total_pay}`)
        .cut("partial");

      const printBuffer = encoder.getBuffer();

      await characteristic.writeValue(printBuffer);
    } catch (error) {
      console.error("Printing failed:", error);
      alert("Printing failed: " + error.message);
    }
  };

  return (
    <div>
      <ScrollArea className="h-160">
        <h1 className="text-2xl font-bold mb-4 text-center">Coffee System</h1>
        <p>Invoice No: {data.invoice_no}</p>
        <p>Date: {new Date(data.created_at).toLocaleString()}</p>
        <p>Payment Method: {data.payment_method}</p>
        <p>Paid By: Customer</p>

        <h2 className="mt-4 font-semibold">Items</h2>
        <ul className="list-disc pl-5">
          {data.items.map((it: any, i: number) => {
            const realSubtotal = it.price * it.quantity;
            const subtotal =
              it.price * it.quantity * (1 - (it.discount ?? 0) / 100);

            return (
              <li key={i} className="mb-2">
                {it.item?.name} = ${it.price}
                <br />${it.price} x {it.quantity} = ${realSubtotal.toFixed(2)}{" "}
                <br />
                {it.discount ? ` (Discount: ${it.discount}%)` : ""}
                <div>
                  <span className="font-bold">Subtotal: </span>$
                  {subtotal.toFixed(2)}
                </div>
              </li>
            );
          })}
        </ul>

        <p className="pt-2 font-bold">Total: ${data.total_pay}</p>
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
        {" "}
        Back to Checkout{" "}
      </button>
    </div>
  );
}
