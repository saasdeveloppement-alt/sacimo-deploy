import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    // Configuration SendGrid
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })
    
    // Envoyer un email de test
    const info = await transporter.sendMail({
      from: 'saasdeveloppement@gmail.com', // Votre email vérifié
      to: email,
      subject: 'Test SACIMO - Email de connexion',
      html: `
        <h1>Test SACIMO</h1>
        <p>Bonjour,</p>
        <p>Ceci est un email de test pour vérifier que SendGrid fonctionne.</p>
        <p>Si vous recevez cet email, la configuration est correcte !</p>
        <p>Cliquez sur ce lien pour vous connecter :</p>
        <a href="https://sacimo-deploy.vercel.app/app/dashboard" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Se connecter au dashboard
        </a>
      `,
    })
    
    return NextResponse.json({
      success: true,
      message: 'Email envoyé avec succès',
      messageId: info.messageId
    })
    
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({
      success: false,
      message: 'Erreur d\'envoi d\'email',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
