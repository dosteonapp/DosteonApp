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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  async rewrites() {
    return [
      // Workspace-slug-prefixed dashboard URLs: serve /dashboard/* file tree
      // while keeping the slug visible in the browser URL.
      {
        source: '/:workspace/dashboard',
        destination: '/dashboard',
      },
      {
        source: '/:workspace/dashboard/:path*',
        destination: '/dashboard/:path*',
      },
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
      {
        // Hash-named JS/CSS chunks — safe to cache forever (new hash = new URL on each build).
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Static public files — cache for 1 day (no content hash, so shorter TTL).
        source: '/:file(favicon\\.ico|manifest\\.json)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
    ];
  },
}

export default nextConfig
