import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (email === 'saasdeveloppement@gmail.com') {
      // Connexion directe simplifiée (sans base de données)
      const token = Buffer.from(`user-123:${Date.now()}`).toString('base64')
      
      return NextResponse.json({
        success: true,
        message: 'Connexion directe réussie',
        user: {
          id: 'user-123',
          email: 'saasdeveloppement@gmail.com',
          name: 'SaaS Développement'
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