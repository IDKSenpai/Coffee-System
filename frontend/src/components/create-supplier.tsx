import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import api from "@/services/api";

interface CreateSupplierProps {
  onSuccess?: () => void;
}

export function CreateSupplier({ onSuccess }: CreateSupplierProps) {
  const [isActive, setIsActive] = useState(true);
  const [shopName, setShopName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/suppliers", {
        name: shopName,
        contact: contact || null,
        email: email || null,
        address: address || null,
        status: isActive ? "active" : "inactive",
      });
      onSuccess?.();
      setShopName("");
      setContact("");
      setEmail("");
      setAddress("");
      setIsActive(true);
      setOpen(false);
    } catch (error: any) {
      console.error(error);
      if (error.response?.data?.errors) {
        alert(JSON.stringify(error.response.data.errors));
      } else if (error.response?.data?.error) {
        alert("Failed to create supplier: " + error.response.data.error);
      } else {
        alert("Failed to create supplier.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create Supplier</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-center mb-10 font-bold">
              Create Supplier
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-1">
              <Label htmlFor="shopName">Shop Name</Label>
              <Input
                id="shopName"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>

            <div className="grid gap-1">
              <Label htmlFor="contact">Contact</Label>
              <Input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>

            <div className="grid gap-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-1">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked)}
              />
              <Label htmlFor="status">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Add Supplier</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
