"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, MoreHorizontal, Users } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useListEvents, useDeleteEvent, useListMembers } from "@/lib/auth/hooks";
import { CreateEventDialog } from "./create-event-dialog";
import { EventAttendanceDialog } from "./event-attendance-dialog";

type Member = {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string; image?: string | null };
};

type EventRow = {
  id: string;
  title: string;
  description: string | null;
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

function creatorInitials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function OrgEventsTab({ organizationId, canManage }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EventRow | null>(null);
  const [attendanceTarget, setAttendanceTarget] = useState<EventRow | null>(null);

  const { data: events = [], isPending } = useListEvents(organizationId);
  const { data: membersRaw } = useListMembers({ organizationId });
  const members: Member[] = membersRaw
    ? Array.isArray(membersRaw)
      ? (membersRaw as Member[])
      : ((membersRaw as { members?: Member[] }).members ?? [])
    : [];
  const deleteEvent = useDeleteEvent();

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

      <Card>
        <CardContent className="p-0">
          {isPending ? (
            <div className="space-y-3 px-6 py-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <CalendarDays className="text-muted-foreground mb-3 size-8" />
              <p className="text-muted-foreground text-sm">No events yet</p>
              {canManage && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1 text-xs"
                  onClick={() => setCreateOpen(true)}
                >
                  Create the first event
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {events.map((ev) => (
                <div key={ev.id} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-xl">
                      <CalendarDays className="text-muted-foreground size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-tight">{ev.title}</p>
                      {ev.description && (
                        <p className="text-muted-foreground mt-0.5 text-xs line-clamp-1">
                          {ev.description}
                        </p>
                      )}
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-xs font-normal">
                          {format(new Date(ev.startAt), "MMM d, yyyy · h:mm a")}
                          {ev.endAt && (
                            <span className="text-muted-foreground ml-1">
                              – {format(new Date(ev.endAt), "h:mm a")}
                            </span>
                          )}
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
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={() => setAttendanceTarget(ev as EventRow)}
                    >
                      <Users className="size-3.5" />
                      Attendance
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
                            onClick={() => setDeleteTarget(ev as EventRow)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateEventDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        organizationId={organizationId}
      />

      {attendanceTarget && (
        <EventAttendanceDialog
          open={!!attendanceTarget}
          onOpenChange={(open) => !open && setAttendanceTarget(null)}
          eventId={attendanceTarget.id}
          eventTitle={attendanceTarget.title}
          organizationId={organizationId}
          members={members}
          canManage={canManage}
        />
      )}

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
