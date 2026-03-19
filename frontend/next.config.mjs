/** @type {import('next').NextConfig} */
// Force rebuild for Vercel 404 fix
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
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
        destination: `${process.env.BACKEND_URL || 'http://127.0.0.1:8000'}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
