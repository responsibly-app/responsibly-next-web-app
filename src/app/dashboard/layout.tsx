import { cookies } from "next/headers";
import Dashboard from "@/components/dashboard/dashboard-layout";

export default async function Page({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar_state")?.value;
  const defaultOpen = sidebarState !== "false";

  return <Dashboard defaultOpen={defaultOpen}>{children}</Dashboard>;
}
