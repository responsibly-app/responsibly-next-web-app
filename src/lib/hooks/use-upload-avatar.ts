"use client";

import { authClient } from "@/lib/auth/auth-client";

import { useStorageDelete, useStorageUpload } from "../../supabase/hooks/use-storage";

function avatarStoragePath(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const match = url.pathname.match(/\/storage\/v1\/object\/public\/avatars\/(.+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

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

export function useDeleteAvatar() {
  const storageDelete = useStorageDelete();

  async function remove(imageUrl: string): Promise<void> {
    const path = avatarStoragePath(imageUrl);
    if (!path) return;
    await storageDelete.mutateAsync({ bucket: "avatars", paths: [path] });
  }

  return { remove, isPending: storageDelete.isPending };
}
