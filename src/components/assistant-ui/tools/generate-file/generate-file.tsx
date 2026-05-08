"use client";

import type { Toolkit } from "@assistant-ui/react";
import { DownloadIcon, LoaderCircleIcon, AlertCircleIcon } from "lucide-react";
import {
  FileRoot,
  FileIconDisplay,
  FileName,
  FileSize,
} from "@/components/assistant-ui/file";
import { useSignedBucketUrl } from "@/supabase/hooks/use-signed-url";
import { cn } from "@/lib/utils";

type GenerateFileResult = {
  filename: string;
  mimeType: string;
  publicUrl: string;
  sizeBytes: number;
  error?: string;
};

function GeneratedFileCard({
  filename,
  mimeType,
  publicUrl,
  sizeBytes,
}: GenerateFileResult) {
  const signedUrl = useSignedBucketUrl(publicUrl);

  return (
    <FileRoot>
      <FileIconDisplay mimeType={mimeType} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <FileName>{filename}</FileName>
        <FileSize bytes={sizeBytes} className="text-xs" />
      </div>
      {signedUrl === undefined ? (
        <span className="shrink-0 p-1 text-muted-foreground">
          <LoaderCircleIcon className="size-4 animate-spin" />
        </span>
      ) : signedUrl ? (
        <button
          onClick={async () => {
            const res = await fetch(signedUrl);
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = objectUrl;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(objectUrl);
          }}
          className={cn(
            "shrink-0 rounded-md p-1 text-muted-foreground transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <DownloadIcon className="size-4" />
        </button>
      ) : (
        <span
          className="shrink-0 p-1 text-destructive/60"
          title="Download link unavailable"
        >
          <AlertCircleIcon className="size-4" />
        </span>
      )}
    </FileRoot>
  );
}

export const generateFileTool: Toolkit["generate_file"] = {
  type: "backend",
  render: ({ result }) => {
    if (!result) return null;
    const r = result as GenerateFileResult;
    if (r.error) {
      return <p className="text-sm text-destructive">{r.error}</p>;
    }
    return <GeneratedFileCard {...r} />;
  },
};
