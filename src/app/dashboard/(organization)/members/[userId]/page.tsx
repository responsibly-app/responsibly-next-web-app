"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OrgPageShell } from "@/components/organizations/organization/org-page-shell";
import { useListMembers } from "@/lib/auth/hooks";
import { OrgRole, ROLE_META } from "@/lib/auth/hooks/oraganization/permissions";
import { authClient } from "@/lib/auth/auth-client";
import { routes } from "@/routes";

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

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <Avatar className="size-16">
              <AvatarImage src={member.user?.image ?? undefined} />
              <AvatarFallback className="text-lg">
                {member.user?.name ? initials(member.user.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">
                  {member.user?.name}
                </h2>
                {isSelf && (
                  <span className="text-xs text-muted-foreground">(you)</span>
                )}
              </div>
              <Badge variant={member.role === "owner" ? "default" : member.role === "admin" ? "secondary" : "outline"}>
                {ROLE_META[member.role]?.label ?? member.role}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="size-4 text-muted-foreground" />
            <span>{member.user?.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Joined</span>
            <span>
              {new Date(member.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </CardContent>
      </Card>
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
