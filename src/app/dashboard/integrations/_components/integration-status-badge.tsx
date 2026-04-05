import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface IntegrationStatusBadgeProps {
  isLoading: boolean;
  isConnected: boolean;
}

export function IntegrationStatusBadge({ isLoading, isConnected }: IntegrationStatusBadgeProps) {
  if (isLoading) {
    return <Skeleton className="h-5 w-20 rounded-full" />;
  }

  if (isConnected) {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Connected
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-muted-foreground">
      Not connected
    </Badge>
  );
}
