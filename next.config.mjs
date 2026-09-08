/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow LAN devices (tablets/phones) during `next dev -H 0.0.0.0`
  allowedDevOrigins: (process.env.DEV_ALLOWED_ORIGINS ?? "192.168.1.177")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "ujuziplus.co.tz" },
    ],
    formats: ["image/webp"],
  },

  // Allow large file uploads (videos up to 500 MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
    optimizePackageImports: ["@mui/material", "@mui/icons-material", "lucide-react"],
  },

  // Security headers applied to every route
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;