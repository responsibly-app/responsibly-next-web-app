import { sessionRouter } from "./apis/session/session-router";
import { storageRouter } from "./apis/storage/storage-router";
import { zoomRouter } from "./apis/integrations/zoom/zoom-router";
import { calendlyRouter } from "./apis/integrations/calendly/calendly-router";
import { organizationRouter } from "./apis/organization/organization-router";
import { orgSettingsRouter } from "./apis/organization/org-settings-router";
import { eventRouter } from "./apis/event/event-router";
import { telegramRouter } from "./apis/integrations/telegram/telegram-router";
import { invitesRouter } from "./apis/personal/invites-router";
import { pointsRouter } from "./apis/personal/points-router";

export const appRouter = {
  session: sessionRouter,
  storage: storageRouter,
  organization: { ...organizationRouter, settings: orgSettingsRouter },
  event: eventRouter,
  integrations: {
    zoom: zoomRouter,
    calendly: calendlyRouter,
    telegram: telegramRouter,
  },
  personal: {
    invites: invitesRouter,
    points: pointsRouter,
  },
};

export type AppRouter = typeof appRouter;
