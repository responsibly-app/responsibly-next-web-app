import { organizationClient } from "better-auth/client/plugins";
import { accessControl } from "../hooks/oraganization/permissions";

export const organizationClientPlugin = organizationClient({
    ...accessControl,
    teams: { enabled: true }
})