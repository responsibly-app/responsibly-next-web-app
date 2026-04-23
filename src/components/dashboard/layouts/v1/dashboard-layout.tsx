"use client";

import Cookies from "js-cookie";
import { AppSidebar } from "@/components/dashboard/layouts/v1/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DasboardHeader } from "./dashboard-header";

function getDefaultOpen(): boolean {
  const value = Cookies.get("sidebar_state");
  return value !== undefined ? value === "true" : true;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      defaultOpen={getDefaultOpen()}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 60)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <DasboardHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* <div className="bg-blue-100 min-h-[100vh]"></div> */}
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
