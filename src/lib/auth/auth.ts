import { betterAuth } from "better-auth";
// import Database from "better-sqlite3";
import { db } from "@/lib/db/index";
import * as betterAuthSchema from "@/lib/db/schema/better-auth-schema";
import { expo } from "@better-auth/expo";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { jwt, openAPI, bearer } from "better-auth/plugins";
import ENVConfig from "@/config";
import { sendPasswordResetEmail } from "@/email/email-templates/password-reset";
import { sendVerificationEmail } from "@/email/email-templates/verification";

const baseURL = ENVConfig.backend_base_url;


export const auth = betterAuth({
  appName: ENVConfig.app_name,
  baseURL: baseURL,
  // database: new Database("./sqlite.db"),
  database: drizzleAdapter(db, {
    provider: "pg", // or "pg" or "mysql"
    schema: betterAuthSchema,
  }),
  user: {
    deleteUser: {
      enabled: true
    }
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendPasswordResetEmail(
        { userEmail: user.email, resetUrl: url },
      );
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // Don't await - prevents timing attacks
      await sendVerificationEmail(
        { userEmail: user.email, verificationUrl: url },
      );
    },
    async afterEmailVerification(user, request) {
      // Your custom logic here, e.g., grant access to premium features
      console.log(`${user.email} has been successfully verified!`);
    },
    sendOnSignUp: true,
    sendOnSignIn: false,
  },
  session: {
    // expiresIn: 60 * 60 * 24 * 7, // 7 days
    // updateAge: 60 * 60 * 24, // refresh every 24h
    expiresIn: 60 * 60 * 24 * 2, // 1 day for testing
    updateAge: 60 * 60 * 24 * 1, // refresh every 10 seconds for testing
    cookieCache: {
      strategy: "jwt", // "compact" or "jwt" or "jwe"
      enabled: true, // Enable caching session in cookie (default: `false`)
      // maxAge: 60 * 60 * 24 * 2, // 2 days (session in coockie without revalidation with database)
      maxAge: 1 * 60, // 30 seconds for testing
      // refreshCache: true, // Refresh cookie cache when session is updated via updateAge
    },
  },
  socialProviders: {
    //https://www.better-auth.com/docs/authentication/google
    //https://console.cloud.google.com/apis/dashboard
    google: {
      prompt: "select_account",
      // prompt: "select_account consent",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // accessType: "offline",
    },
    zoom: {
      clientId: process.env.ZOOM_CLIENT_ID as string,
      clientSecret: process.env.ZOOM_CLIENT_SECRET as string,
    },
  },
  account: {
    // modelName: "accounts",
    // fields: {
    //   userId: "user_id"
    // },
    encryptOAuthTokens: true, // Encrypt OAuth tokens before storing them in the database
    storeAccountCookie: false, // Store account data after OAuth flow in a cookie (useful for database-less flows)
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "zoom", "email-password"], // or async (request) => ["google", "github"]
      allowDifferentEmails: true
    }
  },
  trustedOrigins: [
    baseURL,
    "exp://",
    "exp://**",
    "mobileapp://",
    "mobileapp://*",
  ],
  advanced: {
    // useSecureCookies: true
  },
  plugins: [nextCookies(), jwt(), bearer(), openAPI(), expo()],
});

// http://localhost:3000/api/auth/reference