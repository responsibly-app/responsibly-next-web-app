"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { orpcTQUtils, orpc } from "@/lib/orpc/orpc-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Link2Off, Send } from "lucide-react";
import { toast } from "sonner";
import telegramIcon from "@/images/icons/telegram.svg";
import { IntegrationCard } from "./integration-card";

const ACCENT = "#229ED9";

export function TelegramCard() {
  const queryClient = useQueryClient();
  const [isPendingLink, setIsPendingLink] = useState(false);

  const { data: statusData, isLoading } = useQuery({
    ...orpcTQUtils.integrations.telegram.status.queryOptions(),
    refetchInterval: isPendingLink ? 3000 : false,
  });
  const isConnected = statusData?.connected ?? false;

  useEffect(() => {
    if (isConnected && isPendingLink) {
      setIsPendingLink(false);
      const account = statusData?.telegramUsername
        ? `@${statusData.telegramUsername}`
        : statusData?.telegramFirstName;
      toast.success("Telegram connected successfully!", {
        description: account ? `Connected as ${account}` : undefined,
      });
    }
  }, [isConnected, isPendingLink, statusData]);

  const initiateMutation = useMutation({
    mutationFn: () => orpc.integrations.telegram.initiate(undefined),
    onSuccess: ({ url }) => {
      setIsPendingLink(true);
      window.open(url, "_blank");
    },
    onError: () => {
      toast.error("Failed to start Telegram connection. Please try again.");
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: () => orpc.integrations.telegram.unlink(undefined),
    onSuccess: () => {
      setIsPendingLink(false);
      queryClient.invalidateQueries({ queryKey: orpcTQUtils.integrations.telegram.status.key() });
      toast.success("Telegram disconnected.");
    },
    onError: () => {
      toast.error("Failed to disconnect Telegram.");
    },
  });

  return (
    <IntegrationCard
      icon={telegramIcon}
      name="Telegram"
      description="Notifications & messaging"
      accentColor={ACCENT}
      isLoading={isLoading}
      isConnected={isConnected}
      detailsHref="/dashboard/integrations/telegram"
      connectButton={
        <Button
          size="sm"
          className="gap-2"
          onClick={() => initiateMutation.mutate()}
          disabled={initiateMutation.isPending || isPendingLink}
        >
          {isPendingLink ? (
            <>
              <ExternalLink className="h-4 w-4" />
              Open Telegram again
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {initiateMutation.isPending ? "Connecting…" : "Connect Telegram"}
            </>
          )}
        </Button>
      }
      disconnectButton={
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-destructive hover:text-destructive"
          onClick={() => unlinkMutation.mutate()}
          disabled={unlinkMutation.isPending}
        >
          <Link2Off className="h-4 w-4" />
          {unlinkMutation.isPending ? "Disconnecting…" : "Disconnect"}
        </Button>
      }
    />
  );
}
