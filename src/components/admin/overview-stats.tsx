"use client";

import { Users, ShieldCheck, Ban, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminListUsers } from "@/lib/auth/hooks";

function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value: number | undefined;
  icon: React.ElementType;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
          <Icon className="text-primary size-4" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-3xl font-bold">{value?.toLocaleString() ?? "—"}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function OverviewStats() {
  const total = useAdminListUsers({ limit: 1 });
  const admins = useAdminListUsers({ limit: 1, filterField: "role", filterValue: "admin", filterOperator: "eq" });
  const banned = useAdminListUsers({ limit: 1, filterField: "banned", filterValue: true, filterOperator: "eq" });
  const verified = useAdminListUsers({ limit: 1, filterField: "emailVerified", filterValue: true, filterOperator: "eq" });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Users"
        value={total.data?.total}
        icon={Users}
        isLoading={total.isLoading}
      />
      <StatCard
        title="Admins"
        value={admins.data?.total}
        icon={ShieldCheck}
        isLoading={admins.isLoading}
      />
      <StatCard
        title="Banned"
        value={banned.data?.total}
        icon={Ban}
        isLoading={banned.isLoading}
      />
      <StatCard
        title="Verified"
        value={verified.data?.total}
        icon={UserCheck}
        isLoading={verified.isLoading}
      />
    </div>
  );
}
