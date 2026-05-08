import { useQuery } from "@tanstack/react-query";
import {
  isBucketUrl,
  isStoragePath,
  signBucketUrl,
  signStoragePath,
  SIGNED_URL_TTL_S,
} from "@/supabase/utils/sign-bucket-url";

export function useSignedBucketUrl(src: string | undefined): string | undefined {
  const isPath = isStoragePath(src);
  const isUrl = !isPath && isBucketUrl(src);
  const enabled = isPath || isUrl;

  const { data } = useQuery({
    queryKey: ["signed-bucket-url", src],
    enabled,
    staleTime: (SIGNED_URL_TTL_S - 60) * 1000,
    gcTime: SIGNED_URL_TTL_S * 1000,
    queryFn: () => (isPath ? signStoragePath(src!) : signBucketUrl(src!)),
  });

  if (!enabled) return src;
  return data;
}
