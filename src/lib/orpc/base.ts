import { ORPCError, os } from "@orpc/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/better-auth-schema";
import { getZoomClient, type ZoomClient } from "@/lib/sdks/zoom-client";
import type { Context, Session } from "./context";

export const pub = os.$context<Context>();

export const authed = pub.use(({ context, next }) => {
  if (!context.session) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: { ...context, session: context.session as Session },
  });
});

export const adminAuthed = authed.use(async ({ context, next }) => {
  const [dbUser] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, context.session.user.id))
    .limit(1);

  if (dbUser?.role !== "admin") {
    throw new ORPCError("FORBIDDEN");
  }

  return next();
});

export const zoomAuthed = authed.use(async ({ context, next }) => {
  const zoom = await getZoomClient(context.headers);
  if (!zoom) {
    throw new ORPCError("PRECONDITION_FAILED", {
      message: "Zoom account not connected",
    });
  }
  return next({ context: { ...context, zoom: zoom as ZoomClient } });
});
