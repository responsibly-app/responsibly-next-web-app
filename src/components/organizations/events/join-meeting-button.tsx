"use client";

import { Video, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  zoomJoinUrl: string | null | undefined;
  /** Compact variant for list views */
  compact?: boolean;
}

/**
 * Join Meeting Button
 *
 * Opens the Zoom meeting join URL. The meeting has registration enabled
 * (auto-approved), so Zoom will prompt the participant to register with
 * their email before joining. This email is used by the webhook for
 * identity matching against the web app account.
 */
export function JoinMeetingButton({ zoomJoinUrl, compact }: Props) {
  if (!zoomJoinUrl) return null;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    window.open(zoomJoinUrl!, "_blank", "noopener,noreferrer");
  }

  if (compact) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 gap-1.5"
        onClick={handleClick}
      >
        <Video className="size-3.5" />
        Join
        <ExternalLink className="size-3" />
      </Button>
    );
  }

  return (
    <Button size="sm" className="gap-1.5" onClick={handleClick}>
      <Video className="mr-1.5 size-3.5" />
      Join Meeting
      <ExternalLink className="size-3" />
    </Button>
  );
}
