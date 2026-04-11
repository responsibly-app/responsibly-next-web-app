export function proxiedAvatarUrl(url: string | null | undefined, size = 1024) {
    if (!url) return undefined;
    url = url.replace(/=s\d+-c/, '=s400-c'); // handle Google avatar URLs that have size parameters
    // url = `/_next/image?url=${encodeURIComponent(url)}&w=${size}&q=75` // proxy through Next.js image optimization
    return url;
}
