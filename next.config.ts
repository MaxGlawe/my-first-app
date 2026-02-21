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
  },
})

const nextConfig: NextConfig = {
  // Use empty turbopack config to silence the webpack/turbopack mismatch error
  // while still allowing next-pwa to function during production builds.
  turbopack: {},
  allowedDevOrigins: ["192.168.178.49"],
}

export default withPWA(nextConfig)
