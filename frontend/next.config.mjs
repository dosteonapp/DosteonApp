/** @type {import('next').NextConfig} */
// Next.js configuration for Dosteon frontend
const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

// Core security headers applied to all routes.
// CSP is intentionally permissive enough for Supabase and the backend
// while still blocking obvious injection vectors.
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      `connect-src 'self' ${backendUrl} https://*.supabase.co wss://*.supabase.co https://*.posthog.com https://us.i.posthog.com`,
      "font-src 'self' https://fonts.gstatic.com",
      "frame-src https://*.supabase.co",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'self'",
    ].join('; '),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

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

  async headers() {
    return [
      {
        // Apply security headers to all routes.
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
}

export default nextConfig
