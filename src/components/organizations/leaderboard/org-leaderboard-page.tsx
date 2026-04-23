"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetPointsLeaderboard } from "@/lib/auth/hooks";
import { WFG_LEVEL_META, WFG_LEVELS, type WFGLevel } from "@/lib/auth/hooks/oraganization/levels";
import { routes } from "@/routes";

type Props = { orgId: string };

type Preset = "month" | "lastmonth" | "3months" | "all" | "custom";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return <Badge className="w-8 justify-center bg-yellow-500 text-white hover:bg-yellow-500">1</Badge>;
  if (rank === 2)
    return <Badge className="w-8 justify-center bg-slate-400 text-white hover:bg-slate-400">2</Badge>;
  if (rank === 3)
    return <Badge className="w-8 justify-center bg-amber-600 text-white hover:bg-amber-600">3</Badge>;
  return (
    <span className="inline-flex w-8 justify-center text-sm text-muted-foreground">{rank}</span>
  );
}

function dateRangeForPreset(preset: Preset): { startDate?: string; endDate?: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (preset === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: fmt(start) };
  }
  if (preset === "lastmonth") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { startDate: fmt(start), endDate: fmt(end) };
  }
  if (preset === "3months") {
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return { startDate: fmt(start) };
  }
  return {};
}

const PRESET_LABELS: Record<Preset, string> = {
  month: "This Month",
  lastmonth: "Last Month",
  "3months": "Last 3 Months",
  all: "All Time",
  custom: "Custom",
};

function subtitleForPreset(
  preset: Preset,
  customStart: string,
  customEnd: string,
): string {
  const now = new Date();
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (preset === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return `${fmt(start)} – ${fmt(now)}`;
  }
  if (preset === "lastmonth") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return `${fmt(start)} – ${fmt(end)}`;
  }
  if (preset === "3months") {
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return `${fmt(start)} – ${fmt(now)}`;
  }
  if (preset === "all") {
    return "All recorded activity";
  }
  if (preset === "custom") {
    if (customStart && customEnd) {
      return `${fmt(new Date(customStart + "T00:00:00"))} – ${fmt(new Date(customEnd + "T00:00:00"))}`;
    }
    if (customStart) return `From ${fmt(new Date(customStart + "T00:00:00"))}`;
    if (customEnd) return `Until ${fmt(new Date(customEnd + "T00:00:00"))}`;
    return "Select a date range";
  }
  return "";
}

export function OrgLeaderboardPage({ orgId }: Props) {
  const [preset, setPreset] = useState<Preset>("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<WFGLevel | "all">("all");

  const { startDate, endDate } = useMemo(() => {
    if (preset === "custom") return { startDate: customStart || undefined, endDate: customEnd || undefined };
    return dateRangeForPreset(preset);
  }, [preset, customStart, customEnd]);

  const { data: rawEntries = [], isPending } = useGetPointsLeaderboard(orgId, startDate, endDate);

  const entries = useMemo(() => {
    let result = rawEntries;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.memberName?.toLowerCase().includes(q) ||
          e.memberEmail?.toLowerCase().includes(q),
      );
    }
    if (levelFilter !== "all") {
      result = result.filter((e) => e.memberLevel === levelFilter);
    }
    return result;
  }, [rawEntries, search, levelFilter]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>

      {/* Search + level filter */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as WFGLevel | "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            {(Object.keys(WFG_LEVELS) as WFGLevel[]).map((lvl) => (
              <SelectItem key={lvl} value={lvl}>
                {WFG_LEVEL_META[lvl].abbreviation} — {WFG_LEVEL_META[lvl].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Time filter */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {(["month", "lastmonth", "3months", "all", "custom"] as Preset[]).map((p) => (
              <Button
                key={p}
                variant={preset === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPreset(p)}
              >
                {PRESET_LABELS[p]}
              </Button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {subtitleForPreset(preset, customStart, customEnd)}
          </p>

          {preset === "custom" && (
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="space-y-1.5">
                <Label>From</Label>
                <Input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="space-y-1.5">
                <Label>To</Label>
                <Input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-40"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isPending ? (
            <div className="space-y-3 px-6 py-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Trophy className="mb-3 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {search.trim() || levelFilter !== "all" ? "No members match your filters" : "No data yet"}
              </p>
              {!search.trim() && levelFilter === "all" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Members need to log activity to appear here.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead className="text-right">AMAs</TableHead>
                    <TableHead className="text-right">Invites</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry, index) => (
                    <TableRow key={entry.memberId}>
                      <TableCell>
                        <RankBadge rank={index + 1} />
                      </TableCell>
                      <TableCell>
                        <Link
                          href={routes.dashboard.memberProfile(entry.userId)}
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                          <Avatar className="size-8">
                            <AvatarImage src={entry.memberImage ?? undefined} />
                            <AvatarFallback className="text-xs">
                              {entry.memberName ? initials(entry.memberName) : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="leading-tight">
                            <p className="text-sm font-medium">{entry.memberName ?? "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{entry.memberEmail}</p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        {entry.memberLevel ? (
                          <Badge variant="outline" className="font-mono text-xs">
                            {WFG_LEVEL_META[entry.memberLevel as WFGLevel]?.abbreviation ?? entry.memberLevel.toUpperCase()}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold tabular-nums text-primary">
                          {entry.totalPoints.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="tabular-nums text-sm font-medium">
                          {entry.totalAmas.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="tabular-nums text-sm font-medium">
                          {entry.totalInvites.toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
