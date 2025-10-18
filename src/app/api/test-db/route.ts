import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test de connexion à la base de données
    await prisma.$connect()
    
    // Compter les utilisateurs
    const userCount = await prisma.user.count()
    const agencyCount = await prisma.agency.count()
    const searchCount = await prisma.search.count()
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      data: {
        users: userCount,
        agencies: agencyCount,
        searches: searchCount,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
