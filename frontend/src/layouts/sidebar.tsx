"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import Dashboard from "./dashboard";
import Employee from "./employee";
import Supplier from "./supplier";
import Pos from "./pos";
import Items from "./items";
import ReceiveOrder from "./receiveOrder";
import PurchaseOrder from "./purchaseOrder";

export default function Page() {
  const [currentPage, setCurrentPage] = useState({
    url: "dashboard",
    title: "Dashboard",
  });

  const renderContent = () => {
    switch (currentPage.url) {
      case "dashboard":
        return <Dashboard />;
      case "item":
        return <Items />;
      case "pos":
        return <Pos />;
      case "purchase":
        return <PurchaseOrder />;
      case "receive":
        return <ReceiveOrder />;
      case "employee":
        return <Employee />;
      case "supplier":
        return <Supplier />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar onSelectPage={setCurrentPage} />
      <SidebarInset>
        <header className="border-b-2 border-gray-100 flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentPage.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="bg-white min-h-[100%] flex-1 rounded-xl md:min-h-min px-4 py-4">
            {renderContent()}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
