"use client";

import dynamic from "next/dynamic";

const AdminLayout = dynamic(() => import("@/components/admin/admin-layout").then((m) => m.AdminLayout), { ssr: false });

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
