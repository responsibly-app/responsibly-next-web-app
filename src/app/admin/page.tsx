import { OverviewStats } from "@/components/admin/overview-stats";
import { UserGrowthChart } from "@/components/admin/user-growth-chart";

export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-2 pt-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1 text-sm">Platform-wide stats at a glance.</p>
      </div>
      <OverviewStats />
      <UserGrowthChart />
    </div>
  );
}
