import { type LucideIcon } from "lucide-react";

import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function ShopPos({
  shops,
  onSelectPage,
}: {
  shops: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
  onSelectPage: (page: { url: string; title: string }) => void;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Shop Control</SidebarGroupLabel>
      <SidebarMenu>
        {shops.map((shop) => (
          <Collapsible key={shop.title} asChild className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  className="cursor-pointer"
                  tooltip={shop.title}
                  onClick={() =>
                    onSelectPage({ url: shop.url, title: shop.title })
                  }
                >
                  {shop.icon && <shop.icon />}
                  <span>{shop.title}</span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
