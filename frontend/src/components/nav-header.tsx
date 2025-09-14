import { type LucideIcon } from "lucide-react";

import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavHeaders({
  navHeaders,
}: {
  navHeaders: {
    title: string;
    icon?: LucideIcon;
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {navHeaders.map((header) => {
          const Icon = header.icon;
          return (
            <SidebarMenuItem key={header.title}>
              <Collapsible className="group/collapsible">
                <CollapsibleTrigger
                  asChild
                  className="flex justify-center align-middle"
                >
                  <SidebarMenuButton
                    className="border-b-2 flex items-center gap-0"
                    tooltip={header.title}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span className="truncate ml-1 align-middle">
                      {header.title}
                    </span>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </Collapsible>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
