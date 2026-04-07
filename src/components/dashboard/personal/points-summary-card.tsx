"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useListPoints } from "@/lib/auth/hooks";
import { routes } from "@/routes";
import Link from "next/link";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function currentMonthStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function PointsSummaryCard() {
  const { data: items = [], isPending } = useListPoints();

  const { totalAll, totalMonth, monthlyBars } = useMemo(() => {
    const totalAll = items.reduce((s, i) => s + i.amount, 0);
    const thisMonth = currentMonthStr();
    const totalMonth = items.filter((i) => i.date.startsWith(thisMonth)).reduce((s, i) => s + i.amount, 0);

    // Last 6 months for bar chart
    const map = new Map<string, number>();
    items.forEach((item) => {
      const month = item.date.substring(0, 7);
      map.set(month, (map.get(month) ?? 0) + item.amount);
    });

    const now = new Date();
    const months: { label: string; key: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({ label: MONTH_NAMES[d.getMonth()], key, total: map.get(key) ?? 0 });
    }

    const maxVal = Math.max(...months.map((m) => m.total), 1);
    const monthlyBars = months.map((m) => ({ ...m, pct: Math.round((m.total / maxVal) * 100) }));

    return { totalAll, totalMonth, monthlyBars };
  }, [items]);

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-16 w-full" />
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

        {/* Monthly bar chart */}
        <div className="flex items-end gap-1.5 h-16">
          {monthlyBars.map((m) => (
            <div key={m.key} className="flex flex-col items-center gap-1 flex-1">
              <div className="w-full flex items-end" style={{ height: "44px" }}>
                <div
                  className="w-full rounded-t-sm bg-primary/25 transition-all"
                  style={{ height: m.pct === 0 ? "2px" : `${Math.max(m.pct * 0.44, 4)}px` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground leading-none">{m.label}</span>
            </div>
          ))}
        </div>

        <Link href={routes.dashboard.points()} className="text-xs text-primary hover:underline block">
          View all points →
        </Link>
      </CardContent>
    </Card>
  );
}
