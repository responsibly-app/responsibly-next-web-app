"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Monitor, Blend } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useCreateEvent } from "@/lib/auth/hooks";
import { useActiveOrganization } from "@/lib/auth/hooks/oraganization";

type EventType = "in_person" | "online" | "hybrid";

const EVENT_TYPE_OPTIONS: { value: EventType; label: string; icon: React.ElementType }[] = [
  { value: "in_person", label: "In Person", icon: MapPin },
  { value: "online", label: "Online", icon: Monitor },
  { value: "hybrid", label: "Hybrid", icon: Blend },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
};

export function CreateEventDialog({ open, onOpenChange, organizationId }: Props) {
  const { data: activeOrg } = useActiveOrganization();
  const createEvent = useCreateEvent();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<EventType>("in_person");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setEventType("in_person");
      setDate(undefined);
      setStartTime("09:00");
      setEndTime("");
    }
  }, [open]);

  function buildDateTime(date: Date, time: string): string {
    const [hours, minutes] = time.split(":").map(Number);
    const dt = new Date(date);
    dt.setHours(hours, minutes, 0, 0);
    return dt.toISOString();
  }

  function handleSubmit() {
    if (!date || !startTime) return;
    createEvent.mutate(
      {
        organizationId,
        title,
        description: description || undefined,
        eventType,
        startAt: buildDateTime(date, startTime),
        endAt: endTime ? buildDateTime(date, endTime) : undefined,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  const canSubmit = title.trim() && date && startTime && !createEvent.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
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
                  onClick={() => setEventType(value)}
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
