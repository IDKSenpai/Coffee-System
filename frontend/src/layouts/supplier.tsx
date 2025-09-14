import { useState, useEffect } from "react";
import { CreateSupplier } from "@/components/create-supplier";
import { TableSupplier, type Shop } from "@/components/supplier-table";
import api from "@/services/api";

export default function Supplier() {
  const [suppliers, setSuppliers] = useState<Shop[]>([]);

  const fetchSuppliers = async () => {
    try {
      const res = await api.get("/suppliers");
      setSuppliers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return (
    <>
      <aside>
        <CreateSupplier onSuccess={fetchSuppliers} />
      </aside>
      <aside>
        <TableSupplier data={suppliers} onDeleted={fetchSuppliers} />
      </aside>
    </>
  );
}
