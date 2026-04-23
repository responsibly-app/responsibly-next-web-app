"use client";

import { Button } from "@/components/ui/button";
import { orpcTQUtils } from "@/lib/orpc/orpc-client";
import { useLinkGenericOAuth, useUnlinkSocial } from "@/lib/auth/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, Link2Off } from "lucide-react";
import { toast } from "sonner";
import calendlyIcon from "@/images/icons/calendly.svg";
import { IntegrationCard } from "./integration-card";

const ACCENT = "#006BFF";

export function CalendlyCard() {
  const { data: statusData, isLoading } = useQuery(orpcTQUtils.integrations.calendly.status.queryOptions());
  const isConnected = statusData?.connected ?? false;

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
    <IntegrationCard
      icon={calendlyIcon}
      name="Calendly"
      description="Scheduling & calendar automation"
      accentColor={ACCENT}
      isLoading={isLoading}
      isConnected={isConnected}
      detailsHref="/dashboard/integrations/calendly"
      connectButton={
        <Button size="sm" className="gap-2" onClick={handleConnect} disabled={linkCalendly.isPending}>
          <Link2 className="h-4 w-4" />
          {linkCalendly.isPending ? "Connecting…" : "Connect Calendly"}
        </Button>
      }
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
  );
}
