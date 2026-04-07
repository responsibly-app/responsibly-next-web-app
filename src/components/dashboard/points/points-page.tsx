"use client";

import { useMemo } from "react";
import { Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useListPoints, useDeletePointItem } from "@/lib/auth/hooks";
import { AddPointDialog } from "./add-point-dialog";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function currentMonthStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function MonthlyChart({ items }: { items: { date: string; amount: number }[] }) {
  const bars = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((i) => {
      const month = i.date.substring(0, 7);
      map.set(month, (map.get(month) ?? 0) + i.amount);
    });

    const now = new Date();
    return Array.from({ length: 6 }, (_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return { label: MONTH_NAMES[d.getMonth()], key, total: map.get(key) ?? 0 };
    });
  }, [items]);

  const maxVal = Math.max(...bars.map((b) => b.total), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2 h-24">
        {bars.map((b) => (
          <div key={b.key} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-[10px] text-muted-foreground tabular-nums">{b.total > 0 ? b.total : ""}</span>
            <div className="w-full flex items-end" style={{ height: "60px" }}>
              <div
                className="w-full rounded-t-sm bg-primary/30 transition-all"
                style={{ height: b.total === 0 ? "2px" : `${Math.max((b.total / maxVal) * 60, 6)}px` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PointsPage() {
  const { data: items = [], isPending } = useListPoints();
  const { mutate: deleteItem, isPending: isDeleting } = useDeletePointItem();

  const { totalAll, totalMonth } = useMemo(() => {
    const thisMonth = currentMonthStr();
    return {
      totalAll: items.reduce((s, i) => s + i.amount, 0),
      totalMonth: items.filter((i) => i.date.startsWith(thisMonth)).reduce((s, i) => s + i.amount, 0),
    };
  }, [items]);

  return (
    <div className="space-y-6 pt-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Points</h1>
        <AddPointDialog />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-3xl font-bold tabular-nums">{totalAll.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total points</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-3xl font-bold tabular-nums">{totalMonth.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-4 text-blue-500" />
            Monthly Breakdown
          </CardTitle>
          <CardDescription>Points earned per month (last 6 months)</CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <MonthlyChart items={items} />
          )}
        </CardContent>
      </Card>

      {/* Items list */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">All Items</CardTitle>
            <CardDescription className="mt-0.5">Every deal or achievement you've logged</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isPending ? (
            <div className="space-y-3 px-6 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center">
              <TrendingUp className="mx-auto mb-2 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No points logged yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add your first deal or achievement above.
              </p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm font-medium">{item.description}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(item.date)}
                      </TableCell>
                      <TableCell className="text-right font-bold tabular-nums text-primary">
                        +{item.amount}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          disabled={isDeleting}
                          onClick={() => deleteItem({ id: item.id })}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
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
