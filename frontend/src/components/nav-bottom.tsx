import { type LucideIcon } from "lucide-react";

import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function SinglePage({
  pages,
  onSelectPage,
}: {
  pages: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
  onSelectPage: (page: { url: string; title: string }) => void;
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {pages.map((page) => (
          <Collapsible key={page.title} asChild className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  className="cursor-pointer"
                  tooltip={page.title}
                  onClick={() =>
                    onSelectPage({ url: page.url, title: page.title })
                  }
                >
                  {page.icon && <page.icon />}
                  <span>{page.title}</span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
