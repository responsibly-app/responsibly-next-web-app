"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Monitor, Blend } from "lucide-react";
import { JoinMeetingButton } from "@/components/organizations/events/join-meeting-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/auth-client";
import { useListAllUpcomingEvents } from "@/lib/auth/hooks";
import { dateInTimezone, detectTimezone, formatEventTime, tzAbbr } from "@/lib/utils/timezone";
import { routes } from "@/routes";

const EVENT_TYPE_ICONS: Record<string, React.ElementType> = {
  in_person: MapPin,
  online: Monitor,
  hybrid: Blend,
};

function formatEventDate(date: Date, timezone: string): string {
  const todayStr = dateInTimezone(new Date(), timezone);
  const eventStr = dateInTimezone(date, timezone);

  const todayDate = new Date(todayStr + "T12:00:00Z");
  const eventDate = new Date(eventStr + "T12:00:00Z");
  const diffDays = Math.round((eventDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

  const time = formatEventTime(date, timezone);
  const abbr = tzAbbr(date, timezone);

  if (diffDays === 0) return `Today · ${time} ${abbr}`;
  if (diffDays === 1) return `Tomorrow · ${time} ${abbr}`;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
  }).format(date) + ` · ${time} ${abbr}`;
}

type StatusBadge = { label: string; className: string };

function getStatusBadge(startAt: Date, endAt: Date | null | undefined, timezone: string): StatusBadge {
  const now = new Date();

  if (now >= startAt && (endAt ? now <= endAt : false)) {
    return { label: "In Progress", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
  }

  const todayStr = dateInTimezone(now, timezone);
  const eventStr = dateInTimezone(startAt, timezone);
  const todayDate = new Date(todayStr + "T12:00:00Z");
  const eventDate = new Date(eventStr + "T12:00:00Z");
  const diffDays = Math.round((eventDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { label: "Today", className: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20" };
  if (diffDays === 1) return { label: "Tomorrow", className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20" };
  return { label: `In ${diffDays} days`, className: "bg-muted text-muted-foreground border-border" };
}

export function UpcomingEventsCard() {
  const { data: events = [], isPending } = useListAllUpcomingEvents();
  const { data: session } = authClient.useSession();
  const userTz = session?.user?.timezone ?? detectTimezone();

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
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
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
              const status = getStatusBadge(ev.startAt, ev.endAt, userTz);

              const hasZoom =
                (ev.eventType === "online" || ev.eventType === "hybrid") && ev.zoomJoinUrl;

              return (
                <li key={ev.id} className="rounded-xl border overflow-hidden transition-colors hover:bg-muted/50">
                  <Link
                    href={routes.dashboard.eventDetail(ev.id)}
                    className="flex flex-col gap-1.5 p-3"
                  >
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className="text-sm font-medium leading-snug min-w-0 flex-1">{ev.title}</p>
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {ev.organizationName}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                        <TypeIcon className="size-3 shrink-0" />
                        <span className="truncate">{formatEventDate(ev.startAt, userTz)}</span>
                      </div>
                      <Badge className={`shrink-0 text-[10px] border ${status.className}`}>
                        {status.label}
                      </Badge>
                    </div>
                  </Link>
                  {hasZoom && (
                    <div className="border-t px-3 py-2">
                      <JoinMeetingButton zoomJoinUrl={ev.zoomJoinUrl} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
