import type { ReactNode } from "react";
import type { StaticImageData } from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface IntegrationNotConnectedProps {
  icon: StaticImageData;
  name: string;
  accentColor: string;
  prompt: string;
  connectButton: ReactNode;
  pendingMessage?: string;
}

export function IntegrationNotConnected({
  icon,
  name,
  accentColor,
  prompt,
  connectButton,
  pendingMessage,
}: IntegrationNotConnectedProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <div
          className="relative h-14 w-14 rounded-xl p-2.5"
          style={{ backgroundColor: `${accentColor}1A` }}
        >
          <Image src={icon} alt={name} fill className="object-contain" />
        </div>
        <div>
          <p className="font-medium">Connect your {name} account</p>
          <p className="text-muted-foreground mt-1 text-sm">{prompt}</p>
        </div>
        {connectButton}
        {pendingMessage && (
          <p className="text-muted-foreground text-xs">{pendingMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}
