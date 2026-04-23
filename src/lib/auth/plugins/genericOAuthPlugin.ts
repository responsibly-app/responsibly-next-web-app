import { genericOAuth } from "better-auth/plugins";

const CalendlyOAuthConfig = {
    providerId: "calendly",
    clientId: process.env.CALENDLY_CLIENT_ID!,
    clientSecret: process.env.CALENDLY_CLIENT_SECRET!,
    authorizationUrl: "https://auth.calendly.com/oauth/authorize",
    tokenUrl: "https://auth.calendly.com/oauth/token",
    scopes: ["users:read", "event_types:read", "scheduled_events:read"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getUserInfo: async (tokens: any) => {
        const res = await fetch("https://api.calendly.com/users/me", {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });
        const data = await res.json();
        const r = data.resource;
        return {
            id: r.uri,
            name: r.name,
            email: r.email,
            image: r.avatar_url ?? undefined,
            emailVerified: true,
        };
    },
};


export const genericOAuthPlugin = genericOAuth({
    config: [
        CalendlyOAuthConfig,
        // Add more providers here as needed
    ],
}) 