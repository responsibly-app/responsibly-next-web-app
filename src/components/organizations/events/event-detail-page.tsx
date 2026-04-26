"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CalendarCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Monitor,
  Blend,
  Pencil,
  Users,
  ClipboardList,
} from "lucide-react";
import { JoinMeetingButton } from "./join-meeting-button";
import { EventEditForm } from "./event-edit-form";
import { EventRsvpList } from "./event-rsvp-list";
import { EventAttendancePage } from "@/components/organizations/attendance/event-attendance-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetEvent, useGetRsvpStatus, useListRsvps, useToggleRsvp } from "@/lib/auth/hooks";
import { ROLE_LEVELS, type OrgRole } from "@/lib/auth/hooks/oraganization/permissions";
import { formatEventDateTime, formatEventTime, tzAbbr } from "@/lib/utils/timezone";
import { useTabSearchParam } from "@/lib/hooks/use-tab-search-param";
import { routes } from "@/routes";

type EventType = "in_person" | "online" | "hybrid";

const EVENT_TYPE_OPTIONS: { value: EventType; label: string; icon: React.ElementType }[] = [
  { value: "in_person", label: "In Person", icon: MapPin },
  { value: "online", label: "Online", icon: Monitor },
  { value: "hybrid", label: "Hybrid", icon: Blend },
];

function eventTypeLabel(type: string | null | undefined) {
  return EVENT_TYPE_OPTIONS.find((o) => o.value === type) ?? EVENT_TYPE_OPTIONS[0];
}

function canEditEvent(role: string | undefined): boolean {
  if (!role) return false;
  return (ROLE_LEVELS[role as OrgRole] ?? Infinity) <= ROLE_LEVELS["admin"];
}

function canViewRsvpList(role: string | undefined): boolean {
  if (!role) return false;
  return (ROLE_LEVELS[role as OrgRole] ?? Infinity) <= ROLE_LEVELS["assistant"];
}

type Props = { eventId: string };

export function EventDetailPage({ eventId }: Props) {
  const { data: event, isPending } = useGetEvent(eventId);
  const toggleRsvp = useToggleRsvp();

  const isInPersonOrHybrid =
    event?.eventType === "in_person" || event?.eventType === "hybrid";
  const { data: rsvpStatus } = useGetRsvpStatus(isInPersonOrHybrid ? eventId : "");

  const isAdmin = canEditEvent(event?.userRole);
  const isManager = canViewRsvpList(event?.userRole);

  // Preload rsvp list so the card has data ready when rendered
  useListRsvps(isInPersonOrHybrid && isManager ? eventId : "");

  const [activeTab, setTab] = useTabSearchParam("attendance");

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CalendarDays className="mb-3 size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Event not found.</p>
        <Button variant="link" size="sm" asChild className="mt-2">
          <Link href={routes.dashboard.events()}>Back to Events</Link>
        </Button>
      </div>
    );
  }

  const typeInfo = eventTypeLabel(event.eventType);
  const TypeIcon = typeInfo.icon;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href={routes.dashboard.events()}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Events
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
            <CalendarDays className="size-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{event.title}</h1>
              <Badge variant="secondary" className="text-xs">
                {event.organizationName}
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <TypeIcon className="size-3.5" />
                {typeInfo.label}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {formatEventDateTime(new Date(event.startAt), event.timezone ?? "UTC")}
                {event.endAt && (
                  <> – {formatEventTime(new Date(event.endAt), event.timezone ?? "UTC")}</>
                )}
                <span className="text-xs opacity-70">
                  {tzAbbr(new Date(event.startAt), event.timezone ?? "UTC")}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(event.eventType === "online" || event.eventType === "hybrid") &&
            event.zoomJoinUrl && <JoinMeetingButton zoomJoinUrl={event.zoomJoinUrl} />}
          {isInPersonOrHybrid && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleRsvp.mutate({ eventId: event.id })}
              disabled={toggleRsvp.isPending}
              className={
                rsvpStatus?.rsvped
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-700 dark:hover:bg-emerald-900"
                  : ""
              }
            >
              {toggleRsvp.isPending ? (
                <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />
              ) : rsvpStatus?.rsvped ? (
                <CheckCircle2 className="mr-1.5 size-3.5" />
              ) : (
                <CalendarCheck className="mr-1.5 size-3.5" />
              )}
              {rsvpStatus?.rsvped ? "RSVPed" : "RSVP"}
              {rsvpStatus && rsvpStatus.totalCount > 0 && (
                <Badge
                  variant={rsvpStatus.rsvped ? "secondary" : "outline"}
                  className="ml-1.5 text-xs"
                >
                  {rsvpStatus.totalCount}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="attendance">
            <Users className="size-3.5" />
            Attendance
          </TabsTrigger>
          {isManager && isInPersonOrHybrid && (
            <TabsTrigger value="rsvp">
              <ClipboardList className="size-3.5" />
              RSVP List
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="edit">
              <Pencil className="size-3.5" />
              Edit
            </TabsTrigger>
          )}
        </TabsList>
        <div className="border-b"></div>

        {isAdmin && (
          <TabsContent value="edit" className="mt-4">
            <EventEditForm event={event} onClose={() => setTab("attendance")} />
          </TabsContent>
        )}

        <TabsContent value="attendance" className="mt-4">
          <EventAttendancePage
            eventId={eventId}
            organizationId={event.organizationId}
            hideBack
          />
        </TabsContent>

        {isManager && isInPersonOrHybrid && (
          <TabsContent value="rsvp" className="mt-4">
            <EventRsvpList eventId={eventId} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
