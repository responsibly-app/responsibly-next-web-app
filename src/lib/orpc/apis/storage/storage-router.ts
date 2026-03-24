import { ORPCError } from "@orpc/server";
import { authed } from "@/lib/orpc/base";
import { supabase } from "@/supabase/client";
import { DeleteAvatarInputSchema, UploadAvatarInputSchema, UploadAvatarOutputSchema } from "./storage-schemas";

export const storageRouter = {
    uploadAvatar: authed
        .route({ method: "POST", path: "/storage/avatar/upload", summary: "Upload user avatar", tags: ["Storage"] })
        .input(UploadAvatarInputSchema)
        .output(UploadAvatarOutputSchema)
        .handler(async ({ input }) => {
            const { file, userId } = input;
            const ext = file.type === "image/png" ? "png" : "webp";
            const path = `${userId}/avatar.${ext}`;

            const { error } = await supabase.storage.from("avatars").upload(path, file, {
                upsert: true,
                contentType: file.type || "image/webp",
            });

            if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: error.message });

            const { data } = supabase.storage.from("avatars").getPublicUrl(path);
            return { publicUrl: `${data.publicUrl}?t=${Date.now()}` };
        }),

    deleteAvatar: authed
        .route({ method: "DELETE", path: "/storage/avatar", summary: "Delete user avatar", tags: ["Storage"] })
        .input(DeleteAvatarInputSchema)
        .handler(async ({ input }) => {
            const { userId } = input;

            const { data: files, error: listError } = await supabase.storage
                .from("avatars")
                .list(userId);

            if (listError) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: listError.message });

            if (!files || files.length === 0) return;

            const paths = files.map((f) => `${userId}/${f.name}`);
            const { error } = await supabase.storage.from("avatars").remove(paths);
            if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: error.message });
        }),
};
