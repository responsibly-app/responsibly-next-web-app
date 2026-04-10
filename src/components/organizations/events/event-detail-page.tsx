"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Monitor,
  Blend,
  Pencil,
  Users,
  X,
  Check,
  Video,
  Link as LinkIcon,
  QrCode,
  CheckSquare,
} from "lucide-react";
import { JoinMeetingButton } from "./join-meeting-button";
import { EventQRCode } from "./event-qr-code";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useGetEvent, useUpdateEvent } from "@/lib/auth/hooks";
import { ROLE_LEVELS, type OrgRole } from "@/lib/auth/hooks/oraganization/permissions";
import { TimezoneSelect } from "@/components/ui-custom/timezone-select";
import { buildDateTimeInTimezone, extractTimeInTimezone, formatEventDateTime, formatEventTime, tzAbbr } from "@/lib/utils/timezone";
import { routes } from "@/routes";
import { toast } from "sonner";

type EventType = "in_person" | "online" | "hybrid";
type ZoomOption = "none" | "create" | "link";
type AttendanceMethod = "manual" | "qr" | "zoom";

const EVENT_TYPE_OPTIONS: { value: EventType; label: string; icon: React.ElementType }[] = [
  { value: "in_person", label: "In Person", icon: MapPin },
  { value: "online", label: "Online", icon: Monitor },
  { value: "hybrid", label: "Hybrid", icon: Blend },
];

const ZOOM_OPTION_OPTIONS: { value: ZoomOption; label: string; icon: React.ElementType; description: string }[] = [
  { value: "none", label: "No Zoom", icon: Video, description: "No Zoom meeting" },
  { value: "create", label: "Create Meeting", icon: Video, description: "Auto-create a Zoom meeting" },
  { value: "link", label: "Link Existing", icon: LinkIcon, description: "Link an existing meeting ID" },
];

function defaultAttendanceMethods(eventType: EventType): AttendanceMethod[] {
  if (eventType === "online") return ["manual", "zoom"];
  if (eventType === "hybrid") return ["manual", "qr", "zoom"];
  return ["manual", "qr"];
}

function eventTypeLabel(type: string | null | undefined) {
  return EVENT_TYPE_OPTIONS.find((o) => o.value === type) ?? EVENT_TYPE_OPTIONS[0];
}

function canEditEvent(role: string | undefined): boolean {
  if (!role) return false;
  const level = ROLE_LEVELS[role as OrgRole] ?? Infinity;
  return level <= ROLE_LEVELS["admin"];
}

type Props = { eventId: string };

export function EventDetailPage({ eventId }: Props) {
  const { data: event, isPending } = useGetEvent(eventId);
  const updateEvent = useUpdateEvent();

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<EventType>("in_person");
  const [timezone, setTimezone] = useState("UTC");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [zoomOption, setZoomOption] = useState<ZoomOption>("none");
  const [linkedZoomId, setLinkedZoomId] = useState("");
  const [attendanceMethods, setAttendanceMethods] = useState<AttendanceMethod[]>(
    defaultAttendanceMethods("in_person"),
  );

  function startEdit() {
    if (!event) return;
    setTitle(event.title);
    setDescription(event.description ?? "");
    setEventType((event.eventType as EventType) ?? "in_person");
    setTimezone(event.timezone ?? "UTC");
    const tz = event.timezone ?? "UTC";
    // Build a Date whose year/month/day matches the wall-clock date in the event's timezone
    // so the calendar picker shows the correct day
    const localDateStr = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date(event.startAt));
    setDate(new Date(localDateStr + "T12:00:00"));
    setStartTime(extractTimeInTimezone(new Date(event.startAt), tz));
    setEndTime(event.endAt ? extractTimeInTimezone(new Date(event.endAt), tz) : "");
    setLocation(event.location ?? "");
    setZoomOption(event.zoomMeetingId ? "link" : "none");
    setLinkedZoomId(event.zoomMeetingId ?? "");
    setAttendanceMethods(
      (event.attendanceMethods as AttendanceMethod[]) ?? defaultAttendanceMethods((event.eventType as EventType) ?? "in_person"),
    );
    setEditing(true);
  }

  function handleEventTypeChange(type: EventType) {
    setEventType(type);
    setAttendanceMethods(defaultAttendanceMethods(type));
    if (type === "in_person") setZoomOption("none");
  }

  function toggleAttendanceMethod(method: AttendanceMethod) {
    setAttendanceMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method],
    );
  }

  function cancelEdit() {
    setEditing(false);
  }

  function handleSave() {
    if (!event || !date || !startTime) return;
    updateEvent.mutate(
      {
        eventId: event.id,
        organizationId: event.organizationId,
        title,
        description: description || null,
        eventType,
        timezone,
        location: location || null,
        startAt: buildDateTimeInTimezone(date, startTime, timezone),
        endAt: endTime ? buildDateTimeInTimezone(date, endTime, timezone) : null,
        zoomOption,
        zoomMeetingId: zoomOption === "link" ? linkedZoomId : undefined,
        attendanceMethods,
      },
      {
        onSuccess: () => {
          setEditing(false);
          toast.success("Event updated.");
        },
        onError: (err: { message?: string }) => {
          toast.error(err?.message ?? "Failed to update event.");
        },
      },
    );
  }

  const canSave =
    title.trim() &&
    date &&
    startTime &&
    !updateEvent.isPending &&
    (zoomOption !== "link" || linkedZoomId.trim());
  const isAdmin = canEditEvent(event?.userRole);

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

  const typeInfo = eventTypeLabel(editing ? eventType : event.eventType);
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
                {event.endAt && <> – {formatEventTime(new Date(event.endAt), event.timezone ?? "UTC")}</>}
                <span className="text-xs opacity-70">{tzAbbr(new Date(event.startAt), event.timezone ?? "UTC")}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && !editing && (
            <Button variant="outline" size="sm" onClick={startEdit}>
              <Pencil className="mr-1.5 size-3.5" />
              Edit
            </Button>
          )}
          {(event.eventType === "online" || event.eventType === "hybrid") && event.zoomJoinUrl && (
            <JoinMeetingButton
              zoomJoinUrl={event.zoomJoinUrl}
            />
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={routes.dashboard.eventAttendance(event.id)}>
              <Users className="mr-1.5 size-3.5" />
              Attendance
            </Link>
          </Button>
        </div>
      </div>

      {/* Edit form */}
      {editing ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Edit Event</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            {/* Event Type */}
            <div className="grid gap-2">
              <Label>Event Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {EVENT_TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleEventTypeChange(value)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                      eventType === value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location (in_person + hybrid) */}
            {(eventType === "in_person" || eventType === "hybrid") && (
              <div className="grid gap-2">
                <Label>
                  Location <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  placeholder="123 Main St, Room 4B"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            )}

            {/* Zoom (online + hybrid) */}
            {(eventType === "online" || eventType === "hybrid") && (
              <div className="grid gap-2">
                <Label>Zoom Meeting</Label>
                <div className="grid grid-cols-3 gap-2">
                  {ZOOM_OPTION_OPTIONS.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setZoomOption(value)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                        zoomOption === value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                      )}
                    >
                      <Icon className="size-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
                {zoomOption === "create" && (
                  <p className="text-muted-foreground text-xs">
                    A Zoom meeting will be created automatically using your connected Zoom account.
                  </p>
                )}
                {zoomOption === "link" && (
                  <Input
                    placeholder="Zoom Meeting ID (e.g. 123 456 7890)"
                    value={linkedZoomId}
                    onChange={(e) => setLinkedZoomId(e.target.value)}
                  />
                )}
              </div>
            )}

            {/* Date */}
            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarDays className="mr-2 size-4" />
                    {date ? new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(date) : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      setDate(d);
                      setCalendarOpen(false);
                    }}
                  />
                  <div className="border-t p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => {
                        setDate(new Date());
                        setCalendarOpen(false);
                      }}
                    >
                      Today
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Start & End Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>
                  End Time <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  min={startTime}
                />
              </div>
            </div>

            {/* Timezone */}
            <div className="grid gap-2">
              <Label>Timezone</Label>
              <TimezoneSelect value={timezone} onChange={setTimezone} />
            </div>

            {/* Attendance Methods */}
            <div className="grid gap-2">
              <Label>Attendance Tracking</Label>
              <div className="flex flex-wrap gap-3">
                {([
                  { value: "manual" as AttendanceMethod, label: "Manual", icon: CheckSquare },
                  ...((eventType === "in_person" || eventType === "hybrid")
                    ? [{ value: "qr" as AttendanceMethod, label: "QR Code", icon: QrCode }]
                    : []),
                  ...((eventType === "online" || eventType === "hybrid")
                    ? [{ value: "zoom" as AttendanceMethod, label: "Zoom", icon: Video }]
                    : []),
                ]).map(({ value, label, icon: Icon }) => (
                  <label
                    key={value}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                      attendanceMethods.includes(value)
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-input text-muted-foreground hover:border-foreground/30",
                      value === "manual" && "opacity-70 cursor-not-allowed",
                    )}
                  >
                    <Checkbox
                      checked={attendanceMethods.includes(value)}
                      onCheckedChange={() => value !== "manual" && toggleAttendanceMethod(value)}
                      disabled={value === "manual"}
                      className="size-3.5"
                    />
                    <Icon className="size-3.5" />
                    {label}
                  </label>
                ))}
              </div>
              <p className="text-muted-foreground text-xs">Manual attendance is always enabled.</p>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label>
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Add details about this event..."
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={cancelEdit} disabled={updateEvent.isPending} className="w-full sm:w-auto">
                <X className="mr-1.5 size-3.5" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!canSave} className="w-full sm:w-auto">
                {updateEvent.isPending ? (
                  <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />
                ) : (
                  <Check className="mr-1.5 size-3.5" />
                )}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Detail view */
        <>
          {event.description && (
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm text-muted-foreground whitespace-pre-line">{event.description}</p>
              </CardContent>
            </Card>
          )}
          {isAdmin && (event.attendanceMethods as string[] | null)?.includes("qr") && (
            <EventQRCode eventId={event.id} organizationId={event.organizationId} />
          )}
        </>
      )}
    </div>
  );
}
