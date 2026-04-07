import ENVConfig from "@/config";
import { createAuthClient } from "better-auth/react";
import { clientPlugins } from "./plugins/plugins-client";

const baseURL = ENVConfig.backend_base_url;

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  // baseURL: process.env.BETTER_AUTH_URL,
  baseURL: baseURL,
  plugins: clientPlugins,
});

export type Session = typeof authClient.$Infer.Session
