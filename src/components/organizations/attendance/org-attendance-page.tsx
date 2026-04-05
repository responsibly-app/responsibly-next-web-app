"use client";

import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, ChevronRight, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useListEvents } from "@/lib/auth/hooks";
import { routes } from "@/routes";

type Props = { orgId: string };

export function OrgAttendancePage({ orgId }: Props) {
  const { data: events = [], isPending } = useListEvents(orgId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>

      <Card>
        <CardContent className="p-0">
          {isPending ? (
            <div className="space-y-3 px-6 py-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ClipboardList className="mb-3 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No events yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create events in the{" "}
                <Link href={routes.dashboard.events()} className="underline underline-offset-4">
                  Events
                </Link>{" "}
                page to track attendance.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {events.map((ev) => (
                <Link
                  key={ev.id}
                  href={routes.dashboard.eventAttendance(ev.id)}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <CalendarDays className="size-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{ev.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {format(new Date(ev.startAt), "MMM d, yyyy · h:mm a")}
                        {ev.endAt && (
                          <span> – {format(new Date(ev.endAt), "h:mm a")}</span>
                        )}
                      </p>
                      {ev.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {ev.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
