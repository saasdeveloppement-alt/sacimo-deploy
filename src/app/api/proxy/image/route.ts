/**
 * 🖼️ PROXY IMAGE
 * 
 * Télécharge et proxifie des images externes (notamment LeBonCoin)
 * pour contourner les restrictions de hotlinking
 */

import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")

    if (!imageUrl) {
      return NextResponse.json(
        { error: "URL d'image requise" },
        { status: 400 }
      )
    }

    // Valider que c'est une URL valide
    try {
      new URL(imageUrl)
    } catch {
      return NextResponse.json(
        { error: "URL invalide" },
        { status: 400 }
      )
    }

    // Télécharger l'image avec headers pour contourner hotlinking
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.leboncoin.fr/",
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erreur téléchargement image: ${response.status}` },
        { status: response.status }
      )
    }

    // Récupérer le type MIME
    const contentType = response.headers.get("content-type") || "image/jpeg"
    const imageBuffer = await response.arrayBuffer()

    // Retourner l'image avec les bons headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600", // Cache 1h
      },
    })
  } catch (error: any) {
    console.error("❌ [Proxy Image] Erreur:", error)
    return NextResponse.json(
      { error: error.message || "Erreur lors du téléchargement de l'image" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/proxy/image
 * Convertit une image URL en base64 via le proxy
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: "URL d'image requise" },
        { status: 400 }
      )
    }

    // Utiliser le proxy GET
    const proxyUrl = new URL("/api/proxy/image", request.url)
    proxyUrl.searchParams.set("url", url)

    const response = await fetch(proxyUrl.toString(), {
      headers: {
        "User-Agent": request.headers.get("user-agent") || "",
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erreur proxy: ${response.status}` },
        { status: response.status }
      )
    }

    const imageBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(imageBuffer).toString("base64")
    const contentType = response.headers.get("content-type") || "image/jpeg"

    return NextResponse.json({
      success: true,
      dataUrl: `data:${contentType};base64,${base64}`,
      contentType,
    })
  } catch (error: any) {
    console.error("❌ [Proxy Image] Erreur POST:", error)
    return NextResponse.json(
      { error: error.message || "Erreur lors de la conversion" },
      { status: 500 }
    )
  }
}


