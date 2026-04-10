import { DEBUG_MODE } from "./config";

export const DEBUG = {
  enabled: DEBUG_MODE,

  categories: {
    zoomWebhookRequests: true,
    telegramWebhookRequests: true,
  },
};

type DebugCategory = keyof typeof DEBUG.categories;

// -------------------------------------------------------------------

export function debugLog(category: DebugCategory, ...args: any[]) {
  if (!DEBUG.enabled) return;
  if (!DEBUG.categories[category]) return;

  console.log(`[${category}]`, ...args);
}

// -------------------------------------------------------------------
