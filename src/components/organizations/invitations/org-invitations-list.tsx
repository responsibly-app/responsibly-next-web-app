"use client";

import { Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useListInvitations, useCancelInvitation } from "@/lib/auth/hooks";
import { OrgRole, ROLE_META } from "@/lib/auth/hooks/oraganization/permissions";

type Invitation = {
  id: string;
  email: string;
  role: OrgRole;
  status: "pending" | "accepted" | "rejected" | "canceled";
  expiresAt: Date | string;
};

export function OrgInvitationsList({ orgId }: { orgId: string }) {
  const { data: invitationsRaw, isPending } = useListInvitations(orgId);
  const cancelInvitation = useCancelInvitation();

  const invitations: Invitation[] = (
    invitationsRaw == null
      ? []
      : Array.isArray(invitationsRaw)
        ? (invitationsRaw as Invitation[])
        : ((invitationsRaw as { invitations?: Invitation[] }).invitations ?? [])
  ).filter((inv) => inv.status === "pending");

  return (
    <Card>
      <CardContent className="p-0">
        {isPending ? (
          <div className="space-y-3 px-6 py-6">
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
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="text-sm">{inv.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ROLE_META[inv.role]?.label ?? inv.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive h-7 px-2 text-xs"
                      disabled={cancelInvitation.isPending && cancelInvitation.variables?.invitationId === inv.id}
                      onClick={() => cancelInvitation.mutate({ invitationId: inv.id, email: inv.email })}
                    >
                      {cancelInvitation.isPending && cancelInvitation.variables?.invitationId === inv.id ? (
                        <Spinner className="size-3" />
                      ) : (
                        "Cancel"
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
