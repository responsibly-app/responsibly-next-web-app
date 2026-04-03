"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";
import { orpc } from "@/lib/orpc/orpc-client";
import { OrgRole, canAssignRole } from "./permissions";

export type InvitationRole = "owner" | "admin" | "assistant" | "priviledgedMember" | "member";

type InviteMemberParams = {
    email: string;
    role: InvitationRole;
    organizationId: string;
};

/** Invite a member to an organization */
export function useInviteMember(organizationId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: InviteMemberParams) => {
            const { role: actorRole } = await orpc.organization.getMemberRole({ organizationId });
            if (!actorRole || !canAssignRole(actorRole as OrgRole, params.role as OrgRole)) {
                throw new Error("You cannot invite a user with a role higher than your own.");
            }
            const result = await authClient.organization.inviteMember(params);
            if (result.error) throw result.error;
            return result.data;
        },
        onSuccess: (_, { email }) => {
            queryClient.invalidateQueries({ queryKey: ["organization"] });
            toast.success(`Invitation sent to ${email}.`);
        },
        onError: (err: { message?: string }) => {
            toast.error(err?.message ?? "Failed to send invitation.");
        },
    });
}

/** Cancel a pending invitation */
export function useCancelInvitation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ invitationId }: { invitationId: string; email: string }) => {
            const result = await authClient.organization.cancelInvitation({ invitationId });
            if (result.error) throw result.error;
            return result.data;
        },
        onSuccess: (_, { email }) => {
            queryClient.invalidateQueries({ queryKey: ["organization"] });
            toast.success(`Invitation to ${email} cancelled.`);
        },
        onError: (err: { message?: string }) => {
            toast.error(err?.message ?? "Failed to cancel invitation.");
        },
    });
}

/** Get an invitation by ID */
export function useGetInvitation(invitationId: string) {
    return useQuery({
        queryKey: ["organization", "invitation", invitationId],
        queryFn: async () => {
            const result = await authClient.organization.getInvitation({ query: { id: invitationId } });
            if (result.error) throw result.error;
            return result.data;
        },
        enabled: !!invitationId,
    });
}

/** Accept an invitation */
export function useAcceptInvitation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (invitationId: string) => {
            const result = await authClient.organization.acceptInvitation({ invitationId });
            if (result.error) throw result.error;
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["organization"] });
        },
    });
}

/** Reject an invitation */
export function useRejectInvitation() {
    return useMutation({
        mutationFn: async (invitationId: string) => {
            const result = await authClient.organization.rejectInvitation({ invitationId });
            if (result.error) throw result.error;
            return result.data;
        },
    });
}

/** List all invitations for an organization */
export function useListInvitations(organizationId: string) {
    return useQuery({
        queryKey: ["organization", "invitations", organizationId],
        queryFn: async () => {
            const result = await authClient.organization.listInvitations({
                query: { organizationId },
            });
            if (result.error) throw result.error;
            return result.data;
        },
        enabled: !!organizationId,
    });
}

/** List all invitations for the current user */
export function useListUserInvitations() {
    return useQuery({
        queryKey: ["organization", "user-invitations"],
        queryFn: async () => {
            const result = await authClient.organization.listUserInvitations();
            if (result.error) throw result.error;
            return result.data;
        },
    });
}