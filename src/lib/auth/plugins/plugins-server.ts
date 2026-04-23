import { BetterAuthPlugin } from "better-auth/types";
import { expo } from "@better-auth/expo";
import { nextCookies } from "better-auth/next-js";
import { admin, jwt, openAPI, bearer } from "better-auth/plugins";
import { emailOTPPlugin } from "./emailOTPPlugin";
import { magicLinkPlugin } from "./magicLinkPlugin";
import { organizationPlugin } from "./organizationPlugin";
import { genericOAuthPlugin } from "./genericOAuthPlugin";
// import { agentAuthPlugin } from "./agentAuthPlugin";

export const serverPlugins = [
    nextCookies(),
    admin(),
    jwt(),
    bearer(),
    openAPI(),
    expo(),
    emailOTPPlugin,
    magicLinkPlugin,
    organizationPlugin,
    genericOAuthPlugin,
    // agentAuthPlugin,
] as const satisfies BetterAuthPlugin[]

