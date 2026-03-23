/** @type {import('next').NextConfig} */
// Next.js configuration for Dosteon frontend
const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // All frontend API calls go through this internal /api proxy.
        // BACKEND_URL must be set in .env/.env.local and in Render for production.
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
