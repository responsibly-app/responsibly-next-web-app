"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { QrCode, RefreshCw, Clock, Download } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetEventQRCode, useGenerateQRCode } from "@/lib/auth/hooks";

interface Props {
  eventId: string;
  organizationId: string;
}

export function EventQRCode({ eventId, organizationId }: Props) {
  const { data: qrData, isPending } = useGetEventQRCode(eventId);
  const generateQR = useGenerateQRCode();
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);

  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL ?? "";

  useEffect(() => {
    if (!qrData?.code) {
      setQrImageUrl(null);
      return;
    }
    const checkInUrl = `${baseUrl}/check-in?code=${qrData.code}`;
    QRCode.toDataURL(checkInUrl, { width: 256, margin: 2 })
      .then(setQrImageUrl)
      .catch(() => setQrImageUrl(null));
  }, [qrData?.code, baseUrl]);

  function handleGenerate() {
    generateQR.mutate(
      { eventId, organizationId, expiresInHours: 24 },
      {
        onSuccess: () => toast.success("QR code generated"),
        onError: (err: { message?: string }) =>
          toast.error(err?.message ?? "Failed to generate QR code"),
      },
    );
  }

  function handleDownload() {
    if (!qrImageUrl) return;
    const a = document.createElement("a");
    a.href = qrImageUrl;
    a.download = `event-qr-${eventId}.png`;
    a.click();
  }

  const isExpired = qrData?.expiresAt && new Date(qrData.expiresAt) < new Date();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="size-4" />
              Event QR Code
            </CardTitle>
            <CardDescription className="mt-1 text-xs">
              Members scan this to check in in-person
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerate}
            disabled={generateQR.isPending}
          >
            {generateQR.isPending ? (
              <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />
            ) : (
              <RefreshCw className="mr-1.5 size-3.5" />
            )}
            {qrData ? "Regenerate" : "Generate"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isPending ? (
          <Skeleton className="h-48 w-48 rounded-lg" />
        ) : !qrData || isExpired ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-8 text-center">
            <QrCode className="text-muted-foreground size-10" />
            <p className="text-muted-foreground text-sm">
              {isExpired ? "QR code has expired." : "No QR code generated yet."}
            </p>
            <Button size="sm" variant="outline" onClick={handleGenerate} disabled={generateQR.isPending}>
              Generate QR Code
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {qrImageUrl ? (
              <img
                src={qrImageUrl}
                alt="Event check-in QR code"
                className="rounded-lg border"
                width={200}
                height={200}
              />
            ) : (
              <Skeleton className="h-48 w-48 rounded-lg" />
            )}

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              {qrData.expiresAt ? (
                <span>Expires {format(new Date(qrData.expiresAt), "MMM d, yyyy 'at' h:mm a")}</span>
              ) : (
                <span>No expiry set</span>
              )}
            </div>

            <Button size="sm" variant="outline" onClick={handleDownload} disabled={!qrImageUrl}>
              <Download className="mr-1.5 size-3.5" />
              Download PNG
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
