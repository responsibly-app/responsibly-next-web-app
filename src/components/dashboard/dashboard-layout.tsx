"use client";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DasboardHeader } from "./dashboard-header";

export default function DashboardLayout({
  children,
  defaultOpen,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
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
