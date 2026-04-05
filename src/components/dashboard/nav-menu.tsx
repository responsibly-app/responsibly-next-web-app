"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ClipboardList, LayoutDashboard, Plug, User, Building2, Users } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { routes } from "@/routes";

const items = [
  { title: "Dashboard", url: routes.dashboard.root(), icon: LayoutDashboard },
  { title: "Members", url: routes.dashboard.members(), icon: Users },
  { title: "Events", url: routes.dashboard.events(), icon: CalendarDays },
  { title: "Attendance", url: routes.dashboard.attendance(), icon: ClipboardList },
  { title: "Organizations", url: routes.dashboard.organizations(), icon: Building2 },
  { title: "Integrations", url: routes.dashboard.integrations(), icon: Plug },
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
