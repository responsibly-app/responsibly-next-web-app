"use client";

import { authClient } from "@/lib/auth/auth-client";
import { InviteLogCard } from "./invite-log-card";
import { PointsSummaryCard } from "./points-summary-card";
import { UpcomingEventsCard } from "./upcoming-events";
import { InviteStreakGrid } from "./invite-streak-grid";
import { useGetInviteHistory } from "@/lib/auth/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import Link from "next/link";
import { routes } from "@/routes";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function InviteStreakPreview() {
  const { data: history = [] } = useGetInviteHistory(90);
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="size-4 text-orange-500" />
          Invite Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <InviteStreakGrid data={history} />
        <Link href={routes.dashboard.invites()} className="text-xs text-primary hover:underline block">
          View full history →
        </Link>
      </CardContent>
    </Card>
  );
}

export function PersonalPage() {
  const { data: session } = authClient.useSession();
  const firstName = session?.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6 pt-5">
      <h1 className="text-2xl font-semibold tracking-tight">
        {greeting()}, {firstName}
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Left column: activity cards */}
        <div className="space-y-4 md:col-span-2">
          <PointsSummaryCard />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]">
            <InviteStreakPreview />
            <InviteLogCard />
          </div>
        </div>

        {/* Right column: upcoming events */}
        <div className="md:col-span-1">
          <UpcomingEventsCard />
        </div>
      </div>
    </div>
  );
}
