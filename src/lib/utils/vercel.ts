export function withVercelBypass(url: string): string {
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (!bypass) return url;
  return `${url}?x-vercel-protection-bypass=${bypass}`;
}
