"use client";

import { useState } from "react";
import { CalendarDays, MapPin, Monitor, Blend, MoreHorizontal, Users } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useListEvents, useDeleteEvent } from "@/lib/auth/hooks";
import { CreateEventDialog } from "./create-event-dialog";
import { formatEventDateShort, formatEventTime, tzAbbr } from "@/lib/utils/timezone";
import { routes } from "@/routes";

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  eventType: string | null;
  timezone: string;
  startAt: Date;
  endAt: Date | null;
  createdBy: string;
  createdAt: Date;
  creatorName: string | null;
};

type Props = {
  organizationId: string;
  canManage: boolean;
};

const EVENT_TYPE_ICONS: Record<string, React.ElementType> = {
  in_person: MapPin,
  online: Monitor,
  hybrid: Blend,
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  in_person: "In Person",
  online: "Online",
  hybrid: "Hybrid",
};

function creatorInitials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function EventItem({
  ev,
  canManage,
  organizationId,
  onDelete,
}: {
  ev: EventRow;
  canManage: boolean;
  organizationId: string;
  onDelete: (ev: EventRow) => void;
}) {
  const TypeIcon = EVENT_TYPE_ICONS[ev.eventType ?? "in_person"] ?? MapPin;
  const typeLabel = EVENT_TYPE_LABELS[ev.eventType ?? "in_person"] ?? "In Person";

  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4">
      <Link
        href={routes.dashboard.eventDetail(ev.id)}
        className="flex items-start gap-3 min-w-0 flex-1 group"
      >
        <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-xl group-hover:bg-muted/70 transition-colors">
          <CalendarDays className="text-muted-foreground size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
            {ev.title}
          </p>
          {ev.description && (
            <p className="text-muted-foreground mt-0.5 text-xs line-clamp-1">
              {ev.description}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs font-normal gap-1">
              <TypeIcon className="size-3" />
              {typeLabel}
            </Badge>
            <Badge variant="outline" className="text-xs font-normal">
              {formatEventDateShort(ev.startAt, ev.timezone)}
              {ev.endAt && (
                <span className="text-muted-foreground ml-1">
                  – {formatEventTime(ev.endAt, ev.timezone)}
                </span>
              )}
              <span className="text-muted-foreground ml-1">{tzAbbr(ev.startAt, ev.timezone)}</span>
            </Badge>
            {ev.creatorName && (
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <Avatar className="size-4">
                  <AvatarFallback className="text-[9px]">
                    {creatorInitials(ev.creatorName)}
                  </AvatarFallback>
                </Avatar>
                {ev.creatorName}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button variant="outline" size="sm" className="h-8 gap-1.5" asChild>
          <Link href={routes.dashboard.eventAttendance(ev.id)}>
            <Users className="size-3.5" />
            <span className="hidden sm:inline">Attendance</span>
          </Link>
        </Button>
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Event actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(ev)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

function EventListContent({
  events,
  emptyLabel,
  canManage,
  organizationId,
  onDelete,
  onCreateClick,
  showCreatePrompt,
}: {
  events: EventRow[];
  emptyLabel: string;
  canManage: boolean;
  organizationId: string;
  onDelete: (ev: EventRow) => void;
  onCreateClick: () => void;
  showCreatePrompt: boolean;
}) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <CalendarDays className="text-muted-foreground mb-3 size-8" />
        <p className="text-muted-foreground text-sm">{emptyLabel}</p>
        {showCreatePrompt && canManage && (
          <Button variant="link" size="sm" className="mt-1 text-xs" onClick={onCreateClick}>
            Create the first event
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="divide-y">
      {events.map((ev) => (
        <EventItem
          key={ev.id}
          ev={ev}
          canManage={canManage}
          organizationId={organizationId}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export function OrgEventsList({ organizationId, canManage }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EventRow | null>(null);

  const { data: events = [], isPending } = useListEvents(organizationId);
  const deleteEvent = useDeleteEvent();

  const now = new Date();
  const upcoming = events
    .filter((ev) => ev.startAt >= now)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const past = events
    .filter((ev) => ev.startAt < now)
    .sort((a, b) => b.startAt.getTime() - a.startAt.getTime());

  function handleDelete() {
    if (!deleteTarget) return;
    deleteEvent.mutate(
      { eventId: deleteTarget.id, organizationId },
      {
        onSuccess: () => toast.success(`"${deleteTarget.title}" deleted.`),
        onError: (err: { message?: string }) =>
          toast.error(err?.message ?? "Failed to delete event."),
      },
    );
    setDeleteTarget(null);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <span />
        {canManage && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <CalendarDays className="mr-1.5 size-3.5" />
            Create Event
          </Button>
        )}
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">
            Upcoming
            {!isPending && upcoming.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 h-4">
                {upcoming.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">
            Past
            {!isPending && past.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 h-4">
                {past.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {isPending ? (
          <Card>
            <CardContent className="p-0">
              <div className="space-y-3 px-6 py-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <TabsContent value="upcoming">
              <Card>
                <CardContent className="p-0">
                  <EventListContent
                    events={upcoming}
                    emptyLabel="No upcoming events"
                    canManage={canManage}
                    organizationId={organizationId}
                    onDelete={setDeleteTarget}
                    onCreateClick={() => setCreateOpen(true)}
                    showCreatePrompt
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="past">
              <Card>
                <CardContent className="p-0">
                  <EventListContent
                    events={past}
                    emptyLabel="No past events"
                    canManage={canManage}
                    organizationId={organizationId}
                    onDelete={setDeleteTarget}
                    onCreateClick={() => setCreateOpen(true)}
                    showCreatePrompt={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>

      <CreateEventDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        organizationId={organizationId}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? All attendance
              records will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
