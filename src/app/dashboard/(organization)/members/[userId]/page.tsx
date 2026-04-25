"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, ShieldCheck, TrendingUp, Flame, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { OrgPageShell } from "@/components/organizations/organization/org-page-shell";
import { useListMembers, useGetMemberInviteHistory, useGetMemberPoints, useGetMemberAmas } from "@/lib/auth/hooks";
import { OrgRole, ROLE_META } from "@/lib/auth/hooks/oraganization/permissions";
import { authClient } from "@/lib/auth/auth-client";
import { routes } from "@/routes";
import { InviteStreakGrid } from "@/components/dashboard/personal/invite-streak-grid";

type MemberRow = {
  id: string;
  userId: string;
  organizationId: string;
  role: OrgRole;
  createdAt: Date | string;
  user: { id: string; name: string; email: string; image?: string | null };
};

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const chartConfig = {
  points: { label: "Points", color: "var(--color-primary)" },
} satisfies ChartConfig;

function currentMonthStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function MemberInvitesTab({ orgId, userId }: { orgId: string; userId: string }) {
  const { data: history = [], isPending } = useGetMemberInviteHistory(orgId, userId);

  if (isPending) return <Skeleton className="h-48 w-full" />;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="size-4 text-orange-500" />
          90-Day Invite Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <InviteStreakGrid data={history} />
      </CardContent>
    </Card>
  );
}

function MemberPointsTab({ orgId, userId }: { orgId: string; userId: string }) {
  const { data: items = [], isPending } = useGetMemberPoints(orgId, userId);

  const { totalAll, totalMonth, chartData } = useMemo(() => {
    const totalAll = items.reduce((s, i) => s + i.amount, 0);
    const thisMonth = currentMonthStr();
    const totalMonth = items
      .filter((i) => i.date.startsWith(thisMonth))
      .reduce((s, i) => s + i.amount, 0);

    const map = new Map<string, number>();
    items.forEach((item) => {
      const month = item.date.substring(0, 7);
      map.set(month, (map.get(month) ?? 0) + item.amount);
    });

    const now = new Date();
    const chartData = Array.from({ length: 6 }, (_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return { month: MONTH_NAMES[d.getMonth()], points: map.get(key) ?? 0 };
    });

    return { totalAll, totalMonth, chartData };
  }, [items]);

  if (isPending) return <Skeleton className="h-48 w-full" />;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="size-4 text-blue-500" />
          Points
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-6">
          <div>
            <p className="text-2xl font-bold tabular-nums">{totalAll.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">All time</p>
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">{totalMonth.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="h-36 w-full">
          <BarChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="points" fill="var(--color-primary)" radius={[4, 4, 0, 0]} minPointSize={3} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const amasChartConfig = {
  amas: { label: "AMAs", color: "var(--color-primary)" },
} satisfies ChartConfig;

function MemberAmasTab({ orgId, userId }: { orgId: string; userId: string }) {
  const { data: items = [], isPending } = useGetMemberAmas(orgId, userId);

  const { totalAll, totalMonth, chartData } = useMemo(() => {
    const totalAll = items.length;
    const thisMonth = currentMonthStr();
    const totalMonth = items.filter((i) => i.date.startsWith(thisMonth)).length;

    const map = new Map<string, number>();
    items.forEach((item) => {
      const month = item.date.substring(0, 7);
      map.set(month, (map.get(month) ?? 0) + 1);
    });

    const now = new Date();
    const chartData = Array.from({ length: 6 }, (_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return { month: MONTH_NAMES[d.getMonth()], amas: map.get(key) ?? 0 };
    });

    return { totalAll, totalMonth, chartData };
  }, [items]);

  if (isPending) return <Skeleton className="h-48 w-full" />;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="size-4 text-purple-500" />
          AMAs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-6">
          <div>
            <p className="text-2xl font-bold tabular-nums">{totalAll.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">All time</p>
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">{totalMonth.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </div>
        </div>

        <ChartContainer config={amasChartConfig} className="h-36 w-full">
          <BarChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="amas" fill="var(--color-primary)" radius={[4, 4, 0, 0]} minPointSize={3} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function MemberProfileContent({ orgId, userId }: { orgId: string; userId: string }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { data: membersRaw, isPending } = useListMembers({ organizationId: orgId });

  const members: MemberRow[] = membersRaw
    ? Array.isArray(membersRaw)
      ? (membersRaw as MemberRow[])
      : ((membersRaw as { members?: MemberRow[] }).members ?? [])
    : [];

  const member = members.find((m) => m.userId === userId);
  const isSelf = session?.user?.id === userId;

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium">Member not found</p>
        <p className="mt-1 text-xs text-muted-foreground">
          This member may have left the organization.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => router.push(routes.dashboard.members())}
        >
          Back to Members
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(routes.dashboard.members())}
          className="-ml-2"
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Members
        </Button>
      </div>

      {/* Profile card */}
      <div className="flex flex-wrap items-start gap-4">
        <Avatar className="size-30">
          <AvatarImage src={member.user?.image ?? undefined} />
          <AvatarFallback className="text-lg">
            {member.user?.name ? initials(member.user.name) : "?"}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{member.user?.name}</h2>
            {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}
          </div>
          <Badge variant={member.role === "owner" ? "default" : member.role === "admin" ? "secondary" : "outline"}>
            {ROLE_META[member.role]?.label ?? member.role}
          </Badge>
          <div className="flex flex-col gap-1 pt-1">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5" />
              <span>{member.user?.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <ShieldCheck className="size-3.5" />
              <span>
                Joined{" "}
                {new Date(member.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="invites">
        <TabsList>
          <TabsTrigger value="invites">Invites</TabsTrigger>
          <TabsTrigger value="points">Points</TabsTrigger>
          <TabsTrigger value="amas">AMAs</TabsTrigger>
        </TabsList>
        <TabsContent value="invites" className="mt-4">
          <MemberInvitesTab orgId={orgId} userId={userId} />
        </TabsContent>
        <TabsContent value="points" className="mt-4">
          <MemberPointsTab orgId={orgId} userId={userId} />
        </TabsContent>
        <TabsContent value="amas" className="mt-4">
          <MemberAmasTab orgId={orgId} userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function MemberProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  return (
    <OrgPageShell>
      {(orgId) => <MemberProfileContent orgId={orgId} userId={userId} />}
    </OrgPageShell>
  );
}
