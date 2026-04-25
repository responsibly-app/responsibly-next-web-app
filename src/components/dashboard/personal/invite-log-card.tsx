"use client";

import { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/auth-client";
import { useGetInviteHistory, useLogInvites } from "@/lib/auth/hooks";
import { useFireworks } from "@/contexts/fireworks-context";
import { localDateStr } from "@/lib/utils/timezone";

export function InviteLogCard() {
  const { data: session } = authClient.useSession();
  const timezone = session?.user ?.timezone ?? "UTC";
  const today = localDateStr(timezone);

  const { data: history = [], isPending } = useGetInviteHistory(90);
  const { mutate: logInvites, isPending: isSaving } = useLogInvites();
  const { triggerFireworks } = useFireworks();

  const todayEntry = history.find((h) => h.date === today);
  const [count, setCount] = useState<string>("");

  useEffect(() => {
    if (todayEntry !== undefined) {
      setCount(String(todayEntry.count));
    }
  }, [todayEntry]);

  function handleSave() {
    const parsed = parseInt(count, 10);
    if (isNaN(parsed) || parsed < 0) return;
    logInvites({ date: today, count: parsed }, { onSuccess: () => triggerFireworks() });
  }

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="size-4 text-orange-500" />
          Today's Invites
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-r-none border-r-0"
              onClick={() => setCount((prev) => String(Math.max(0, (parseInt(prev, 10) || 0) - 1)))}
            >
              −
            </Button>
            <Input
              type="number"
              min={0}
              max={9999}
              placeholder="0"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="w-16 rounded-none text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-l-none border-l-0"
              onClick={() => setCount((prev) => String(Math.min(9999, (parseInt(prev, 10) || 0) + 1)))}
            >
              +
            </Button>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving || count === ""}
            size="sm"
          >
            {isSaving ? "Saving…" : todayEntry ? "Update" : "Log"}
          </Button>
        </div>
        {todayEntry && (
          <p className="text-xs text-muted-foreground">
            Logged <span className="font-medium text-foreground">{todayEntry.count}</span> invite{todayEntry.count !== 1 ? "s" : ""} today
          </p>
        )}
      </CardContent>
    </Card>
  );
}
