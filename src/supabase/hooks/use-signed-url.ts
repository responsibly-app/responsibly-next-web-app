import { useQuery } from "@tanstack/react-query";
import { isBucketUrl, signBucketUrl, SIGNED_URL_TTL_S } from "@/supabase/utils/sign-bucket-url";

export function useSignedBucketUrl(url: string | undefined): string | undefined {
  const enabled = isBucketUrl(url);

  const { data } = useQuery({
    queryKey: ["signed-bucket-url", url],
    enabled,
    staleTime: (SIGNED_URL_TTL_S - 60) * 1000,
    gcTime: SIGNED_URL_TTL_S * 1000,
    queryFn: () => signBucketUrl(url!),
  });

  if (!enabled) return url;
  return data;
}
