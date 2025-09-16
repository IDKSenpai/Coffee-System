// invoice.tsx

import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
import { toPng } from "html-to-image";
import EscPosEncoder from "@freedom_sky/esc-pos-encoder";

interface InvoiceProps {
  data: any;
  onBack: () => void;
}

export default function Invoice({ data, onBack }: InvoiceProps) {
  // Get all unique option names to use as table columns
  const allOptionNames = Array.from(
    new Set(
      data.items.flatMap((item: any) =>
        Array.isArray(item.options)
          ? item.options.map((opt: any) => opt.name)
          : []
      )
    )
  );

  const printerWidthPx = 384;

  // Function to handle the Bluetooth communication
  const sendToBluetoothPrinter = async (commands: Uint8Array) => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          "000018f0-0000-1000-8000-00805f9b34fb",
          "00002af1-0000-1000-8000-00805f9b34fb",
        ],
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(
        "000018f0-0000-1000-8000-00805f9b34fb"
      );
      const characteristic = await service.getCharacteristic(
        "00002af1-0000-1000-8000-00805f9b34fb"
      );

      const chunkSize = 512;
      for (let i = 0; i < commands.length; i += chunkSize) {
        const chunk = commands.slice(i, i + chunkSize);
        await characteristic.writeValue(chunk);
        await new Promise((res) => setTimeout(res, 50));
      }
    } catch (error) {
      console.error("Bluetooth printing failed:", error);
      alert("Bluetooth printing failed: " + (error as Error).message);
    }
  };

  const handlePrint = async () => {
    const node = document.getElementById("print-area");
    if (!node) return alert("No div found with id=print-area");

    try {
      // 1. Capture div as high-res PNG
      const dataUrl = await toPng(node, { cacheBust: true });
      const img = new Image();
      img.src = dataUrl;
      await new Promise((res) => (img.onload = res));

      // 2. Draw into temp canvas to trim white space
      const tempCanvas = document.createElement("canvas");
      const tctx = tempCanvas.getContext("2d")!;
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      tctx.drawImage(img, 0, 0);

      const imgData = tctx.getImageData(
        0,
        0,
        tempCanvas.width,
        tempCanvas.height
      );
      const pixels = imgData.data;

      let top = null,
        bottom = null;
      for (let y = 0; y < tempCanvas.height; y++) {
        for (let x = 0; x < tempCanvas.width; x++) {
          const idx = (y * tempCanvas.width + x) * 4;
          const alpha = pixels[idx + 3];
          if (alpha > 0) {
            if (top === null) top = y;
            bottom = y;
          }
        }
      }

      // 3. Crop image vertically
      const croppedHeight = bottom! - top! + 1;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = img.width;
      canvas.height = croppedHeight;
      ctx.drawImage(img, 0, -top!);

      // Convert cropped canvas back into bitmap
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/png")
      );
      let bitmap = await createImageBitmap(blob);

      // 4. Resize to printer width
      const printerHeightPx =
        Math.ceil(((bitmap.height / bitmap.width) * printerWidthPx) / 8) * 8;

      // 5. Encode and send
      const encoder = new EscPosEncoder();
      const commands = encoder
        .initialize()
        .align("center")
        .image(bitmap, printerWidthPx, printerHeightPx, "threshold")
        .newline()
        .newline()
        .newline()
        .encode();

      await sendToBluetoothPrinter(commands);
    } catch (err) {
      console.error("Failed to print:", err);
      alert("Failed to print. Check console.");
    }
  };

  return (
    <div className="p-4">
      {/* This is the visible invoice for the user to see and scroll through */}
      <ScrollArea className="h-[450px] px-4">
        <div className="w-[384px] font-bold" id="print-area">
          <h1 className="text-2xl font-bold mb-4 text-center">Coffee System</h1>
          <p>Invoice No: {data.invoice_no}</p>
          <p>Date: {new Date(data.created_at).toLocaleString()}</p>
          <p>Payment Method: {data.payment_method}</p>
          <p>Paid By: Customer</p>
          <p className="mb-2">
            Exchange Rate: 4,100<span style={{ fontFamily: "Khmer" }}>៛</span>
          </p>

          <table className="font-sans  border-collapse w-full text-xl">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left">Item</th>
                <th className="px-2 py-1 text-center">Qty</th>
                {allOptionNames.map((name) => (
                  <th key={name} className="px-2 py-1 text-center">
                    {name}
                  </th>
                ))}
                <th className="px-2 py-1 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((it: any, i: number) => {
                const itemPrice = parseFloat(it.price);
                const itemQuantity = parseFloat(it.quantity);
                const itemDiscount = parseFloat(it.discount ?? 0);
                const itemSubtotal = itemPrice * itemQuantity;
                const finalSubtotal = itemSubtotal * (1 - itemDiscount / 100);

                return (
                  <React.Fragment key={i}>
                    <tr className="border-t">
                      <td className="px-2 py-1 text-left">{it.item?.name}</td>
                      <td className="px-2 py-1 text-center">{itemQuantity}</td>
                      {allOptionNames.map((name) => {
                        const opt = it.options?.find(
                          (o: any) => o.name === name
                        );
                        return (
                          <td key={name} className="px-2 py-1 text-center">
                            {opt ? opt.values.join(", ") : ""}
                          </td>
                        );
                      })}
                      <td className="px-2 py-1 text-right">
                        ${itemPrice.toFixed(2)}
                      </td>
                    </tr>
                    <tr style={{ fontSize: "10px" }}>
                      <td colSpan={1} className="px-2 py-1 text-sm font-bold">
                        Subtotal:
                      </td>
                      <td
                        colSpan={2 + allOptionNames.length}
                        className="px-2 text-right text-sm font-bold"
                      >
                        <p>${finalSubtotal.toFixed(2)}</p>
                        <p className="text-black text-sm font-bold">
                          (Dis: {itemDiscount.toFixed(0)}%)
                        </p>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          <div className="border-t mt-2 pt-2 text-2xl ">
            <div className="flex justify-between font-bold align-middle">
              <p className="font-bold">Total:</p>
              <p>${parseFloat(data.total_pay).toFixed(2)}</p>
            </div>
            <div className="font-bold flex align-middle justify-between">
              <p style={{ fontFamily: "Khmer" }}>សរុប:</p>
              <p>
                {(parseFloat(data.total_pay) * 4100).toLocaleString("en-US")}
                <span style={{ fontFamily: "Khmer" }}>៛</span>
              </p>
            </div>
            <p className="text-center my-4">Thank you! Come Again!</p>
          </div>
        </div>
      </ScrollArea>

      <div className="flex justify-between gap-4 mt-4">
        <button
          className="flex-1 border px-4 py-2 rounded bg-green-500 text-white cursor-pointer"
          onClick={handlePrint}
        >
          Print Invoice
        </button>
        <button
          className="flex-1 border px-4 py-2 rounded bg-blue-500 text-white cursor-pointer"
          onClick={onBack}
        >
          Close
        </button>
      </div>
    </div>
  );
}
