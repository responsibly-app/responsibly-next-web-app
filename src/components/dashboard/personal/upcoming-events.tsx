"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Monitor, Blend } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useListAllUpcomingEvents } from "@/lib/auth/hooks";
import { routes } from "@/routes";

const EVENT_TYPE_ICONS: Record<string, React.ElementType> = {
  in_person: MapPin,
  online: Monitor,
  hybrid: Blend,
};

function formatEventDate(date: Date): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const time = new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (diffDays === 0) return `Today · ${time}`;
  if (diffDays === 1) return `Tomorrow · ${time}`;
  return new Date(date).toLocaleDateString([], { month: "short", day: "numeric" }) + ` · ${time}`;
}

export function UpcomingEventsCard() {
  const { data: events = [], isPending } = useListAllUpcomingEvents();

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="size-4 text-violet-500" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CalendarDays className="mb-2 size-7 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No upcoming events</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {events.map((ev) => {
              const TypeIcon = EVENT_TYPE_ICONS[ev.eventType ?? "in_person"] ?? MapPin;

              return (
                <li key={ev.id}>
                  <Link
                    href={routes.dashboard.eventDetail(ev.id)}
                    className="flex flex-col gap-0.5 rounded-md border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug">{ev.title}</p>
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {ev.organizationName}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <TypeIcon className="size-3 shrink-0" />
                      <span>{formatEventDate(ev.startAt)}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
