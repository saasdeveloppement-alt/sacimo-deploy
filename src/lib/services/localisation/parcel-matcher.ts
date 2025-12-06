/**
 * 🎯 PARCEL MATCHER
 * 
 * Match les parcelles candidates avec les images utilisateur et hints
 * Calcule des scores détaillés pour chaque parcelle
 */

import OpenAI from "openai"
import type { LocalizationUserHints } from "@/types/localisation"
import type { ParcelCandidate } from "./parcel-scanner"
import { getDVFData } from "./dvf"
import { scorePrixSurfaceDVF, scoreQuartier, scoreTypologie } from "./hints-scoring"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null

export interface MatchedParcel {
  parcel: ParcelCandidate
  scoreTotal: number // 0-100
  scoreImage: number // 0-100
  scorePiscine: number // 0-100
  scoreToiture: number // 0-100
  scoreTerrain: number // 0-100
  scoreHints: number // 0-100
  scoreDVF: number // 0-100
  reasons: string[] // Explications textuelles
  streetViewUrl?: string
}

/**
 * Détecte la présence d'une piscine sur une image
 */
async function detectPiscineOnImage(imageUrl: string): Promise<{
  hasPiscine: boolean
  confidence: number
  shape?: "rectangulaire" | "ronde" | "autre"
  position?: { x: number; y: number } // Position relative dans l'image
}> {
  if (!openai) {
    return { hasPiscine: false, confidence: 0 }
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyse cette image immobilière et détecte si une piscine est visible.
              Si oui, indique :
              - hasPiscine: true
              - confidence: score de confiance 0-1
              - shape: "rectangulaire", "ronde", ou "autre"
              - position: {x: 0-1, y: 0-1} position relative dans l'image
              
              Réponds en JSON uniquement.`,
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 200,
      response_format: { type: "json_object" },
    })

    const parsed = JSON.parse(response.choices[0].message.content || "{}")
    return {
      hasPiscine: parsed.hasPiscine === true,
      confidence: parsed.confidence || 0,
      shape: parsed.shape,
      position: parsed.position,
    }
  } catch (error) {
    console.warn("⚠️ [Parcel Matcher] Erreur détection piscine:", error)
    return { hasPiscine: false, confidence: 0 }
  }
}

/**
 * Score piscine : compare piscine détectée sur image user vs satellite
 */
export async function scorePiscine(
  parcel: ParcelCandidate,
  userImages: string[],
  hints?: LocalizationUserHints
): Promise<{ score: number; reasons: string[] }> {
  const reasons: string[] = []
  let score = 50 // Score neutre de base

  // Si hints indiquent "aucune piscine", pénaliser si piscine détectée
  if (hints?.piscine === "aucune") {
    // Détecter piscine sur image satellite
    const satellitePiscine = await detectPiscineOnImage(parcel.satelliteImageUrl)
    if (satellitePiscine.hasPiscine) {
      score -= 30 // Pénalité si piscine détectée mais utilisateur dit "aucune"
      reasons.push("Piscine détectée sur satellite mais utilisateur indique 'aucune'")
    } else {
      score += 10 // Bonus si cohérent
      reasons.push("Aucune piscine détectée, cohérent avec les hints")
    }
    return { score: Math.max(0, Math.min(100, score)), reasons }
  }

  // Si hints indiquent une piscine
  if (hints?.piscine && hints.piscine !== "inconnu" && hints.piscine !== "aucune") {
    // Détecter piscine sur image user
    let userHasPiscine = false
    let userPiscineShape: string | undefined

    for (const img of userImages) {
      const detection = await detectPiscineOnImage(img)
      if (detection.hasPiscine) {
        userHasPiscine = true
        userPiscineShape = detection.shape
        break
      }
    }

    // Détecter piscine sur image satellite
    const satellitePiscine = await detectPiscineOnImage(parcel.satelliteImageUrl)

    if (userHasPiscine && satellitePiscine.hasPiscine) {
      score += 30 // Bonus si piscine détectée sur les deux
      reasons.push("Piscine détectée sur image utilisateur et satellite")

      // Vérifier la forme si spécifiée
      if (hints.piscine === "oui_rectangulaire" && userPiscineShape === "rectangulaire") {
        score += 10
        reasons.push("Forme rectangulaire confirmée")
      }
    } else if (userHasPiscine && !satellitePiscine.hasPiscine) {
      score -= 10 // Pénalité si piscine sur user mais pas sur satellite
      reasons.push("Piscine sur image utilisateur mais non visible sur satellite")
    } else if (!userHasPiscine && satellitePiscine.hasPiscine) {
      score += 15 // Bonus si piscine sur satellite (peut être masquée sur photo user)
      reasons.push("Piscine détectée sur satellite")
    }
  }

  return { score: Math.max(0, Math.min(100, score)), reasons }
}

/**
 * Score toiture : compare couleur et forme de toit
 */
export async function scoreToiture(
  parcel: ParcelCandidate,
  userImages: string[]
): Promise<{ score: number; reasons: string[] }> {
  const reasons: string[] = []
  let score = 50

  if (!openai || userImages.length === 0) {
    return { score, reasons }
  }

  try {
    // Analyser la toiture sur l'image utilisateur
    const userAnalysis = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyse la toiture de ce bâtiment :
              - couleur (rouge, grise, noire, etc.)
              - forme (2 pans, 4 pans, plat, etc.)
              - matériau estimé (tuiles, ardoise, etc.)
              
              Réponds en JSON : {color, shape, material, confidence}`,
            },
            {
              type: "image_url",
              image_url: { url: userImages[0] },
            },
          ],
        },
      ],
      max_tokens: 150,
      response_format: { type: "json_object" },
    })

    const userRoof = JSON.parse(userAnalysis.choices[0].message.content || "{}")

    // Analyser la toiture sur l'image satellite
    const satelliteAnalysis = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyse la toiture de ce bâtiment sur cette image satellite :
              - couleur
              - forme
              - matériau estimé
              
              Réponds en JSON : {color, shape, material, confidence}`,
            },
            {
              type: "image_url",
              image_url: { url: parcel.satelliteImageUrl },
            },
          ],
        },
      ],
      max_tokens: 150,
      response_format: { type: "json_object" },
    })

    const satelliteRoof = JSON.parse(satelliteAnalysis.choices[0].message.content || "{}")

    // Comparer les caractéristiques
    if (userRoof.color && satelliteRoof.color) {
      if (userRoof.color.toLowerCase() === satelliteRoof.color.toLowerCase()) {
        score += 20
        reasons.push(`Couleur de toiture correspondante : ${userRoof.color}`)
      } else {
        score -= 10
        reasons.push(`Couleur de toiture différente (user: ${userRoof.color}, satellite: ${satelliteRoof.color})`)
      }
    }

    if (userRoof.shape && satelliteRoof.shape) {
      if (userRoof.shape.toLowerCase() === satelliteRoof.shape.toLowerCase()) {
        score += 15
        reasons.push(`Forme de toiture correspondante : ${userRoof.shape}`)
      }
    }

    return { score: Math.max(0, Math.min(100, score)), reasons }
  } catch (error) {
    console.warn("⚠️ [Parcel Matcher] Erreur scoreToiture:", error)
    return { score, reasons }
  }
}

/**
 * Score terrain : compare forme, ombrage, distance piscine → maison
 */
export async function scoreTerrain(
  parcel: ParcelCandidate,
  userImages: string[],
  hints?: LocalizationUserHints
): Promise<{ score: number; reasons: string[] }> {
  const reasons: string[] = []
  let score = 50

  if (!openai || userImages.length === 0) {
    return { score, reasons }
  }

  try {
    // Analyser le terrain sur l'image utilisateur
    const userAnalysis = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyse le terrain de cette propriété :
              - forme générale (rectangulaire, irrégulière, etc.)
              - présence de terrasse
              - distance estimée entre piscine et maison (si piscine visible)
              - orientation des ombres (pour estimer orientation)
              
              Réponds en JSON : {shape, hasTerrace, poolDistance, shadowOrientation}`,
            },
            {
              type: "image_url",
              image_url: { url: userImages[0] },
            },
          ],
        },
      ],
      max_tokens: 200,
      response_format: { type: "json_object" },
    })

    const userTerrain = JSON.parse(userAnalysis.choices[0].message.content || "{}")

    // Analyser le terrain sur l'image satellite
    const satelliteAnalysis = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyse le terrain de cette propriété sur cette image satellite :
              - forme générale
              - présence de terrasse/patio
              - distance entre piscine et bâtiment (si visible)
              - orientation des ombres
              
              Réponds en JSON : {shape, hasTerrace, poolDistance, shadowOrientation}`,
            },
            {
              type: "image_url",
              image_url: { url: parcel.satelliteImageUrl },
            },
          ],
        },
      ],
      max_tokens: 200,
      response_format: { type: "json_object" },
    })

    const satelliteTerrain = JSON.parse(satelliteAnalysis.choices[0].message.content || "{}")

    // Comparer les caractéristiques
    if (userTerrain.shape && satelliteTerrain.shape) {
      if (userTerrain.shape.toLowerCase() === satelliteTerrain.shape.toLowerCase()) {
        score += 15
        reasons.push("Forme de terrain correspondante")
      }
    }

    if (userTerrain.hasTerrace === satelliteTerrain.hasTerrace) {
      score += 10
      reasons.push("Présence de terrasse cohérente")
    }

    // Vérifier la surface terrain si hint fourni
    if (hints?.housingTypeDetails?.terrainSurfaceRange) {
      // Estimer la surface depuis le satellite
      const estimatedSurface = estimateTerrainSurface(parcel.polygon)
      const { min, max } = hints.housingTypeDetails.terrainSurfaceRange

      if (estimatedSurface >= min * 0.9 && estimatedSurface <= max * 1.1) {
        score += 15
        reasons.push(`Surface terrain cohérente (estimée: ${Math.round(estimatedSurface)}m²)`)
      } else {
        score -= 10
        reasons.push(`Surface terrain différente (estimée: ${Math.round(estimatedSurface)}m², attendu: ${min}-${max}m²)`)
      }
    }

    return { score: Math.max(0, Math.min(100, score)), reasons }
  } catch (error) {
    console.warn("⚠️ [Parcel Matcher] Erreur scoreTerrain:", error)
    return { score, reasons }
  }
}

/**
 * Estime la surface d'un terrain depuis son polygone (formule de Shoelace)
 */
function estimateTerrainSurface(polygon: Array<{ lat: number; lng: number }>): number {
  if (polygon.length < 3) return 0

  let area = 0
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length
    area += polygon[i].lng * polygon[j].lat
    area -= polygon[j].lng * polygon[i].lat
  }
  area = Math.abs(area) / 2

  // Convertir de degrés² en m² (approximation pour la France)
  // 1 degré ≈ 111km, donc 1 degré² ≈ 12,321 km² = 12,321,000,000 m²
  const metersSquared = area * 12321000000

  return Math.round(metersSquared)
}

/**
 * Score basé sur les hints contextuels
 */
export async function scoreContextHints(
  parcel: ParcelCandidate,
  hints?: LocalizationUserHints
): Promise<{ score: number; reasons: string[] }> {
  const reasons: string[] = []
  let score = 50

  if (!hints) {
    return { score, reasons }
  }

  // Score typologie
  const typologieScore = scoreTypologie(
    {
      lat: parcel.centroid.lat,
      lng: parcel.centroid.lng,
      address: parcel.address || "",
      postalCode: parcel.postalCode,
      city: parcel.city,
      sources: {},
      scores: {},
    },
    hints
  )
  score += typologieScore * 20 // 0-20 points
  if (typologieScore > 0.7) {
    reasons.push("Typologie cohérente avec les hints")
  }

  // Score quartier
  const quartierScore = scoreQuartier(
    {
      lat: parcel.centroid.lat,
      lng: parcel.centroid.lng,
      address: parcel.address || "",
      postalCode: parcel.postalCode,
      city: parcel.city,
      sources: {},
      scores: {},
    },
    hints
  )
  score += quartierScore * 10 // 0-10 points
  if (quartierScore > 0.6) {
    reasons.push("Type de quartier cohérent")
  }

  // Score prix/surface DVF
  const dvfScore = await scorePrixSurfaceDVF(
    {
      lat: parcel.centroid.lat,
      lng: parcel.centroid.lng,
      address: parcel.address || "",
      postalCode: parcel.postalCode,
      city: parcel.city,
      sources: {},
      scores: {},
    },
    hints
  )
  score += dvfScore * 20 // 0-20 points
  if (dvfScore > 0.7) {
    reasons.push("Prix et surface cohérents avec DVF")
  }

  return { score: Math.max(0, Math.min(100, score)), reasons }
}

/**
 * Score image globale (comparaison visuelle générale)
 */
export async function scoreImage(
  parcel: ParcelCandidate,
  userImages: string[]
): Promise<{ score: number; reasons: string[] }> {
  const reasons: string[] = []
  let score = 50

  if (!openai || userImages.length === 0) {
    return { score, reasons }
  }

  try {
    // Comparer l'image utilisateur avec l'image satellite
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Compare ces deux images d'une propriété immobilière.
              La première est une photo fournie par l'utilisateur, la seconde est une vue satellite.
              
              Évalue la similarité globale (style architectural, environnement, position relative des éléments).
              Réponds avec un score de 0 à 1 et une explication courte.`,
            },
            {
              type: "image_url",
              image_url: { url: userImages[0] },
            },
            {
              type: "image_url",
              image_url: { url: parcel.satelliteImageUrl },
            },
          ],
        },
      ],
      max_tokens: 150,
      response_format: { type: "json_object" },
    })

    const comparison = JSON.parse(response.choices[0].message.content || "{}")
    const similarity = comparison.similarity || 0.5

    score = similarity * 100
    if (similarity > 0.7) {
      reasons.push("Similarité visuelle élevée entre photo et satellite")
    } else if (similarity < 0.3) {
      reasons.push("Faible similarité visuelle")
    }

    return { score: Math.max(0, Math.min(100, score)), reasons }
  } catch (error) {
    console.warn("⚠️ [Parcel Matcher] Erreur scoreImage:", error)
    return { score, reasons }
  }
}

/**
 * Match principal : calcule tous les scores pour une parcelle
 */
export async function matchParcel(
  parcel: ParcelCandidate,
  userImages: string[],
  hints?: LocalizationUserHints
): Promise<MatchedParcel> {
  const reasons: string[] = []

  // Calculer tous les scores en parallèle
  const [
    imageScore,
    piscineScore,
    toitureScore,
    terrainScore,
    hintsScore,
  ] = await Promise.all([
    scoreImage(parcel, userImages),
    scorePiscine(parcel, userImages, hints),
    scoreToiture(parcel, userImages),
    scoreTerrain(parcel, userImages, hints),
    scoreContextHints(parcel, hints),
  ])

  // Score DVF (densité)
  let dvfScore = 50
  try {
    const dvfData = await getDVFData(parcel.centroid.lat, parcel.centroid.lng, 500)
    if (dvfData) {
      dvfScore = Math.min(100, 50 + dvfData.densite * 5) // Normaliser
      if (dvfData.densite > 5) {
        reasons.push("Zone active avec ventes DVF récentes")
      }
    }
  } catch (error) {
    console.warn("⚠️ [Parcel Matcher] Erreur DVF:", error)
  }

  // Score total pondéré
  const scoreTotal =
    imageScore.score * 0.25 +
    piscineScore.score * 0.15 +
    toitureScore.score * 0.15 +
    terrainScore.score * 0.15 +
    hintsScore.score * 0.20 +
    dvfScore * 0.10

  // Générer URL Street View
  const streetViewUrl = GOOGLE_MAPS_API_KEY
    ? `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${parcel.centroid.lat},${parcel.centroid.lng}&key=${GOOGLE_MAPS_API_KEY}&heading=0&pitch=0&fov=90`
    : undefined

  // Collecter toutes les raisons
  reasons.push(...imageScore.reasons)
  reasons.push(...piscineScore.reasons)
  reasons.push(...toitureScore.reasons)
  reasons.push(...terrainScore.reasons)
  reasons.push(...hintsScore.reasons)

  return {
    parcel,
    scoreTotal: Math.round(scoreTotal),
    scoreImage: Math.round(imageScore.score),
    scorePiscine: Math.round(piscineScore.score),
    scoreToiture: Math.round(toitureScore.score),
    scoreTerrain: Math.round(terrainScore.score),
    scoreHints: Math.round(hintsScore.score),
    scoreDVF: Math.round(dvfScore),
    reasons: reasons.filter((r) => r.length > 0),
    streetViewUrl,
  }
}

/**
 * Match toutes les parcelles et retourne les meilleures
 */
export async function matchParcels(
  parcels: ParcelCandidate[],
  userImages: string[],
  hints?: LocalizationUserHints,
  topN: number = 15
): Promise<MatchedParcel[]> {
  console.log(`🎯 [Parcel Matcher] Matching ${parcels.length} parcelles...`)

  // Matcher toutes les parcelles (en parallèle par batch pour éviter surcharge)
  const batchSize = 5
  const matched: MatchedParcel[] = []

  for (let i = 0; i < parcels.length; i += batchSize) {
    const batch = parcels.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map((parcel) => matchParcel(parcel, userImages, hints))
    )
    matched.push(...batchResults)
  }

  // Trier par score décroissant
  matched.sort((a, b) => b.scoreTotal - a.scoreTotal)

  // Retourner les top N
  const top = matched.slice(0, topN)

  console.log(`✅ [Parcel Matcher] Top ${top.length} parcelles sélectionnées (scores: ${top.map((t) => t.scoreTotal).join(", ")})`)

  return top
}


