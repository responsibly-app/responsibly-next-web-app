import { sessionRouter } from "./apis/session/session-router";
import { storageRouter } from "./apis/storage/storage-router";
import { zoomRouter } from "./apis/zoom/zoom-router";
import { organizationRouter } from "./apis/organization/organization-router";

export const appRouter = {
  session: sessionRouter,
  storage: storageRouter,
  zoom: zoomRouter,
  organization: organizationRouter,
};

export type AppRouter = typeof appRouter;
