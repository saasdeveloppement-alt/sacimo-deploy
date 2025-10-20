import { NextResponse } from 'next/server'

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL
  const nextAuthSecret = process.env.NEXTAUTH_SECRET
  const nextAuthUrl = process.env.NEXTAUTH_URL
  
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
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('DATABASE') || 
      key.includes('NEXTAUTH') || 
      key.includes('POSTGRES')
    ),
    timestamp: new Date().toISOString()
  })
}

