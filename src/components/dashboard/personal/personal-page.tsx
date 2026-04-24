"use client";

import { authClient } from "@/lib/auth/auth-client";
import { InviteLogCard } from "./invite-log-card";
import { DashboardPointsCard } from "./dashboard-points-card";
import { DashboardAmasCard } from "./dashboard-amas-card";
import { UpcomingEventsCard } from "./upcoming-events";
import { InviteStreakGrid } from "./invite-streak-grid";
import { useGetInviteHistory } from "@/lib/auth/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame } from "lucide-react";
import Link from "next/link";
import { routes } from "@/routes";
import { InviteGoalBar, GoalPopoverButton, useInviteGoal } from "@/components/dashboard/invites/invite-goal-bar";
import { localDateStr } from "@/lib/utils/timezone";

function greeting(hour: number): string {
  if (hour < 5) return "Up late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

// function useLocalClock(timezone: string) {
//   const [time, setTime] = useState<Date | null>(null);

//   useEffect(() => {
//     setTime(new Date());
//     const id = setInterval(() => setTime(new Date()), 1000);
//     return () => clearInterval(id);
//   }, []);

//   if (!time) return { display: "", hour: new Date().getHours() };

//   const display = new Intl.DateTimeFormat("en-US", {
//     timeZone: timezone,
//     hour: "numeric",
//     minute: "2-digit",
//     second: "2-digit",
//     hour12: true,
//   }).format(time);

//   const hour = parseInt(
//     new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hour12: false }).format(time),
//     10,
//   );

//   return { display, hour };
// }

function InviteStreakPreview() {
  const { data: session } = authClient.useSession();
  const timezone = session?.user?.timezone ?? "UTC";
  const { data: history = [] } = useGetInviteHistory(90);
  const { goal, setGoal } = useInviteGoal();

  const today = localDateStr(timezone);
  const todayCount = history.find((h) => h.date === today)?.count ?? 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Flame className="size-4 text-orange-500" />
            Invite Streak
          </CardTitle>
          <GoalPopoverButton goal={goal} setGoal={setGoal} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <InviteStreakGrid data={history} timezone={timezone} />
        {goal !== null && (
          <InviteGoalBar current={todayCount} goal={goal} />
        )}
        <Link href={routes.dashboard.invites()} className="text-xs text-primary hover:underline block">
          {goal === null ? "View full history →" : "Manage goal & history →"}
        </Link>
      </CardContent>
    </Card>
  );
}

export function PersonalPage() {
  const { data: session, isPending } = authClient.useSession();

  const firstName = session?.user.name?.split(" ")[0] ?? "there";
  const timezone = session?.user?.timezone ?? "UTC";

  const now = new Date();
  const hour = parseInt(
    new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hour12: false }).format(now),
    10,
  );

  return (
    <div className="space-y-6 pt-5">
      <div>
        {isPending ? (
          <Skeleton className="h-8 w-56" />
        ) : (
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting(hour)}, {firstName}
          </h1>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column: activity cards */}
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DashboardPointsCard />
            <DashboardAmasCard />
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_220px]">
            <InviteStreakPreview />
            <InviteLogCard />
          </div>
        </div>

        {/* Right column: upcoming events */}
        <div className="lg:col-span-1">
          <UpcomingEventsCard />
        </div>
      </div>
    </div>
  );
}
