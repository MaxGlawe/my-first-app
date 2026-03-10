import type { NextConfig } from "next"
import withPWAInit from "@ducanh2912/next-pwa"

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        // API routes: always fetch from network (no stale cache)
        urlPattern: /^\/api\/.*/i,
        handler: "NetworkOnly",
      },
      {
        // Supabase: always fresh
        urlPattern: /supabase\.co/i,
        handler: "NetworkOnly",
      },
    ],
  },
})

const nextConfig: NextConfig = {
  // Use empty turbopack config to silence the webpack/turbopack mismatch error
  // while still allowing next-pwa to function during production builds.
  turbopack: {},
  allowedDevOrigins: ["192.168.178.49"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; media-src 'self' https://*.supabase.co data: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.anthropic.com; frame-src 'self' https://js.stripe.com; frame-ancestors 'none'",
          },
        ],
      },
    ]
  },
}

export default withPWA(nextConfig)
