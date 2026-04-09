"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, CalendarDays, Lock, QrCode, Search, Users, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type DisplayStatus = "absent" | "in_person" | "online" | "excused";

type AttendanceRecord = {
  memberId: string;
  status: "present" | "absent" | "excused";
  zoomDuration: number | null;
  qrCheckedInAt: Date | null;
  onlineZoom: boolean | null;
  inPersonQr: boolean | null;
  inPersonManual: boolean | null;
  onlineManual: boolean | null;
};

type Member = {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string; image?: string | null };
};

type MarkInput = {
  eventId: string;
  memberId: string;
  status: "present" | "absent" | "excused";
  organizationId: string;
  inPersonManual?: boolean;
  onlineManual?: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

/**
 * Derive a single category for filtering/sorting/stats.
 * In-person (QR or manual) takes priority over online-only.
 */
function getDisplayStatus(record: AttendanceRecord | undefined): DisplayStatus {
  if (!record || record.status === "absent") return "absent";
  if (record.status === "excused") return "excused";
  if (record.inPersonQr || record.inPersonManual) return "in_person";
  return "online";
}

// ─── Button-level active styles ───────────────────────────────────────────────

const BTN = {
  inPerson:
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/15 dark:text-emerald-400",
  online:
    "bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/15 dark:text-blue-400",
  absent:
    "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/15",
  excused:
    "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/15 dark:text-amber-400",
} as const;

// Read-only badge styles (same palette, used when canManage = false)
const BADGE_CLASSES: Record<DisplayStatus, string> = {
  in_person: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  online: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  absent: "bg-destructive/10 text-destructive border-destructive/20",
  excused: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
};

const BADGE_LABELS: Record<DisplayStatus, string> = {
  in_person: "In Person",
  online: "Online",
  absent: "Absent",
  excused: "Excused",
};

// ─── Main component ────────────────────────────────────────────────────────────

type Props = { eventId: string; organizationId: string };

export function EventAttendancePage({ eventId, organizationId }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DisplayStatus | "all">("all");

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
    if (!eventsPending && !event) router.replace(routes.dashboard.events());
  }, [eventsPending, event, router]);

  const members: Member[] = membersRaw
    ? Array.isArray(membersRaw)
      ? (membersRaw as Member[])
      : ((membersRaw as { members?: Member[] }).members ?? [])
    : [];

  const attendanceMap = useMemo(
    () => new Map(attendanceRecords.map((r) => [r.memberId, r as AttendanceRecord])),
    [attendanceRecords],
  );

  const eventType = event?.eventType;
  const showZoom = eventType === "online" || eventType === "hybrid";
  const showQR = !eventType || eventType === "in_person" || eventType === "hybrid";

  // Stats — members with no record count as absent
  const stats = useMemo(() => {
    const markedIds = new Set(attendanceRecords.map((r) => r.memberId));
    let inPerson = 0, online = 0, absent = 0, excused = 0;
    for (const r of attendanceRecords) {
      const s = getDisplayStatus(r as AttendanceRecord);
      if (s === "in_person") inPerson++;
      else if (s === "online") online++;
      else if (s === "excused") excused++;
      else absent++;
    }
    absent += members.filter((m) => !markedIds.has(m.id)).length;
    return { inPerson, online, absent, excused };
  }, [attendanceRecords, members]);

  const filterCounts = useMemo(
    () => ({
      all: members.length,
      absent: stats.absent,
      in_person: stats.inPerson,
      online: stats.online,
      excused: stats.excused,
    }),
    [members.length, stats],
  );

  const filteredMembers = useMemo(() => {
    const q = search.toLowerCase();
    return members
      .filter((m) => {
        if (
          q &&
          !m.user?.name?.toLowerCase().includes(q) &&
          !m.user?.email?.toLowerCase().includes(q)
        )
          return false;
        if (statusFilter === "all") return true;
        return getDisplayStatus(attendanceMap.get(m.id)) === statusFilter;
      })
      .sort((a, b) => (a.user?.name ?? "").localeCompare(b.user?.name ?? ""));
  }, [members, search, statusFilter, attendanceMap]);

  const isLoading = eventsPending || membersPending || attendancePending;

  const filterOptions: Array<DisplayStatus | "all"> = [
    "all",
    "absent",
    "in_person",
    ...(showZoom ? (["online"] as const) : []),
    "excused",
  ];

  return (
    <div className="space-y-6">
      {/* Back */}
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
            {event.endAt && <span> – {format(new Date(event.endAt), "h:mm a")}</span>}
          </p>
          {event.description && (
            <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
          )}
        </div>
      ) : (
        <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
      )}

      {/* Stats bar */}
      {!isLoading && members.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <StatTile
            count={stats.inPerson}
            label="In Person"
            className="border-emerald-200 dark:border-emerald-800"
            countClass="text-emerald-600 dark:text-emerald-400"
          />
          {showZoom && (
            <StatTile
              count={stats.online}
              label="Online"
              className="border-blue-200 dark:border-blue-800"
              countClass="text-blue-600 dark:text-blue-400"
            />
          )}
          <StatTile
            count={stats.absent}
            label="Absent"
            className="border-destructive/20"
            countClass="text-destructive"
          />
          <StatTile
            count={stats.excused}
            label="Excused"
            className="border-amber-200 dark:border-amber-800"
            countClass="text-amber-600 dark:text-amber-400"
          />
        </div>
      )}

      {/* Toolbar */}
      {!isLoading && members.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search members…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filterOptions.map((f) => {
              const label =
                f === "all"
                  ? "All"
                  : f === "in_person"
                    ? "In Person"
                    : f === "online"
                      ? "Online"
                      : f === "excused"
                        ? "Excused"
                        : "Absent";
              const isActive = statusFilter === f;
              return (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    isActive
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[10px] font-semibold leading-5",
                      isActive
                        ? "bg-background/20 text-background"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {filterCounts[f]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Member list */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 px-6 py-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-3 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No members in this organization.</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground">No members match your filters.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredMembers.map((member) => {
                const record = attendanceMap.get(member.id);
                const displayStatus = getDisplayStatus(record);
                const isPendingMark =
                  markAttendance.isPending &&
                  markAttendance.variables?.memberId === member.id;

                return (
                  <div
                    key={member.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    {/* Left: avatar + name + source badges */}
                    <div className="flex min-w-0 items-start gap-3">
                      <Avatar className="mt-0.5 size-9 shrink-0">
                        <AvatarImage src={member.user?.image ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {member.user?.name ? initials(member.user.name) : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{member.user?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {member.user?.email}
                        </p>
                        {record && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {showZoom && record.onlineZoom &&
                              record.zoomDuration != null &&
                              record.zoomDuration > 0 && (
                                <SourcePill
                                  icon={<Video className="size-3" />}
                                  className="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                >
                                  {record.zoomDuration}m via Zoom
                                </SourcePill>
                              )}
                            {showQR && record.inPersonQr && record.qrCheckedInAt && (
                              <SourcePill
                                icon={<QrCode className="size-3" />}
                                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              >
                                QR · {format(new Date(record.qrCheckedInAt), "h:mm a")}
                              </SourcePill>
                            )}
                            {record.inPersonManual && (
                              <SourcePill className="bg-muted text-muted-foreground">
                                Manual In Person
                              </SourcePill>
                            )}
                            {record.onlineManual && (
                              <SourcePill className="bg-muted text-muted-foreground">
                                Manual Online
                              </SourcePill>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: status controls or read-only badge */}
                    <div className="flex shrink-0 items-center self-end sm:self-auto">
                      {isPendingMark ? (
                        <div className="flex h-8 w-48 items-center justify-center">
                          <Spinner className="size-4" />
                        </div>
                      ) : canManage ? (
                        <MemberControls
                          record={record}
                          memberId={member.id}
                          eventId={eventId}
                          organizationId={organizationId}
                          showQR={showQR}
                          showZoom={showZoom}
                          mark={(input) => markAttendance.mutate(input)}
                        />
                      ) : (
                        <Badge
                          variant="outline"
                          className={cn("border", BADGE_CLASSES[displayStatus])}
                        >
                          {BADGE_LABELS[displayStatus]}
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

// ─── MemberControls ───────────────────────────────────────────────────────────
//
// Button rules:
//
// • Auto via QR  → "In Person" button is LOCKED (selected, disabled).
// • Auto via Zoom → "Online" button is LOCKED (selected, disabled).
//                  ALSO shows "Manual In Person" as a toggleable button so an
//                  admin can additionally record physical presence.
// • Manual only  → "Manual In Person" and "Manual Online" are both independently
//                  toggleable (select / deselect back to absent).
// • Absent / Excused are always available as full-status overrides.

type MemberControlsProps = {
  record: AttendanceRecord | undefined;
  memberId: string;
  eventId: string;
  organizationId: string;
  showQR: boolean;
  showZoom: boolean;
  mark: (input: MarkInput) => void;
};

function MemberControls({
  record,
  memberId,
  eventId,
  organizationId,
  showQR,
  showZoom,
  mark,
}: MemberControlsProps) {
  const m = (
    status: "present" | "absent" | "excused",
    opts?: { inPersonManual?: boolean; onlineManual?: boolean },
  ) => mark({ eventId, memberId, status, organizationId, ...opts });

  const qrLocked = record?.status === "present" && !!record.inPersonQr;
  const zoomLocked = record?.status === "present" && !!record.onlineZoom;
  const inPersonActive = record?.status === "present" && !!record.inPersonManual;
  const onlineActive = record?.status === "present" && !!record.onlineManual;
  const isExcused = record?.status === "excused";

  function onInPersonClick() {
    if (qrLocked) return;
    if (inPersonActive) {
      onlineActive ? m("present", { inPersonManual: false }) : m("absent");
    } else {
      m("present", { inPersonManual: true });
    }
  }

  function onOnlineClick() {
    if (zoomLocked) return;
    if (onlineActive) {
      inPersonActive ? m("present", { onlineManual: false }) : m("absent");
    } else {
      m("present", { onlineManual: true });
    }
  }

  const baseBtn = "h-8 px-3 text-xs";
  const lockedBtn = "cursor-not-allowed opacity-100";

  return (
    <ButtonGroup>
      {/* ── In Person ── */}
      {showQR && (
        <Button
          size="sm"
          variant="outline"
          disabled={qrLocked}
          className={cn(
            baseBtn,
            (qrLocked || inPersonActive) && BTN.inPerson,
            qrLocked && lockedBtn,
          )}
          onClick={onInPersonClick}
        >
          {qrLocked ? (
            <>
              <Lock className="mr-1 size-3" />
              In Person
            </>
          ) : (
            "Manual In Person"
          )}
        </Button>
      )}

      {/* ── Online ── */}
      {showZoom && (
        <Button
          size="sm"
          variant="outline"
          disabled={zoomLocked}
          className={cn(
            baseBtn,
            (zoomLocked || onlineActive) && BTN.online,
            zoomLocked && lockedBtn,
          )}
          onClick={onOnlineClick}
        >
          {zoomLocked ? (
            <>
              <Lock className="mr-1 size-3" />
              Online
            </>
          ) : (
            "Manual Online"
          )}
        </Button>
      )}

      {/* ── Excused ── */}
      <Button
        size="sm"
        variant="outline"
        className={cn(baseBtn, isExcused && BTN.excused)}
        onClick={() => { if (record?.status !== "excused") m("excused"); }}
      >
        Excused
      </Button>
    </ButtonGroup>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatTile({
  count,
  label,
  className,
  countClass,
}: {
  count: number;
  label: string;
  className?: string;
  countClass?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-2.5",
        className,
      )}
    >
      <span className={cn("text-2xl font-semibold", countClass)}>{count}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

function SourcePill({
  children,
  icon,
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
