"use client";

import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";

// ─── crop image util (mirrored from image-cropper/cropImage) ──────────────────

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

function getRadianAngle(deg: number) {
  return (deg * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number) {
  const r = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(r) * width) + Math.abs(Math.sin(r) * height),
    height: Math.abs(Math.sin(r) * width) + Math.abs(Math.cos(r) * height),
  };
}

async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const rotRad = getRadianAngle(rotation);
  const { width: bW, height: bH } = rotateSize(image.width, image.height, rotation);

  canvas.width = bW;
  canvas.height = bH;

  ctx.translate(bW / 2, bH / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const cropped = document.createElement("canvas");
  cropped.width = pixelCrop.width;
  cropped.height = pixelCrop.height;
  cropped.getContext("2d")!.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    cropped.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Canvas is empty"))), "image/jpeg", 0.95);
  });
}

// ─── types ────────────────────────────────────────────────────────────────────

interface AvatarCropperDialogProps {
  src: string | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (blob: Blob) => void;
}

type Step = "crop" | "confirm";

// ─── component ────────────────────────────────────────────────────────────────

export function AvatarCropperDialog({ src, open, onClose, onConfirm }: AvatarCropperDialogProps) {
  const [step, setStep] = useState<Step>("crop");

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setReady(true), 500); // small delay fixes layout
      return () => clearTimeout(t);
    } else {
      setReady(false);
    }
  }, [open]);

  // reset state when dialog opens with a new image
  useEffect(() => {
    if (open) {
      setStep("crop");
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setCroppedAreaPixels(null);
      setPreviewUrl(null);
      setPreviewBlob(null);
    }
  }, [open, src]);

  // revoke preview URL on cleanup
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onCropComplete = useCallback((_: unknown, pixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleCrop() {
    if (!src || !croppedAreaPixels) return;
    const blob = await getCroppedBlob(src, croppedAreaPixels, rotation);
    const url = URL.createObjectURL(blob);
    setPreviewBlob(blob);
    setPreviewUrl(url);
    setStep("confirm");
  }

  function handleConfirm() {
    if (!previewBlob) return;
    onConfirm(previewBlob);
    onClose();
  }

  function handleReCrop() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewBlob(null);
    setStep("crop");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {step === "crop" ? "Crop your photo" : "Confirm photo"}
          </DialogTitle>
        </DialogHeader>

        {step === "crop" && src && (
          ready ? <div className="space-y-5">
            {/* Cropper canvas */}
            <div className="relative h-72 overflow-hidden rounded-xl">
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground mb-2 text-xs">Zoom</p>
                <Slider
                  value={[zoom]}
                  min={1}
                  max={3}
                  step={0.05}
                  onValueChange={(v) => setZoom(v[0])}
                />
              </div>

              <div>
                <p className="text-muted-foreground mb-2 text-xs">Rotation</p>
                <div className="relative">
                  <Slider
                    value={[rotation]}
                    min={-180}
                    max={180}
                    step={1}
                    onValueChange={(v) => {
                      const val = v[0];
                      setRotation(Math.abs(val) < 2 ? 0 : val);
                    }}
                  />
                  <div className="pointer-events-none absolute top-1/2 left-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs">{rotation}°</p>
                  {rotation !== 0 && (
                    <button
                      type="button"
                      onClick={() => setRotation(0)}
                      className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleCrop}>
                Crop photo
              </Button>
            </div>
          </div> : <div className="flex h-50 items-center justify-center overflow-hidden rounded-xl"><Spinner className="size-20" /></div>
        )}

        {step === "confirm" && previewUrl && (
          <div className="flex flex-col items-center gap-6 py-2">
            {/* Circular preview */}
            <div className="ring-border size-36 overflow-hidden rounded-full ring-4">
              <img
                src={previewUrl}
                alt="Cropped avatar preview"
                className="h-full w-full object-cover"
              />
            </div>

            <p className="text-muted-foreground text-center text-sm">
              This is how your avatar will look. You can re-crop or confirm to apply it.
            </p>

            <div className="flex w-full gap-2">
              <Button variant="outline" className="flex-1" onClick={handleReCrop}>
                Re-crop
              </Button>
              <Button className="flex-1" onClick={handleConfirm}>
                Use this photo
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
