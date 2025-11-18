/**
 * Route API pour récupérer une annonce par ID
 * GET /api/annonces/[id]
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const annonce = await prisma.annonceScrape.findUnique({
      where: { id },
      include: {
        location: true,
      },
    })

    if (!annonce) {
      return NextResponse.json(
        { success: false, error: "Annonce non trouvée" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      annonce,
    })
  } catch (error: any) {
    console.error("❌ [API Annonce] Erreur:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la récupération de l'annonce",
      },
      { status: 500 },
    )
  }
}

