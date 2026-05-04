import { createContext, useContext, useRef, type ReactNode } from "react";
import { useAuiState } from "@assistant-ui/react";

export const ThreadInitLoadingCtx = createContext(false);
export const useThreadInitLoading = () => useContext(ThreadInitLoadingCtx);

export function ThreadInitLoadingProvider({
  initialThreadId,
  children,
}: {
  initialThreadId?: string;
  children: ReactNode;
}) {
  const remoteId = useAuiState((s) => s.threadListItem.remoteId);
  const hasLoadedInitial = useRef(false);
  if (remoteId) hasLoadedInitial.current = true;

  const isLoading = !!initialThreadId && !remoteId && !hasLoadedInitial.current;

  return (
    <ThreadInitLoadingCtx.Provider value={isLoading}>
      {children}
    </ThreadInitLoadingCtx.Provider>
  );
}