import { z } from "zod/v3";

export const UploadAvatarInputSchema = z.object({
    file: z.instanceof(Blob),
});

export const UploadAvatarOutputSchema = z.object({
    publicUrl: z.string(),
});

export const DeleteAvatarInputSchema = z.object({});

export const UploadChatAttachmentInputSchema = z.object({
    file: z.instanceof(Blob),
});

export const UploadChatAttachmentOutputSchema = z.object({
    path: z.string(),
});

export const DeleteChatAttachmentInputSchema = z.object({
    path: z.string(),
});
