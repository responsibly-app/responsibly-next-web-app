import type { ReactNode } from "react";
import type { StaticImageData } from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IntegrationStatusBadge } from "./integration-status-badge";

interface IntegrationCardProps {
  icon: StaticImageData;
  name: string;
  description: string;
  accentColor: string;
  isLoading: boolean;
  isConnected: boolean;
  connectButton: ReactNode;
  disconnectButton: ReactNode;
  detailsHref: string;
}

export function IntegrationCard({
  icon,
  name,
  description,
  accentColor,
  isLoading,
  isConnected,
  connectButton,
  disconnectButton,
  detailsHref,
}: IntegrationCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="relative h-14 w-14 shrink-0 rounded-xl p-2.5"
              style={{ backgroundColor: `${accentColor}1A` }}
            >
              <Image src={icon} alt={name} fill className="object-contain" />
            </div>
            <div>
              <CardTitle className="text-base">{name}</CardTitle>
              <CardDescription className="text-xs">{description}</CardDescription>
            </div>
          </div>

          <IntegrationStatusBadge isLoading={isLoading} isConnected={isConnected} />
        </div>
      </CardHeader>

      <CardFooter className="flex items-center justify-between">
        {isLoading ? (
          <Skeleton className="h-9 w-32 rounded-md" />
        ) : isConnected ? (
          disconnectButton
        ) : (
          connectButton
        )}

        {isConnected && (
          <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
            <Link href={detailsHref}>
              Details <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
