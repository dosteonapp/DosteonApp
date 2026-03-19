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
        destination: `${process.env.BACKEND_URL || 'https://dosteonapp.onrender.com'}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
