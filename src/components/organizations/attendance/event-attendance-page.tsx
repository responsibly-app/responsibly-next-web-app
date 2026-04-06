"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  useGetEventAttendance,
  useMarkAttendance,
  useListEvents,
  useListMembers,
  useGetMemberRole,
} from "@/lib/auth/hooks";
import { getPermissions } from "@/lib/auth/hooks/oraganization/access-control";
import { OrgRole } from "@/lib/auth/hooks/oraganization/permissions";
import { routes } from "@/routes";

type AttendanceStatus = "present" | "absent" | "excused";

const STATUS_OPTIONS = [
  { value: "present" as const, label: "Present" },
  { value: "absent" as const, label: "Absent" },
  { value: "excused" as const, label: "Excused" },
];

function statusVariant(status: AttendanceStatus | undefined) {
  if (status === "present") return "default" as const;
  if (status === "absent") return "destructive" as const;
  if (status === "excused") return "secondary" as const;
  return "outline" as const;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type Member = {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string; image?: string | null };
};

type Props = { eventId: string; organizationId: string };

export function EventAttendancePage({ eventId, organizationId }: Props) {
  const router = useRouter();
  const { data: events = [], isPending: eventsPending } = useListEvents(organizationId);
  const { data: membersRaw, isPending: membersPending } = useListMembers({ organizationId });
  const { data: attendanceRecords = [], isPending: attendancePending } =
    useGetEventAttendance(eventId);
  const { data: memberRoleData } = useGetMemberRole(organizationId);
  const markAttendance = useMarkAttendance();

  const currentRole = memberRoleData?.role as OrgRole | undefined;
  const { canManage } = getPermissions(currentRole);

  const event = events.find((e) => e.id === eventId);

  useEffect(() => {
    if (!eventsPending && !event) {
      router.replace(routes.dashboard.events());
    }
  }, [eventsPending, event, router]);
  const members: Member[] = membersRaw
    ? Array.isArray(membersRaw)
      ? (membersRaw as Member[])
      : ((membersRaw as { members?: Member[] }).members ?? [])
    : [];

  const attendanceMap = new Map(attendanceRecords.map((r) => [r.memberId, r.status]));

  const presentCount = attendanceRecords.filter((r) => r.status === "present").length;
  const absentCount = attendanceRecords.filter((r) => r.status === "absent").length;
  const excusedCount = attendanceRecords.filter((r) => r.status === "excused").length;
  const unmarkedCount = members.length - attendanceRecords.length;

  const isLoading = eventsPending || membersPending || attendancePending;

  function handleMark(memberId: string, status: AttendanceStatus) {
    markAttendance.mutate({ eventId, memberId, status, organizationId });
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={routes.dashboard.events()}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Events
      </Link>

      {/* Event header */}
      {eventsPending ? (
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      ) : event ? (
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight">{event.title}</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {format(new Date(event.startAt), "EEEE, MMMM d, yyyy · h:mm a")}
            {event.endAt && (
              <span> – {format(new Date(event.endAt), "h:mm a")}</span>
            )}
          </p>
          {event.description && (
            <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
          )}
        </div>
      ) : (
        <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
      )}

      {/* Stats */}
      {!isLoading && members.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-2.5">
            <span className="text-2xl font-semibold">{presentCount}</span>
            <span className="text-sm text-muted-foreground">Present</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-2.5">
            <span className="text-2xl font-semibold">{absentCount}</span>
            <span className="text-sm text-muted-foreground">Absent</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-2.5">
            <span className="text-2xl font-semibold">{excusedCount}</span>
            <span className="text-sm text-muted-foreground">Excused</span>
          </div>
          {unmarkedCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-2.5">
              <span className="text-2xl font-semibold">{unmarkedCount}</span>
              <span className="text-sm text-muted-foreground">Unmarked</span>
            </div>
          )}
        </div>
      )}

      {/* Member list */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 px-6 py-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-muted-foreground">No members in this organization.</p>
            </div>
          ) : (
            <div className="divide-y">
              {members.map((member) => {
                const status = attendanceMap.get(member.id) as AttendanceStatus | undefined;
                const isPendingMark =
                  markAttendance.isPending && markAttendance.variables?.memberId === member.id;

                return (
                  <div
                    key={member.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-9 shrink-0">
                        <AvatarImage src={member.user?.image ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {member.user?.name ? initials(member.user.name) : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 leading-tight">
                        <p className="truncate text-sm font-medium">{member.user?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {member.user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-auto">
                      {isPendingMark ? (
                        <Spinner className="size-4" />
                      ) : canManage ? (
                        STATUS_OPTIONS.map((opt) => (
                          <Button
                            key={opt.value}
                            size="sm"
                            variant={status === opt.value ? "default" : "outline"}
                            className="h-8 px-3 text-xs"
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
        </CardContent>
      </Card>
    </div>
  );
}
