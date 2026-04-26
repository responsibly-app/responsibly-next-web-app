export const routes = {
  dashboard: {
    root: () => "/dashboard",
    members: () => "/dashboard/members",
    memberProfile: (userId: string) => `/dashboard/members/${userId}`,
    events: () => "/dashboard/events",
    integrations: () => "/dashboard/integrations",
    settings: () => "/dashboard/settings",
    organizations: () => "/dashboard/organizations",
    leaderboard: () => "/dashboard/leaderboard",
    baseshop: () => "/dashboard/baseshop",
    personal: () => "/dashboard/personal",
    invites: () => "/dashboard/invites",
    points: () => "/dashboard/points",
    amas: () => "/dashboard/amas",
    eventDetail: (eventId: string) => `/dashboard/events/${eventId}`,
    acceptInvitation: (invitationId: string) => `/dashboard/accept-invitation?id=${invitationId}`,
  },
  admin: {
    root: () => "/admin",
    users: () => "/admin/users",
  },
  authParent: () => "/auth",
  auth: {
    signIn: (callbackUrl?: string) => `/auth/sign-in${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`,
    signUp: () => "/auth/sign-up",
    pendingEmailVerification: () => "/auth/pending-email-verification",
    resetPassword: () => "/auth/reset-password",
    newPassword: () => "/auth/new-password",
    goodbye: () => "/auth/goodbye",
    deleteAccount: () => "/auth/delete-account", // used only if sendDeleteAccountVerification is provided in auth.ts
  },
  checkIn: (code?: string) => `/check-in${code ? `?code=${encodeURIComponent(code)}` : ''}`,
  landing: {
    root: () => "/",
    privacy: () => "/privacy",
    terms: () => "/terms",
  }
};
