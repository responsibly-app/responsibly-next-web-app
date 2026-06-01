"use client";

import { type PropsWithChildren, useEffect, useState, type FC } from "react";
import { XIcon, PlusIcon, FileText, File, ImageIcon } from "lucide-react";
import {
  AttachmentPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  useAuiState,
  useAui,
} from "@assistant-ui/react";
import { useShallow } from "zustand/shallow";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { cn } from "@/lib/utils";
import { useSignedBucketUrl } from "@/supabase/hooks/use-signed-url";

const useFileSrc = (file: File | undefined) => {
  const [src, setSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!file) {
      setSrc(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSrc(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return src;
};

const useAttachmentData = () => {
  const { file, storedSrc, type } = useAuiState(
    useShallow((s) => {
      const type = s.attachment.type;
      const file = s.attachment.file;
      if (file) return { type, file };
      const storedSrc =
        type === "image"
          ? (s.attachment.content?.find((c) => c.type === "image")?.image as string | undefined)
          : (s.attachment.content?.find((c) => c.type === "file")?.data as string | undefined);
      return { type, storedSrc };
    }),
  );

  const isImage = type === "image";
  const fileSrc = useFileSrc(file);
  const signedSrc = useSignedBucketUrl(storedSrc);

  return { src: fileSrc ?? signedSrc, isImage, type };
};

type AttachmentPreviewProps = {
  src: string;
};

const AttachmentPreview: FC<AttachmentPreviewProps> = ({ src }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <img
      src={src}
      alt="Attachment preview"
      className={cn(
        "block h-auto max-h-[80vh] w-auto max-w-full object-contain",
        isLoaded
          ? "aui-attachment-preview-image-loaded"
          : "aui-attachment-preview-image-loading invisible",
      )}
      onLoad={() => setIsLoaded(true)}
    />
  );
};

type AttachmentInteractionProps = PropsWithChildren<{ isImage: boolean; src?: string }>;

const AttachmentInteraction: FC<AttachmentInteractionProps> = ({ isImage, src, children }) => {
  if (!src) return <>{children}</>;

  if (isImage) {
    return (
      <Dialog>
        <DialogTrigger
          className="aui-attachment-preview-trigger cursor-pointer transition-colors hover:bg-accent/50"
          asChild
        >
          {children}
        </DialogTrigger>
        <DialogContent className="aui-attachment-preview-dialog-content p-2 sm:max-w-3xl [&>button]:rounded-full [&>button]:bg-foreground/60 [&>button]:p-1 [&>button]:opacity-100 [&>button]:ring-0! [&_svg]:text-background [&>button]:hover:[&_svg]:text-destructive">
          <DialogTitle className="aui-sr-only sr-only">Image Attachment Preview</DialogTitle>
          <div className="aui-attachment-preview relative mx-auto flex max-h-[80dvh] w-full items-center justify-center overflow-hidden bg-background rounded-2xl">
            <AttachmentPreview src={src} />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className="contents">
      {children}
    </a>
  );
};

const attachmentFallbackIcon = {
  image: ImageIcon,
  document: FileText,
  file: FileText,
} as const;

type AttachmentThumbProps = { src?: string; type: string };

const AttachmentThumb: FC<AttachmentThumbProps> = ({ src, type }) => {
  const FallbackIcon = attachmentFallbackIcon[type as keyof typeof attachmentFallbackIcon] ?? FileText;
  return (
    <Avatar className="aui-attachment-tile-avatar h-full w-full rounded-none">
      <AvatarImage
        src={src}
        alt="Attachment preview"
        className="aui-attachment-tile-image object-cover"
      />
      <AvatarFallback>
        <FallbackIcon className="aui-attachment-tile-fallback-icon size-8 text-muted-foreground" />
      </AvatarFallback>
    </Avatar>
  );
};

const AttachmentUI: FC = () => {
  const aui = useAui();
  const isComposer = aui.attachment.source !== "message";
  const { src, isImage, type } = useAttachmentData();

  const typeLabel = (() => {
    switch (type) {
      case "image": return "Image";
      case "document": return "Document";
      case "file": return "File";
      default: return type;
    }
  })();

  return (
    <Tooltip>
      <AttachmentPrimitive.Root
        className={cn(
          "aui-attachment-root relative",
          isImage && "aui-attachment-root-composer only:*:first:size-24",
        )}
      >
        <AttachmentInteraction isImage={isImage} src={src}>
          <TooltipTrigger asChild>
            <div
              className="aui-attachment-tile size-14 cursor-pointer overflow-hidden rounded-[calc(var(--composer-radius)-var(--composer-padding))] border bg-muted transition-opacity hover:opacity-75"
              role="button"
              tabIndex={0}
              aria-label={`${typeLabel} attachment`}
            >
              <AttachmentThumb src={isImage ? src : undefined} type={type} />
            </div>
          </TooltipTrigger>
        </AttachmentInteraction>
        {isComposer && <AttachmentRemove />}
      </AttachmentPrimitive.Root>
      <TooltipContent side="top">
        <AttachmentPrimitive.Name />
      </TooltipContent>
    </Tooltip>
  );
};

const AttachmentRemove: FC = () => {
  return (
    <AttachmentPrimitive.Remove asChild>
      <TooltipIconButton
        tooltip="Remove file"
        className="aui-attachment-tile-remove absolute inset-e-1.5 top-1.5 size-3.5 rounded-full bg-white text-muted-foreground opacity-100 shadow-sm hover:bg-white! [&_svg]:text-black hover:[&_svg]:text-destructive"
        side="top"
      >
        <XIcon className="aui-attachment-remove-icon size-3 dark:stroke-[2.5px]" />
      </TooltipIconButton>
    </AttachmentPrimitive.Remove>
  );
};

export const UserMessageAttachments: FC = () => {
  return (
    <div className="aui-user-message-attachments-end col-span-full col-start-1 row-start-1 flex w-full flex-row justify-end gap-2">
      <MessagePrimitive.Attachments>
        {() => <AttachmentUI />}
      </MessagePrimitive.Attachments>
    </div>
  );
};

export const ComposerAttachments: FC = () => {
  return (
    <div className="aui-composer-attachments flex w-full flex-row items-center gap-2 overflow-x-auto empty:hidden">
      <ComposerPrimitive.Attachments>
        {() => <AttachmentUI />}
      </ComposerPrimitive.Attachments>
    </div>
  );
};

export const ComposerAddAttachment: FC = () => {
  return (
    <ComposerPrimitive.AddAttachment asChild>
      <TooltipIconButton
        tooltip="Add Attachment"
        side="bottom"
        variant="ghost"
        size="icon"
        className="aui-composer-add-attachment size-8 rounded-full p-1 font-semibold text-xs hover:bg-muted-foreground/15 dark:border-muted-foreground/15 dark:hover:bg-muted-foreground/30"
        aria-label="Add Attachment"
      >
        <PlusIcon className="aui-attachment-add-icon size-5 stroke-[1.5px]" />
      </TooltipIconButton>
    </ComposerPrimitive.AddAttachment>
  );
};
