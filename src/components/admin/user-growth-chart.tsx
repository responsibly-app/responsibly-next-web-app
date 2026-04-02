"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useAdminListUsers } from "@/lib/auth/hooks";

type View = "newUsers" | "total";
type Range = "7d" | "30d" | "90d" | "12m" | "all";
type Granularity = "daily" | "weekly" | "monthly";

const chartConfig = {
  newUsers: {
    label: "New Users",
    color: "var(--primary)",
  },
  total: {
    label: "Cumulative",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const VIEWS: { value: View; label: string }[] = [
  { value: "newUsers", label: "New Users" },
  { value: "total", label: "Cumulative" },
];

const RANGES: { value: Range; label: string; days: number | null }[] = [
  { value: "7d", label: "7D", days: 7 },
  { value: "30d", label: "30D", days: 30 },
  { value: "90d", label: "90D", days: 90 },
  { value: "12m", label: "12M", days: 365 },
  { value: "all", label: "All", days: null },
];

const GRANULARITIES: { value: Granularity; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const DEFAULT_GRANULARITY: Record<Range, Granularity> = {
  "7d": "daily",
  "30d": "daily",
  "90d": "weekly",
  "12m": "monthly",
  all: "monthly",
};

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function bucketKey(date: Date, granularity: Granularity): string {
  if (granularity === "daily") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  if (granularity === "weekly") {
    const w = startOfWeek(date);
    return w.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function buildChartData(
  users: { createdAt: string | Date }[],
  range: Range,
  granularity: Granularity,
) {
  const rangeDef = RANGES.find((r) => r.value === range)!;
  const cutoff = rangeDef.days ? new Date(Date.now() - rangeDef.days * 86_400_000) : null;

  const totalBefore = cutoff ? users.filter((u) => new Date(u.createdAt) < cutoff).length : 0;
  const filtered = cutoff ? users.filter((u) => new Date(u.createdAt) >= cutoff) : users;

  const byBucket = new Map<string, number>();
  for (const user of filtered) {
    const key = bucketKey(new Date(user.createdAt), granularity);
    byBucket.set(key, (byBucket.get(key) ?? 0) + 1);
  }

  let running = totalBefore;
  return Array.from(byBucket.entries()).map(([bucket, newUsers]) => {
    running += newUsers;
    return { bucket, newUsers, total: running };
  });
}

export function UserGrowthChart() {
  const [view, setView] = useState<View>("total");
  const [range, setRange] = useState<Range>("all");
  const [granularity, setGranularity] = useState<Granularity>("daily");

  function handleRangeChange(value: string) {
    if (!value) return;
    const next = value as Range;
    setRange(next);
    setGranularity(DEFAULT_GRANULARITY[next]);
  }

  const { data, isLoading } = useAdminListUsers({
    limit: 10_000,
    sortBy: "createdAt",
    sortDirection: "asc",
  });

  const chartData = useMemo(() => {
    const users = data?.users ?? [];
    return buildChartData(users, range, granularity);
  }, [data, range, granularity]);

  const description = useMemo(() => {
    const r = RANGES.find((x) => x.value === range)!;
    const g = GRANULARITIES.find((x) => x.value === granularity)!;
    return `${g.label} sign-ups${r.days ? ` · last ${r.label}` : " · all time"}`;
  }, [range, granularity]);

  const axisProps = {
    tickLine: false,
    axisLine: false,
    tickMargin: 8,
    tick: { fontSize: 11 },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>User Growth</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(v) => v && setView(v as View)}
              className="h-8"
            >
              {VIEWS.map((v) => (
                <ToggleGroupItem key={v.value} value={v.value} className="h-7 px-2.5 text-xs">
                  {v.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <ToggleGroup
              type="single"
              value={range}
              onValueChange={handleRangeChange}
              className="h-8"
            >
              {RANGES.map((r) => (
                <ToggleGroupItem key={r.value} value={r.value} className="h-7 px-2.5 text-xs">
                  {r.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <ToggleGroup
              type="single"
              value={granularity}
              onValueChange={(v) => v && setGranularity(v as Granularity)}
              className="h-8"
            >
              {GRANULARITIES.map((g) => (
                <ToggleGroupItem key={g.value} value={g.value} className="h-7 px-2.5 text-xs">
                  {g.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : view === "newUsers" ? (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="bucket" {...axisProps} />
              <YAxis allowDecimals={false} {...axisProps} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="newUsers"
                fill="var(--color-newUsers)"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="bucket" {...axisProps} />
              <YAxis allowDecimals={false} {...axisProps} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="total"
                type="monotone"
                stroke="var(--color-total)"
                strokeWidth={2}
                fill="url(#gradTotal)"
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
