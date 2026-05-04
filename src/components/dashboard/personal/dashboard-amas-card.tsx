"use client";

import { useMemo } from "react";
import { Users } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useListAmas } from "@/lib/auth/hooks";
import { routes } from "@/routes";
import Link from "next/link";
import { AddAmaDialog } from "@/components/dashboard/amas/add-ama-dialog";
import { useAmaGoal, AmaGoalBar, AmaGoalPopoverButton } from "@/components/dashboard/amas/ama-goal-bar";

const chartConfig = {
  recruits: { label: "Recruits", color: "var(--color-primary)" },
} satisfies ChartConfig;

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function currentMonthStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function currentMonthName(): string {
  return MONTH_NAMES[new Date().getMonth()];
}

const WEEK_RANGES = [
  { label: "Wk 1", from: 1, to: 7 },
  { label: "Wk 2", from: 8, to: 14 },
  { label: "Wk 3", from: 15, to: 21 },
  { label: "Wk 4", from: 22, to: 28 },
  { label: "Wk 5", from: 29, to: 31 },
];

export function DashboardAmasCard() {
  const { data: items = [], isPending } = useListAmas();
  const { goal, setGoal } = useAmaGoal();

  const { totalMonth, chartData } = useMemo(() => {
    const thisMonth = currentMonthStr();
    const now = new Date();
    const todayDay = now.getDate();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const monthItems = items.filter((i) => i.date.startsWith(thisMonth));
    const totalMonth = monthItems.length;

    const chartData = WEEK_RANGES.filter((w) => w.from <= Math.min(todayDay, lastDay)).map((w) => ({
      week: w.label,
      recruits: monthItems.filter((i) => {
        const day = parseInt(i.date.split("-")[2], 10);
        return day >= w.from && day <= w.to;
      }).length,
    }));

    return { totalMonth, chartData };
  }, [items]);

  if (isPending) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4 shrink-0 text-primary" />
            AMAs — {currentMonthName()}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-1.5">
            <AmaGoalPopoverButton goal={goal} setGoal={setGoal} />
            <AddAmaDialog />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-2xl font-bold tabular-nums">{totalMonth.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Recruits this month</p>
        </div>

        <ChartContainer config={chartConfig} className="h-36 w-full">
          <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="recruits" fill="var(--color-primary)" radius={[4, 4, 0, 0]} minPointSize={3}>
              <LabelList dataKey="recruits" position="top" style={{ fontSize: 11, fill: "var(--muted-foreground)" }} formatter={(v: unknown) => (v === 0 ? "" : (v as string | number))} />
            </Bar>
          </BarChart>
        </ChartContainer>

        {goal !== null && <AmaGoalBar current={totalMonth} goal={goal} />}

        <Link href={routes.dashboard.amas()} className="text-xs text-primary hover:underline block">
          View all AMAs →
        </Link>
      </CardContent>
    </Card>
  );
}
