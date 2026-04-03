"use client";

import { Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useActiveOrganization,
  useListInvitations,
  useCancelInvitation,
  useGetActiveMemberRole,
} from "@/lib/auth/hooks";
import { OrgRole } from "@/lib/auth/hooks/oraganization/permissions";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

type Invitation = {
  id: string;
  email: string;
  role: OrgRole;
  inviterId: string;
  organizationId: string;
  status: "pending" | "accepted" | "rejected" | "canceled";
  expiresAt: Date | string;
};

export function OrgInvitationsSection() {
  const { data: activeOrg } = useActiveOrganization();
  const { data: currentRole } = useGetActiveMemberRole();

  const orgId = activeOrg?.id ?? "";

  const { data: invitationsRaw, isPending } = useListInvitations(orgId);
  const cancelInvitation = useCancelInvitation();

  if (!activeOrg) return null;

  const raw = invitationsRaw as unknown;
  const invitations = (
    raw == null
      ? []
      : Array.isArray(raw)
        ? (raw as Invitation[])
        : ((raw as { invitations?: Invitation[] }).invitations ?? [])
  ).filter((inv) => inv.status === "pending");

  const canManage = currentRole === "owner" || currentRole === "admin";

  function handleCancel(invitationId: string, email: string) {
    cancelInvitation.mutate({ invitationId, email });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Pending Invitations
          {invitations.length > 0 && (
            <span className="text-muted-foreground ml-2 font-normal">
              ({invitations.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isPending ? (
          <div className="space-y-3 px-6 pb-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        ) : invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Mail className="text-muted-foreground mb-3 size-8" />
            <p className="text-muted-foreground text-sm">No pending invitations</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                {canManage && <TableHead className="w-24" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="text-sm">{inv.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {ROLE_LABELS[inv.role] ?? inv.role}
                    </Badge>
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive h-7 px-2 text-xs"
                        disabled={
                          cancelInvitation.isPending &&
                          cancelInvitation.variables?.invitationId === inv.id
                        }
                        onClick={() => handleCancel(inv.id, inv.email)}
                      >
                        {cancelInvitation.isPending &&
                          cancelInvitation.variables?.invitationId === inv.id ? (
                          <Spinner className="size-3" />
                        ) : (
                          "Cancel"
                        )}
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
