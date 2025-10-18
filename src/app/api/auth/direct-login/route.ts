import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (email === 'saasdeveloppement@gmail.com') {
      // Vérifier que l'utilisateur existe
      const user = await prisma.user.findUnique({
        where: { email: email }
      })
      
      if (!user) {
        return NextResponse.json({
          success: false,
          message: 'Utilisateur non trouvé'
        }, { status: 404 })
      }
      
      // Retourner un token de session temporaire
      const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')
      
      return NextResponse.json({
        success: true,
        message: 'Connexion directe réussie',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token: token,
        redirectUrl: '/app/dashboard'
      })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Email non autorisé pour la connexion directe'
    }, { status: 401 })
    
  } catch (error) {
    console.error('Direct login error:', error)
    return NextResponse.json({
      success: false,
      message: 'Erreur de connexion directe'
    }, { status: 500 })
  }
}