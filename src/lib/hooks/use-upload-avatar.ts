"use client";

import { authClient } from "@/lib/auth/auth-client";

import { useStorageUpload } from "../../supabase/hooks/use-storage";

export function useUploadAvatar() {
  const { data: session } = authClient.useSession();
  const storageUpload = useStorageUpload();

  async function upload(blob: Blob): Promise<string> {
    const userId = session?.user?.id;
    if (!userId) throw new Error("Not authenticated");

    const ext = blob.type === "image/png" ? "png" : "webp";
    const path = `${userId}/avatar.${ext}`;

    const publicUrl = await storageUpload.mutateAsync({ bucket: "avatars", path, blob });
    return `${publicUrl}?t=${Date.now()}`;
  }

  return { upload, isPending: storageUpload.isPending };
}
