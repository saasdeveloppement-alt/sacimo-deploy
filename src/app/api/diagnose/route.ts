import { NextResponse } from 'next/server'

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL
  const nextAuthSecret = process.env.NEXTAUTH_SECRET
  const nextAuthUrl = process.env.NEXTAUTH_URL
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
  const zenrowsApiKey = process.env.ZENROWS_API_KEY
  const scrapeSecretKey = process.env.SCRAPE_SECRET_KEY
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    hasDatabaseUrl: !!databaseUrl,
    databaseUrlType: databaseUrl ? typeof databaseUrl : 'undefined',
    databaseUrlLength: databaseUrl ? databaseUrl.length : 0,
    databaseUrlPrefix: databaseUrl ? databaseUrl.substring(0, 30) + '...' : 'undefined',
    databaseUrlEndsWith: databaseUrl ? databaseUrl.substring(databaseUrl.length - 20) : 'undefined',
    hasNextAuthSecret: !!nextAuthSecret,
    hasNextAuthUrl: !!nextAuthUrl,
    nextAuthUrl: nextAuthUrl,
    hasGoogleClientId: !!googleClientId,
    hasGoogleClientSecret: !!googleClientSecret,
    googleClientIdPrefix: googleClientId ? googleClientId.substring(0, 20) + '...' : 'undefined',
    hasZenrowsApiKey: !!zenrowsApiKey,
    hasScrapeSecretKey: !!scrapeSecretKey,
    zenrowsApiKeyPrefix: zenrowsApiKey ? zenrowsApiKey.substring(0, 20) + '...' : 'undefined',
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('DATABASE') || 
      key.includes('NEXTAUTH') || 
      key.includes('POSTGRES') ||
      key.includes('GOOGLE') ||
      key.includes('EMAIL') ||
      key.includes('ZENROWS') ||
      key.includes('SCRAPE')
    ),
    timestamp: new Date().toISOString()
  })
}

