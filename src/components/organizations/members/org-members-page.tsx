"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrgMembersList } from "./org-members-list";
import { OrgInvitationsList } from "../invitations/org-invitations-list";
import { InviteMemberDialog } from "../invitations/invite-member-dialog";
import { useGetMemberRole, useListMembers } from "@/lib/auth/hooks";
import { getPermissions } from "@/lib/auth/hooks/oraganization/access-control";
import { OrgRole } from "@/lib/auth/hooks/oraganization/permissions";

type Props = { orgId: string };

export function OrgMembersPage({ orgId }: Props) {
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: memberRoleData } = useGetMemberRole(orgId);
  const { data: membersRaw } = useListMembers({ organizationId: orgId });

  const currentRole = memberRoleData?.role as OrgRole | undefined;
  const { canManage } = getPermissions(currentRole);

  const memberCount = membersRaw
    ? Array.isArray(membersRaw)
      ? membersRaw.length
      : ((membersRaw as { members?: unknown[] }).members?.length ?? 0)
    : null;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
          {canManage && (
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <UserPlus className="mr-1.5 size-3.5" />
              Invite Member
            </Button>
          )}
        </div>

        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">
              Members
              {memberCount != null && memberCount > 0 && (
                <span className="ml-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-xs font-normal text-primary-foreground">
                  {memberCount}
                </span>
              )}
            </TabsTrigger>
            {canManage && <TabsTrigger value="invitations">Invitations</TabsTrigger>}
          </TabsList>

          <TabsContent value="members" className="mt-4">
            <OrgMembersList orgId={orgId} />
          </TabsContent>

          {canManage && (
            <TabsContent value="invitations" className="mt-4">
              <OrgInvitationsList orgId={orgId} />
            </TabsContent>
          )}
        </Tabs>
      </div>

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        organizationId={orgId}
      />
    </>
  );
}
