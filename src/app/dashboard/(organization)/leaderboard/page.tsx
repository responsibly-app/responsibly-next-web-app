"use client";

import { OrgPageShell } from "@/components/organizations/organization/org-page-shell";
import { OrgLeaderboardPage } from "@/components/organizations/leaderboard/org-leaderboard-page";

export default function LeaderboardPage() {
  return (
    <OrgPageShell>
      {(orgId) => <OrgLeaderboardPage orgId={orgId} />}
    </OrgPageShell>
  );
}
