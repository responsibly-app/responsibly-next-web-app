import { createRouterClient } from "@orpc/server";
import { appRouter } from "./router";
import type { Session } from "./context";

export function createServerCaller(session: Session) {
  return createRouterClient(appRouter, {
    context: { session, headers: new Headers() },
  });
}

export type ServerCaller = ReturnType<typeof createServerCaller>;
