"use client";

import { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/auth-client";
import { useGetInviteHistory, useLogInvites } from "@/lib/auth/hooks";
import { localDateStr } from "@/lib/utils/timezone";

export function InviteLogCard() {
  const { data: session } = authClient.useSession();
  const timezone = session?.user ?.timezone ?? "UTC";
  const today = localDateStr(timezone);

  const { data: history = [], isPending } = useGetInviteHistory(90);
  const { mutate: logInvites, isPending: isSaving } = useLogInvites();

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
    logInvites({ date: today, count: parsed });
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
        <div className="flex gap-2">
          <Input
            type="number"
            min={0}
            max={9999}
            placeholder="0"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="w-28"
          />
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
