import { sessionRouter } from "./apis/session/session-router";
import { storageRouter } from "./apis/storage/storage-router";
import { zoomRouter } from "./apis/integrations/zoom/zoom-router";
import { organizationRouter } from "./apis/organization/organization-router";
import { eventRouter } from "./apis/event/event-router";
import { telegramRouter } from "./apis/integrations/telegram/telegram-router";

export const appRouter = {
  session: sessionRouter,
  storage: storageRouter,
  organization: organizationRouter,
  event: eventRouter,
  integrations: {
    zoom: zoomRouter,
    telegram: telegramRouter,
  },
};

export type AppRouter = typeof appRouter;
