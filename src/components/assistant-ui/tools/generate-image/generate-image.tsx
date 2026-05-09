"use client";

import type { Toolkit } from "@assistant-ui/react";
import { DownloadIcon } from "lucide-react";
import { useSignedBucketUrl } from "@/supabase/hooks/use-signed-url";
import { cn } from "@/lib/utils";
import { ImageGenerationAnimation } from "./image-generation-animation";

type GenerateImageResult = {
  prompt: string;
  publicUrl: string;
  error?: string;
};

function GeneratedImageCard({ prompt, publicUrl }: GenerateImageResult) {
  const signedUrl = useSignedBucketUrl(publicUrl);

  return (
    <div className="flex flex-col gap-2.5 w-72">
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-muted border border-border/40">
        {signedUrl ? (
          <>
            <img
              src={signedUrl}
              alt={prompt}
              className="w-full h-full object-cover"
            />
            <button
              onClick={async () => {
                const res = await fetch(signedUrl);
                const blob = await res.blob();
                const objectUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = objectUrl;
                a.download = "generated-image.png";
                a.click();
                URL.revokeObjectURL(objectUrl);
              }}
              className={cn(
                "absolute bottom-2 right-2 rounded-lg p-1.5",
                "bg-black/40 text-white backdrop-blur-sm",
                "hover:bg-black/60 transition-colors",
              )}
              title="Download image"
            >
              <DownloadIcon className="size-4" />
            </button>
          </>
        ) : (
          <div className="w-full h-full animate-pulse bg-muted" />
        )}
      </div>
      {prompt && (
        <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-2 px-0.5">
          {prompt}
        </p>
      )}
    </div>
  );
}

export const generateImageTool: Toolkit["generate_image"] = {
  type: "backend",
  render: ({ result }) => {
    if (!result) {
      return <ImageGenerationAnimation />;
    }
    const r = result as GenerateImageResult;
    if (r.error) {
      return <p className="text-sm text-destructive">{r.error}</p>;
    }
    return <GeneratedImageCard {...r} />;
  },
};
