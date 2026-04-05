"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useGetEventAttendance, useMarkAttendance } from "@/lib/auth/hooks";

type Member = {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string; image?: string | null };
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
  organizationId: string;
  members: Member[];
  canManage: boolean;
};

const STATUS_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "excused", label: "Excused" },
] as const;

type AttendanceStatus = "present" | "absent" | "excused";

function statusVariant(status: AttendanceStatus | undefined) {
  if (status === "present") return "default" as const;
  if (status === "absent") return "destructive" as const;
  if (status === "excused") return "secondary" as const;
  return "outline" as const;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function EventAttendanceDialog({
  open,
  onOpenChange,
  eventId,
  eventTitle,
  organizationId,
  members,
  canManage,
}: Props) {
  const { data: attendanceRecords = [], isPending } = useGetEventAttendance(eventId);
  const markAttendance = useMarkAttendance();

  const attendanceMap = new Map(attendanceRecords.map((r) => [r.memberId, r.status]));

  function handleMark(memberId: string, status: AttendanceStatus) {
    markAttendance.mutate({ eventId, memberId, status, organizationId });
  }

  const presentCount = attendanceRecords.filter((r) => r.status === "present").length;
  const absentCount = attendanceRecords.filter((r) => r.status === "absent").length;
  const excusedCount = attendanceRecords.filter((r) => r.status === "excused").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Attendance — {eventTitle}</DialogTitle>
          <DialogDescription>
            {members.length} member{members.length !== 1 ? "s" : ""}
            {attendanceRecords.length > 0 && (
              <span className="ml-1">
                · <span className="text-foreground font-medium">{presentCount}</span> present
                · <span className="text-foreground font-medium">{absentCount}</span> absent
                · <span className="text-foreground font-medium">{excusedCount}</span> excused
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[28rem] overflow-y-auto -mx-6 px-6">
          {isPending ? (
            <div className="space-y-3 py-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-1 py-1">
              {members.map((member) => {
                const status = attendanceMap.get(member.id) as AttendanceStatus | undefined;
                const isPendingMark =
                  markAttendance.isPending && markAttendance.variables?.memberId === member.id;

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-3 rounded-xl px-2 py-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="size-8 shrink-0">
                        <AvatarImage src={member.user?.image ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {member.user?.name ? initials(member.user.name) : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="leading-tight min-w-0">
                        <p className="text-sm font-medium truncate">{member.user?.name}</p>
                        <p className="text-muted-foreground text-xs truncate">{member.user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isPendingMark ? (
                        <Spinner className="size-4" />
                      ) : canManage ? (
                        STATUS_OPTIONS.map((opt) => (
                          <Button
                            key={opt.value}
                            size="sm"
                            variant={status === opt.value ? "default" : "outline"}
                            className="h-7 px-2.5 text-xs"
                            onClick={() => handleMark(member.id, opt.value)}
                          >
                            {opt.label}
                          </Button>
                        ))
                      ) : (
                        <Badge variant={statusVariant(status)}>
                          {status ?? "—"}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
