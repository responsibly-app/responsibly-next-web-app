import type { MetadataRoute } from 'next'
import { logoPath } from "@/config";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Responsibly',
        short_name: 'Responsibly',
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