"use client";

import * as React from "react";
import Cookies from "js-cookie";
import { AppSidebarV2 } from "./app-sidebar-v2";
import { DashboardHeaderV2 } from "./dashboard-header-v2";

const SIDEBAR_ICON_W = 55;
const SIDEBAR_PINNED_W = 240;

function getDefaultPinned(): boolean {
  const v2 = Cookies.get("sidebar_v2_pinned");
  return v2 !== undefined ? v2 !== "false" : true;
}

export default function DashboardLayoutV2({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPinned, setIsPinned] = React.useState(getDefaultPinned);

  const handleTogglePin = React.useCallback(() => {
    setIsPinned((prev) => {
      const next = !prev;
      Cookies.set("sidebar_v2_pinned", String(next), { expires: 365 });
      return next;
    });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className="hidden md:block relative h-screen shrink-0 transition-[width] duration-300 ease-in-out"
        style={{ width: isPinned ? SIDEBAR_PINNED_W : SIDEBAR_ICON_W }}
      >
        <AppSidebarV2 isPinned={isPinned} onTogglePin={handleTogglePin} />
      </div>

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <DashboardHeaderV2 />

        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
