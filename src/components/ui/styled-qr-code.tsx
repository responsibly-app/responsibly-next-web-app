"use client";

import { cn } from "@/lib/utils";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

export interface StyledQRCodeHandle {
  download: (filename: string) => Promise<void>;
}

interface StyledQRCodeProps {
  data: string;
  size?: number;
  className?: string;
}

export const StyledQRCode = forwardRef<StyledQRCodeHandle, StyledQRCodeProps>(
  ({ data, size = 300, className }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const qrRef = useRef<QRCodeStyling | null>(null);

    useEffect(() => {
      const qr = new QRCodeStyling({
        width: size,
        height: size,
        type: "svg",
        data,
        margin: 5,
        image: "/logo.png",
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 6,
          imageSize: 0.3,
        },
        dotsOptions: {
          type: "extra-rounded",
          color: "#09090b",
        },
        cornersSquareOptions: {
          type: "extra-rounded",
          color: "#09090b",
        },
        cornersDotOptions: {
          type: "dot",
          color: "#09090b",
        },
        backgroundOptions: {
          color: "#ffffff",
        },
        qrOptions: {
          errorCorrectionLevel: "M",
        },
      });
      qrRef.current = qr;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        qr.append(containerRef.current);
      }
    }, [data, size]);

    useImperativeHandle(ref, () => ({
      async download(filename: string) {
        await qrRef.current?.download({ name: filename, extension: "png" });
      },
    }));

    return (
      <div
        ref={containerRef}
        style={{ width: size, height: size }}
        className={cn("overflow-hidden rounded-xl shadow-sm", className)}
      />
    );
  },
);

StyledQRCode.displayName = "StyledQRCode";
