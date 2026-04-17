import { organization } from "better-auth/plugins/organization";
import { accessControl, canAssignRole, type OrgRole } from "../hooks/oraganization/permissions";
import ENVConfig from "@/config";
import { routes } from "@/routes";
import { sendOrganizationInvitation } from "@/email/email-templates/organization/organization-invitation";
import { APIError } from "better-auth/api";
import { db } from "@/lib/db";
import { member as memberTable } from "@/lib/db/schema/better-auth-schema";
import { and, eq } from "drizzle-orm";

const baseURL = ENVConfig.backend_base_url;

export const organizationPlugin = organization({
    ...accessControl,
    teams: { enabled: true, defaultTeam: { enabled: false } },
    // schema: {
    //     member: {
    //         additionalFields: {
    //             level: {
    //                 type: "string",
    //                 defaultValue: "TA",
    //             }
    //         }
    //     }
    // },
    async sendInvitationEmail(data) {
        const inviteLink = `${baseURL}${routes.dashboard.acceptInvitation(data.id)}`;
        await sendOrganizationInvitation({
            email: data.email,
            invitedByUsername: data.inviter.user.name,
            invitedByEmail: data.inviter.user.email,
            organizationName: data.organization.name,
            inviteLink,
        });
    },
    // organizationHooks: {
    //     beforeUpdateMemberRole: async ({ member, newRole, user }) => {
    //         const actorMember = await db
    //             .select({ role: memberTable.role })
    //             .from(memberTable)
    //             .where(and(eq(memberTable.userId, user.id), eq(memberTable.organizationId, member.organizationId)))
    //             .limit(1)
    //             .then(rows => rows[0]);

    //         if (!actorMember) {
    //             throw new APIError("FORBIDDEN", { message: "Could not verify your role in this organization" });
    //         }

    //         if (!canAssignRole(actorMember.role as OrgRole, newRole as OrgRole)) {
    //             throw new APIError("FORBIDDEN", { message: "You cannot assign a role higher than your own" });
    //         }
    //     },
    //     beforeCreateInvitation: async ({ invitation, inviter }) => {
    //         const actorMember = await db
    //             .select({ role: memberTable.role })
    //             .from(memberTable)
    //             .where(and(eq(memberTable.userId, inviter.id), eq(memberTable.organizationId, invitation.organizationId)))
    //             .limit(1)
    //             .then(rows => rows[0]);

    //         if (!actorMember) {
    //             throw new APIError("FORBIDDEN", { message: "Could not verify your role in this organization" });
    //         }

    //         if (!canAssignRole(actorMember.role as OrgRole, invitation.role as OrgRole)) {
    //             throw new APIError("FORBIDDEN", { message: "You cannot invite a user with a role higher than your own" });
    //         }
    //     }
    // }
})
