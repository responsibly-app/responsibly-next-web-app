import type { ReactNode } from "react";
import type { StaticImageData } from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IntegrationStatusBadge } from "./integration-status-badge";

interface IntegrationDetailLayoutProps {
  icon: StaticImageData;
  name: string;
  description: string;
  accentColor: string;
  isLoading: boolean;
  isConnected: boolean;
  children: ReactNode;
}

export function IntegrationDetailLayout({
  icon,
  name,
  description,
  accentColor,
  isLoading,
  isConnected,
  children,
}: IntegrationDetailLayoutProps) {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <Button variant="ghost" size="sm" className="gap-1.5" asChild>
        <Link href="/dashboard/integrations">
          <ChevronLeft className="h-4 w-4" />
          Integrations
        </Link>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div
            className="relative h-12 w-12 shrink-0 rounded-xl p-2"
            style={{ backgroundColor: `${accentColor}1A` }}
          >
            <Image src={icon} alt={name} fill className="object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{name}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </div>

        <IntegrationStatusBadge isLoading={isLoading} isConnected={isConnected} />
      </div>

      <Separator />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-22 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : children}
    </div>
  );
}
