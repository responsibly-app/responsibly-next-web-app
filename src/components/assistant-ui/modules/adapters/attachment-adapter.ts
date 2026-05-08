"use client";

import type { AttachmentAdapter, Attachment, PendingAttachment, CompleteAttachment } from "@assistant-ui/react";
import { orpc } from "@/lib/orpc/orpc-client";
import { mimeTypeToAttachmentType } from "@/lib/utils/image";
import { toast } from "sonner";

export const CHAT_ATTACHMENT_ACCEPT = "image/jpeg,image/png,image/gif,image/webp,text/plain,text/markdown,text/csv,application/pdf";
export const CHAT_ATTACHMENT_MAX = 5;

export function isFileTypeAccepted(mimeType: string): boolean {
  return CHAT_ATTACHMENT_ACCEPT.split(",").some((accepted) => {
    const t = accepted.trim();
    return t.endsWith("/*") ? mimeType.startsWith(t.slice(0, -1)) : mimeType === t;
  });
}

export class SupabaseChatAttachmentAdapter implements AttachmentAdapter {
  accept = CHAT_ATTACHMENT_ACCEPT;

  // Storage paths for attachments that finished uploading before send
  private uploadedPaths = new Map<string, string>();
  // Fallback: files that failed to pre-upload, retried on send
  private pendingFiles = new Map<string, File>();
  // Tracks active attachment keys (name:size) to prevent duplicates
  private activeFileKeys = new Map<string, string>();

  async *add({ file }: { file: File }): AsyncGenerator<PendingAttachment, void> {
    if (this.activeFileKeys.size >= CHAT_ATTACHMENT_MAX) {
      toast.error("Attachment limit reached", {
        description: `You can attach a maximum of ${CHAT_ATTACHMENT_MAX} files per message.`,
      });
      return;
    }

    const fileKey = `${file.name}:${file.size}`;
    if ([...this.activeFileKeys.values()].includes(fileKey)) {
      toast.error("Already attached", {
        description: `"${file.name}" is already in your attachments.`,
      });
      return;
    }

    const id = crypto.randomUUID();
    this.activeFileKeys.set(id, fileKey);
    const type = mimeTypeToAttachmentType(file.type);
    const base = { id, type, name: file.name, contentType: file.type, file };

    yield { ...base, status: { type: "running", reason: "uploading", progress: 0 } };

    try {
      const { path } = await orpc.storage.uploadChatAttachment({ file });
      this.uploadedPaths.set(id, path);
    } catch {
      this.pendingFiles.set(id, file);
    }

    yield { ...base, status: { type: "requires-action", reason: "composer-send" } };
  }

  async remove(attachment: Attachment): Promise<void> {
    this.activeFileKeys.delete(attachment.id);
    this.pendingFiles.delete(attachment.id);
    const path = this.uploadedPaths.get(attachment.id);
    if (path) {
      this.uploadedPaths.delete(attachment.id);
      orpc.storage.deleteChatAttachment({ path }).catch(() => { });
    }
  }

  async send(attachment: PendingAttachment): Promise<CompleteAttachment> {
    let path = this.uploadedPaths.get(attachment.id);

    if (!path) {
      const file = this.pendingFiles.get(attachment.id);
      if (!file) throw new Error("Attachment file not found");
      const result = await orpc.storage.uploadChatAttachment({ file });
      path = result.path;
      this.pendingFiles.delete(attachment.id);
    } else {
      this.uploadedPaths.delete(attachment.id);
    }

    const content: CompleteAttachment["content"] =
      attachment.type === "image"
        ? [{ type: "image", image: path, filename: attachment.name }]
        : [{ type: "file", data: path, mimeType: attachment.contentType ?? "", filename: attachment.name }];

    return { ...attachment, status: { type: "complete" }, content };
  }
}
