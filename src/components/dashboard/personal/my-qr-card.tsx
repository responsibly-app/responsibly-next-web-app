"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrCode, ChevronDown, ChevronUp, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useListMyOrganizations } from "@/lib/auth/hooks";
import { type OrgWithRole } from "@/lib/orpc/apis/organization/organization-schemas";
import { cn } from "@/lib/utils";

function OrgQR({ memberId, orgName }: { memberId: string; orgName: string }) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(`member:${memberId}`, { width: 200, margin: 2 })
      .then(setQrUrl)
      .catch(() => setQrUrl(null));
  }, [memberId]);

  function handleDownload() {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `my-qr-${orgName.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {qrUrl ? (
        <img src={qrUrl} alt={`QR for ${orgName}`} className="rounded-lg border" width={160} height={160} />
      ) : (
        <Skeleton className="size-40 rounded-lg" />
      )}
      <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={handleDownload} disabled={!qrUrl}>
        <Download className="size-3" />
        Download
      </Button>
    </div>
  );
}

export function MyQRCard() {
  const { data: orgs = [], isPending } = useListMyOrganizations();
  const [expanded, setExpanded] = useState(false);

  // Only show when there's at least one org
  if (!isPending && orgs.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="size-4" />
              My Check-in QR
            </CardTitle>
            <CardDescription className="mt-1 text-xs">
              Show this to an admin to mark you present at in-person events.
            </CardDescription>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            {expanded ? "Hide" : "Show"}
          </button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent>
          {isPending ? (
            <div className="flex gap-6">
              <Skeleton className="size-40 rounded-lg" />
            </div>
          ) : (
            <div className={cn("flex flex-wrap gap-6", orgs.length === 1 && "justify-center")}>
              {(orgs as OrgWithRole[]).map((org) => (
                <div key={org.id} className="flex flex-col items-center gap-2">
                  {orgs.length > 1 && (
                    <p className="text-xs font-medium text-muted-foreground">{org.name}</p>
                  )}
                  <OrgQR memberId={org.memberId} orgName={org.name} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
