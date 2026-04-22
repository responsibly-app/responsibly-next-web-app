"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Monitor, Blend, Video, Link, QrCode, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/auth-client";
import { useCreateEvent } from "@/lib/auth/hooks";
import { useActiveOrganization } from "@/lib/auth/hooks/oraganization";
import { TimezoneSelect } from "@/components/ui-custom/timezone-select";
import { buildDateTimeInTimezone } from "@/lib/utils/timezone";

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
  { value: "link", label: "Link Existing", icon: Link, description: "Link an existing meeting ID" },
];

function defaultAttendanceMethods(eventType: EventType): AttendanceMethod[] {
  if (eventType === "online") return ["manual", "zoom"];
  if (eventType === "hybrid") return ["manual", "qr", "zoom"];
  return ["manual", "qr"];
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
};

export function CreateEventDialog({ open, onOpenChange, organizationId }: Props) {
  const { data: session } = authClient.useSession();
  const userTimezone = session?.user?.timezone ?? "UTC";

  const { data: activeOrg } = useActiveOrganization();
  const createEvent = useCreateEvent();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<EventType>("in_person");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("");
  const [timezone, setTimezone] = useState(userTimezone);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [zoomOption, setZoomOption] = useState<ZoomOption>("none");
  const [linkedZoomId, setLinkedZoomId] = useState("");
  const [attendanceMethods, setAttendanceMethods] = useState<AttendanceMethod[]>(
    defaultAttendanceMethods("in_person"),
  );

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setEventType("in_person");
      setLocation("");
      setDate(undefined);
      setStartTime("09:00");
      setEndTime("");
      setTimezone(userTimezone);
      setZoomOption("none");
      setLinkedZoomId("");
      setAttendanceMethods(defaultAttendanceMethods("in_person"));
    }
  }, [open, userTimezone]);

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

  function handleSubmit() {
    if (!date || !startTime) return;
    createEvent.mutate(
      {
        organizationId,
        title,
        description: description || undefined,
        eventType,
        timezone,
        location: location || undefined,
        startAt: buildDateTimeInTimezone(date, startTime, timezone),
        endAt: endTime ? buildDateTimeInTimezone(date, endTime, timezone) : undefined,
        zoomOption,
        zoomMeetingId: zoomOption === "link" ? linkedZoomId : undefined,
        attendanceMethods,
      },
      {
        onSuccess: () => onOpenChange(false),
        onError: (err: unknown) => {
          const message =
            err instanceof Error ? err.message : "Failed to create event";
          toast.error(message);
        },
      },
    );
  }

  const needsZoom = eventType === "online" || eventType === "hybrid";
  const needsLocation = eventType === "in_person" || eventType === "hybrid";
  const canSubmit =
    title.trim() &&
    date &&
    startTime &&
    !createEvent.isPending &&
    (zoomOption !== "link" || linkedZoomId.trim());

  // Available attendance methods per event type
  const availableMethods: { value: AttendanceMethod; label: string; icon: React.ElementType }[] = [
    { value: "manual", label: "Manual", icon: CheckSquare },
    ...(needsLocation ? [{ value: "qr" as AttendanceMethod, label: "QR Code", icon: QrCode }] : []),
    ...(needsZoom ? [{ value: "zoom" as AttendanceMethod, label: "Zoom", icon: Video }] : []),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
          <DialogDescription className="flex items-center gap-1.5">
            <span>For</span>
            {activeOrg ? (
              <Badge variant="secondary" className="text-xs font-medium">
                {activeOrg.name}
              </Badge>
            ) : (
              <span className="text-muted-foreground">your organization</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              placeholder="Monthly Meeting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Event Type */}
          <div className="grid gap-2">
            <Label>Event Type</Label>
            <div className="flex gap-2">
              {EVENT_TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleEventTypeChange(value)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
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
          {needsLocation && (
            <div className="grid gap-2">
              <Label htmlFor="event-location">
                Location <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="event-location"
                placeholder="123 Main St, Room 4B"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          )}

          {/* Zoom (online + hybrid) */}
          {needsZoom && (
            <div className="grid gap-2">
              <Label>Zoom Meeting</Label>
              <div className="flex gap-2">
                {ZOOM_OPTION_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setZoomOption(value)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
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
                  <CalendarIcon className="mr-2 size-4" />
                  {date ? format(date, "EEEE, MMMM d, yyyy") : "Pick a date"}
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
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
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
              <Label htmlFor="event-start-time">Start Time</Label>
              <Input
                id="event-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-end-time">
                End Time <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="event-end-time"
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
              {availableMethods.map(({ value, label, icon: Icon }) => (
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
            <Label htmlFor="event-description">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="event-description"
              placeholder="Add details about this event..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {createEvent.isPending && <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />}
            Create Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
