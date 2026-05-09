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
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";

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
          <Toaster
            closeButton={true}
            icons={{
              success: <CheckCircle2 className="size-4 text-emerald-500" />,
              info: <Info className="size-4 text-blue-500" />,
              warning: <AlertTriangle className="size-4 text-amber-500" />,
              error: <XCircle className="size-4 text-red-500" />,
              loading: <Loader2 className="size-4 animate-spin text-muted-foreground" />,
            }}
          />
          <TimezoneSyncProvider />
          <FireworksProvider>
            <Suspense fallback={<SuspendFallback />}>{children}</Suspense>
          </FireworksProvider>
        </ThemeProvider>
      </TooltipProvider>
    </TanstackProvider>
  );
}
