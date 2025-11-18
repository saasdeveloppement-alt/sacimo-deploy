/**
 * Route API pour localiser un bien à partir d'une image
 * POST /api/annonces/[id]/localisation/from-image
 * 
 * Pipeline :
 * 1. Lecture EXIF (si disponible)
 * 2. Google Vision API (OCR)
 * 3. Extraction d'adresses candidates
 * 4. Google Geocoding API
 * 5. Street View (validation)
 * 6. Sauvegarde dans AnnonceLocation
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  callVisionForImage,
  extractAddressCandidatesFromVision,
  geocodeAddressCandidates,
  readExifFromImage,
  fetchStreetViewPreview,
} from "@/lib/google/locationClient"
import type { LocationFromImageResult, GeocodedCandidate } from "@/types/location"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Auth & validation
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { status: "error", error: "Non authentifié" },
        { status: 401 },
      )
    }

    const { id } = await params

    // 2. Récupération du listing
    const annonce = await prisma.annonceScrape.findUnique({
      where: { id },
      select: {
        id: true,
        city: true,
        postalCode: true,
        title: true,
      },
    })

    if (!annonce) {
      return NextResponse.json(
        { status: "error", error: "Annonce non trouvée" },
        { status: 404 },
      )
    }

    // 3. Récupération du FormData
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { status: "error", error: "Aucun fichier fourni" },
        { status: 400 },
      )
    }

    // Validation du type de fichier
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          status: "error",
          error: "Type de fichier non supporté. Utilisez JPG, PNG ou WebP.",
        },
        { status: 400 },
      )
    }

    // Validation de la taille (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { status: "error", error: "Fichier trop volumineux (max 10MB)" },
        { status: 400 },
      )
    }

    // 4. Conversion en Buffer
    const arrayBuffer = await file.arrayBuffer()
    const imageBuffer = Buffer.from(arrayBuffer)

    // 5. Lecture EXIF (priorité)
    console.log("📸 [Localisation] Lecture EXIF...")
    const exifData = await readExifFromImage(imageBuffer)

    if (exifData.lat && exifData.lng) {
      console.log(
        `✅ [Localisation] Coordonnées GPS trouvées dans EXIF: ${exifData.lat}, ${exifData.lng}`,
      )

      // Récupérer ou créer AnnonceLocation
      let location = await prisma.annonceLocation.findUnique({
        where: { annonceScrapeId: id },
      })

      if (!location) {
        location = await prisma.annonceLocation.create({
          data: {
            annonceScrapeId: id,
            autoLatitude: exifData.lat,
            autoLongitude: exifData.lng,
            autoConfidence: 0.98,
            autoSource: "EXIF",
          },
        })
      } else {
        location = await prisma.annonceLocation.update({
          where: { id: location.id },
          data: {
            autoLatitude: exifData.lat,
            autoLongitude: exifData.lng,
            autoConfidence: 0.98,
            autoSource: "EXIF",
          },
        })
      }

      // Mettre à jour aussi latitude/longitude directement sur AnnonceScrape
      await prisma.annonceScrape.update({
        where: { id },
        data: {
          latitude: exifData.lat,
          longitude: exifData.lng,
        },
      })

      const streetViewUrl = fetchStreetViewPreview(exifData.lat, exifData.lng)

      return NextResponse.json({
        status: "ok",
        source: "EXIF",
        autoLocation: {
          address: `${exifData.lat}, ${exifData.lng}`,
          latitude: exifData.lat,
          longitude: exifData.lng,
          confidence: 0.98,
          streetViewUrl,
        },
      } as LocationFromImageResult)
    }

    // 6. Appel Google Vision (si pas d'EXIF)
    console.log("🔍 [Localisation] Appel Google Vision API...")
    const visionResult = await callVisionForImage(imageBuffer)

    // 7. Extraction des candidats d'adresse
    console.log("📝 [Localisation] Extraction des adresses candidates...")
    const addressCandidates = extractAddressCandidatesFromVision(visionResult, {
      city: annonce.city,
      postalCode: annonce.postalCode || undefined,
      country: "France",
    })

    if (addressCandidates.length === 0) {
      // Sauvegarder quand même le résultat Vision pour debug
      let location = await prisma.annonceLocation.findUnique({
        where: { annonceScrapeId: id },
      })

      if (!location) {
        await prisma.annonceLocation.create({
          data: {
            annonceScrapeId: id,
            visionRaw: visionResult as any,
            autoSource: "VISION_GEOCODING",
            autoConfidence: 0,
          },
        })
      } else {
        await prisma.annonceLocation.update({
          where: { id: location.id },
          data: {
            visionRaw: visionResult as any,
            autoSource: "VISION_GEOCODING",
            autoConfidence: 0,
          },
        })
      }

      return NextResponse.json({
        status: "error",
        error: "Aucune adresse détectée dans l'image",
      } as LocationFromImageResult)
    }

    console.log(
      `✅ [Localisation] ${addressCandidates.length} adresse(s) candidate(s) trouvée(s)`,
    )

    // 8. Géocoding
    console.log("🗺️ [Localisation] Géocodage des adresses...")
    const geocodedCandidates = await geocodeAddressCandidates(addressCandidates)

    if (geocodedCandidates.length === 0) {
      return NextResponse.json({
        status: "error",
        error: "Aucune adresse n'a pu être géocodée",
      } as LocationFromImageResult)
    }

    console.log(
      `✅ [Localisation] ${geocodedCandidates.length} adresse(s) géocodée(s)`,
    )

    // 9. Sélection du meilleur candidat
    const bestCandidate = geocodedCandidates[0]

    console.log(
      `🏆 [Localisation] Meilleur candidat: ${bestCandidate.address} (score: ${bestCandidate.globalScore})`,
    )

    // 10. Sauvegarde dans AnnonceLocation
    let location = await prisma.annonceLocation.findUnique({
      where: { annonceScrapeId: id },
    })

    const locationData = {
      autoAddress: bestCandidate.address,
      autoLatitude: bestCandidate.latitude,
      autoLongitude: bestCandidate.longitude,
      autoConfidence: bestCandidate.globalScore,
      autoSource: "VISION_GEOCODING",
      visionRaw: visionResult as any,
      geocodingCandidates: geocodedCandidates as any,
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

    // Mettre à jour aussi latitude/longitude directement sur AnnonceScrape
    await prisma.annonceScrape.update({
      where: { id },
      data: {
        latitude: bestCandidate.latitude,
        longitude: bestCandidate.longitude,
      },
    })

    // 11. Réponse JSON
    return NextResponse.json({
      status: "ok",
      source: "VISION_GEOCODING",
      autoLocation: {
        address: bestCandidate.address,
        latitude: bestCandidate.latitude,
        longitude: bestCandidate.longitude,
        confidence: bestCandidate.globalScore,
        streetViewUrl: bestCandidate.streetViewUrl,
      },
      candidates: geocodedCandidates,
    } as LocationFromImageResult)
  } catch (error: any) {
    console.error("❌ [Localisation] Erreur:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Erreur lors du traitement de l'image",
      },
      { status: 500 },
    )
  }
}

