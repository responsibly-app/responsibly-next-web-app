"use client";

import { SuspendFallback } from "@/components/suspend-fallback";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/theme-provider";
import { useAutoSyncTimezone } from "@/lib/auth/hooks";
import NextTopLoader from "nextjs-toploader";
import { Suspense } from "react";
import { TanstackProvider } from "./tanstack-provider";
import { Toaster } from "@/components/ui/sonner";
import { FireworksProvider } from "@/components/ui-custom/fireworks";

function TimezoneSyncProvider() {
  useAutoSyncTimezone();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  // For hydration issues, use in specific components causing the issue not globally
  // const [mounted, setMounted] = useState(false);

  // useEffect(() => {
  //   // eslint-disable-next-line react-hooks/set-state-in-effect
  //   setMounted(true);
  // }, []);

  // if (!mounted) {
  //   return <></>;
  // }

  return (
    <TanstackProvider>
      <TooltipProvider delayDuration={10}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color="var(--primary)" showSpinner={false} />
          <Toaster />
          <TimezoneSyncProvider />
          <FireworksProvider>
            <Suspense fallback={<SuspendFallback />}>{children}</Suspense>
          </FireworksProvider>
        </ThemeProvider>
      </TooltipProvider>
    </TanstackProvider>
  );
}
