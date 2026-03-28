export const routes = {
  dashboard: {
    root: () => "/dashboard",
    integrations: () => "/dashboard/integrations",
    account: () => "/dashboard/account",
  },
  authParent: () => "/auth",
  auth: {
    signIn: () => "/auth/sign-in",
    signUp: () => "/auth/sign-up",
    pendingEmailVerification: () => "/auth/pending-email-verification",
    resetPassword: () => "/auth/reset-password",
    newPassword: () => "/auth/new-password",
    goodbye: () => "/auth/goodbye",
    deleteAccount: () => "/auth/delete-account", // used only if sendDeleteAccountVerification is provided in auth.ts
  },
};
