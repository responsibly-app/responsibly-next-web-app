import { sessionRouter } from "./apis/session/session-router";
import { storageRouter } from "./apis/storage/storage-router";
import { zoomRouter } from "./apis/zoom/zoom-router";

export const appRouter = {
  session: sessionRouter,
  storage: storageRouter,
  zoom: zoomRouter,
};

export type AppRouter = typeof appRouter;
