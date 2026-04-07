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

function getTextClass(count: number): string {
  if (count === 0) return "text-muted-foreground/50";
  if (count <= 2) return "text-green-800 dark:text-green-200";
  if (count <= 5) return "text-green-900 dark:text-green-100";
  return "text-white dark:text-green-950";
}

/** Returns YYYY-MM-DD for the given Date in the specified IANA timezone. */
function toLocalDateStr(d: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(d);
}

/**
 * Advance a YYYY-MM-DD string by `days` calendar days.
 * Uses UTC noon to avoid DST boundary issues.
 */
function addCalendarDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

/** Day-of-week (0=Sun) for a YYYY-MM-DD string, computed via UTC noon. */
function dayOfWeek(dateStr: string): number {
  return new Date(dateStr + "T12:00:00Z").getUTCDay();
}

export function calculateStreak(
  data: { date: string; count: number }[],
  timezone: string = "UTC",
): number {
  const map = new Map(data.map((d) => [d.date, d.count]));
  let checkDate = toLocalDateStr(new Date(), timezone);

  // If today has no invites, start from yesterday
  if (!map.get(checkDate)) {
    checkDate = addCalendarDays(checkDate, -1);
  }

  let streak = 0;
  while (true) {
    const count = map.get(checkDate) ?? 0;
    if (count === 0) break;
    streak++;
    checkDate = addCalendarDays(checkDate, -1);
  }

  return streak;
}

type Props = {
  data: { date: string; count: number }[];
  timezone?: string;
};

export function InviteStreakGrid({ data, timezone = "UTC" }: Props) {
  const { grid, streak } = useMemo(() => {
    const dateMap = new Map(data.map((d) => [d.date, d.count]));

    const todayStr = toLocalDateStr(new Date(), timezone);
    const rangeStartStr = addCalendarDays(todayStr, -89);

    // Go back to the Sunday before rangeStart
    const gridStartStr = addCalendarDays(rangeStartStr, -dayOfWeek(rangeStartStr));

    const weeks: DayCell[][] = [];
    let curStr = gridStartStr;

    while (curStr <= todayStr) {
      const week: DayCell[] = [];
      for (let d = 0; d < 7; d++) {
        const isPadding = curStr < rangeStartStr || curStr > todayStr;
        week.push({
          date: curStr,
          count: isPadding ? 0 : (dateMap.get(curStr) ?? 0),
          isPadding,
        });
        curStr = addCalendarDays(curStr, 1);
      }
      weeks.push(week);
    }

    return { grid: weeks, streak: calculateStreak(data, timezone) };
  }, [data, timezone]);

  const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

  const todayStr = toLocalDateStr(new Date(), timezone);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tabular-nums">{streak}</span>
        <span className="text-sm text-muted-foreground">day streak</span>
      </div>

      <div className="w-full">
        <div
          className="grid gap-0.75"
          style={{ gridTemplateColumns: `1.25rem repeat(${grid.length}, minmax(0, 18px))` }}
        >
          {/* Day-of-week labels column */}
          <div className="flex flex-col gap-0.75">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="aspect-square flex items-center justify-end pr-0.5">
                <span className="text-[9px] text-muted-foreground leading-none">{i % 2 === 1 ? label : ""}</span>
              </div>
            ))}
          </div>

          {/* Week columns */}
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.75">
              {week.map((day, di) => (
                <div
                  key={di}
                  title={day.isPadding ? "" : `${day.date}: ${day.count} invite${day.count !== 1 ? "s" : ""}`}
                  className={`aspect-square w-full rounded-[3px] flex items-center justify-center ${
                    day.isPadding ? "opacity-0" : getIntensityClass(day.count)
                  } ${!day.isPadding && day.date === todayStr ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}`}
                >
                  {!day.isPadding && (
                    <span className={`text-[clamp(6px,0.6cqw,9px)] font-medium leading-none tabular-nums ${getTextClass(day.count)}`}>
                      {day.count}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>Less</span>
        {[0, 2, 5, 9, 10].map((v) => (
          <div key={v} className={`h-4 w-4 rounded-[3px] shrink-0 ${getIntensityClass(v)}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
