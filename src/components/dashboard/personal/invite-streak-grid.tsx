"use client";

import { useMemo } from "react";

type DayCell = {
  date: string;
  count: number;
  isPadding: boolean;
};

function getIntensityClass(count: number): string {
  if (count === 0) return "bg-muted";
  if (count <= 2) return "bg-green-200 dark:bg-green-900";
  if (count <= 5) return "bg-green-400 dark:bg-green-700";
  if (count <= 9) return "bg-green-600 dark:bg-green-500";
  return "bg-green-800 dark:bg-green-300";
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function calculateStreak(data: { date: string; count: number }[]): number {
  const map = new Map(data.map((d) => [d.date, d.count]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cur = new Date(today);

  // If today has no invites, start streak check from yesterday
  if (!map.get(toDateStr(cur))) {
    cur.setDate(cur.getDate() - 1);
  }

  let streak = 0;
  while (true) {
    const count = map.get(toDateStr(cur)) ?? 0;
    if (count === 0) break;
    streak++;
    cur.setDate(cur.getDate() - 1);
  }

  return streak;
}

type Props = {
  data: { date: string; count: number }[];
};

export function InviteStreakGrid({ data }: Props) {
  const { grid, streak } = useMemo(() => {
    const dateMap = new Map(data.map((d) => [d.date, d.count]));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rangeStart = new Date(today);
    rangeStart.setDate(rangeStart.getDate() - 89);

    // Go back to the Sunday before rangeStart
    const gridStart = new Date(rangeStart);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());

    const weeks: DayCell[][] = [];
    const cur = new Date(gridStart);

    while (cur <= today) {
      const week: DayCell[] = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = toDateStr(cur);
        const isPadding = cur < rangeStart || cur > today;
        week.push({ date: dateStr, count: isPadding ? 0 : (dateMap.get(dateStr) ?? 0), isPadding });
        cur.setDate(cur.getDate() + 1);
      }
      weeks.push(week);
    }

    return { grid: weeks, streak: calculateStreak(data) };
  }, [data]);

  const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tabular-nums">{streak}</span>
        <span className="text-sm text-muted-foreground">day streak</span>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex gap-[3px] min-w-max">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-[3px] mr-1">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="h-[11px] w-3 flex items-center justify-end">
                <span className="text-[9px] text-muted-foreground leading-none">{i % 2 === 1 ? label : ""}</span>
              </div>
            ))}
          </div>

          {/* Week columns */}
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <div
                  key={di}
                  title={day.isPadding ? "" : `${day.date}: ${day.count} invite${day.count !== 1 ? "s" : ""}`}
                  className={`h-[11px] w-[11px] rounded-[2px] ${
                    day.isPadding ? "opacity-0" : getIntensityClass(day.count)
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>Less</span>
        {[0, 2, 5, 9, 10].map((v) => (
          <div key={v} className={`h-[11px] w-[11px] rounded-[2px] ${getIntensityClass(v)}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
