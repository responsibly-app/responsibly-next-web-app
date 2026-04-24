"use client";

import { useEffect, useState } from "react";
import { Target, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const STORAGE_KEY = "points-monthly-goal";

// ── Hook ─────────────────────────────────────────────────────────────────────

export function usePointsGoal() {
  const [goal, setGoalState] = useState<number | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const n = parseInt(raw, 10);
      if (!isNaN(n) && n > 0) setGoalState(n);
    }
  }, []);

  function setGoal(value: number | null) {
    if (value !== null && value > 0) {
      localStorage.setItem(STORAGE_KEY, String(value));
      setGoalState(value);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setGoalState(null);
    }
  }

  return { goal, setGoal };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fillClass(pct: number): string {
  if (pct >= 100) return "bg-green-500 dark:bg-green-400";
  if (pct >= 75) return "bg-yellow-400 dark:bg-yellow-300";
  if (pct >= 40) return "bg-orange-400";
  return "bg-red-400 dark:bg-red-500";
}

function motivationText(current: number, goal: number): { text: string; good: boolean } {
  if (current === 0) {
    return { text: `${goal} points to reach this month's goal`, good: false };
  }
  const above = current - goal;
  const left = goal - current;
  if (above > 0) return { text: `${above} above goal — you're crushing it!`, good: true };
  if (left === 0) return { text: "Monthly goal reached! Incredible work!", good: true };
  if (left <= Math.ceil(goal * 0.1)) return { text: `${left} more — almost there!`, good: false };
  if (current / goal >= 0.5) return { text: `${left} more to go — keep pushing!`, good: false };
  return { text: `${left} more to go — you got this!`, good: false };
}

// ── GoalPopoverButton ─────────────────────────────────────────────────────────

interface GoalPopoverButtonProps {
  goal: number | null;
  setGoal: (value: number | null) => void;
}

export function PointsGoalPopoverButton({ goal, setGoal }: GoalPopoverButtonProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (open) setInput(goal !== null ? String(goal) : "");
  }, [open, goal]);

  function handleSave() {
    const n = parseInt(input, 10);
    if (!isNaN(n) && n > 0) {
      setGoal(n);
      setOpen(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex shrink-0 items-center gap-1.5 text-xs">
          <Target className="size-3.5" />
          {goal !== null ? `Goal: ${goal}` : "Set monthly goal"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-3" align="end">
        <div className="space-y-2.5">
          <Label className="text-xs font-medium">Monthly points goal</Label>
          <div className="flex gap-1.5">
            <Input
              type="number"
              min={1}
              max={99999}
              placeholder="e.g. 500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="h-8 text-sm"
              autoFocus
            />
            <Button size="sm" className="h-8 px-2.5" onClick={handleSave} disabled={!input}>
              <Check className="size-3.5" />
            </Button>
          </div>
          {goal !== null && (
            <button
              onClick={() => {
                setGoal(null);
                setInput("");
                setOpen(false);
              }}
              className="text-[11px] text-muted-foreground transition-colors hover:text-destructive"
            >
              Clear goal
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── PointsGoalBar ─────────────────────────────────────────────────────────────

interface PointsGoalBarProps {
  current: number;
  goal: number;
}

export function PointsGoalBar({ current, goal }: PointsGoalBarProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(false);
    const id = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(id);
  }, [current, goal]);

  if (goal <= 0) return null;

  const pct = Math.min((current / goal) * 100, 100);
  const isAtGoal = current >= goal;
  const cls = fillClass(pct);
  const { text, good } = motivationText(current, goal);

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Target className="size-3 shrink-0" />
          <span>This month's goal</span>
        </div>
        <div className="text-xs tabular-nums">
          <span
            className={cn(
              "font-semibold",
              isAtGoal ? "text-green-600 dark:text-green-400" : "text-foreground",
            )}
          >
            {current.toLocaleString()}
          </span>
          <span className="text-muted-foreground"> / {goal.toLocaleString()}</span>
        </div>
      </div>

      <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out",
            cls,
          )}
          style={{ width: animated ? `${pct}%` : "0%" }}
        />
        {!isAtGoal && (
          <div className="absolute inset-y-0 right-0 w-[3px] bg-foreground/15 rounded-r-full" />
        )}
      </div>

      <p
        className={cn(
          "text-[11px] leading-tight",
          good ? "text-green-600 dark:text-green-400 font-medium" : "text-muted-foreground",
        )}
      >
        {text}
      </p>
    </div>
  );
}
