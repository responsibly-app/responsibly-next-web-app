import { sessionRouter } from "./apis/session/session-router";
import { storageRouter } from "./apis/storage/storage-router";
import { zoomRouter } from "./apis/zoom/zoom-router";
import { organizationRouter } from "./apis/organization/organization-router";
import { eventRouter } from "./apis/event/event-router";

export const appRouter = {
  session: sessionRouter,
  storage: storageRouter,
  zoom: zoomRouter,
  organization: organizationRouter,
  event: eventRouter,
};

export type AppRouter = typeof appRouter;
