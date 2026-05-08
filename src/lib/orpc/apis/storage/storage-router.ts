import { ORPCError } from "@orpc/server";
import { auth } from "@/lib/auth/auth";
import { authed } from "@/lib/orpc/base";
import { supabase } from "@/supabase/client";
import {
    DeleteAvatarInputSchema,
    DeleteChatAttachmentInputSchema,
    UploadAvatarInputSchema,
    UploadAvatarOutputSchema,
    UploadChatAttachmentInputSchema,
    UploadChatAttachmentOutputSchema,
} from "./storage-schemas";

export const storageRouter = {
    uploadAvatar: authed
        .route({ method: "POST", path: "/storage/avatar/upload", summary: "Upload user avatar", tags: ["Storage"] })
        .input(UploadAvatarInputSchema)
        .output(UploadAvatarOutputSchema)
        .handler(async ({ input, context }) => {
            const { file } = input;
            const userId = context.session.user.id;
            const ext = file.type === "image/png" ? "png" : "webp";
            const path = `${userId}/avatar.${ext}`;

            const { error } = await supabase.storage.from("avatars").upload(path, file, {
                upsert: true,
                contentType: file.type || "image/webp",
            });

            if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: error.message });

            const { data } = supabase.storage.from("avatars").getPublicUrl(path);
            const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

            const { status } = await auth.api.updateUser({ body: { image: publicUrl }, headers: context.headers });
            if (!status) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update user image" });

            return { publicUrl };
        }),

    uploadChatAttachment: authed
        .route({ method: "POST", path: "/storage/chat-attachment/upload", summary: "Upload chat attachment", tags: ["Storage"] })
        .input(UploadChatAttachmentInputSchema)
        .output(UploadChatAttachmentOutputSchema)
        .handler(async ({ input, context }) => {
            const { file } = input;
            const userId = context.session.user.id;
            const ext = (file as File).name?.includes(".")
                ? (file as File).name.split(".").pop()
                : "bin";
            const objectPath = `${userId}/${crypto.randomUUID()}.${ext}`;

            const { error } = await supabase.storage.from("chat-attachments").upload(objectPath, file, {
                upsert: false,
                contentType: file.type || "application/octet-stream",
            });

            if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: error.message });

            return { path: `chat-attachments/${objectPath}` };
        }),

    deleteChatAttachment: authed
        .route({ method: "DELETE", path: "/storage/chat-attachment", summary: "Delete chat attachment", tags: ["Storage"] })
        .input(DeleteChatAttachmentInputSchema)
        .handler(async ({ input, context }) => {
            const userId = context.session.user.id;
            const slashIndex = input.path.indexOf("/");
            if (slashIndex === -1) throw new ORPCError("BAD_REQUEST", { message: "Invalid attachment path" });
            const bucket = input.path.slice(0, slashIndex);
            const objectPath = input.path.slice(slashIndex + 1);
            if (!objectPath.startsWith(`${userId}/`)) throw new ORPCError("FORBIDDEN", { message: "Not authorized to delete this attachment" });

            const { error } = await supabase.storage.from(bucket).remove([objectPath]);
            if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: error.message });
        }),

    deleteAvatar: authed
        .route({ method: "DELETE", path: "/storage/avatar", summary: "Delete user avatar", tags: ["Storage"] })
        .input(DeleteAvatarInputSchema)
        .handler(async ({ context }) => {
            const userId = context.session.user.id;

            const { data: files, error: listError } = await supabase.storage
                .from("avatars")
                .list(userId);

            if (listError) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: listError.message });

            if (files && files.length > 0) {
                const paths = files.map((f) => `${userId}/${f.name}`);
                const { error } = await supabase.storage.from("avatars").remove(paths);
                if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: error.message });
            }

            const { status } = await auth.api.updateUser({ body: { image: "" }, headers: context.headers });
            if (!status) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update user image" });
        }),
};
