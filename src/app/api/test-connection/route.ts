import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Test de connexion simple
    await prisma.$connect()
    
    // Test d'une requête simple
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    return NextResponse.json({
      success: true,
      message: 'Connexion à la base de données Neon réussie !',
      test: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur de connexion:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Erreur de connexion à la base de données',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}











