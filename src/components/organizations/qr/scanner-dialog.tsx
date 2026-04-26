"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useScanMemberQR } from "@/lib/auth/hooks";
import { proxiedAvatarUrl } from "@/lib/utils/image";

type Member = {
  id: string;
  userId: string;
  user: { name: string; image?: string | null };
};

type PendingMember = Member;

type ScanResult =
  | { type: "success"; name: string }
  | { type: "already"; name: string; scannedAt?: Date | null }
  | { type: "error"; message: string }
  | null;

interface Props {
  open: boolean;
  onClose: () => void;
  eventId: string;
  organizationId: string;
  members: Member[];
  rsvpedMemberIds?: Set<string>;
}

export function ScannerDialog({ open, onClose, eventId, organizationId, members, rsvpedMemberIds }: Props) {
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
  const [pendingMember, setPendingMember] = useState<PendingMember | null>(null);
  const pendingMemberRef = useRef<PendingMember | null>(null);

  const scanMemberQR = useScanMemberQR();
  const scanMemberQRRef = useRef(scanMemberQR);
  useEffect(() => { scanMemberQRRef.current = scanMemberQR; }, [scanMemberQR]);

  // Camera setup — runs only when the dialog opens/closes
  useEffect(() => {
    if (!open) return;

    setCameraError(null);
    setReady(false);
    setScanResult(null);
    setPendingMember(null);
    pendingMemberRef.current = null;
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
          // Pause scanning while awaiting admin confirmation
          if (pendingMemberRef.current) {
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
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

              // Already scanned this session — show already result directly
              if (scannedMemberIdsRef.current.has(found.id)) {
                setScanResult({ type: "already", name: found.user.name });
                setTimeout(() => {
                  lastScannedRef.current = null;
                  setScanResult(null);
                }, 2500);
                return;
              }

              // Pause and ask admin to confirm identity
              pendingMemberRef.current = found;
              setPendingMember(found);
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

  function handleConfirm() {
    const found = pendingMemberRef.current;
    if (!found) return;
    pendingMemberRef.current = null;
    setPendingMember(null);

    setScanResult({ type: "success", name: found.user.name });
    scanMemberQRRef.current.mutate(
      {
        eventId: eventIdRef.current,
        memberId: found.id,
        organizationId: organizationIdRef.current,
      },
      {
        onSuccess: (data) => {
          scannedMemberIdsRef.current.add(found.id);
          if (data.alreadyScanned) {
            setScanResult({ type: "already", name: found.user.name, scannedAt: data.previousScanTime ?? undefined });
            toast.info(`${found.user.name} was already checked in via QR.`);
          } else {
            toast.success(`${found.user.name} marked present via QR.`);
          }
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
  }

  function handleCancelConfirm() {
    pendingMemberRef.current = null;
    setPendingMember(null);
    lastScannedRef.current = null;
  }

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
                          ? (
                            <>
                              {scanResult.name} — already checked in
                              {scanResult.scannedAt && (
                                <span className="mt-0.5 block text-xs font-normal opacity-80">
                                  {new Date(scanResult.scannedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  {" · "}
                                  {new Date(scanResult.scannedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                                </span>
                              )}
                            </>
                          )
                          : `${scanResult.name} — marked present`}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Identity confirmation overlay */}
                <AnimatePresence>
                  {pendingMember && (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-4"
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.05 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <Avatar className="size-30 ring-2 ring-white/30">
                          <AvatarImage src={proxiedAvatarUrl(pendingMember.user.image)} />
                          <AvatarFallback className="text-xl font-semibold">
                            {pendingMember.user.name
                              .split(" ")
                              .map((w) => w[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-center text-sm font-semibold leading-tight text-white drop-shadow">
                          {pendingMember.user.name}
                        </p>
                        {rsvpedMemberIds && !rsvpedMemberIds.has(pendingMember.id) && (
                          <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
                            Has not RSVPed
                          </span>
                        )}
                        <p className="text-xs text-white/60">Confirm identity?</p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.12, duration: 0.18 }}
                        className="flex gap-2"
                      >
                        <Button
                          size="default"
                          variant="outline"
                          className="border-white/30 bg-white/10 px-3 text-default text-white hover:bg-white/20"
                          onClick={handleCancelConfirm}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="default"
                          className="bg-emerald-500 px-3 text-default text-white hover:bg-emerald-600"
                          onClick={handleConfirm}
                        >
                          Confirm Presence
                        </Button>
                      </motion.div>
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
