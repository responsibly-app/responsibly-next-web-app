"use client";

import dynamic from "next/dynamic";

const DashboardLayout = dynamic(() => import("@/components/dashboard/dashboard-layout"), { ssr: false });

import Cookies from "js-cookie";
// import { cookies } from "next/headers";
// import DashboardLayout from "@/components/dashboard/dashboard-layout";



function getDefaultOpen(): boolean {
  // if (typeof document === "undefined") return true;
  // const match = document.cookie.match(/sidebar_state=([^;]+)/);
  // return match ? match[1] !== "false" : true;
  // -------------
  // const cookieStore = await cookies();
  // const sidebarState = cookieStore.get("sidebar_state")?.value;
  // const defaultOpen = sidebarState !== "false";
  // return defaultOpen
  // -------------
  return Cookies.get("sidebar_state") !== "false"
}

export default function Page({ children }: { children: React.ReactNode }) {
  return <DashboardLayout defaultOpen={getDefaultOpen()}>{children}</DashboardLayout>;
}
