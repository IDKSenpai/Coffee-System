import { useState, useEffect } from "react";
import api from "@/services/api";
import { CreateEmployee } from "@/components/create-employee";
import { EmployeeTable } from "@/components/employee-table";
import { Separator } from "@/components/ui/separator";

function Employee() {
  const [employees, setEmployees] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get("/employee");
        setEmployees(response.data);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      }
    };

    fetchEmployees();
  }, [refreshTrigger]);

  return (
    <>
      <main className="container mx-auto py-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <CreateEmployee onEmployeeCreated={handleRefresh} />
        </header>
        <Separator className="my-6" />
        <section className="border-2 p-4 rounded-md">
          <p className="text-center text-xl font-bold mb-4">Employee List</p>
          <EmployeeTable
            data={employees}
            onEmployeeUpdated={handleRefresh}
            onEmployeeDeleted={handleRefresh}
          />
        </section>
      </main>
    </>
  );
}

export default Employee;
