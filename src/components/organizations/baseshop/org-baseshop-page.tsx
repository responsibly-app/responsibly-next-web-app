"use client";

import { useState, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Users2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useGetPointsLeaderboard, useGetOrgTimeSeries } from "@/lib/auth/hooks";
import { cn } from "@/lib/utils";

type Timeframe = "week" | "month" | "year";
type Metric = "points" | "amas" | "invites";

const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  week: "This Week",
  month: "This Month",
  year: "This Year",
};

const METRIC_LABELS: Record<Metric, string> = {
  points: "Points",
  amas: "AMAs",
  invites: "Invites",
};

const chartConfig = {
  points: { label: "Points", color: "var(--primary)" },
  amas: { label: "AMAs", color: "var(--chart-2)" },
  invites: { label: "Invites", color: "var(--chart-3)" },
} satisfies ChartConfig;

function startDateForTimeframe(tf: Timeframe): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (tf === "week") {
    const d = new Date(now);
    d.setDate(now.getDate() - 6);
    return fmt(d);
  }
  if (tf === "month") {
    return fmt(new Date(now.getFullYear(), now.getMonth(), 1));
  }
  return fmt(new Date(now.getFullYear(), 0, 1));
}

type DailyRow = { date: string; points: number; amas: number; invites: number };
type Bucket = { label: string; sortKey: string; points: number; amas: number; invites: number };

const pad = (n: number) => String(n).padStart(2, "0");
const fmtDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function mondayOf(d: Date): Date {
  const m = new Date(d);
  const diff = d.getDay() === 0 ? -6 : 1 - d.getDay();
  m.setDate(d.getDate() + diff);
  return m;
}

function generateBuckets(timeframe: Timeframe): Map<string, Bucket> {
  const now = new Date();
  const map = new Map<string, Bucket>();

  if (timeframe === "week") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const sortKey = fmtDate(d);
      const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      map.set(sortKey, { label, sortKey, points: 0, amas: 0, invites: 0 });
    }
    return map;
  }

  if (timeframe === "month") {
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    let week = mondayOf(firstOfMonth);
    while (week <= now) {
      const sortKey = fmtDate(week);
      const label = week.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      map.set(sortKey, { label, sortKey, points: 0, amas: 0, invites: 0 });
      const next = new Date(week);
      next.setDate(week.getDate() + 7);
      week = next;
    }
    return map;
  }

  // year — all 12 months
  for (let m = 0; m < 12; m++) {
    const sortKey = `${now.getFullYear()}-${pad(m + 1)}`;
    const label = new Date(now.getFullYear(), m, 1).toLocaleDateString("en-US", { month: "short" });
    map.set(sortKey, { label, sortKey, points: 0, amas: 0, invites: 0 });
  }
  return map;
}

function rowBucketKey(dateStr: string, timeframe: Timeframe): string {
  const d = new Date(dateStr + "T00:00:00");
  if (timeframe === "week") return dateStr;
  if (timeframe === "month") return fmtDate(mondayOf(d));
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function buildChartData(rows: DailyRow[], timeframe: Timeframe): Bucket[] {
  const buckets = generateBuckets(timeframe);
  for (const row of rows) {
    const key = rowBucketKey(row.date, timeframe);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.points += row.points;
      bucket.amas += row.amas;
      bucket.invites += row.invites;
    }
  }
  return Array.from(buckets.values());
}

type Props = { orgId: string };

export function OrgBaseshopPage({ orgId }: Props) {
  const [timeframe, setTimeframe] = useState<Timeframe>("month");
  const [metric, setMetric] = useState<Metric>("points");

  const startDate = useMemo(() => startDateForTimeframe(timeframe), [timeframe]);

  const { data: tsRows = [], isPending: tsPending } = useGetOrgTimeSeries(orgId, startDate);
  const { data: leaderboardEntries = [], isPending: lbPending } = useGetPointsLeaderboard(orgId, startDate);

  const isPending = tsPending || lbPending;

  const totals = useMemo(
    () => ({
      points: tsRows.reduce((s, r) => s + r.points, 0),
      amas: tsRows.reduce((s, r) => s + r.amas, 0),
      invites: tsRows.reduce((s, r) => s + r.invites, 0),
    }),
    [tsRows],
  );

  const chartData = useMemo(() => buildChartData(tsRows, timeframe), [tsRows, timeframe]);

  const statCards: { label: string; metric: Metric }[] = [
    { label: "Total Points", metric: "points" },
    { label: "Total AMAs", metric: "amas" },
    { label: "Total Invites", metric: "invites" },
  ];

  const axisProps = {
    tickLine: false,
    axisLine: false,
    tickMargin: 8,
    tick: { fontSize: 11 },
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Baseshop</h1>

      {/* Summary stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {statCards.map((card) => (
          <Card
            key={card.metric}
            className={cn(
              "cursor-pointer transition-all",
              metric === card.metric && "ring-2 ring-primary",
            )}
            onClick={() => setMetric(card.metric)}
          >
            <CardContent className="px-4 py-3">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              {isPending ? (
                <Skeleton className="mt-1 h-6 w-16" />
              ) : (
                <p className="text-xl font-bold tabular-nums">
                  {totals[card.metric].toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Activity Over Time</CardTitle>
              <CardDescription>
                {METRIC_LABELS[metric]} · {TIMEFRAME_LABELS[timeframe]}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as Timeframe)}>
                <TabsList>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
              </Tabs>
              <Tabs value={metric} onValueChange={(v) => setMetric(v as Metric)}>
                <TabsList>
                  <TabsTrigger value="points">Points</TabsTrigger>
                  <TabsTrigger value="amas">AMAs</TabsTrigger>
                  <TabsTrigger value="invites">Invites</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis allowDecimals={false} {...axisProps} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey={metric}
                  fill={`var(--color-${metric})`}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                  minPointSize={2}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Users2 className="size-4" />
        <span>
          {leaderboardEntries.length} member{leaderboardEntries.length !== 1 ? "s" : ""} with activity in this period
        </span>
      </div>
    </div>
  );
}
