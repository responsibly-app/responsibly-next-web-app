"use client";

import { useMemo, useRef, useState, useEffect } from "react";

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

function addCalendarDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

function dayOfWeek(dateStr: string): number {
  return new Date(dateStr + "T12:00:00Z").getUTCDay();
}

export function calculateStreak(
  data: { date: string; count: number }[],
  timezone: string = "UTC",
): number {
  const map = new Map(data.map((d) => [d.date, d.count]));
  let checkDate = toLocalDateStr(new Date(), timezone);

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

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const LABEL_W = 28; // px — wide enough for 3-letter labels at 9px font
const GAP = 3;      // px

type Props = {
  data: { date: string; count: number }[];
  timezone?: string;
};

export function InviteStreakGrid({ data, timezone = "UTC" }: Props) {
  const { grid, streak } = useMemo(() => {
    const dateMap = new Map(data.map((d) => [d.date, d.count]));

    const todayStr = toLocalDateStr(new Date(), timezone);
    const rangeStartStr = addCalendarDays(todayStr, -89);
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

  const todayStr = toLocalDateStr(new Date(), timezone);

  // Responsive tile size derived from container width
  const containerRef = useRef<HTMLDivElement>(null);
  const [tileSize, setTileSize] = useState(16);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.getBoundingClientRect().width;
      const numWeeks = grid.length;
      // total gap space: between label col and first week, plus between each week column
      const totalGaps = numWeeks * GAP;
      const available = w - LABEL_W - totalGaps;
      const size = Math.max(9, Math.min(22, Math.floor(available / numWeeks)));
      setTileSize(size);
    };
    compute();
    const obs = new ResizeObserver(compute);
    obs.observe(el);
    return () => obs.disconnect();
  }, [grid.length]);

  const countFontSize = Math.max(6, Math.floor(tileSize * 0.5));

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tabular-nums">{streak}</span>
        <span className="text-sm text-muted-foreground">day streak</span>
      </div>

      <div ref={containerRef} className="w-full">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `${LABEL_W}px repeat(${grid.length}, ${tileSize}px)`,
            gap: `${GAP}px`,
          }}
        >
          {/* Day-of-week label column */}
          <div className="flex flex-col" style={{ gap: `${GAP}px` }}>
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                style={{ height: `${tileSize}px` }}
                className="flex items-center justify-end"
              >
                <span
                  className="text-muted-foreground leading-none select-none font-medium"
                  style={{ fontSize: "9px" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Week columns */}
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col" style={{ gap: `${GAP}px` }}>
              {week.map((day, di) => (
                <div
                  key={di}
                  title={day.isPadding ? "" : `${day.date}: ${day.count} invite${day.count !== 1 ? "s" : ""}`}
                  style={{ width: `${tileSize}px`, height: `${tileSize}px` }}
                  className={`rounded-[3px] flex items-center justify-center shrink-0 ${
                    day.isPadding ? "opacity-0" : getIntensityClass(day.count)
                  } ${!day.isPadding && day.date === todayStr ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}`}
                >
                  {!day.isPadding && day.count > 0 && (
                    <span
                      className={`font-medium leading-none tabular-nums ${getTextClass(day.count)}`}
                      style={{ fontSize: `${countFontSize}px` }}
                    >
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
          <div key={v} className={`h-3.5 w-3.5 rounded-[3px] shrink-0 ${getIntensityClass(v)}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
