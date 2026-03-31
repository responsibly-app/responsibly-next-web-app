"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import { useAdminStopImpersonating } from "@/lib/auth/hooks";
import { toast } from "sonner";
import { routes } from "@/routes";

const breadcrumbMap: Record<string, string> = {
  [routes.admin.root()]: "Overview",
  [routes.admin.users()]: "Users",
};

export function AdminHeader() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const impersonatedBy = (session?.session as Record<string, unknown> | undefined)?.impersonatedBy;
  const isImpersonating = !!impersonatedBy;

  const stopImpersonating = useAdminStopImpersonating();

  function handleStopImpersonating() {
    stopImpersonating.mutate(undefined, {
      onSuccess: () => {
        toast.success("Stopped impersonating.");
        window.location.href = routes.admin.users();
      },
      onError: (err: { message?: string }) => {
        toast.error(err?.message ?? "Failed to stop impersonating.");
      },
    });
  }

  const pageTitle = breadcrumbMap[pathname] ?? "Admin";

  return (
    <header className="bg-background/60 sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b shadow-xs backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 my-auto data-[orientation=vertical]:h-[calc(var(--header-height)/1.5)]"
        />
        <span className="text-sm font-medium">{pageTitle}</span>

        {isImpersonating && (
          <Badge variant="secondary" className="ml-2 gap-1.5">
            <UserCheck className="size-3" />
            Impersonating: {session?.user?.name || session?.user?.email}
          </Badge>
        )}

        <div className="ml-auto flex items-center gap-2">
          {isImpersonating && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleStopImpersonating}
              disabled={stopImpersonating.isPending}
            >
              {stopImpersonating.isPending ? (
                <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />
              ) : (
                <ArrowLeft className="mr-1.5 size-3.5" data-icon="inline-start" />
              )}
              Stop Impersonating
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild>
            <Link href={routes.dashboard.root()}>Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
