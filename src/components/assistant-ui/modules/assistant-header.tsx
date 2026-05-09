"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { routes } from "@/routes";
import { Separator } from "@/components/ui/separator";
import { HeaderUserDropdown, NavUserType } from "./header-user";
import { authClient } from "@/lib/auth/auth-client";
import { ContextDisplay } from "../context-display";
import { UsageDisplay } from "./usage-display";

export function AssistantHeader() {
  const { data: session, isPending } = authClient.useSession();

  const user: NavUserType = {
    id: session?.user.id ?? "",
    name: session?.user.name ?? "",
    email: session?.user.email ?? "",
    avatar: session?.user.image ?? "avatar",
  };

  return (
    <header className="bg-background/60 sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between gap-2 border-b px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        {/* <Separator
          orientation="vertical"
          className="mx-2 my-auto h-8"
        /> */}
        {/* <Link href={routes.dashboard.root()}>Dashboard</Link> */}
      </div>
      <div className="flex items-center gap-4">
        <UsageDisplay />
        <div>
          <HeaderUserDropdown user={user} isPending={isPending} />
        </div>
      </div>
    </header>
  );
}
