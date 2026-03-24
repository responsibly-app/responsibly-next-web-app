import { useState } from "react";

export function useUploadAvatar() {
  const [isPending, setIsPending] = useState(false);

  async function upload(blob: Blob): Promise<string> {
    setIsPending(true);
    try {
      // TODO: upload blob to cloud storage and return the remote URL
      // e.g. const url = await uploadToS3(blob)
      // For now, return a local object URL as a placeholder
      return URL.createObjectURL(blob);
    } finally {
      setIsPending(false);
    }
  }

  return { upload, isPending };
}
