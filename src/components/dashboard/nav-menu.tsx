"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  Flame,
  LayoutDashboard,
  Plug,
  TrendingUp,
  User,
  Users,
  Trophy,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { routes } from "@/routes";

const topItems = [
  { title: "Dashboard", url: routes.dashboard.root(), icon: LayoutDashboard },
  // { title: "Personal", url: routes.dashboard.personal(), icon: User },
  // { title: "Invites", url: routes.dashboard.invites(), icon: Flame },
  // { title: "Points", url: routes.dashboard.points(), icon: TrendingUp },
];

const personalItems = [
  { title: "Invites", url: routes.dashboard.invites(), icon: Flame },
  { title: "Points", url: routes.dashboard.points(), icon: TrendingUp },
];

const organizationItems = [
  { title: "Leaderboard", url: routes.dashboard.leaderboard(), icon: Trophy },
  { title: "Members", url: routes.dashboard.members(), icon: Users },
  { title: "Events", url: routes.dashboard.events(), icon: CalendarDays },
  { title: "Attendance", url: routes.dashboard.attendance(), icon: ClipboardList },
];

const settingsItems = [
  { title: "Integrations", url: routes.dashboard.integrations(), icon: Plug },
];

function NavItems({ items }: { items: typeof topItems }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
            <Link href={item.url} onClick={() => setOpenMobile(false)}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function NavMenu() {
  return (
    <>
      <SidebarGroup>
        <NavItems items={topItems} />
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Personal</SidebarGroupLabel>
        <NavItems items={personalItems} />
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Organization</SidebarGroupLabel>
        <NavItems items={organizationItems} />
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Settings</SidebarGroupLabel>
        <NavItems items={settingsItems} />
      </SidebarGroup>
    </>
  );
}
