import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.google.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "api.telegram.org",
      },
    ],
  },

  async headers() {
    return [
      {
        // You can narrow this to "/" if you want stricter compliance
        source: "/(.*)",
        headers: [
          // -------------------------
          // OWASP REQUIRED HEADERS
          // -------------------------

          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },

          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          // -------------------------
          // CSP (Zoom Apps safe baseline)
          // -------------------------
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",

              // Inline/eval control
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",

              // External scripts (CDNs)
              "script-src-elem 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://cdn.jsdelivr.net https://vercel.live",

              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' https:",
              "connect-src 'self' https:",
              // assistant-ui devtools panel
              "frame-src 'self' https://devtools-frame.assistant-ui.com",
              // REQUIRED for Zoom embedding
              "frame-ancestors 'self' https://*.zoom.us https://*.zoom.com",
              // prevents iframe injection attacks
              "base-uri 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
