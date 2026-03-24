import { useMutation } from "@tanstack/react-query";

import { supabase } from "@/supabase/client";

type StorageUploadParams = {
  bucket: string;
  path: string;
  blob: Blob;
};

type StorageDeleteParams = {
  bucket: string;
  paths: string[];
};

export function useStorageUpload() {
  return useMutation({
    mutationFn: async ({ bucket, path, blob }: StorageUploadParams) => {
      const { error } = await supabase.storage.from(bucket).upload(path, blob, {
        upsert: true,
        contentType: blob.type || "image/webp",
      });

      if (error) throw error;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    },
  });
}

export function useStorageDelete() {
  return useMutation({
    mutationFn: async ({ bucket, paths }: StorageDeleteParams) => {
      const { error } = await supabase.storage.from(bucket).remove(paths);
      if (error) throw error;
    },
  });
}
