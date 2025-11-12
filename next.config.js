const isProd = process.env.NODE_ENV === 'production'
const defaultPort = process.env.PORT || '3000'

if (
  !isProd &&
  (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes('.vercel.app'))
) {
  process.env.NEXTAUTH_URL = `http://localhost:${defaultPort}`
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    unoptimized: false,
  },
}

module.exports = nextConfig


