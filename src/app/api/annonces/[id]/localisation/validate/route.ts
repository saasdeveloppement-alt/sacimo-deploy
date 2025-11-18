/**
 * Route API pour valider une localisation proposée
 * POST /api/annonces/[id]/localisation/validate
 * 
 * Permet à l'agent de valider la localisation auto ou de la corriger manuellement
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const validateSchema = z.object({
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  precisionMeters: z.number().int().positive().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Auth
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 },
      )
    }

    const { id } = await params

    // 2. Validation du body
    const body = await request.json()
    const parsed = validateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Données invalides", details: parsed.error },
        { status: 400 },
      )
    }

    const { address, latitude, longitude, precisionMeters } = parsed.data

    // 3. Vérifier que l'annonce existe
    const annonce = await prisma.annonceScrape.findUnique({
      where: { id },
    })

    if (!annonce) {
      return NextResponse.json(
        { success: false, error: "Annonce non trouvée" },
        { status: 404 },
      )
    }

    // 4. Récupérer ou créer AnnonceLocation
    let location = await prisma.annonceLocation.findUnique({
      where: { annonceScrapeId: id },
    })

    const locationData: any = {
      address: address || location?.autoAddress || null,
      latitude: latitude ?? location?.autoLatitude ?? null,
      longitude: longitude ?? location?.autoLongitude ?? null,
      precisionMeters: precisionMeters || null,
    }

    if (!location) {
      location = await prisma.annonceLocation.create({
        data: {
          annonceScrapeId: id,
          ...locationData,
        },
      })
    } else {
      location = await prisma.annonceLocation.update({
        where: { id: location.id },
        data: locationData,
      })
    }

    // 5. Mettre à jour aussi latitude/longitude directement sur AnnonceScrape
    if (latitude && longitude) {
      await prisma.annonceScrape.update({
        where: { id },
        data: {
          latitude,
          longitude,
        },
      })
    }

    return NextResponse.json({
      success: true,
      location: {
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        precisionMeters: location.precisionMeters,
      },
    })
  } catch (error: any) {
    console.error("❌ [Localisation Validate] Erreur:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la validation",
      },
      { status: 500 },
    )
  }
}

