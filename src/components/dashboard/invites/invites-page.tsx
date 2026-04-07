"use client";

import { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetInviteHistory, useLogInvites } from "@/lib/auth/hooks";
import { InviteStreakGrid } from "@/components/dashboard/personal/invite-streak-grid";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

export function InvitesPage() {
  const today = todayStr();
  const { data: history = [], isPending } = useGetInviteHistory(90);
  const { mutate: logInvites, isPending: isSaving } = useLogInvites();

  const todayEntry = history.find((h) => h.date === today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [count, setCount] = useState<string>("");

  const selectedEntry = history.find((h) => h.date === selectedDate);

  useEffect(() => {
    setCount(selectedEntry ? String(selectedEntry.count) : "");
  }, [selectedDate, selectedEntry]);

  function handleSave() {
    const parsed = parseInt(count, 10);
    if (isNaN(parsed) || parsed < 0) return;
    logInvites({ date: selectedDate, count: parsed });
  }

  const totalInvites = history.reduce((s, h) => s + h.count, 0);
  const activeDays = history.filter((h) => h.count > 0).length;

  return (
    <div className="space-y-6 pt-5">
      <h1 className="text-2xl font-semibold tracking-tight">Invites</h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-2xl font-bold tabular-nums">{totalInvites}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total (90 days)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-2xl font-bold tabular-nums">{activeDays}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Active days</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="pt-5">
            <p className="text-2xl font-bold tabular-nums">
              {activeDays > 0 ? Math.round(totalInvites / activeDays) : 0}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Avg per active day</p>
          </CardContent>
        </Card>
      </div>

      {/* Streak grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Flame className="size-4 text-orange-500" />
            90-Day Streak
          </CardTitle>
          <CardDescription>Your invite activity over the last 90 days</CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <InviteStreakGrid data={history} />
          )}
        </CardContent>
      </Card>

      {/* Log entry */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Log Invites</CardTitle>
          <CardDescription>Update your invite count for any day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="invite-date">Date</Label>
              <Input
                id="invite-date"
                type="date"
                value={selectedDate}
                max={today}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-44"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-count">Number of invites</Label>
              <Input
                id="invite-count"
                type="number"
                min={0}
                max={9999}
                placeholder="0"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-32"
              />
            </div>
            <Button onClick={handleSave} disabled={isSaving || count === ""}>
              {isSaving ? "Saving…" : selectedEntry ? "Update" : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isPending ? (
            <div className="space-y-3 px-6 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : history.filter((h) => h.count > 0).length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No invites logged yet
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Invites</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...history]
                    .filter((h) => h.count > 0)
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-sm">{formatDate(entry.date)}</TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {entry.count}
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
