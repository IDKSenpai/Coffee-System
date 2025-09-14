"use client";

import * as React from "react";
import {
  Coffee,
  Monitor,
  Box,
  ShoppingBag,
  CreditCard,
  UserCheck,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { ShopPos } from "./nav-shop";
import { SinglePage } from "./nav-bottom";
import { NavHeaders } from "./nav-header";
import api from "@/services/api";

interface UserResponse {
  username: string;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onSelectPage: (page: { url: string; title: string }) => void;
}

export function AppSidebar({ onSelectPage, ...props }: AppSidebarProps) {
  const [user, setUser] = React.useState<UserResponse | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get<UserResponse>("/user");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);

  const handleUserUpdate = (updatedUser: { username: string }) => {
    setUser({ username: updatedUser.username });
  };

  const data = {
    user: {
      name: user?.username ?? "Guest",
    },
    navHeaders: [
      {
        title: "Coffee System",
        icon: Coffee,
      },
    ],
    shops: [
      {
        title: "Dashboard",
        url: "dashboard",
        icon: Monitor,
      },
      {
        title: "Items",
        url: "item",
        icon: Box,
      },
      {
        title: "Shop POS",
        url: "pos",
        icon: ShoppingBag,
      },
    ],
    navMain: [
      {
        title: "Shop Purchase Order",
        url: "#",
        icon: CreditCard,
        isActive: true,
        items: [
          {
            title: "Purchase Order",
            url: "purchase",
          },
          {
            title: "Receive Order",
            url: "receive",
          },
        ],
      },
    ],
    pages: [
      {
        title: "Employee Dashboard",
        url: "employee",
        icon: UserCheck,
      },
      {
        title: "Supplier",
        url: "supplier",
        icon: Users,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHeaders navHeaders={data.navHeaders} />
      </SidebarHeader>
      <SidebarContent>
        <ShopPos shops={data.shops} onSelectPage={onSelectPage} />
        <NavMain items={data.navMain} onSelectPage={onSelectPage} />
        <SinglePage pages={data.pages} onSelectPage={onSelectPage} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} onUpdateSuccess={handleUserUpdate} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
