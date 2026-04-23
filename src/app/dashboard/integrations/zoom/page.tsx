"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpcTQUtils } from "@/lib/orpc/orpc-client";
import { useLinkSocial, useUnlinkSocial } from "@/lib/auth/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, ExternalLink, Link2, Link2Off, Users } from "lucide-react";
import { toast } from "sonner";
import zoomIcon from "@/images/icons/zoom.svg";
import { IntegrationDetailLayout } from "../_components/integration-detail-layout";
import { IntegrationNotConnected } from "../_components/integration-not-connected";
import { ConnectedAccountCard } from "../_components/connected-account-card";
import { formatInTz } from "@/lib/utils/timezone";

const ACCENT = "#2D8CFF";

export default function ZoomIntegrationPage() {
  const { data: statusData, isLoading: statusLoading } = useQuery(
    orpcTQUtils.integrations.zoom.status.queryOptions()
  );
  const isConnected = statusData?.connected ?? false;

  const { data: profileData, isLoading: profileLoading } = useQuery(
    orpcTQUtils.integrations.zoom.profile.queryOptions({ enabled: isConnected })
  );

  const { data: meetingsData, isLoading: meetingsLoading } = useQuery(
    orpcTQUtils.integrations.zoom.meetings.list.queryOptions({ input: { type: "upcoming" }, enabled: isConnected })
  );

  const queryClient = useQueryClient();
  const linkZoom = useLinkSocial({ provider: "zoom" });
  const unlinkSocial = useUnlinkSocial();

  function handleConnect() {
    linkZoom.mutate(undefined, {
      onError: () => toast.error("Failed to connect Zoom. Please try again."),
    });
  }

  function handleDisconnect() {
    unlinkSocial.mutate("zoom", {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpcTQUtils.integrations.zoom.status.key() });
        queryClient.removeQueries({ queryKey: orpcTQUtils.integrations.zoom.meetings.key() });
        toast.success("Zoom disconnected.");
      },
    });
  }

  return (
    <IntegrationDetailLayout
      icon={zoomIcon}
      name="Zoom"
      description="Video meetings & webinars"
      accentColor={ACCENT}
      isLoading={statusLoading}
      isConnected={isConnected}
    >
      {!isConnected ? (
        <IntegrationNotConnected
          icon={zoomIcon}
          name="Zoom"
          accentColor={ACCENT}
          prompt="Link Zoom to view and manage your upcoming meetings."
          connectButton={
            <Button className="gap-2" onClick={handleConnect} disabled={linkZoom.isPending}>
              <Link2 className="h-4 w-4" />
              {linkZoom.isPending ? "Connecting…" : "Connect Zoom"}
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <ConnectedAccountCard
            avatarUrl={profileData?.pic_url}
            avatarFallbackChar={profileData?.first_name?.[0] ?? "Z"}
            accentColor={ACCENT}
            primaryText={profileData ? `${profileData.first_name} ${profileData.last_name}` : ""}
            secondaryText={profileData?.email}
            isLoading={profileLoading}
            disconnectButton={
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive"
                onClick={handleDisconnect}
                disabled={unlinkSocial.isPending}
              >
                <Link2Off className="h-4 w-4" />
                {unlinkSocial.isPending ? "Disconnecting…" : "Disconnect"}
              </Button>
            }
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Upcoming meetings</CardTitle>
              <CardDescription className="text-xs">Your next scheduled Zoom meetings</CardDescription>
            </CardHeader>
            <CardContent>
              {meetingsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : meetingsData?.meetings?.length ? (
                <ul className="space-y-2">
                  {meetingsData.meetings.map((meeting) => (
                    <li
                      key={meeting.id}
                      className="bg-muted/40 flex items-start justify-between rounded-lg p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{meeting.topic}</p>
                        <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                          {meeting.start_time && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatInTz(meeting.start_time, meeting.timezone, { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          )}
                          {meeting.start_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatInTz(meeting.start_time, meeting.timezone, { hour: "numeric", minute: "2-digit", hour12: true })}
                              {meeting.timezone && (
                                <span className="text-muted-foreground/70">{meeting.timezone}</span>
                              )}
                            </span>
                          )}
                          {meeting.duration! > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {meeting.duration} min
                            </span>
                          )}
                        </div>
                      </div>
                      {meeting.join_url && (
                        <a
                          href={meeting.join_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground ml-3 shrink-0 transition-colors"
                          aria-label="Join meeting"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  No upcoming meetings
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </IntegrationDetailLayout>
  );
}
