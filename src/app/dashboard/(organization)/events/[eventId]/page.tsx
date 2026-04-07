"use client";

import { use } from "react";
import { EventDetailPage } from "@/components/organizations/events/event-detail-page";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default function EventDetailRoute({ params }: PageProps) {
  const { eventId } = use(params);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-2 pt-5">
      <EventDetailPage eventId={eventId} />
    </div>
  );
}
