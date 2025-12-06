/**
 * 🎯 API DE LOCALISATION ULTRA PUISSANTE
 * 
 * POST /api/localisation
 * 
 * Endpoint principal pour localiser un bien à partir de :
 * - URL d'annonce
 * - Texte (description, notes)
 * - Images (façade, jardin, piscine, rue, etc.)
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { runLocalizationPipeline } from "@/lib/services/localisation/engine"
import type { LocalizationUserHints } from "@/types/localisation"
import { z } from "zod"

const requestSchema = z.object({
  url: z.string().url().optional(),
  text: z.string().min(1).optional(),
  images: z.array(z.string()).optional(), // URLs ou base64
  hintPostalCode: z.string().optional(),
  hintCity: z.string().optional(),
  userHints: z.any().optional(), // LocalizationUserHints (schéma complexe, validation souple)
  multiCandidates: z.boolean().optional().default(false), // Mode multi-candidats
})

export async function POST(request: NextRequest) {
  try {
    // Auth optionnel (peut être anonyme)
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    // Parser le body
    const body = await request.json()
    const parsed = requestSchema.parse(body)

    // Vérifier qu'au moins une source est fournie
    if (!parsed.url && !parsed.text && (!parsed.images || parsed.images.length === 0)) {
      return NextResponse.json(
        {
          success: false,
          error: "Au moins une source doit être fournie : url, text ou images",
        },
        { status: 400 }
      )
    }

    // Créer la requête de localisation
    const userHints = parsed.userHints as LocalizationUserHints | undefined
    
    const localisationRequest = await prisma.localisationRequest.create({
      data: {
        userId,
        rawInput: {
          url: parsed.url,
          text: parsed.text,
          images: parsed.images || [],
          hintPostalCode: parsed.hintPostalCode,
          hintCity: parsed.hintCity,
        },
        userHints: userHints || null,
        status: "PENDING",
      },
    })

    // Si URL LeBonCoin fournie, convertir les images via proxy
    let processedImages = parsed.images || []
    if (parsed.url && parsed.url.includes("leboncoin.fr")) {
      // TODO: Extraire les URLs d'images depuis l'URL LeBonCoin
      // Pour l'instant, on garde les images fournies telles quelles
      // Si des images sont dans parsed.images, les convertir via proxy
      if (processedImages.length > 0) {
        try {
          const convertedImages = await Promise.all(
            processedImages.map(async (imgUrl: string) => {
              // Si c'est déjà base64, garder tel quel
              if (imgUrl.startsWith("data:")) {
                return imgUrl
              }
              // Sinon, convertir via proxy
              const proxyResponse = await fetch(
                `${request.url.split("/api")[0]}/api/proxy/image`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ url: imgUrl }),
                }
              )
              if (proxyResponse.ok) {
                const data = await proxyResponse.json()
                return data.dataUrl
              }
              return imgUrl // Fallback si proxy échoue
            })
          )
          processedImages = convertedImages
        } catch (error) {
          console.warn("⚠️ [API Localisation] Erreur conversion images:", error)
        }
      }
    }

    // Lancer le pipeline en arrière-plan (non bloquant)
    // Pour une vraie implémentation, utiliser un job queue (Bull, BullMQ, etc.)
    runLocalizationPipeline(
      localisationRequest.id,
      {
        url: parsed.url,
        text: parsed.text,
        images: processedImages,
        hintPostalCode: parsed.hintPostalCode,
        hintCity: parsed.hintCity,
      },
      userHints,
      parsed.multiCandidates || false
    ).catch((error) => {
      console.error("❌ [API Localisation] Erreur pipeline:", error)
    })

    // Retourner immédiatement avec l'ID de la requête
    return NextResponse.json({
      success: true,
      requestId: localisationRequest.id,
      status: "PENDING",
      message: "Localisation en cours de traitement",
    })
  } catch (error: any) {
    console.error("❌ [API Localisation] Erreur:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la création de la requête de localisation",
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/localisation?requestId=xxx
 * Récupérer le résultat d'une requête de localisation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get("requestId")

    if (!requestId) {
      return NextResponse.json(
        {
          success: false,
          error: "requestId requis",
        },
        { status: 400 }
      )
    }

    // Récupérer la requête avec ses candidates
    const localisationRequest = await prisma.localisationRequest.findUnique({
      where: { id: requestId },
      include: {
        candidates: {
          orderBy: [{ best: "desc" }, { confidence: "desc" }],
          take: 10,
        },
      },
    })

    if (!localisationRequest) {
      return NextResponse.json(
        {
          success: false,
          error: "Requête de localisation non trouvée",
        },
        { status: 404 }
      )
    }

    // Trouver le meilleur candidat
    const bestCandidate = localisationRequest.candidates.find((c) => c.best) || localisationRequest.candidates[0] || null

    // Générer l'explication
    const explanation = bestCandidate
      ? `Probable à ${Math.round(bestCandidate.confidence)}% : ${bestCandidate.addressText}. 
         Raisons : ${Object.entries((bestCandidate.confidenceBreakdown as Record<string, number>) || {})
           .filter(([_, v]) => v > 0)
           .map(([k, v]) => `${k}: ${Math.round(v)}%`)
           .join(", ")}.`
      : "Aucune localisation fiable trouvée."

    // Déterminer le statut
    const status = bestCandidate
      ? bestCandidate.confidence >= 60
        ? "success"
        : bestCandidate.confidence >= 40
          ? "low-confidence"
          : "failed"
      : "failed"

    return NextResponse.json({
      success: true,
      request: {
        id: localisationRequest.id,
        status: localisationRequest.status,
        createdAt: localisationRequest.createdAt,
        updatedAt: localisationRequest.updatedAt,
      },
      bestCandidate: bestCandidate
        ? {
            id: bestCandidate.id,
            address: bestCandidate.addressText,
            latitude: bestCandidate.lat,
            longitude: bestCandidate.lng,
            postalCode: bestCandidate.postalCode,
            city: bestCandidate.city,
            parcelId: bestCandidate.parcelId,
            confidence: bestCandidate.confidence,
            confidenceBreakdown: bestCandidate.confidenceBreakdown,
            sources: bestCandidate.sources,
          }
        : null,
      candidates: localisationRequest.candidates.map((c) => {
        const breakdown = c.confidenceBreakdown as Record<string, number> | null
        return {
          id: c.id,
          address: c.addressText,
          latitude: c.lat,
          longitude: c.lng,
          postalCode: c.postalCode,
          city: c.city,
          parcelId: c.parcelId,
          confidence: c.confidence,
          confidenceBreakdown: breakdown || {},
          sources: c.sources,
          best: c.best,
          // Extraire les scores individuels depuis le breakdown
          scoreImage: breakdown?.scoreImage || undefined,
          scorePiscine: breakdown?.scorePiscine || undefined,
          scoreToiture: breakdown?.scoreToiture || undefined,
          scoreTerrain: breakdown?.scoreTerrain || undefined,
          scoreHints: breakdown?.scoreHints || undefined,
          scoreDVF: breakdown?.scoreDVF || undefined,
          // URLs depuis les sources
          satelliteImageUrl: (c.sources as any)?.satelliteImageUrl || undefined,
          streetViewUrl: (c.sources as any)?.streetViewUrl || undefined,
        }
      }),
      explanation,
      status,
      // Si low-confidence, suggérer des actions
      ...(status === "low-confidence" && {
        fallbackSuggestions: {
          expandRadius: true,
          message: "Confiance faible. Essayez d'ajouter plus d'informations ou d'élargir la zone de recherche.",
        },
      }),
    })
  } catch (error: any) {
    console.error("❌ [API Localisation] Erreur GET:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la récupération de la localisation",
      },
      { status: 500 }
    )
  }
}

