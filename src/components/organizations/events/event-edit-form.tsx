"use client";

import { useState } from "react";
import {
  CalendarDays,
  X,
  Check,
  Video,
  Link as LinkIcon,
  QrCode,
  CheckSquare,
  MapPin,
  Monitor,
  Blend,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useGetEvent, useUpdateEvent } from "@/lib/auth/hooks";
import { TimezoneSelect } from "@/components/ui-custom/timezone-select";
import { buildDateTimeInTimezone, extractTimeInTimezone } from "@/lib/utils/timezone";
import { toast } from "sonner";

type EventType = "in_person" | "online" | "hybrid";
type ZoomOption = "none" | "create" | "link";
type AttendanceMethod = "manual" | "qr" | "zoom";

const EVENT_TYPE_OPTIONS: { value: EventType; label: string; icon: React.ElementType }[] = [
  { value: "in_person", label: "In Person", icon: MapPin },
  { value: "online", label: "Online", icon: Monitor },
  { value: "hybrid", label: "Hybrid", icon: Blend },
];

const ZOOM_OPTION_OPTIONS: { value: ZoomOption; label: string; icon: React.ElementType }[] = [
  { value: "none", label: "No Zoom", icon: Video },
  { value: "create", label: "Create Meeting", icon: Video },
  { value: "link", label: "Link Existing", icon: LinkIcon },
];

function defaultAttendanceMethods(eventType: EventType): AttendanceMethod[] {
  if (eventType === "online") return ["manual", "zoom"];
  if (eventType === "hybrid") return ["manual", "qr", "zoom"];
  return ["manual", "qr"];
}

type EventData = NonNullable<ReturnType<typeof useGetEvent>["data"]>;

type Props = {
  event: EventData;
  onClose: () => void;
};

export function EventEditForm({ event, onClose }: Props) {
  const tz = event.timezone ?? "UTC";
  const localDateStr = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(
    new Date(event.startAt),
  );

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description ?? "");
  const [eventType, setEventType] = useState<EventType>(
    (event.eventType as EventType) ?? "in_person",
  );
  const [timezone, setTimezone] = useState(tz);
  const [date, setDate] = useState<Date | undefined>(new Date(localDateStr + "T12:00:00"));
  const [startTime, setStartTime] = useState(
    extractTimeInTimezone(new Date(event.startAt), tz),
  );
  const [endTime, setEndTime] = useState(
    event.endAt ? extractTimeInTimezone(new Date(event.endAt), tz) : "",
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [location, setLocation] = useState(event.location ?? "");
  const [zoomOption, setZoomOption] = useState<ZoomOption>(
    event.zoomMeetingId ? "link" : "none",
  );
  const [linkedZoomId, setLinkedZoomId] = useState(event.zoomMeetingId ?? "");
  const [attendanceMethods, setAttendanceMethods] = useState<AttendanceMethod[]>(
    (event.attendanceMethods as AttendanceMethod[]) ??
      defaultAttendanceMethods((event.eventType as EventType) ?? "in_person"),
  );

  const updateEvent = useUpdateEvent();

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

  function handleSave() {
    if (!date || !startTime) return;
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
          onClose();
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

  return (
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
                {date
                  ? new Intl.DateTimeFormat("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }).format(date)
                  : "Pick a date"}
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
            {(
              [
                { value: "manual" as AttendanceMethod, label: "Manual", icon: CheckSquare },
                ...(eventType === "in_person" || eventType === "hybrid"
                  ? [{ value: "qr" as AttendanceMethod, label: "QR Code", icon: QrCode }]
                  : []),
                ...(eventType === "online" || eventType === "hybrid"
                  ? [{ value: "zoom" as AttendanceMethod, label: "Zoom", icon: Video }]
                  : []),
              ] as { value: AttendanceMethod; label: string; icon: React.ElementType }[]
            ).map(({ value, label, icon: Icon }) => (
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
          <Button
            variant="outline"
            onClick={onClose}
            disabled={updateEvent.isPending}
            className="w-full sm:w-auto"
          >
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
  );
}
