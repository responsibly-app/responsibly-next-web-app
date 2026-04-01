"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Plug, LayoutDashboard, User, Building2 } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { routes } from "@/routes";

const items = [
  { title: "Dashboard", url: routes.dashboard.root(), icon: LayoutDashboard },
  { title: "Chat", url: "/chat", icon: MessageSquare },
  { title: "Organizations", url: routes.dashboard.organizations(), icon: Building2 },
  { title: "Integrations", url: routes.dashboard.integrations(), icon: Plug },
  { title: "Account", url: routes.dashboard.account(), icon: User },
];

export function NavMenu() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
              <Link href={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
