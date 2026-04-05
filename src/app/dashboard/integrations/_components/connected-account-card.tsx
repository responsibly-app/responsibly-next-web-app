import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ConnectedAccountCardProps {
  avatarUrl?: string | null;
  avatarFallbackChar: string;
  accentColor: string;
  primaryText: string;
  secondaryText?: string | null;
  disconnectButton: ReactNode;
  isLoading?: boolean;
}

export function ConnectedAccountCard({
  avatarUrl,
  avatarFallbackChar,
  accentColor,
  primaryText,
  secondaryText,
  disconnectButton,
  isLoading,
}: ConnectedAccountCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Connected account</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        {isLoading ? (
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 text-lg">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={primaryText} />}
              <AvatarFallback style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}>
                {avatarFallbackChar}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{primaryText}</p>
              {secondaryText && (
                <p className="text-muted-foreground text-sm">{secondaryText}</p>
              )}
            </div>
          </div>
        )}

        {!isLoading && disconnectButton}
      </CardContent>
    </Card>
  );
}
