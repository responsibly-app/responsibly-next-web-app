import { adminClient, jwtClient, emailOTPClient, magicLinkClient } from "better-auth/client/plugins";
import { agentAuthClient } from "@better-auth/agent-auth/client";
import { organizationClientPlugin } from "./organizationClientPlugin";
import { BetterAuthClientPlugin } from "better-auth/types";

export const clientPlugins = [
    adminClient(),
    organizationClientPlugin,
    jwtClient(),
    emailOTPClient(),
    magicLinkClient(),
    agentAuthClient(),
] as const satisfies BetterAuthClientPlugin[]