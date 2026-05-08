import { supabase } from "@/supabase/client";

export const SIGNED_URL_TTL_S = 3600;

// Path-based: "bucket/objectPath" (preferred for stored references)
export function isStoragePath(src: string | undefined): boolean {
  return !!src && !src.startsWith("http") && !src.startsWith("blob:");
}

export async function signStoragePath(path: string): Promise<string> {
  const slashIndex = path.indexOf("/");
  if (slashIndex === -1) return path;
  const bucket = path.slice(0, slashIndex);
  const objectPath = path.slice(slashIndex + 1);
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(objectPath, SIGNED_URL_TTL_S);
  return error || !data?.signedUrl ? path : data.signedUrl;
}

// URL-based: full Supabase storage URLs (used for AI-generated markdown links)
export function isBucketUrl(url: string | undefined): boolean {
  return !!url?.includes("/storage/v1/object/");
}

export async function signBucketUrl(url: string): Promise<string> {
  const match = url.match(/\/storage\/v1\/object\/(?:public|authenticated)\/([^/]+)\/(.+?)(\?.*)?$/);
  if (!match) return url;
  const [, bucket, path] = match;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, SIGNED_URL_TTL_S);
  return error || !data?.signedUrl ? url : data.signedUrl;
}
