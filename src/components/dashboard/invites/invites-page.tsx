"use client";

import { useState, useEffect, useRef } from "react";
import { Flame, CalendarIcon, Target, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth/auth-client";
import { useGetInviteHistory, useLogInvites } from "@/lib/auth/hooks";
import { InviteStreakGrid } from "@/components/dashboard/personal/invite-streak-grid";
import { InviteGoalBar, useInviteGoal } from "@/components/dashboard/invites/invite-goal-bar";
import { localDateStr } from "@/lib/utils/timezone";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

export function InvitesPage() {
  const { data: session } = authClient.useSession();
  const timezone = session?.user?.timezone ?? "UTC";
  const today = localDateStr(timezone);

  const { data: history = [], isPending } = useGetInviteHistory(90);
  const { mutate: logInvites, isPending: isSaving } = useLogInvites();

  // Today's log
  const todayCount = history.find((h) => h.date === today)?.count ?? 0;

  const [logDate, setLogDate] = useState(today);
  const [logCount, setLogCount] = useState<string>("");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Keep logDate in sync when timezone/today changes
  useEffect(() => {
    if (!showCustomDate) setLogDate(today);
  }, [today, showCustomDate]);

  const logEntry = history.find((h) => h.date === logDate);

  useEffect(() => {
    setLogCount(logEntry ? String(logEntry.count) : "");
  }, [logDate, logEntry]);

  function handleSaveLog() {
    const parsed = parseInt(logCount, 10);
    if (isNaN(parsed) || parsed < 0) return;
    logInvites({ date: logDate, count: parsed });
  }

  function handleToggleCustomDate() {
    if (showCustomDate) {
      setShowCustomDate(false);
      setLogDate(today);
    } else {
      setShowCustomDate(true);
      setTimeout(() => dateInputRef.current?.showPicker?.(), 50);
    }
  }

  // Edit dialog
  const [editEntry, setEditEntry] = useState<{ date: string; count: number } | null>(null);
  const [editCount, setEditCount] = useState<string>("");

  function openEdit(entry: { date: string; count: number }) {
    setEditEntry(entry);
    setEditCount(String(entry.count));
  }

  function handleSaveEdit() {
    if (!editEntry) return;
    const parsed = parseInt(editCount, 10);
    if (isNaN(parsed) || parsed < 0) return;
    logInvites({ date: editEntry.date, count: parsed }, { onSuccess: () => setEditEntry(null) });
  }

  const totalInvites = history.reduce((s, h) => s + h.count, 0);
  const activeDays = history.filter((h) => h.count > 0).length;

  // Daily goal
  const { goal, setGoal } = useInviteGoal();
  const [goalInput, setGoalInput] = useState("");
  const [goalPopoverOpen, setGoalPopoverOpen] = useState(false);

  useEffect(() => {
    if (goalPopoverOpen) setGoalInput(goal !== null ? String(goal) : "");
  }, [goalPopoverOpen, goal]);

  function handleSaveGoal() {
    const n = parseInt(goalInput, 10);
    if (!isNaN(n) && n > 0) {
      setGoal(n);
      setGoalPopoverOpen(false);
    }
  }

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

      {/* Streak + Log side by side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Flame className="size-4 text-orange-500" />
                  90-Day Streak
                </CardTitle>
                <CardDescription className="mt-1">
                  Your invite activity over the last 90 days
                </CardDescription>
              </div>

              {/* Goal setting popover */}
              <Popover open={goalPopoverOpen} onOpenChange={setGoalPopoverOpen}>
                <PopoverTrigger asChild>
                  <button className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground mt-0.5">
                    <Target className="size-3" />
                    {goal !== null ? `Goal: ${goal}` : "Set daily goal"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-3" align="end">
                  <div className="space-y-2.5">
                    <Label className="text-xs font-medium">Daily invite goal</Label>
                    <div className="flex gap-1.5">
                      <Input
                        type="number"
                        min={1}
                        max={999}
                        placeholder="e.g. 5"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveGoal()}
                        className="h-8 text-sm"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        className="h-8 px-2.5"
                        onClick={handleSaveGoal}
                        disabled={!goalInput}
                      >
                        <Check className="size-3.5" />
                      </Button>
                    </div>
                    {goal !== null && (
                      <button
                        onClick={() => {
                          setGoal(null);
                          setGoalInput("");
                          setGoalPopoverOpen(false);
                        }}
                        className="text-[11px] text-muted-foreground transition-colors hover:text-destructive"
                      >
                        Clear goal
                      </button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>

          <CardContent>
            {isPending ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <div className="space-y-3">
                {/* Streak grid + vertical goal bar side by side */}
                <div className="flex items-stretch gap-3">
                  <div className="flex-1 min-w-0">
                    <InviteStreakGrid data={history} timezone={timezone} />
                  </div>
                  {goal !== null && (
                    <InviteGoalBar
                      current={todayCount}
                      goal={goal}
                      orientation="vertical"
                    />
                  )}
                </div>

                {/* Horizontal goal bar + message below the grid */}
                {goal !== null && (
                  <InviteGoalBar current={todayCount} goal={goal} />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Log Invites</CardTitle>
            <CardDescription>Log your invite count for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Date</Label>
                  <button
                    type="button"
                    onClick={handleToggleCustomDate}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <CalendarIcon className="size-3" />
                    {showCustomDate ? "Use today" : "Custom date"}
                  </button>
                </div>
                {showCustomDate ? (
                  <Input
                    ref={dateInputRef}
                    type="date"
                    value={logDate}
                    max={today}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <p className="text-sm font-medium text-foreground">Today — {formatDate(today)}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-count">Number of invites</Label>
                <Input
                  id="invite-count"
                  type="number"
                  min={0}
                  max={9999}
                  placeholder="0"
                  value={logCount}
                  onChange={(e) => setLogCount(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button onClick={handleSaveLog} disabled={isSaving || logCount === ""} className="w-full">
                {isSaving ? "Saving…" : logEntry ? "Update" : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

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
                      <TableRow
                        key={entry.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => openEdit(entry)}
                      >
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

      {/* Edit dialog */}
      <Dialog open={!!editEntry} onOpenChange={(open) => { if (!open) setEditEntry(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Invites</DialogTitle>
          </DialogHeader>
          {editEntry && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">{formatDate(editEntry.date)}</p>
              <div className="space-y-1.5">
                <Label htmlFor="edit-count">Number of invites</Label>
                <Input
                  id="edit-count"
                  type="number"
                  min={0}
                  max={9999}
                  value={editCount}
                  onChange={(e) => setEditCount(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveEdit} disabled={isSaving || editCount === ""}>
              {isSaving ? "Saving…" : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
