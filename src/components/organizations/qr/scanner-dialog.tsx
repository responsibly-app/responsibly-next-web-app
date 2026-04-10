"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useScanMemberQR } from "@/lib/auth/hooks";

type Member = {
  id: string;
  userId: string;
  user: { name: string };
};

type ScanResult =
  | { type: "success"; name: string }
  | { type: "already"; name: string }
  | { type: "error"; message: string }
  | null;

interface Props {
  open: boolean;
  onClose: () => void;
  eventId: string;
  organizationId: string;
  members: Member[];
}

export function ScannerDialog({ open, onClose, eventId, organizationId, members }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  // Keep latest props/state in refs so the effect closure never goes stale
  const membersRef = useRef(members);
  const eventIdRef = useRef(eventId);
  const organizationIdRef = useRef(organizationId);
  const lastScannedRef = useRef<string | null>(null);
  // Tracks memberIds already processed this session — prevents duplicate API calls
  const scannedMemberIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => { membersRef.current = members; }, [members]);
  useEffect(() => { eventIdRef.current = eventId; }, [eventId]);
  useEffect(() => { organizationIdRef.current = organizationId; }, [organizationId]);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult>(null);

  const scanMemberQR = useScanMemberQR();
  const scanMemberQRRef = useRef(scanMemberQR);
  useEffect(() => { scanMemberQRRef.current = scanMemberQR; }, [scanMemberQR]);

  // Camera setup — runs only when the dialog opens/closes
  useEffect(() => {
    if (!open) return;

    setCameraError(null);
    setReady(false);
    setScanResult(null);
    lastScannedRef.current = null;
    scannedMemberIdsRef.current = new Set();

    if (typeof window === "undefined" || !("BarcodeDetector" in window)) {
      setCameraError("QR scanning is not supported in this browser. Use Chrome or Edge.");
      return;
    }

    let active = true;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setReady(true);

        // @ts-expect-error BarcodeDetector not yet in TypeScript lib
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

        function tick() {
          if (!active || !videoRef.current) return;
          detector
            .detect(videoRef.current)
            .then((codes: { rawValue: string }[]) => {
              if (!codes.length) return;
              const raw = codes[0].rawValue;
              if (lastScannedRef.current === raw) return;
              lastScannedRef.current = raw;

              // QR format: user:{userId}
              let found: Member | undefined;
              if (raw.startsWith("user:")) {
                const scannedUserId = raw.slice(5);
                found = membersRef.current.find((m) => m.userId === scannedUserId);
              }

              if (!found) {
                setScanResult({ type: "error", message: "Not a member of this organization" });
                setTimeout(() => {
                  lastScannedRef.current = null;
                  setScanResult(null);
                }, 2500);
                return;
              }

              const memberId = found.id;

              // Already scanned this session — skip duplicate API call
              if (scannedMemberIdsRef.current.has(memberId)) {
                setScanResult({ type: "already", name: found.user.name });
                setTimeout(() => {
                  lastScannedRef.current = null;
                  setScanResult(null);
                }, 2500);
                return;
              }

              setScanResult({ type: "success", name: found.user.name });
              scanMemberQRRef.current.mutate(
                {
                  eventId: eventIdRef.current,
                  memberId,
                  organizationId: organizationIdRef.current,
                },
                {
                  onSuccess: () => {
                    scannedMemberIdsRef.current.add(memberId);
                    toast.success(`${found!.user.name} marked present via QR.`);
                    setTimeout(() => {
                      lastScannedRef.current = null;
                      setScanResult(null);
                    }, 3000);
                  },
                  onError: (err: { message?: string }) => {
                    setScanResult({ type: "error", message: err?.message ?? "Failed to mark attendance." });
                    toast.error(err?.message ?? "Failed to mark attendance.");
                    setTimeout(() => {
                      lastScannedRef.current = null;
                      setScanResult(null);
                    }, 2500);
                  },
                },
              );
            })
            .catch(() => {});
          rafRef.current = requestAnimationFrame(tick);
        }

        rafRef.current = requestAnimationFrame(tick);
      })
      .catch(() => {
        if (active) setCameraError("Could not access camera. Check browser permissions.");
      });

    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setReady(false);
    };
  }, [open]); // intentionally only [open] — all other values read via refs

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Camera className="size-4" />
            Scan Member QR
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3 py-2">
          {cameraError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
              {cameraError}
            </div>
          ) : (
            <>
              <div
                className="relative overflow-hidden rounded-lg border bg-black"
                style={{ width: 280, height: 280 }}
              >
                <video ref={videoRef} muted playsInline className="size-full object-cover" />
                {/* QR frame guide */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="size-40 rounded-lg border-2 border-white/60" />
                </div>
                {/* Scan result overlay */}
                <AnimatePresence>
                  {scanResult && (
                    <motion.div
                      key={scanResult.type}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute inset-0 flex flex-col items-center justify-center gap-4 ${
                        scanResult.type === "error" ? "bg-red-500/85" : "bg-emerald-500/85"
                      }`}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 320, damping: 22, delay: 0.05 }}
                      >
                        {scanResult.type === "error" ? (
                          <svg
                            viewBox="0 0 24 24"
                            className="size-24 text-white drop-shadow-lg"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.75}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            className="size-24 text-white drop-shadow-lg"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.75}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="8.5 12 11 14.5 15.5 9.5" />
                          </svg>
                        )}
                      </motion.div>
                      <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.18, duration: 0.2 }}
                        className="max-w-55 text-center text-sm font-semibold leading-snug text-white drop-shadow"
                      >
                        {scanResult.type === "error"
                          ? scanResult.message
                          : scanResult.type === "already"
                          ? `${scanResult.name} — already checked in`
                          : `${scanResult.name} — marked present`}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
                {!ready && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Spinner className="size-6 text-white" />
                  </div>
                )}
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Point the camera at a member&apos;s QR code to mark them present.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
