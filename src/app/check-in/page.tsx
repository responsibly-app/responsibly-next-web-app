import { Suspense } from "react";
import { CheckInView } from "./_components/check-in-view";

export default function CheckInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<div className="text-muted-foreground text-sm">Loading...</div>}>
        <CheckInView />
      </Suspense>
    </div>
  );
}
