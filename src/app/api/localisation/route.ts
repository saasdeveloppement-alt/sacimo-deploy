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
  selectedZone: z.object({
    placeId: z.string(),
    label: z.string(),
    lat: z.number(),
    lng: z.number(),
    radiusKm: z.number(),
    bounds: z.object({
      north: z.number(),
      south: z.number(),
      east: z.number(),
      west: z.number(),
    }).optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [API Localisation] POST request received');
    
    // Auth optionnel (peut être anonyme)
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null
    console.log('👤 [API Localisation] User ID:', userId || 'anonymous');

    // Parser le body
    const body = await request.json()
    console.log('📦 [API Localisation] Request body:', JSON.stringify(body, null, 2));
    
    // Validation des inputs
    if (!body.url && !body.text && (!body.images || body.images.length === 0)) {
      console.error('❌ [API Localisation] No input provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'Au moins une source doit être fournie : url, text ou images',
          details: 'url, text ou images manquant'
        },
        { status: 400 }
      );
    }
    
    // Vérification des clés API
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ [API Localisation] OPENAI_API_KEY missing');
      return NextResponse.json(
        { 
          success: false,
          error: 'Configuration manquante: OPENAI_API_KEY' 
        },
        { status: 500 }
      );
    }
    
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      console.error('❌ [API Localisation] GOOGLE_MAPS_API_KEY missing');
      return NextResponse.json(
        { 
          success: false,
          error: 'Configuration manquante: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY' 
        },
        { status: 500 }
      );
    }
    
    console.log('✅ [API Localisation] API Keys validated');
    
    const parsed = requestSchema.parse(body)
    console.log('✅ [API Localisation] Request validated:', {
      hasUrl: !!parsed.url,
      hasText: !!parsed.text,
      imagesCount: parsed.images?.length || 0,
      hasSelectedZone: !!parsed.selectedZone,
      hasUserHints: !!parsed.userHints,
    });

    // Vérifier qu'une zone de recherche est fournie
    if (!parsed.selectedZone) {
      console.error('❌ [API Localisation] No selectedZone provided');
      return NextResponse.json(
        {
          success: false,
          error: "Une zone de recherche est requise",
          details: "selectedZone manquant dans la requête"
        },
        { status: 400 }
      )
    }
    
    console.log('✅ [API Localisation] Selected zone:', {
      placeId: parsed.selectedZone.placeId,
      label: parsed.selectedZone.label,
      radiusKm: parsed.selectedZone.radiusKm,
      hasBounds: !!parsed.selectedZone.bounds,
    });

    // Créer la requête de localisation
    const userHints = parsed.userHints as LocalizationUserHints | undefined
    console.log('📝 [API Localisation] Creating localisation request...');
    
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
    
    console.log('✅ [API Localisation] Request created:', {
      requestId: localisationRequest.id,
      status: localisationRequest.status,
    });

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
    console.log('🚀 [API Localisation] Launching pipeline...');
    runLocalizationPipeline(
      localisationRequest.id,
      {
        url: parsed.url,
        text: parsed.text,
        images: processedImages,
        hintPostalCode: parsed.hintPostalCode,
        hintCity: parsed.hintCity,
        selectedZone: parsed.selectedZone,
      },
      userHints,
      parsed.multiCandidates || false
    ).catch((error) => {
      console.error("❌ [API Localisation] Erreur pipeline:", error);
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    })
    
    console.log('✅ [API Localisation] Pipeline launched, returning request ID');

    // Retourner immédiatement avec l'ID de la requête
    return NextResponse.json({
      success: true,
      requestId: localisationRequest.id,
      status: "PENDING",
      message: "Localisation en cours de traitement",
    })
  } catch (error: any) {
    console.error("💥 [API Localisation] Erreur:", error);
    
    // Log détaillé de l'erreur
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Error type:', typeof error);
      console.error('Error value:', JSON.stringify(error, null, 2));
    }

    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      console.error('❌ [API Localisation] Validation error:', errorMessages);
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          message: `Les données fournies ne sont pas valides : ${errorMessages}`,
          details: error.errors,
        },
        { status: 400 }
      )
    }

    // Messages d'erreur plus spécifiques selon le type
    let errorMessage = error.message || "Erreur lors de la création de la requête de localisation";
    let errorDetails = "Une erreur inattendue s'est produite. Veuillez réessayer.";

    if (errorMessage.includes("zone") || errorMessage.includes("Zone")) {
      errorDetails = "La zone de recherche fournie est invalide. Vérifiez que vous avez sélectionné une ville ou un code postal valide.";
    } else if (errorMessage.includes("image") || errorMessage.includes("Image")) {
      errorDetails = "Les images fournies sont invalides ou corrompues. Vérifiez que les fichiers sont au format JPG, PNG ou WEBP et qu'ils ne dépassent pas 10Mo chacun.";
    } else if (errorMessage.includes("URL") || errorMessage.includes("url")) {
      errorDetails = "L'URL fournie est invalide ou inaccessible. Vérifiez que l'URL est correcte et que le site est accessible.";
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: errorDetails,
        type: error instanceof Error ? error.name : typeof error,
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
    console.log('🔍 [API Localisation] GET request received');
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get("requestId")
    console.log('📋 [API Localisation] Request ID:', requestId);

    if (!requestId) {
      console.error('❌ [API Localisation] No requestId provided');
      return NextResponse.json(
        {
          success: false,
          error: "requestId requis",
        },
        { status: 400 }
      )
    }

    // Récupérer la requête avec ses candidates
    console.log('🔍 [API Localisation] Fetching request from database...');
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
      console.error('❌ [API Localisation] Request not found:', requestId);
      return NextResponse.json(
        {
          success: false,
          error: "Requête de localisation non trouvée",
        },
        { status: 404 }
      )
    }
    
    console.log('✅ [API Localisation] Request found:', {
      id: localisationRequest.id,
      status: localisationRequest.status,
      candidatesCount: localisationRequest.candidates?.length || 0,
    });

    // Trouver le meilleur candidat
    const bestCandidate = localisationRequest.candidates.find((c) => c.best) || localisationRequest.candidates[0] || null

    // Générer l'explication
    let explanation = bestCandidate
      ? `Probable à ${Math.round(bestCandidate.confidence)}% : ${bestCandidate.addressText}. 
         Raisons : ${Object.entries((bestCandidate.confidenceBreakdown as Record<string, number>) || {})
           .filter(([_, v]) => v > 0)
           .map(([k, v]) => `${k}: ${Math.round(v)}%`)
           .join(", ")}.`
      : localisationRequest.status === 'DONE' && localisationRequest.candidates.length === 0
        ? "Aucun candidat trouvé respectant toutes les contraintes strictes (zone, piscine, jardin, type de bien). Essayez d'élargir le rayon de recherche ou d'assouplir certaines contraintes."
        : localisationRequest.status === 'FAILED'
          ? "Le traitement a échoué. Vérifiez vos paramètres et réessayez."
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
      explanation, // Inclure l'explication dans la réponse
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
          cadastralUrl: (c.sources as any)?.cadastralUrl || undefined,
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
    console.error("💥 [API Localisation] Erreur GET:", error);
    
    // Log détaillé de l'erreur
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Error type:', typeof error);
      console.error('Error value:', JSON.stringify(error, null, 2));
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la récupération de la localisation",
        type: error instanceof Error ? error.name : typeof error,
      },
      { status: 500 }
    )
  }
}

// Configuration Vercel pour timeout long (nécessaire pour le pipeline de localisation)
export const maxDuration = 300; // 5 minutes (maximum autorisé par Vercel Pro)
export const runtime = 'nodejs';

