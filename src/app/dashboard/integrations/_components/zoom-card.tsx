"use client";

import { Button } from "@/components/ui/button";
import { orpcTQUtils } from "@/lib/orpc/orpc-client";
import { useLinkSocial, useUnlinkSocial } from "@/lib/auth/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, Link2Off } from "lucide-react";
import { toast } from "sonner";
import zoomIcon from "@/images/icons/zoom.svg";
import { IntegrationCard } from "./integration-card";

const ACCENT = "#2D8CFF";

export function ZoomCard() {
  const { data: statusData, isLoading } = useQuery(orpcTQUtils.integrations.zoom.status.queryOptions());
  const isConnected = statusData?.connected ?? false;

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
    <IntegrationCard
      icon={zoomIcon}
      name="Zoom"
      description="Video meetings & webinars"
      accentColor={ACCENT}
      isLoading={isLoading}
      isConnected={isConnected}
      detailsHref="/dashboard/integrations/zoom"
      connectButton={
        <Button size="sm" className="gap-2" onClick={handleConnect} disabled={linkZoom.isPending}>
          <Link2 className="h-4 w-4" />
          {linkZoom.isPending ? "Connecting…" : "Connect Zoom"}
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
