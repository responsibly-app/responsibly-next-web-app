"use client";

import dynamic from "next/dynamic";

const dashboardLayout: string = "v2";

const DashboardLayout = dynamic(
  () =>
    dashboardLayout === "v2"
      ? import("@/components/dashboard/layouts/v2/dashboard-layout-v2")
      : import("@/components/dashboard/layouts/v1/dashboard-layout"),
  { ssr: false },
);

export default function Page({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
