import { BetterAuthClientPlugin } from "better-auth/types";
import { adminClient, jwtClient, emailOTPClient, magicLinkClient } from "better-auth/client/plugins";
import { organizationClientPlugin } from "./organizationClientPlugin";
// import { agentAuthClient } from "@better-auth/agent-auth/client";

export const clientPlugins = [
    adminClient(),
    organizationClientPlugin,
    jwtClient(),
    emailOTPClient(),
    magicLinkClient(),
    // agentAuthClient(),
] as const satisfies BetterAuthClientPlugin[]