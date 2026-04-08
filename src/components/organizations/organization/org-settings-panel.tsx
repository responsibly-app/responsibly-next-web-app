"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetOrgSettings, useUpdateOrgSettings } from "@/lib/auth/hooks";

export function OrgSettingsPanel({ orgId }: { orgId: string }) {
  const { data: settings, isPending } = useGetOrgSettings(orgId);
  const updateSettings = useUpdateOrgSettings();

  const [minDuration, setMinDuration] = useState(0);
  const [zoomAutoMark, setZoomAutoMark] = useState(true);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (settings) {
      setMinDuration(settings.minAttendanceDurationMinutes);
      setZoomAutoMark(settings.zoomAutoMarkPresent);
      setDirty(false);
    }
  }, [settings]);

  function handleSave() {
    updateSettings.mutate(
      {
        organizationId: orgId,
        minAttendanceDurationMinutes: minDuration,
        zoomAutoMarkPresent: zoomAutoMark,
      },
      {
        onSuccess: () => {
          toast.success("Settings saved");
          setDirty(false);
        },
        onError: (err: { message?: string }) =>
          toast.error(err?.message ?? "Failed to save settings"),
      },
    );
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-5" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Attendance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance Settings</CardTitle>
          <CardDescription>
            Configure how attendance is tracked and auto-marked for this organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Zoom Auto-mark */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Auto-mark present via Zoom</Label>
              <p className="text-muted-foreground text-xs">
                Automatically mark members as present when they join a linked Zoom meeting for
                the required duration.
              </p>
            </div>
            <Switch
              checked={zoomAutoMark}
              onCheckedChange={(v) => {
                setZoomAutoMark(v);
                setDirty(true);
              }}
            />
          </div>

          <Separator />

          {/* Minimum Duration */}
          <div className="space-y-2">
            <Label htmlFor="min-duration" className="text-sm font-medium">
              Minimum attendance duration (minutes)
            </Label>
            <p className="text-muted-foreground text-xs">
              Members must attend at least this many minutes via Zoom to be automatically marked
              present. Set to 0 to mark present on any join.
            </p>
            <div className="flex items-center gap-3">
              <Input
                id="min-duration"
                type="number"
                min={0}
                max={480}
                value={minDuration}
                onChange={(e) => {
                  setMinDuration(Number(e.target.value));
                  setDirty(true);
                }}
                className="w-28"
              />
              <span className="text-muted-foreground text-sm">minutes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!dirty || updateSettings.isPending}>
          {updateSettings.isPending && (
            <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
