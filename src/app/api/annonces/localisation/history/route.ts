/**
 * Route API pour récupérer l'historique des localisations validées
 * GET /api/annonces/localisation/history
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Récupérer les 10 dernières localisations validées (avec address, latitude, longitude renseignés)
    const locations = await prisma.annonceLocation.findMany({
      where: {
        address: {
          not: null,
        },
        latitude: {
          not: null,
        },
        longitude: {
          not: null,
        },
      },
      include: {
        annonceScrape: {
          select: {
            id: true,
            title: true,
            city: true,
            postalCode: true,
            images: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 10,
    })

    const history = locations.map((loc) => ({
      id: loc.id,
      address: loc.address || "",
      latitude: loc.latitude || 0,
      longitude: loc.longitude || 0,
      confidence: loc.autoConfidence || 0,
      source: loc.autoSource || "MANUAL",
      timestamp: loc.updatedAt,
      annonceId: loc.annonceScrapeId,
      annonceTitle: loc.annonceScrape?.title || "Annonce",
      imageUrl: loc.annonceScrape?.images?.[0] || null,
    }))

    return NextResponse.json({
      success: true,
      history,
    })
  } catch (error: any) {
    console.error("❌ [History] Erreur:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la récupération de l'historique",
      },
      { status: 500 },
    )
  }
}

