"use client";

import { useMutation } from "@tanstack/react-query";
import { orpcUtils } from "@/lib/orpc/orpc-client";

export function useUploadAvatar() {
  const mutation = useMutation(orpcUtils.storage.uploadAvatar.mutationOptions());

  async function upload(blob: Blob): Promise<string> {
    const { publicUrl } = await mutation.mutateAsync({ file: blob });
    return publicUrl;
  }

  return { upload, isPending: mutation.isPending };
}

export function useDeleteAvatar() {
  const mutation = useMutation(orpcUtils.storage.deleteAvatar.mutationOptions());

  async function remove(): Promise<void> {
    await mutation.mutateAsync({});
  }

  return { remove, isPending: mutation.isPending };
}
