import type { NextConfig } from "next"

const isProd = process.env.NODE_ENV === "production"
const defaultPort = process.env.PORT || "3000"

if (
  !isProd &&
  (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes(".vercel.app"))
) {
  process.env.NEXTAUTH_URL = `http://localhost:${defaultPort}`
}

const nextConfig: NextConfig = {
  images: {
    // Autoriser toutes les images externes (pour les annonces immobilières)
    // Les images peuvent venir de différents domaines (LeBonCoin, Seloger, Melo.io, etc.)
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
      // Autoriser tous les domaines pour les images d'annonces (LeBonCoin, Seloger, etc.)
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // Désactiver la vérification stricte des domaines pour les images d'annonces
    unoptimized: false,
  },
}

export default nextConfig
