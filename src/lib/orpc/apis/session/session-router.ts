import { ORPCError } from "@orpc/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/better-auth-schema";
import { eq } from "drizzle-orm";
import { authed } from "@/lib/orpc/base";
import { SessionSchema, SessionWithUserSchema, UserSchema } from "./session-schemas";

export const sessionRouter = {
    me: authed
        .route({ method: "GET", path: "/session/me", summary: "Get the current authenticated user", tags: ["Session"] })
        .output(UserSchema)
        .handler(async ({ context }) => {
            const userId = context.session.user.id;
            const [dbUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
            if (!dbUser) throw new ORPCError("NOT_FOUND", { message: "User not found" });
            return dbUser;
        }),

    current: authed
        .route({ method: "GET", path: "/session/current", summary: "Get the current session with user", tags: ["Session"] })
        .output(SessionWithUserSchema)
        .handler(async ({ context }) => ({
            session: context.session.session,
            user: context.session.user,
        })),
};
