import { BetterAuthClientPlugin } from "better-auth/types";
import { adminClient, jwtClient, emailOTPClient, magicLinkClient, inferAdditionalFields, genericOAuthClient } from "better-auth/client/plugins";
import { organizationClientPlugin } from "./organizationClientPlugin";
import { auth } from "../auth";
// import { agentAuthClient } from "@better-auth/agent-auth/client";

export const clientPlugins = [
    inferAdditionalFields<typeof auth>(),
    adminClient(),
    organizationClientPlugin,
    jwtClient(),
    emailOTPClient(),
    magicLinkClient(),
    genericOAuthClient(),
    // agentAuthClient(),
] as const satisfies BetterAuthClientPlugin[]