/**
 * 🎯 MOTEUR DE LOCALISATION ULTRA PUISSANT
 * 
 * Pipeline complet de localisation multi-sources :
 * 1. Normalisation & extraction (URL, texte, images)
 * 2. Génération de candidates "coarse" (Google Geocoding, Places)
 * 3. Enrichissement cadastral & DVF
 * 4. Analyse Street View & imagerie (OpenAI Vision)
 * 5. Scoring global des candidates
 * 6. Persistance & retour
 */

import { prisma } from "@/lib/prisma"
import { geocodeAddressCandidates, reverseGeocode } from "@/lib/google/locationClient"
import { findParcelleByCoordinates } from "./cadastre"
import { getDVFData, calculateDVFDensityScore } from "./dvf"
import {
  reduceZoneWithHints,
  scoreTypologie,
  scorePrixSurfaceDVF,
  scoreQuartier,
  scorePiscine,
  scoreRepere,
} from "./hints-scoring"
import { buildParcelCandidates, type BoundingBox } from "./parcel-scanner"
import { matchParcels, type MatchedParcel } from "./parcel-matcher"
import type { LocalizationUserHints } from "@/types/localisation"
import OpenAI from "openai"
import type { LocalisationRequest, LocationCandidate } from "@prisma/client"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null

// Types pour le pipeline
export interface LocalisationInput {
  url?: string
  text?: string
  images?: string[] // URLs ou base64
  hintPostalCode?: string
  hintCity?: string
}

export interface LocationCandidateRaw {
  lat: number
  lng: number
  address: string
  postalCode?: string
  city?: string
  parcelId?: string
  sources: {
    google_geocode?: boolean
    cadastre?: boolean
    dvf?: boolean
    ads?: string[]
    streetview?: boolean
  }
  scores: {
    text_match?: number
    image_match?: number
    dvf_density?: number
    streetview_similarity?: number
  }
}

export interface LocalisationResult {
  bestCandidate: LocationCandidateRaw | null
  candidates: LocationCandidateRaw[]
  explanation: string
  confidence: number
  // Nouveau format multi-candidats
  multiCandidates?: MatchedParcel[]
  status?: "success" | "low-confidence" | "failed"
  fallbackSuggestions?: {
    expandRadius?: boolean
    nearbyCommune?: string
    dvfDensity?: number
  }
}

/**
 * PHASE 1 — Normalisation & extraction
 */
async function normalizeAndExtract(
  input: LocalisationInput,
  hints?: LocalizationUserHints
): Promise<{
  title?: string
  description?: string
  city?: string
  postalCode?: string
  surface?: number
  propertyType?: string
  coordinates?: { lat: number; lng: number }
}> {
  const extracted: any = {}

  // Si URL d'annonce fournie, extraire les infos
  if (input.url) {
    // TODO: Intégrer avec le parser d'annonces existant
    // Pour l'instant, on utilise OpenAI pour extraire depuis l'URL ou le texte
    if (openai && input.text) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Tu es un expert en extraction d'informations immobilières. 
              Extrais les informations suivantes depuis le texte d'une annonce immobilière :
              - ville
              - code postal
              - surface (en m²)
              - type de bien (appartement, maison, etc.)
              - coordonnées GPS si présentes
              
              Réponds en JSON avec les clés : city, postalCode, surface, propertyType, coordinates (lat, lng).`,
            },
            {
              role: "user",
              content: input.text,
            },
          ],
          response_format: { type: "json_object" },
        })

        const parsed = JSON.parse(response.choices[0].message.content || "{}")
        Object.assign(extracted, parsed)
      } catch (error) {
        console.warn("⚠️ Erreur extraction OpenAI:", error)
      }
    }
  }

  // Utiliser les hints en priorité (ils sont plus fiables que l'extraction)
  if (hints?.city) extracted.city = hints.city
  else if (input.hintCity) extracted.city = input.hintCity

  if (hints?.postalCode) extracted.postalCode = hints.postalCode
  else if (input.hintPostalCode) extracted.postalCode = input.hintPostalCode

  if (hints?.propertyType) extracted.propertyType = hints.propertyType

  return extracted
}

/**
 * PHASE 2 — Génération de candidates "coarse"
 */
async function generateCoarseCandidates(
  extracted: ReturnType<typeof normalizeAndExtract> extends Promise<infer T> ? T : never,
  input: LocalisationInput,
  hints?: LocalizationUserHints
): Promise<LocationCandidateRaw[]> {
  const candidates: LocationCandidateRaw[] = []

  // Si on a une ville/code postal, utiliser Google Geocoding
  if (extracted.city || extracted.postalCode) {
    const addressQuery = [
      extracted.city,
      extracted.postalCode,
      "France",
    ]
      .filter(Boolean)
      .join(" ")

    try {
      const geocoded = await geocodeAddressCandidates(
        [{ rawText: addressQuery, score: 1.0 }],
        {
          city: extracted.city,
          postalCode: extracted.postalCode,
          country: "France",
        }
      )

      for (const candidate of geocoded.slice(0, 5)) {
        candidates.push({
          lat: candidate.latitude,
          lng: candidate.longitude,
          address: candidate.address,
          postalCode: extracted.postalCode,
          city: extracted.city,
          sources: { google_geocode: true },
          scores: { text_match: candidate.globalScore || 0.5 },
        })
      }
    } catch (error) {
      console.warn("⚠️ Erreur geocoding:", error)
    }
  }

  // Si on a du texte, essayer d'extraire des adresses avec OpenAI
  if (input.text && openai) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Extrais toutes les adresses potentielles depuis ce texte d'annonce immobilière.
            Réponds en JSON avec un tableau "addresses" contenant des objets {address, city, postalCode, confidence}.
            Ne retourne que des adresses françaises valides.`,
          },
          {
            role: "user",
            content: input.text,
          },
        ],
        response_format: { type: "json_object" },
      })

      const parsed = JSON.parse(response.choices[0].message.content || "{}")
      const addresses = parsed.addresses || []

      for (const addr of addresses.slice(0, 3)) {
        if (addr.address) {
          try {
            const geocoded = await geocodeAddressCandidates(
              [{ rawText: addr.address, score: addr.confidence || 0.5 }],
              {
                city: addr.city || extracted.city,
                postalCode: addr.postalCode || extracted.postalCode,
                country: "France",
              }
            )

            if (geocoded.length > 0) {
              const best = geocoded[0]
              candidates.push({
                lat: best.latitude,
                lng: best.longitude,
                address: best.address,
                postalCode: addr.postalCode || extracted.postalCode,
                city: addr.city || extracted.city,
                sources: { google_geocode: true },
                scores: { text_match: addr.confidence || 0.5 },
              })
            }
          } catch (error) {
            console.warn("⚠️ Erreur geocoding adresse extraite:", error)
          }
        }
      }
    } catch (error) {
      console.warn("⚠️ Erreur extraction adresses OpenAI:", error)
    }
  }

  // Réduire la zone selon les hints
  if (hints) {
    candidates = await reduceZoneWithHints(candidates, hints)
  }

  return candidates
}

/**
 * PHASE 3 — Enrichissement cadastral & DVF
 */
async function enrichWithCadastreAndDVF(
  candidates: LocationCandidateRaw[]
): Promise<LocationCandidateRaw[]> {
  const enriched = await Promise.all(
    candidates.map(async (candidate) => {
      // Rechercher la parcelle cadastrale
      const parcelle = await findParcelleByCoordinates(candidate.lat, candidate.lng)
      
      // Récupérer les données DVF
      const dvfData = await getDVFData(candidate.lat, candidate.lng, 500)
      const dvfScore = calculateDVFDensityScore(dvfData)
      
      return {
        ...candidate,
        parcelId: parcelle?.parcelleId || undefined,
        sources: {
          ...candidate.sources,
          cadastre: !!parcelle,
          dvf: !!dvfData,
        },
        scores: {
          ...candidate.scores,
          dvf_density: dvfScore,
        },
      }
    })
  )
  
  return enriched
}

/**
 * PHASE 4 — Analyse Street View & imagerie
 */
async function analyzeWithStreetViewAndImages(
  candidates: LocationCandidateRaw[],
  inputImages?: string[]
): Promise<LocationCandidateRaw[]> {
  if (!inputImages || inputImages.length === 0 || !openai) {
    return candidates
  }

  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY
  
  // Pour chaque candidate, comparer avec les images fournies
  const analyzed = await Promise.all(
    candidates.map(async (candidate) => {
      try {
        // Récupérer une image Street View pour cette position
        let streetViewImageUrl: string | null = null
        if (GOOGLE_MAPS_API_KEY) {
          streetViewImageUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${candidate.lat},${candidate.lng}&key=${GOOGLE_MAPS_API_KEY}&heading=0&pitch=0&fov=90`
        }

        // Comparer les images avec OpenAI Vision
        let imageMatchScore = 0
        let streetViewSimilarity = 0

        if (streetViewImageUrl && inputImages.length > 0) {
          try {
            // Utiliser OpenAI Vision pour comparer l'image fournie avec Street View
            const comparisonPrompt = `Compare ces deux images de façades immobilières. 
            La première est une image fournie par l'utilisateur, la seconde est une vue Google Street View.
            Évalue la similarité entre les deux images (style architectural, couleur, éléments visuels, environnement).
            Réponds avec un score de similarité entre 0 et 1 (1 = identique, 0 = complètement différent).`

            // Prendre la première image fournie pour la comparaison
            const userImage = inputImages[0]
            
            // Appel OpenAI Vision (nécessite l'API avec support images)
            const response = await openai.chat.completions.create({
              model: "gpt-4o", // Modèle avec support vision
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: comparisonPrompt },
                    { type: "image_url", image_url: { url: userImage } },
                    { type: "image_url", image_url: { url: streetViewImageUrl } },
                  ],
                },
              ],
              max_tokens: 100,
            })

            // Parser le score depuis la réponse
            const responseText = response.choices[0].message.content || "0"
            const scoreMatch = responseText.match(/(\d+\.?\d*)/)
            if (scoreMatch) {
              streetViewSimilarity = Math.min(1, Math.max(0, parseFloat(scoreMatch[1])))
              imageMatchScore = streetViewSimilarity * 0.8 // Légèrement plus conservateur
            }
          } catch (error) {
            console.warn("⚠️ [Localisation] Erreur comparaison OpenAI Vision:", error)
          }
        }

        return {
          ...candidate,
          scores: {
            ...candidate.scores,
            image_match: imageMatchScore,
            streetview_similarity: streetViewSimilarity,
          },
          sources: {
            ...candidate.sources,
            streetview: !!streetViewImageUrl,
          },
        }
      } catch (error) {
        console.warn("⚠️ [Localisation] Erreur analyse image pour candidate:", error)
        return candidate
      }
    })
  )

  return analyzed
}

/**
 * PHASE 5 — Scoring global des candidates avec hints
 */
async function scoreLocationCandidate(
  candidate: LocationCandidateRaw,
  hints?: LocalizationUserHints
): Promise<{ confidence: number; breakdown: Record<string, number> }> {
  const breakdown: Record<string, number> = {}

  // Score texte (0-30 points, réduit pour laisser place aux hints)
  breakdown.text_match = (candidate.scores.text_match || 0) * 30

  // Score image (0-25 points)
  breakdown.image_match = (candidate.scores.image_match || 0) * 25

  // Score DVF base (0-10 points)
  breakdown.dvf_density = (candidate.scores.dvf_density || 0) * 10

  // Score Street View (0-10 points)
  breakdown.streetview_similarity = (candidate.scores.streetview_similarity || 0) * 10

  // Scores basés sur les hints (si disponibles)
  if (hints) {
    // Score typologie (0-10 points)
    breakdown.scoreTypologie = scoreTypologie(candidate, hints) * 10

    // Score prix/surface DVF (0-10 points)
    breakdown.scorePrixSurfaceDVF = (await scorePrixSurfaceDVF(candidate, hints)) * 10

    // Score quartier (0-3 points)
    breakdown.scoreQuartier = scoreQuartier(candidate, hints) * 3

    // Score piscine (0-2 points)
    breakdown.scorePiscine = scorePiscine(candidate, hints) * 2

    // Score repère (0-10 points)
    breakdown.scoreRepere = (await scoreRepere(candidate, hints)) * 10
  }

  // Score total (0-100)
  const confidence = Object.values(breakdown).reduce((sum, val) => sum + val, 0)

  return {
    confidence: Math.min(100, Math.max(0, confidence)),
    breakdown,
  }
}

/**
 * Génère une explication détaillée avec OpenAI
 */
async function generateDetailedExplanation(
  bestCandidate: LocationCandidateRaw | { lat: number; lng: number; address: string; postalCode?: string; city?: string },
  hints?: LocalizationUserHints,
  breakdown?: Record<string, number>
): Promise<string> {
  if (!openai) {
    return `Probable à ${Math.round(bestCandidate.confidence || 0)}% : ${bestCandidate.address}.`
  }

  try {
    const hintsSummary = hints
      ? Object.entries(hints)
          .filter(([_, v]) => v !== undefined && v !== null && v !== "")
          .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
          .join(", ")
      : "Aucun hint fourni"

    const breakdownSummary = breakdown
      ? Object.entries(breakdown)
          .filter(([_, v]) => v > 0)
          .map(([k, v]) => `${k}: ${Math.round(v)}%`)
          .join(", ")
      : "Aucun breakdown disponible"

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Tu es un assistant expert en localisation immobilière. 
          Génère une explication claire et rassurante pour l'utilisateur expliquant pourquoi 
          cette localisation a été choisie, en utilisant les hints fournis et le breakdown de confiance.
          Sois précis, naturel et rassurant.`,
        },
        {
          role: "user",
          content: `Génère une explication pour cette localisation :
          
          Adresse: ${bestCandidate.address}
          Confiance: ${Math.round(bestCandidate.confidence || 0)}%
          
          Hints utilisateur: ${hintsSummary}
          
          Breakdown de confiance: ${breakdownSummary}
          
          Génère une explication en français, naturelle et rassurante.`,
        },
      ],
      max_tokens: 200,
    })

    return response.choices[0].message.content || `Probable à ${Math.round(bestCandidate.confidence || 0)}% : ${bestCandidate.address}.`
  } catch (error) {
    console.warn("⚠️ [Localisation] Erreur génération explication:", error)
    return `Probable à ${Math.round(bestCandidate.confidence || 0)}% : ${bestCandidate.address}.`
  }
}

/**
 * PHASE 6 — Pipeline principal
 */
export async function runLocalizationPipeline(
  requestId: string,
  input: LocalisationInput,
  hints?: LocalizationUserHints,
  multiCandidatesMode: boolean = false
): Promise<LocalisationResult> {
  const DEBUG = process.env.LOCALISATION_DEBUG === "true"

  if (DEBUG) console.log("🚀 [Localisation] Démarrage pipeline pour request:", requestId, `(multiCandidates: ${multiCandidatesMode})`)

  try {
    // Mettre à jour le statut
    await prisma.localisationRequest.update({
      where: { id: requestId },
      data: { status: "RUNNING" },
    })

    // PHASE 1
    if (DEBUG) console.log("📋 [Localisation] Phase 1: Normalisation & extraction...")
    const extracted = await normalizeAndExtract(input, hints)

    // MODE MULTI-CANDIDATS : Utiliser le nouveau pipeline avec parcelles
    if (multiCandidatesMode && (input.images?.length || 0) > 0) {
      if (DEBUG) console.log("🎯 [Localisation] Mode multi-candidats activé avec analyse parcelles...")

      // Construire les candidats parcelles
      const parcels = await buildParcelCandidates(
        extracted.city || hints?.city,
        extracted.postalCode || hints?.postalCode
      )

      if (parcels.length === 0) {
        throw new Error("Aucune parcelle trouvée pour cette zone")
      }

      // Matcher les parcelles avec les images et hints
      const matched = await matchParcels(parcels, input.images || [], hints, 15)

      // Filtrer les candidats avec score > 40%
      const validCandidates = matched.filter((m) => m.scoreTotal >= 40)

      if (validCandidates.length === 0) {
        // Fail-safe : élargir la recherche
        if (DEBUG) console.log("⚠️ [Localisation] Aucun candidat > 40%, élargissement...")

        // Élargir le rayon (x2)
        const expandedParcels = await buildParcelCandidates(
          extracted.city || hints?.city,
          extracted.postalCode || hints?.postalCode
        )

        const expandedMatched = await matchParcels(expandedParcels, input.images || [], hints, 20)
        const expandedValid = expandedMatched.filter((m) => m.scoreTotal >= 30)

        if (expandedValid.length > 0) {
          return {
            bestCandidate: {
              lat: expandedValid[0].parcel.centroid.lat,
              lng: expandedValid[0].parcel.centroid.lng,
              address: expandedValid[0].parcel.address || "",
              postalCode: expandedValid[0].parcel.postalCode,
              city: expandedValid[0].parcel.city,
              sources: { cadastre: true },
              scores: {},
            },
            candidates: [],
            explanation: `Localisation à faible confiance (${expandedValid[0].scoreTotal}%). Zone élargie.`,
            confidence: expandedValid[0].scoreTotal,
            multiCandidates: expandedValid,
            status: "low-confidence",
            fallbackSuggestions: {
              expandRadius: true,
              dvfDensity: expandedValid[0].scoreDVF,
            },
          }
        }

        // Si toujours rien, retourner erreur
        return {
          bestCandidate: null,
          candidates: [],
          explanation: "Aucune localisation fiable trouvée même après élargissement.",
          confidence: 0,
          status: "failed",
        }
      }

      // Convertir en format LocationCandidateRaw pour compatibilité
      const convertedCandidates: LocationCandidateRaw[] = validCandidates.map((m) => ({
        lat: m.parcel.centroid.lat,
        lng: m.parcel.centroid.lng,
        address: m.parcel.address || "",
        postalCode: m.parcel.postalCode,
        city: m.parcel.city,
        parcelId: m.parcel.id,
        sources: {
          cadastre: true,
          streetview: !!m.streetViewUrl,
        },
        scores: {
          text_match: m.scoreHints / 100,
          image_match: m.scoreImage / 100,
          dvf_density: m.scoreDVF / 100,
        },
      }))

      // Générer l'explication pour le meilleur candidat
      const best = validCandidates[0]
      const explanation = await generateDetailedExplanation(
        {
          lat: best.parcel.centroid.lat,
          lng: best.parcel.centroid.lng,
          address: best.parcel.address || "",
          postalCode: best.parcel.postalCode,
          city: best.parcel.city,
          sources: {},
          scores: {},
        },
        hints,
        {
          scoreImage: best.scoreImage,
          scorePiscine: best.scorePiscine,
          scoreToiture: best.scoreToiture,
          scoreTerrain: best.scoreTerrain,
          scoreHints: best.scoreHints,
          scoreDVF: best.scoreDVF,
        }
      )

      // Persister les candidats
      await prisma.locationCandidate.createMany({
        data: validCandidates.map((m, index) => ({
          localisationRequestId: requestId,
          lat: m.parcel.centroid.lat,
          lng: m.parcel.centroid.lng,
          addressText: m.parcel.address || "",
          postalCode: m.parcel.postalCode || null,
          city: m.parcel.city || null,
          parcelId: m.parcel.id,
          confidence: m.scoreTotal,
          confidenceBreakdown: {
            scoreImage: m.scoreImage,
            scorePiscine: m.scorePiscine,
            scoreToiture: m.scoreToiture,
            scoreTerrain: m.scoreTerrain,
            scoreHints: m.scoreHints,
            scoreDVF: m.scoreDVF,
          },
          sources: {
            cadastre: true,
            streetview: !!m.streetViewUrl,
          },
          best: index === 0,
        })),
      })

      await prisma.localisationRequest.update({
        where: { id: requestId },
        data: { status: "DONE" },
      })

      return {
        bestCandidate: convertedCandidates[0],
        candidates: convertedCandidates,
        explanation,
        confidence: best.scoreTotal,
        multiCandidates: validCandidates,
        status: best.scoreTotal >= 60 ? "success" : "low-confidence",
      }
    }

    // MODE CLASSIQUE (fallback si pas d'images ou multiCandidatesMode = false)
    if (DEBUG) console.log("🔍 [Localisation] Phase 2: Génération candidates coarse...")
    let candidates = await generateCoarseCandidates(extracted, input, hints)
    if (DEBUG) console.log(`✅ [Localisation] ${candidates.length} candidate(s) généré(s)`)

    // PHASE 3
    if (DEBUG) console.log("🗺️ [Localisation] Phase 3: Enrichissement cadastral & DVF...")
    candidates = await enrichWithCadastreAndDVF(candidates)

    // PHASE 4
    if (DEBUG) console.log("📸 [Localisation] Phase 4: Analyse Street View & images...")
    candidates = await analyzeWithStreetViewAndImages(candidates, input.images)

    // PHASE 5
    if (DEBUG) console.log("📊 [Localisation] Phase 5: Scoring global avec hints...")
    const scoredCandidates = await Promise.all(
      candidates.map(async (c) => {
        const scored = await scoreLocationCandidate(c, hints)
        return {
          ...c,
          confidence: scored.confidence,
          confidenceBreakdown: scored.breakdown,
        }
      })
    )

    // Trier par confiance décroissante
    scoredCandidates.sort((a, b) => b.confidence - a.confidence)

    // Garder les 10 meilleurs
    const topCandidates = scoredCandidates.slice(0, 10)

    // Marquer le meilleur (seuil: 60/100)
    const bestCandidate = topCandidates[0]?.confidence >= 60 ? topCandidates[0] : null

    // Générer l'explication détaillée avec OpenAI
    const explanation = bestCandidate
      ? await generateDetailedExplanation(
          bestCandidate,
          hints,
          bestCandidate.confidenceBreakdown as Record<string, number>
        )
      : "Aucune localisation fiable trouvée."

    // PHASE 6 — Persistance
    if (DEBUG) console.log("💾 [Localisation] Phase 6: Persistance...")
    await prisma.locationCandidate.createMany({
      data: topCandidates.map((c, index) => ({
        localisationRequestId: requestId,
        lat: c.lat,
        lng: c.lng,
        addressText: c.address,
        postalCode: c.postalCode || null,
        city: c.city || null,
        parcelId: c.parcelId || null,
        confidence: c.confidence,
        confidenceBreakdown: c.confidenceBreakdown || {},
        sources: c.sources,
        best: index === 0 && c.confidence >= 60,
      })),
    })

    // Mettre à jour le statut
    await prisma.localisationRequest.update({
      where: { id: requestId },
      data: { status: "DONE" },
    })

    if (DEBUG) {
      console.log("✅ [Localisation] Pipeline terminé")
      console.log(`  - Candidates: ${topCandidates.length}`)
      console.log(`  - Meilleur score: ${bestCandidate?.confidence || 0}%`)
    }

    return {
      bestCandidate: bestCandidate || null,
      candidates: topCandidates,
      explanation,
      confidence: bestCandidate?.confidence || 0,
    }
  } catch (error: any) {
    console.error("❌ [Localisation] Erreur pipeline:", error)

    // Marquer comme FAILED
    await prisma.localisationRequest.update({
      where: { id: requestId },
      data: { status: "FAILED" },
    })

    throw error
  }
}

