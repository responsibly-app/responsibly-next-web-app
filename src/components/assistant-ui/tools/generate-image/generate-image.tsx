"use client";

import type { Toolkit } from "@assistant-ui/react";
import { ChevronRightIcon, DownloadIcon } from "lucide-react";
import { useSignedBucketUrl } from "@/supabase/hooks/use-signed-url";
import { cn } from "@/lib/utils";
import { ImageGenerationAnimation } from "./image-generation-animation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type GenerateImageResult = {
  prompt: string;
  name?: string | null;
  publicUrl: string;
  error?: string;
};

function GeneratedImageCard({ prompt, name, publicUrl }: GenerateImageResult) {
  const signedUrl = useSignedBucketUrl(publicUrl);

  const downloadFilename = name ? `${name}.png` : "generated-image.png";

  return (
    <div className="flex flex-col gap-2.5 w-full">
      <div className="relative w-72 aspect-square rounded-xl overflow-hidden bg-muted border border-border/40">
        {signedUrl ? (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <img
                  src={signedUrl}
                  alt={prompt}
                  className="w-full h-full object-cover cursor-pointer"
                />
              </DialogTrigger>
              <DialogContent className="p-2 sm:max-w-3xl [&>button]:rounded-full [&>button]:bg-foreground/60 [&>button]:p-1 [&>button]:opacity-100 [&>button]:ring-0! [&_svg]:text-background [&>button]:hover:[&_svg]:text-destructive">
                <DialogTitle className="sr-only">Image Preview</DialogTitle>
                <div className="relative mx-auto flex max-h-[80dvh] w-full items-center justify-center overflow-hidden bg-background rounded-2xl">
                  <img
                    src={signedUrl}
                    alt={prompt}
                    className="block h-auto max-h-[80vh] w-auto max-w-full object-contain"
                  />
                </div>
              </DialogContent>
            </Dialog>
            <button
              onClick={async () => {
                const res = await fetch(signedUrl);
                const blob = await res.blob();
                const objectUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = objectUrl;
                a.download = downloadFilename;
                a.click();
                URL.revokeObjectURL(objectUrl);
              }}
              className={cn(
                "absolute bottom-2 right-2 rounded-lg p-1.5 cursor-pointer",
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
        <Collapsible>
          <CollapsibleTrigger className="group flex items-center gap-1 text-xs text-muted-foreground/60 px-0.5 hover:text-muted-foreground transition-colors">
            <ChevronRightIcon className="size-3 transition-transform group-data-[state=open]:rotate-90" />
            Prompt
          </CollapsibleTrigger>
          <CollapsibleContent className="text-xs text-muted-foreground/80 leading-relaxed px-0.5 pt-1">
            {prompt}
          </CollapsibleContent>
        </Collapsible>
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
