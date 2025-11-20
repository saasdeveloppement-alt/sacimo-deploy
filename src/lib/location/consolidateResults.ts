/**
 * Consolidation des résultats avec génération d'explications
 * Combine les résultats de différentes méthodes et génère une explication structurée
 */

import type { LocationResult, LocationExplanation, EvidenceItem } from "@/types/location"

export interface ConsolidatedResult {
  latitude: number
  longitude: number
  address: string
  confidence: number
  source: string
  explanation: LocationExplanation
  streetViewUrl?: string
  streetViewEmbedUrl?: string
  heading?: number
}

/**
 * Priorités des sources (du plus fiable au moins fiable)
 */
const SOURCE_PRIORITY: Record<string, number> = {
  MAPS_SCREENSHOT: 1,
  EXIF: 2,
  STREETVIEW_VISUAL_MATCH: 3,
  OCR_GEOCODING: 4,
  VISION_LANDMARK: 5,
  VISION_GEOCODING: 6,
  AI_GEOGUESSR: 7,
  LLM_REASONING: 8,
}

/**
 * Consolide les résultats et génère une explication
 */
export function consolidateResultsWithExplanation(
  results: LocationResult[],
): ConsolidatedResult | null {
  if (results.length === 0) {
    return null
  }

  // Trier par priorité de source, puis par confiance
  const sortedResults = [...results].sort((a, b) => {
    const priorityA = SOURCE_PRIORITY[a.source] || 999
    const priorityB = SOURCE_PRIORITY[b.source] || 999
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }
    return (b.confidence || 0) - (a.confidence || 0)
  })

  const bestResult = sortedResults[0]

  // Collecter toutes les evidences
  const allEvidences: EvidenceItem[] = []
  
  for (const result of sortedResults) {
    if (result.evidences && result.evidences.length > 0) {
      allEvidences.push(...result.evidences)
    }
  }

  // Dédupliquer les evidences (même type + label similaire)
  const uniqueEvidences = new Map<string, EvidenceItem>()
  for (const evidence of allEvidences) {
    const key = `${evidence.type}:${evidence.label}`
    if (!uniqueEvidences.has(key) || evidence.weight > (uniqueEvidences.get(key)?.weight || 0)) {
      uniqueEvidences.set(key, evidence)
    }
  }

  // Trier par weight décroissant
  const sortedEvidences = Array.from(uniqueEvidences.values()).sort(
    (a, b) => b.weight - a.weight,
  )

  // Calculer le score final de confiance
  let finalConfidence = bestResult.confidence || 0.5

  // Bonus si plusieurs evidences cohérentes
  if (sortedEvidences.length >= 3) {
    finalConfidence = Math.min(0.95, finalConfidence + 0.1)
  }
  if (sortedEvidences.length >= 5) {
    finalConfidence = Math.min(0.98, finalConfidence + 0.05)
  }

  // Bonus selon le type de source
  if (bestResult.source === "STREETVIEW_VISUAL_MATCH" && (bestResult.confidence || 0) > 0.88) {
    finalConfidence = Math.min(0.98, finalConfidence + 0.1)
  }
  if (bestResult.source === "OCR_GEOCODING" && sortedEvidences.some(e => e.type === "SHOP_SIGN")) {
    finalConfidence = Math.min(0.95, finalConfidence + 0.1)
  }

  // Générer le résumé
  const summary = generateSummary(bestResult, sortedEvidences)

  return {
    latitude: bestResult.latitude!,
    longitude: bestResult.longitude!,
    address: bestResult.address || "",
    confidence: finalConfidence,
    source: bestResult.source,
    explanation: {
      summary,
      evidences: sortedEvidences,
    },
    streetViewUrl: bestResult.streetViewUrl,
    streetViewEmbedUrl: bestResult.streetViewEmbedUrl,
    heading: bestResult.heading || 0,
  }
}

/**
 * Génère un résumé textuel de la localisation
 */
function generateSummary(
  result: LocationResult,
  evidences: EvidenceItem[],
): string {
  const address = result.address || "cette position"
  
  // Construire le résumé selon les evidences disponibles
  const parts: string[] = []

  // Enseignes
  const shopSigns = evidences.filter(e => e.type === "SHOP_SIGN")
  if (shopSigns.length > 0) {
    const shopNames = shopSigns.map(e => e.label.replace("Enseigne détectée : ", "")).join(", ")
    parts.push(`les enseignes (${shopNames})`)
  }

  // Fragments de rues
  const roadMarkings = evidences.filter(e => e.type === "ROAD_MARKING")
  if (roadMarkings.length > 0) {
    const streetNames = roadMarkings.map(e => e.label.replace("Marquage au sol : ", "")).join(", ")
    parts.push(`le nom de rue détecté (${streetNames})`)
  }

  // StreetView match
  const streetViewMatch = evidences.find(e => e.type === "STREETVIEW_MATCH")
  if (streetViewMatch) {
    parts.push("une forte correspondance avec une vue Street View")
  }

  // Landmark
  const landmarks = evidences.filter(e => e.type === "LANDMARK")
  if (landmarks.length > 0) {
    const landmarkNames = landmarks.map(e => e.label.replace("Landmark détecté : ", "")).join(", ")
    parts.push(`la vue vers ${landmarkNames}`)
  }

  // Architecture
  const architecture = evidences.find(e => e.type === "ARCHITECTURE_STYLE")
  if (architecture) {
    parts.push("le style architectural caractéristique")
  }

  // Screenshot Maps
  const mapsScreenshot = evidences.find(e => e.type === "GOOGLE_MAPS_SCREENSHOT")
  if (mapsScreenshot) {
    return `L'IA a localisé ce bien sur ${address} en extrayant les coordonnées directement depuis une capture d'écran Google Maps.`
  }

  // EXIF
  if (result.source === "EXIF") {
    return `L'IA a localisé ce bien sur ${address} en utilisant les coordonnées GPS présentes dans les métadonnées de l'image.`
  }

  // Construire le résumé final
  if (parts.length === 0) {
    return `L'IA a localisé ce bien sur ${address} en analysant les éléments visuels de l'image.`
  }

  const partsText = parts.length === 1
    ? parts[0]
    : parts.slice(0, -1).join(", ") + " et " + parts[parts.length - 1]

  return `L'IA a localisé ce bien sur ${address} en se basant sur ${partsText}.`
}


