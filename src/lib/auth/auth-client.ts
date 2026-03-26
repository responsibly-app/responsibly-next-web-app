import ENVConfig from "@/config";
import { jwtClient, emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const baseURL = ENVConfig.backend_base_url;

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  // baseURL: process.env.BETTER_AUTH_URL,
  baseURL: baseURL,
  plugins: [jwtClient(), emailOTPClient()],
});
