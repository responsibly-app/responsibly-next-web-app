import { inferOrgAdditionalFields, organizationClient } from "better-auth/client/plugins";
import { accessControl } from "../hooks/oraganization/permissions";
import { auth } from "../auth";

export const organizationClientPlugin = organizationClient({
    ...accessControl,
    teams: { enabled: true },
    schema: inferOrgAdditionalFields<typeof auth>()
})