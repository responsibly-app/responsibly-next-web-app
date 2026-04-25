"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2, TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
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
import { usePointsGoal, PointsGoalPopoverButton, PointsGoalBar } from "./points-goal-bar";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const chartConfig = {
  points: { label: "Points", color: "hsl(var(--primary) / 1)" },
} satisfies ChartConfig;

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function currentMonthStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function MonthlyChart({ items }: { items: { date: string; amount: number }[] }) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((i) => {
      const month = i.date.substring(0, 7);
      map.set(month, (map.get(month) ?? 0) + i.amount);
    });

    const now = new Date();
    return Array.from({ length: 6 }, (_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return { month: MONTH_NAMES[d.getMonth()], points: map.get(key) ?? 0 };
    });
  }, [items]);

  return (
    <ChartContainer config={chartConfig} className="h-48 w-full">
      <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="points" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} minPointSize={3}>
          <LabelList dataKey="points" position="top" style={{ fontSize: 11 }} formatter={(v: number) => (v === 0 ? "" : v)} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

type PointItem = { id: string; description: string; amount: number; date: string };

export function PointsPage() {
  const { data: items = [], isPending } = useListPoints();
  const { mutate: deleteItem, isPending: isDeleting } = useDeletePointItem();
  const { goal, setGoal } = usePointsGoal();

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<PointItem | null>(null);

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
        <div className="flex items-center gap-2">
          <PointsGoalPopoverButton goal={goal} setGoal={setGoal} />
          <AddPointDialog />
        </div>
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

      {/* Monthly goal bar */}
      {goal !== null && (
        <Card>
          <CardContent className="pt-5">
            <PointsGoalBar current={totalMonth} goal={goal} />
          </CardContent>
        </Card>
      )}

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
                    <TableHead className="w-20" />
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
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => setEditItem(item)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            disabled={isDeleting}
                            onClick={() => setPendingDeleteId(item.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!pendingDeleteId} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete point item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this point entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingDeleteId) deleteItem({ id: pendingDeleteId });
                setPendingDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editItem && (
        <AddPointDialog
          editItem={editItem}
          open={!!editItem}
          onOpenChange={(open) => !open && setEditItem(null)}
        />
      )}
    </div>
  );
}
