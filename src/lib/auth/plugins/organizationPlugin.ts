import { organization } from "better-auth/plugins";
import { accessControl } from "../hooks/oraganization/permissions";
import ENVConfig from "@/config";
import { routes } from "@/routes";
import { sendOrganizationInvitation } from "@/email/email-templates/organization/organization-invitation";
import { organizationClient } from "better-auth/client/plugins";

const baseURL = ENVConfig.backend_base_url;

export const organizationPlugin = organization({
    ...accessControl,
    teams: { enabled: true, defaultTeam: { enabled: false } },
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
})

