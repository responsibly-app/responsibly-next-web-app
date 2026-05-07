import type { MetadataRoute } from 'next'
import { logoPath, ENVIRONMENT } from "@/config";

const suffix = ENVIRONMENT === 'dev' ? ' Dev' : ''

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: `Responsibly${suffix}`,
        short_name: `Responsibly${suffix}`,
        description: 'A Progressive Web App built with Next.js',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: logoPath,
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}