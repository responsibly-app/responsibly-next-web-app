"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpcTQUtils } from "@/lib/orpc/orpc-client";
import { useLinkGenericOAuth, useUnlinkSocial } from "@/lib/auth/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, ExternalLink, Link2, Link2Off } from "lucide-react";
import { toast } from "sonner";
import calendlyIcon from "@/images/icons/calendly.svg";
import { IntegrationDetailLayout } from "../_components/integration-detail-layout";
import { IntegrationNotConnected } from "../_components/integration-not-connected";
import { ConnectedAccountCard } from "../_components/connected-account-card";
import { formatInTz } from "@/lib/utils/timezone";

const ACCENT = "#006BFF";

export default function CalendlyIntegrationPage() {
  const { data: statusData, isLoading: statusLoading } = useQuery(
    orpcTQUtils.integrations.calendly.status.queryOptions()
  );
  const isConnected = statusData?.connected ?? false;

  const { data: profileData, isLoading: profileLoading } = useQuery(
    orpcTQUtils.integrations.calendly.profile.queryOptions({ enabled: isConnected })
  );

  const { data: eventsData, isLoading: eventsLoading } = useQuery(
    orpcTQUtils.integrations.calendly.scheduledEvents.list.queryOptions({
      input: { status: "active", sort: "start_time:asc" },
      enabled: isConnected,
    })
  );

  const queryClient = useQueryClient();
  const linkCalendly = useLinkGenericOAuth({ provider: "calendly" });
  const unlinkSocial = useUnlinkSocial();

  function handleConnect() {
    linkCalendly.mutate(undefined, {
      onError: () => toast.error("Failed to connect Calendly. Please try again."),
    });
  }

  function handleDisconnect() {
    unlinkSocial.mutate("calendly", {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpcTQUtils.integrations.calendly.status.key() });
        queryClient.removeQueries({ queryKey: orpcTQUtils.integrations.calendly.scheduledEvents.key() });
        toast.success("Calendly disconnected.");
      },
    });
  }

  return (
    <IntegrationDetailLayout
      icon={calendlyIcon}
      name="Calendly"
      description="Scheduling & calendar automation"
      accentColor={ACCENT}
      isLoading={statusLoading}
      isConnected={isConnected}
    >
      {!isConnected ? (
        <IntegrationNotConnected
          icon={calendlyIcon}
          name="Calendly"
          accentColor={ACCENT}
          prompt="Link Calendly to view your upcoming scheduled events."
          connectButton={
            <Button className="gap-2" onClick={handleConnect} disabled={linkCalendly.isPending}>
              <Link2 className="h-4 w-4" />
              {linkCalendly.isPending ? "Connecting…" : "Connect Calendly"}
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <ConnectedAccountCard
            avatarUrl={profileData?.avatar_url ?? undefined}
            avatarFallbackChar={profileData?.name?.[0] ?? "C"}
            accentColor={ACCENT}
            primaryText={profileData?.name ?? ""}
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
              <CardTitle className="text-sm font-medium">Upcoming events</CardTitle>
              <CardDescription className="text-xs">Your next scheduled Calendly events</CardDescription>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : eventsData?.collection?.length ? (
                <ul className="space-y-2">
                  {eventsData.collection.map((event) => (
                    <li
                      key={event.uri}
                      className="bg-muted/40 flex items-start justify-between rounded-lg p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{event.name}</p>
                        <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatInTz(event.start_time, undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatInTz(event.start_time, undefined, { hour: "numeric", minute: "2-digit", hour12: true })}
                          </span>
                        </div>
                      </div>
                      {event.location?.join_url && (
                        <a
                          href={event.location.join_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground ml-3 shrink-0 transition-colors"
                          aria-label="Join event"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  No upcoming events
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </IntegrationDetailLayout>
  );
}
