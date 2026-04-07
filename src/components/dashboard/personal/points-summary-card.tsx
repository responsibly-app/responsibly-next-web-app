"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useListPoints } from "@/lib/auth/hooks";
import { routes } from "@/routes";
import Link from "next/link";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const chartConfig = {
  points: { label: "Points", color: "var(--color-primary)" },
} satisfies ChartConfig;

function currentMonthStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function PointsSummaryCard() {
  const { data: items = [], isPending } = useListPoints();

  const { totalAll, totalMonth, chartData } = useMemo(() => {
    const totalAll = items.reduce((s, i) => s + i.amount, 0);
    const thisMonth = currentMonthStr();
    const totalMonth = items.filter((i) => i.date.startsWith(thisMonth)).reduce((s, i) => s + i.amount, 0);

    const map = new Map<string, number>();
    items.forEach((item) => {
      const month = item.date.substring(0, 7);
      map.set(month, (map.get(month) ?? 0) + item.amount);
    });

    const now = new Date();
    const chartData = Array.from({ length: 6 }, (_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return { month: MONTH_NAMES[d.getMonth()], points: map.get(key) ?? 0 };
    });

    return { totalAll, totalMonth, chartData };
  }, [items]);

  if (isPending) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-16" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-6">
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-3 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="size-4 text-blue-500" />
          Points
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-6">
          <div>
            <p className="text-2xl font-bold tabular-nums">{totalAll.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">All time</p>
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">{totalMonth.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="h-36 w-full">
          <BarChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="points" fill="var(--color-primary)" radius={[4, 4, 0, 0]} minPointSize={3} />
          </BarChart>
        </ChartContainer>

        <Link href={routes.dashboard.points()} className="text-xs text-primary hover:underline block">
          View all points →
        </Link>
      </CardContent>
    </Card>
  );
}
