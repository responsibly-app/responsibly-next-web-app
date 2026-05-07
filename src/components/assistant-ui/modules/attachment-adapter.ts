"use client";

import type { AttachmentAdapter, Attachment, PendingAttachment, CompleteAttachment } from "@assistant-ui/react";
import { orpc } from "@/lib/orpc/orpc-client";
import { mimeTypeToAttachmentType } from "@/lib/utils/image";

export class SupabaseChatAttachmentAdapter implements AttachmentAdapter {
  accept = "image/*,text/plain,text/markdown,text/csv,application/pdf";

  private pendingFiles = new Map<string, File>();

  async *add({ file }: { file: File }): AsyncGenerator<PendingAttachment, void> {
    const id = crypto.randomUUID();
    const type = mimeTypeToAttachmentType(file.type);

    this.pendingFiles.set(id, file);

    yield {
      id,
      type,
      name: file.name,
      contentType: file.type,
      file,
      status: { type: "requires-action", reason: "composer-send" },
    };
  }

  async remove(attachment: Attachment): Promise<void> {
    this.pendingFiles.delete(attachment.id);
  }

  async send(attachment: PendingAttachment): Promise<CompleteAttachment> {
    const file = this.pendingFiles.get(attachment.id);
    if (!file) throw new Error("Attachment file not found");
    this.pendingFiles.delete(attachment.id);

    const { publicUrl } = await orpc.storage.uploadChatAttachment({ file });

    const content: CompleteAttachment["content"] =
      attachment.type === "image"
        ? [{ type: "image", image: publicUrl, filename: attachment.name }]
        : [{ type: "file", data: publicUrl, mimeType: attachment.contentType ?? "", filename: attachment.name }];

    return {
      ...attachment,
      status: { type: "complete" },
      content,
    };
  }
}
