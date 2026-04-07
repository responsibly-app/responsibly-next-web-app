"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { detectTimezone } from "@/lib/utils/timezone";
import { useUpdateUser } from "./use-account";

/**
 * Silently syncs the browser timezone to the user's profile whenever:
 * - timezoneMode is "auto" (the default)
 * - the stored timezone differs from the browser's current timezone
 *
 * Runs once per login (keyed on session user ID), not on every render.
 */
export function useAutoSyncTimezone() {
  const { data: session } = authClient.useSession();
  const updateUser = useUpdateUser();

  const userId = session?.user?.id;
  const timezone = session?.user?.timezone ?? "UTC";
  const timezoneMode = session?.user?.timezoneMode ?? "auto";

  useEffect(() => {
    if (!userId || timezoneMode !== "auto") return;
    const browserTz = detectTimezone();
    if (browserTz !== timezone) {
      updateUser.mutate({ timezone: browserTz });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
}
