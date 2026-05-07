/**
 * Maps a MIME type to the assistant-ui attachment category.
 * Images → "image", plain text variants → "document", everything else → "file".
 */
export function mimeTypeToAttachmentType(mimeType: string): "image" | "document" | "file" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("text/")) return "document";
  return "file";
}

export function proxiedAvatarUrl(url: string | null | undefined, size = 1024) {
    if (!url) return undefined;
    url = url.replace(/=s\d+-c/, '=s400-c'); // handle Google avatar URLs that have size parameters
    // url = `/_next/image?url=${encodeURIComponent(url)}&w=${size}&q=75` // proxy through Next.js image optimization
    return url;
}
