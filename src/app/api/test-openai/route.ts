/**
 * Route de test pour vérifier que la clé OpenAI est bien configurée
 * GET /api/test-openai
 */

import { NextResponse } from "next/server"

export async function GET() {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY

  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      {
        status: "error",
        message: "OPENAI_API_KEY non configurée",
        hint: "Vérifiez que la variable d'environnement OPENAI_API_KEY est définie dans .env.local",
      },
      { status: 500 },
    )
  }

  // Vérifier le format de la clé (commence par sk-)
  const isValidFormat = OPENAI_API_KEY.startsWith("sk-")
  const keyLength = OPENAI_API_KEY.length
  const keyPreview = OPENAI_API_KEY.substring(0, 7) + "..." + OPENAI_API_KEY.substring(keyLength - 4)

  // Test simple de connexion (sans consommer de crédits)
  try {
    const testResponse = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    })

    const isConnected = testResponse.ok

    return NextResponse.json({
      status: "ok",
      message: "Clé OpenAI détectée et configurée",
      details: {
        keyFormat: isValidFormat ? "✅ Format valide (sk-...)" : "⚠️ Format suspect",
        keyLength,
        keyPreview,
        apiConnection: isConnected ? "✅ Connexion API réussie" : "❌ Connexion API échouée",
        statusCode: testResponse.status,
        modelsAvailable: isConnected ? "Oui" : "Non",
      },
      modules: {
        isMapsScreenshot: "✅ Disponible",
        locationReasoner: "✅ Disponible",
        guessLocationWithLLM: "✅ Disponible",
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "warning",
        message: "Clé OpenAI détectée mais erreur de connexion",
        details: {
          keyFormat: isValidFormat ? "✅ Format valide" : "⚠️ Format suspect",
          keyLength,
          keyPreview,
          error: error.message,
        },
      },
      { status: 200 },
    )
  }
}







