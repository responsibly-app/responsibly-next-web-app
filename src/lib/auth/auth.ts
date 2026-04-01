import { betterAuth } from "better-auth";
// import Database from "better-sqlite3";
import { db } from "@/lib/db/index";
import * as betterAuthSchema from "@/lib/db/schema/better-auth-schema";
import { expo } from "@better-auth/expo";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, organization, jwt, openAPI, bearer, emailOTP, magicLink } from "better-auth/plugins";
import ENVConfig from "@/config";
// import { sendDeleteAccountEmail } from "@/email/email-templates/delete-account";
// import { sendDeleteAccountConfirmPageEmail } from "@/email/email-templates/delete-account-confirm-page";
import { sendPasswordResetEmail } from "@/email/email-templates/password-reset";
import { sendEmailVerification } from "@/email/email-templates/email-verification";
import { sendEmailVerificationOTP } from "@/email/email-templates/email-verification-otp";
import { sendPasswordResetOTP } from "@/email/email-templates/password-reset-otp";
import { sendMagicLinkEmail } from "@/email/email-templates/magic-link";
import { sendSignInVerificationOTP } from "@/email/email-templates/sign-in-otp";
import { sendOrganizationInvitation } from "@/email/email-templates/organization/organization-invitation";
import { routes } from "@/routes";

const baseURL = ENVConfig.backend_base_url;

const drizzleDatabase = drizzleAdapter(db, {
  provider: "pg", // or "pg" or "mysql"
  schema: betterAuthSchema,
})

const emailOTPPlugin = emailOTP({
  otpLength: 4,
  expiresIn: 60 * 10, // 10 minutes
  async sendVerificationOTP({ email, otp, type }) {
    if (type === "sign-in") {
      await sendSignInVerificationOTP({ userEmail: email, otp: otp, expiresIn: "10 minutes" });
    } else if (type === "email-verification") {
      await sendEmailVerificationOTP({ userEmail: email, otp: otp, expiresIn: "10 minutes" });
    } else if (type === "forget-password") {
      await sendPasswordResetOTP({ userEmail: email, otp: otp, expiresIn: "10 minutes" });
    }
  },
})

const magicLinkPlugin = magicLink({
  sendMagicLink: async ({ email, url }) => {
    await sendMagicLinkEmail({ userEmail: email, magicLinkUrl: url });
  },
})

const organizationPlugin = organization({
  teams: { enabled: true, defaultTeam: { enabled: false } },
  async sendInvitationEmail(data) {
    const inviteLink = `${baseURL}${routes.dashboard.acceptInvitation(data.id)}`;
    await sendOrganizationInvitation({
      email: data.email,
      invitedByUsername: data.inviter.user.name,
      invitedByEmail: data.inviter.user.email,
      organizationName: data.organization.name,
      inviteLink,
    });
  },
})


export const auth = betterAuth({
  appName: ENVConfig.app_name,
  baseURL: baseURL,
  database: drizzleDatabase,
  rateLimit: {
    enabled: true,
    window: 10, // time window in seconds
    max: 100, // max requests in the window
  },
  user: {
    deleteUser: {
      enabled: true,
      // sendDeleteAccountVerification: async ({ user, token }) => {
      //   // await sendDeleteAccountEmail({ userEmail: user.email, deletionUrl: url });
      //   const confirmationPageUrl = `${baseURL}/auth/delete-account?token=${token}`;
      //   await sendDeleteAccountConfirmPageEmail({ userEmail: user.email, confirmationPageUrl });
      // },
    }
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    expiresIn: 60 * 60 * 1, // 1 hour
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendPasswordResetEmail(
        { userEmail: user.email, resetUrl: url, expiresIn: "1 hour" },
      );
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 1, // 1 hour
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // Don't await - prevents timing attacks
      await sendEmailVerification(
        { userEmail: user.email, verificationUrl: url, expiresIn: "1 hour" },
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
    freshAge: 60 * 10, // the session is fresh if created within the last freshAge seconds (Set to 0 to disable freshness check)
    // expiresIn: 60 * 60 * 24 * 7, // 7 days
    // updateAge: 60 * 60 * 24, // refresh every 24h
    expiresIn: 60 * 60 * 24 * 2, // 2 days
    updateAge: 60 * 60 * 24 * 1, // refresh every day
    cookieCache: {
      strategy: "jwt", // "compact" or "jwt" or "jwe"
      enabled: true, // Enable caching session in cookie (default: `false`)
      maxAge: 60 * 60 * 1, // 1 hour
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
  plugins: [
    nextCookies(),
    admin(),
    jwt(),
    bearer(),
    openAPI(),
    expo(),
    emailOTPPlugin,
    magicLinkPlugin,
    organizationPlugin,
  ],
});

// http://localhost:3000/api/auth/reference