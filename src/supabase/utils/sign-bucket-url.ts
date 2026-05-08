import { supabase } from "@/supabase/client";

export const SIGNED_URL_TTL_S = 3600;
export const STORAGE_PATH_REGEX = /\/storage\/v1\/object\/(?:public|authenticated)\/([^/]+)\/(.+?)(\?.*)?$/;

export function isBucketUrl(url: string | undefined): boolean {
  return !!url?.includes("/storage/v1/object/");
}

export async function signBucketUrl(url: string): Promise<string> {
  const match = url.match(STORAGE_PATH_REGEX);
  if (!match) return url;

  const [, bucket, path] = match;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);

  return error || !data?.signedUrl ? url : data.signedUrl;
}
