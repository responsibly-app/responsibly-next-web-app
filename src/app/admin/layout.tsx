import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getUserRoleFromDB } from "@/lib/auth/actions";
import { AdminLayout } from "@/components/admin/admin-layout";
import { routes } from "@/routes";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });

  if (!session) {
    redirect(routes.auth.signIn());
  }

  const role = await getUserRoleFromDB(session.user.id);

  if (role !== "admin") {
    redirect(routes.dashboard.root());
  }

  return <AdminLayout>{children}</AdminLayout>;
}
