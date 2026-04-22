"use client";

import { MobileNav } from "./app-sidebar-v2";
import { BreadcrumbDemo } from "../../header-breadcrumbs";
import { HeaderUserDropdown } from "../../header-user";
import { NavUserType } from "../../nav-user";
import { authClient } from "@/lib/auth/auth-client";
import { EnvBadge } from "@/components/ui-custom/env-badge";

export function DashboardHeaderV2() {
  const { data: session, isPending } = authClient.useSession();

  const user: NavUserType = {
    id: session?.user.id ?? "",
    name: session?.user.name ?? "",
    email: session?.user.email ?? "",
    avatar: session?.user.image ?? "avatar",
  };

  return (
    <header className="absolute inset-x-0 top-0 z-40 bg-background/60 flex h-12 shrink-0 items-center gap-2 border-b px-4 shadow-xs backdrop-blur-md lg:px-6">
      <MobileNav />
      <BreadcrumbDemo />
      <div className="ml-auto flex items-center gap-2">
        <EnvBadge />
        <HeaderUserDropdown user={user} isPending={isPending} />
      </div>
    </header>
  );
}
