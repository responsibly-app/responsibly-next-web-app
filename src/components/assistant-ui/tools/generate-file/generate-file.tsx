"use client";

import type { Toolkit } from "@assistant-ui/react";
import { DownloadIcon, LoaderCircleIcon, AlertCircleIcon, ExternalLinkIcon } from "lucide-react";
import {
  FileRoot,
  FileIconDisplay,
  FileName,
  FileSize,
} from "@/components/assistant-ui/file";
import { useSignedBucketUrl } from "@/supabase/hooks/use-signed-url";
import { cn } from "@/lib/utils";
import { FileGenerationAnimation } from "./file-generation-animation";

type GenerateFileResult = {
  filename: string;
  mimeType: string;
  publicUrl: string;
  sizeBytes: number;
  error?: string;
};

const fileActionButtonClass = cn(
  "shrink-0 rounded-md p-1 text-muted-foreground transition-colors",
  "hover:bg-accent hover:text-accent-foreground cursor-pointer",
);

type FileActionButtonsProps = {
  signedUrl: string | null | undefined;
  filename: string;
  mimeType: string;
};

function FileDownloadButton({ signedUrl, filename }: Pick<FileActionButtonsProps, "signedUrl" | "filename">) {
  return (
    <button
      onClick={async () => {
        if (!signedUrl) return;
        const res = await fetch(signedUrl);
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(objectUrl);
      }}
      className={fileActionButtonClass}
      title="Download"
    >
      <DownloadIcon className="size-4" />
    </button>
  );
}

function FileOpenButton({ signedUrl, mimeType }: Pick<FileActionButtonsProps, "signedUrl" | "mimeType">) {
  return (
    <button
      onClick={async () => {
        if (!signedUrl) return;
        const res = await fetch(signedUrl);
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(new Blob([blob], { type: mimeType }));
        window.open(objectUrl, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      }}
      className={fileActionButtonClass}
      title="Open in new tab"
    >
      <ExternalLinkIcon className="size-4" />
    </button>
  );
}

function GeneratedFileCard({
  filename,
  mimeType,
  publicUrl,
  sizeBytes,
}: GenerateFileResult) {
  const signedUrl = useSignedBucketUrl(publicUrl);

  return (
    <FileRoot variant="outline" size="semi-lg" className="max-w-100">
      <FileIconDisplay mimeType={mimeType} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <FileName title={filename}>{filename}</FileName>
        <FileSize bytes={sizeBytes} className="text-xs" />
      </div>
      {signedUrl === undefined ? (
        <span className="shrink-0 p-1 text-muted-foreground">
          <LoaderCircleIcon className="size-4 animate-spin" />
        </span>
      ) : signedUrl ? (
        <div className="flex shrink-0 items-center">
          <FileOpenButton signedUrl={signedUrl} mimeType={mimeType} />
          <FileDownloadButton signedUrl={signedUrl} filename={filename} />
        </div>
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
  render: ({ args, status, result, interrupt, resume }) => {
    if (status.type === "running") {
      return <FileGenerationAnimation />;
    }
    const r = result as GenerateFileResult;
    if (r.error) {
      return <p className="text-sm text-destructive">{r.error}</p>;
    }
    return <GeneratedFileCard {...r} />;
  },
};
