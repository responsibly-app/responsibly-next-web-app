"use client";

import { LogOutIcon, MonitorIcon, SmartphoneIcon, ShieldIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import { useListSessions, useRevokeSession, useSignOut } from "@/lib/auth/use-auth";

function parseUserAgent(ua: string | null): { label: string; isMobile: boolean } {
  if (!ua) return { label: "Unknown device", isMobile: false };

  const isMobile = /iPhone|iPad|Android/i.test(ua);

  let browser = "Browser";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua)) browser = "Safari";

  let os = "";
  if (/iPhone/i.test(ua)) os = "iPhone";
  else if (/iPad/i.test(ua)) os = "iPad";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  return { label: os ? `${browser} on ${os}` : browser, isMobile };
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function SessionsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-xl" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="divide-y">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-lg" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SessionsCard() {
  const { data: currentSession } = authClient.useSession();
  const { data: sessions, isPending } = useListSessions();
  const revokeSession = useRevokeSession();
  const signOut = useSignOut();

  if (isPending) return <SessionsCardSkeleton />;

  function handleRevoke(token: string) {
    revokeSession.mutate(token, {
      onError: (err: { message?: string }) => {
        toast.error(err?.message ?? "Failed to revoke session.");
      },
    });
  }

  const currentToken = currentSession?.session?.token;
  const sortedSessions = [...(sessions ?? [])].sort((a, b) =>
    a.token === currentToken ? -1 : b.token === currentToken ? 1 : 0
  );

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex size-9 items-center justify-center rounded-xl">
            <ShieldIcon className="text-primary size-4" />
          </div>
          <div>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Devices and browsers currently signed in to your account.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="divide-y">
          {sortedSessions.map((session) => {
            const isCurrent = session.token === currentToken;
            const { label, isMobile } = parseUserAgent(session.userAgent ?? null);
            const DeviceIcon = isMobile ? SmartphoneIcon : MonitorIcon;
            const isRevoking = revokeSession.isPending && revokeSession.variables === session.token;

            return (
              <div
                key={session.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg">
                    <DeviceIcon className="text-muted-foreground size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {isCurrent ? "Current session" : (session.ipAddress ?? "Unknown")}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {label} · {formatDate(session.createdAt)}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 self-end sm:self-auto"
                  onClick={() => isCurrent ? signOut.mutate() : handleRevoke(session.token)}
                  disabled={isCurrent ? signOut.isPending : isRevoking}
                >
                  {(isCurrent ? signOut.isPending : isRevoking) ? (
                    <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />
                  ) : (
                    <LogOutIcon className="mr-1.5 size-3.5" data-icon="inline-start" />
                  )}
                  {isCurrent ? "Sign out" : "Revoke"}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
