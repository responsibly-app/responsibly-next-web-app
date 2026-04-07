"use client";

import { useEffect, useState } from "react";
import { GlobeIcon, PencilIcon, SaveIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/lib/auth/auth-client";
import { useUpdateUser } from "@/lib/auth/hooks";
import { TimezoneSelect } from "@/components/ui-custom/timezone-select";
import { detectTimezone, TIMEZONE_OPTIONS } from "@/lib/utils/timezone";

type UserExt = { timezone?: string; timezoneMode?: string };

export function TimezoneCard() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const user = session?.user;
  const userExt = user as (typeof user & UserExt) | undefined;
  const updateUser = useUpdateUser();

  const [isAuto, setIsAuto] = useState(true);
  const [customTimezone, setCustomTimezone] = useState("UTC");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const mode = userExt?.timezoneMode ?? "auto";
    setIsAuto(mode === "auto");
    setCustomTimezone(userExt?.timezone ?? "UTC");
  }, [user]);

  const browserTimezone = detectTimezone();
  const displayTimezone = isAuto ? browserTimezone : customTimezone;
  const tzLabel = TIMEZONE_OPTIONS.find((t) => t.value === displayTimezone)?.label ?? displayTimezone;
  const isCustomDirty = customTimezone !== (userExt?.timezone ?? "UTC");

  function refetchSession() {
    refetch({ query: { disableCookieCache: true } });
  }

  function handleToggleAuto(checked: boolean) {
    setIsAuto(checked);
    setIsEditing(!checked);
    if (checked) {
      updateUser.mutate(
        { timezone: browserTimezone, timezoneMode: "auto" },
        {
          onSuccess: () => { refetchSession(); toast.success("Timezone set to browser default."); },
          onError: (err: { message?: string }) => { toast.error(err?.message ?? "Failed to update timezone."); },
        },
      );
    }
  }

  function handleCancel() {
    setCustomTimezone(userExt?.timezone ?? "UTC");
    setIsEditing(false);
    setIsAuto((userExt?.timezoneMode ?? "auto") === "auto");
  }

  function handleSave() {
    updateUser.mutate(
      { timezone: customTimezone, timezoneMode: "custom" },
      {
        onSuccess: () => { refetchSession(); setIsEditing(false); toast.success("Custom timezone saved."); },
        onError: (err: { message?: string }) => { toast.error(err?.message ?? "Failed to update timezone."); },
      },
    );
  }

  if (isPending) {
    return (
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-xl" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-52" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex size-9 items-center justify-center rounded-xl">
            <GlobeIcon className="text-primary size-4" />
          </div>
          <div>
            <CardTitle>Timezone</CardTitle>
            <CardDescription>Used for daily tracking, streaks, and event times.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-5">
        {/* Auto toggle */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Use browser timezone</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automatically keeps your timezone in sync
            </p>
          </div>
          <Switch
            checked={isAuto}
            onCheckedChange={handleToggleAuto}
            disabled={updateUser.isPending}
          />
        </div>

        {/* Display */}
        {isAuto ? (
          <div className="rounded-md border bg-muted/40 px-3 py-2.5">
            <p className="text-xs text-muted-foreground mb-0.5">Detected timezone</p>
            <p className="text-sm font-medium">{tzLabel}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {isEditing ? (
              <>
                <div className="grid gap-2">
                  <Label>Custom timezone</Label>
                  <TimezoneSelect value={customTimezone} onChange={setCustomTimezone} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <XIcon className="mr-1.5 size-3.5" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={updateUser.isPending || !isCustomDirty}>
                    {updateUser.isPending
                      ? <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />
                      : <SaveIcon className="mr-1.5 size-3.5" data-icon="inline-start" />}
                    Save
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-md border bg-muted/40 px-3 py-2.5">
                  <p className="text-xs text-muted-foreground mb-0.5">Custom timezone</p>
                  <p className="text-sm font-medium">{tzLabel}</p>
                </div>
                <Button variant="outline" size="icon" onClick={() => setIsEditing(true)} aria-label="Edit timezone">
                  <PencilIcon className="size-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
