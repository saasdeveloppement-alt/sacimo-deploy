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
  LLM_REASONING: 3, // OpenAI Vision en priorité
  LLM_STREETVIEW: 3, // Alias pour LLM_REASONING en mode StreetView
  STREETVIEW_VISUAL_MATCH: 4,
  OCR_GEOCODING: 5,
  GOOGLE_GEOCODING: 5, // Alias pour OCR_GEOCODING
  VISION_LANDMARK: 6,
  VISION_GEOCODING: 7,
  VISION_CONTEXT_FALLBACK: 8, // Fallback basé sur le contexte
  CONTEXT_FALLBACK: 8, // Alias pour VISION_CONTEXT_FALLBACK
  AI_GEOGUESSR: 9,
}

/**
 * Poids des sources dans le calcul de confiance final
 * OpenAI = 60%, Reverse Geocoding = 30%, Google Vision = 10%
 */
const SOURCE_WEIGHT: Record<string, number> = {
  LLM_REASONING: 0.6, // OpenAI Vision = 60%
  MAPS_SCREENSHOT: 0.6, // Maps screenshot utilise aussi OpenAI
  EXIF: 0.3, // EXIF + Reverse Geocoding = 30%
  OCR_GEOCODING: 0.3, // OCR + Reverse Geocoding = 30%
  VISION_GEOCODING: 0.1, // Google Vision = 10%
  VISION_LANDMARK: 0.1, // Google Vision = 10%
  STREETVIEW_VISUAL_MATCH: 0.3, // StreetView + Reverse = 30%
  AI_GEOGUESSR: 0.1,
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

  // Calculer le score final de confiance avec pondération par source
  let baseConfidence = bestResult.confidence || 0.5
  const sourceWeight = SOURCE_WEIGHT[bestResult.source] || 0.5
  
  // Appliquer le poids de la source (OpenAI 60%, Reverse 30%, Vision 10%)
  let finalConfidence = baseConfidence * sourceWeight + (1 - sourceWeight) * 0.5
  
  // Si plusieurs résultats sont disponibles, faire une moyenne pondérée
  if (results.length > 1) {
    const weightedSum = results.reduce((sum, r) => {
      const weight = SOURCE_WEIGHT[r.source] || 0.5
      const confidence = r.confidence || 0.5
      return sum + (confidence * weight)
    }, 0)
    const totalWeight = results.reduce((sum, r) => {
      return sum + (SOURCE_WEIGHT[r.source] || 0.5)
    }, 0)
    
    if (totalWeight > 0) {
      // Combiner : meilleur résultat (pondéré) + moyenne pondérée des autres
      finalConfidence = (finalConfidence * 0.7) + ((weightedSum / totalWeight) * 0.3)
    }
  }

  // Bonus si plusieurs evidences cohérentes
  if (sortedEvidences.length >= 3) {
    finalConfidence = Math.min(0.95, finalConfidence + 0.1)
  }
  if (sortedEvidences.length >= 5) {
    finalConfidence = Math.min(0.98, finalConfidence + 0.05)
  }

  // Bonus selon le type de source (ajusté pour OpenAI)
  if (bestResult.source === "LLM_REASONING" && (bestResult.confidence || 0) > 0.7) {
    finalConfidence = Math.min(0.98, finalConfidence + 0.12) // Bonus OpenAI augmenté
  }
  if (bestResult.source === "MAPS_SCREENSHOT" && (bestResult.confidence || 0) > 0.85) {
    finalConfidence = Math.min(0.98, finalConfidence + 0.10) // Bonus Maps Screenshot
  }
  if (bestResult.source === "STREETVIEW_VISUAL_MATCH" && (bestResult.confidence || 0) > 0.88) {
    finalConfidence = Math.min(0.98, finalConfidence + 0.05) // Bonus réduit pour StreetView
  }
  if (bestResult.source === "OCR_GEOCODING" && sortedEvidences.some(e => e.type === "SHOP_SIGN")) {
    finalConfidence = Math.min(0.95, finalConfidence + 0.05) // Bonus réduit pour OCR
  }
  
  // Bonus supplémentaire si plusieurs résultats cohérents (améliore la confiance)
  if (results.length >= 2) {
    // Vérifier la cohérence des résultats (distance < 100m)
    const distances = []
    for (let i = 0; i < results.length - 1; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const lat1 = results[i].latitude || 0
        const lng1 = results[i].longitude || 0
        const lat2 = results[j].latitude || 0
        const lng2 = results[j].longitude || 0
        // Distance approximative en mètres (formule Haversine simplifiée)
        const dLat = (lat2 - lat1) * 111000 // 1 degré ≈ 111km
        const dLng = (lng2 - lng1) * 111000 * Math.cos(lat1 * Math.PI / 180)
        const distance = Math.sqrt(dLat * dLat + dLng * dLng)
        distances.push(distance)
      }
    }
    const avgDistance = distances.length > 0 ? distances.reduce((a, b) => a + b, 0) / distances.length : Infinity
    if (avgDistance < 100) {
      // Résultats très cohérents (< 100m)
      finalConfidence = Math.min(0.98, finalConfidence + 0.08)
    } else if (avgDistance < 500) {
      // Résultats cohérents (< 500m)
      finalConfidence = Math.min(0.97, finalConfidence + 0.05)
    }
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


