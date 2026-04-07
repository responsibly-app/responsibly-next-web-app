"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Syncs a tab value with a URL search parameter.
 * Returns [activeTab, setTab] — changing the tab replaces the URL without a full navigation.
 */
export function useTabSearchParam(defaultTab: string, paramName = "tab"): [string, (tab: string) => void] {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = searchParams.get(paramName) ?? defaultTab;

  const setTab = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === defaultTab) {
        params.delete(paramName);
      } else {
        params.set(paramName, tab);
      }
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    },
    [searchParams, pathname, router, defaultTab, paramName],
  );

  return [activeTab, setTab];
}
