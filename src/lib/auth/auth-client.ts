import ENVConfig from "@/config";
import { adminClient, organizationClient, jwtClient, emailOTPClient, magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { accessControl } from "./hooks/oraganization/permissions";

const baseURL = ENVConfig.backend_base_url;

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  // baseURL: process.env.BETTER_AUTH_URL,
  baseURL: baseURL,
  plugins: [
    adminClient(),
    organizationClient({
      ...accessControl,
      teams: { enabled: true }
    }),
    jwtClient(),
    emailOTPClient(),
    magicLinkClient()
  ],
});
