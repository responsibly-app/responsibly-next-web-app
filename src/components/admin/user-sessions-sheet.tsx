"use client";

import { format } from "date-fns";
import { MonitorSmartphone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { useAdminListUserSessions, useAdminRevokeUserSession, useAdminRevokeUserSessions } from "@/lib/auth/hooks";

type Props = {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UserSessionsSheet({ userId, userName, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const { data: sessions, isLoading } = useAdminListUserSessions(userId);
  const revokeSession = useAdminRevokeUserSession();
  const revokeAll = useAdminRevokeUserSessions();

  function handleRevoke(token: string) {
    revokeSession.mutate(token, {
      onSuccess: () => {
        toast.success("Session revoked.");
        queryClient.invalidateQueries({ queryKey: ["admin", "sessions", userId] });
      },
      onError: (err: { message?: string }) => {
        toast.error(err?.message ?? "Failed to revoke session.");
      },
    });
  }

  function handleRevokeAll() {
    revokeAll.mutate(userId, {
      onSuccess: () => {
        toast.success(`All sessions revoked for ${userName}.`);
        queryClient.invalidateQueries({ queryKey: ["admin", "sessions", userId] });
      },
      onError: (err: { message?: string }) => {
        toast.error(err?.message ?? "Failed to revoke sessions.");
      },
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Sessions</SheetTitle>
          <SheetDescription>
            Active sessions for <strong>{userName}</strong>.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-4">
          {sessions && sessions.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              className="self-end"
              onClick={handleRevokeAll}
              disabled={revokeAll.isPending}
            >
              {revokeAll.isPending ? (
                <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />
              ) : (
                <Trash2 className="mr-1.5 size-3.5" data-icon="inline-start" />
              )}
              Revoke All
            </Button>
          )}

          {isLoading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          )}

          {!isLoading && sessions?.length === 0 && (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-10 text-center text-sm">
              <MonitorSmartphone className="size-8 opacity-40" />
              No active sessions.
            </div>
          )}

          {sessions?.map((session) => {
            const s = session as {
              token: string;
              createdAt: Date | string;
              expiresAt: Date | string;
              ipAddress?: string | null;
              userAgent?: string | null;
            };
            return (
              <div
                key={s.token}
                className="bg-muted/40 flex items-start justify-between gap-3 rounded-lg border p-3"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {String(s.token).slice(0, 12)}…
                    </Badge>
                  </div>
                  {s.ipAddress && (
                    <p className="text-muted-foreground text-xs">{s.ipAddress}</p>
                  )}
                  {s.userAgent && (
                    <p className="text-muted-foreground truncate text-xs">{s.userAgent}</p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    Expires {format(new Date(s.expiresAt), "MMM d, yyyy HH:mm")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => handleRevoke(s.token)}
                  disabled={revokeSession.isPending}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
