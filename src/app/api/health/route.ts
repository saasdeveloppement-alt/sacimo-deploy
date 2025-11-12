import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'success',
    message: 'SACIMO API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasMeloApiKey: !!process.env.MELO_API_KEY,
    meloEnvironment: process.env.MELO_ENV || 'preprod',
    endpoints: {
      health: '/api/health',
      meloTest: '/api/melo/test',
      annonces: '/api/annonces',
      annoncesAll: '/api/annonces/all',
      scraperMelo: '/api/scraper/melo',
    }
  })
}











