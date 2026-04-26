"use client";

import { CalendarCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useListRsvps } from "@/lib/auth/hooks";

type Props = {
  eventId: string;
};

export function EventRsvpList({ eventId }: Props) {
  const { data: rsvpList } = useListRsvps(eventId);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarCheck className="size-4 text-muted-foreground" />
          RSVPs
          {rsvpList && (
            <Badge variant="secondary" className="text-xs font-normal">
              {rsvpList.count}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!rsvpList || rsvpList.count === 0 ? (
          <p className="text-sm text-muted-foreground">No RSVPs yet.</p>
        ) : (
          <ul className="space-y-2">
            {rsvpList.rsvps.map((r) => (
              <li key={r.id} className="flex items-center gap-3">
                <Avatar size="lg">
                  {r.memberImage && <AvatarImage src={r.memberImage} alt={r.memberName ?? ""} />}
                  <AvatarFallback className="text-xs uppercase">
                    {(r.memberName ?? r.memberEmail ?? "?").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {r.memberName ?? r.memberEmail ?? "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }).format(new Date(r.rsvpedAt))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
