export const routes = {
  dashboard: {
    root: () => "/dashboard",
    members: () => "/dashboard/members",
    memberProfile: (userId: string) => `/dashboard/members/${userId}`,
    events: () => "/dashboard/events",
    integrations: () => "/dashboard/integrations",
    account: () => "/dashboard/account",
    organizations: () => "/dashboard/organizations",
    attendance: () => "/dashboard/attendance",
    eventAttendance: (eventId: string) => `/dashboard/events/${eventId}/attendance`,
    acceptInvitation: (invitationId: string) => `/dashboard/accept-invitation?id=${invitationId}`,
  },
  admin: {
    root: () => "/admin",
    users: () => "/admin/users",
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
