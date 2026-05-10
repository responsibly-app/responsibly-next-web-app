"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MESSAGES = [
  "Sketching it out…",
  "Painting details…",
  "Adding textures…",
  "Refining colors…",
  "Almost there…",
];

const FOCUS_PATH = [
  { x: 0.28, y: 0.28 },
  { x: 0.68, y: 0.22 },
  { x: 0.78, y: 0.58 },
  { x: 0.52, y: 0.78 },
  { x: 0.22, y: 0.62 },
  { x: 0.42, y: 0.38 },
];

const SEGMENT_MS = 1800;
const DOT_SPACING = 16;
const FOCUS_RADIUS = 72;

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function resolveRGB(el: HTMLElement): [number, number, number] {
  const color = getComputedStyle(el).backgroundColor;
  const offscreen = document.createElement("canvas");
  offscreen.width = 1;
  offscreen.height = 1;
  const octx = offscreen.getContext("2d")!;
  octx.fillStyle = color;
  octx.fillRect(0, 0, 1, 1);
  const d = octx.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
}

export function ImageGenerationAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const primarySentinelRef = useRef<HTMLDivElement>(null);
  const [msgIndex, setMsgIndex] = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % MESSAGES.length);
        setMsgVisible(true);
      }, 200);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const primaryEl = primarySentinelRef.current;
    if (!canvas || !container || !primaryEl) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let size = container.getBoundingClientRect().width;
    let startTime: number | null = null;
    let animId: number;

    const [pr, pg, pb] = resolveRGB(primaryEl);

    function resize() {
      size = container!.getBoundingClientRect().width;
      canvas!.width = size * dpr;
      canvas!.height = size * dpr;
      ctx!.scale(dpr, dpr);
    }
    resize();

    function draw(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      const segCount = FOCUS_PATH.length;
      const totalMs = segCount * SEGMENT_MS;
      const progress = (elapsed % totalMs) / totalMs;
      const segF = progress * segCount;
      const segIdx = Math.floor(segF) % segCount;
      const t = smoothstep(segF - Math.floor(segF));

      const from = FOCUS_PATH[segIdx];
      const to = FOCUS_PATH[(segIdx + 1) % segCount];
      const fx = (from.x + (to.x - from.x) * t) * size;
      const fy = (from.y + (to.y - from.y) * t) * size;

      ctx!.clearRect(0, 0, size, size);

      const cols = Math.ceil((size - DOT_SPACING) / DOT_SPACING) + 1;
      const rows = Math.ceil((size - DOT_SPACING) / DOT_SPACING) + 1;
      const ox = (size - (cols - 1) * DOT_SPACING) / 2;
      const oy = (size - (rows - 1) * DOT_SPACING) / 2;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = ox + col * DOT_SPACING;
          const y = oy + row * DOT_SPACING;
          const dist = Math.sqrt((x - fx) ** 2 + (y - fy) ** 2);
          const glow = Math.max(0, 1 - dist / FOCUS_RADIUS);

          const opacity = 0.3 + glow * 0.9;
          const r = pr, g = pg, b = pb;
          const radius = 1.0 + glow * 3.0;

          ctx!.beginPath();
          ctx!.arc(x, y, radius, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
          ctx!.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="w-72">
      {/* Hidden sentinels to read computed theme colors for canvas */}
      <div ref={primarySentinelRef} className="bg-primary hidden" aria-hidden />

      <div
        ref={containerRef}
        className="relative w-full aspect-square rounded-2xl overflow-hidden bg-background border border-border"
      >
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />

        {/* Bottom fade for label legibility */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background/95 via-background/60 to-transparent pointer-events-none" />

        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2.5">
          {/* <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span> */}
          <span
            className={cn(
              "text-muted-foreground shimmer text-sm font-medium transition-opacity duration-200",
              msgVisible ? "opacity-100" : "opacity-0",
            )}
          >
            {MESSAGES[msgIndex]}
          </span>
        </div>
      </div>
    </div>
  );
}
