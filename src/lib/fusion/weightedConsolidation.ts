/**
 * Consolidation Multi-Sources Pondérée
 * Combine les résultats de différentes sources avec des poids spécifiques
 */

import type { LocationResult } from "@/types/location"

export interface WeightedConsolidationResult {
  latitude: number
  longitude: number
  confidence: number
  address: string | null
  source: "WEIGHTED_CONSOLIDATION"
  breakdown: {
    streetViewMatch?: number
    ocrStreet?: number
    architectureStyle?: number
    landmarkDistance?: number
    generalSimilarity?: number
  }
}

/**
 * Consolidation pondérée selon les règles :
 * - 40% StreetView Matching
 * - 20% OCR Rue
 * - 20% Architecture Style Match
 * - 10% Landmark Distance
 * - 10% Similarité générale
 */
export function consolidateWeighted(
  results: LocationResult[],
): WeightedConsolidationResult | null {
  if (results.length === 0) {
    return null
  }

  // Catégoriser les résultats par source
  const streetViewMatches = results.filter(r => 
    r.source === "STREETVIEW_VISUAL_MATCH" || 
    r.method === "COMBINED" ||
    r.method === "SSIM" ||
    r.method === "EMBEDDING"
  )
  
  const ocrResults = results.filter(r => 
    r.source === "VISION_GEOCODING" ||
    r.source === "VISION_GPS_COORDINATES" ||
    r.method?.includes("OCR")
  )
  
  const architectureResults = results.filter(r => 
    r.method?.includes("ARCHITECTURE") ||
    r.method?.includes("STYLE")
  )
  
  const landmarkResults = results.filter(r => 
    r.source === "VISION_LANDMARK"
  )
  
  const generalResults = results.filter(r => 
    !streetViewMatches.includes(r) &&
    !ocrResults.includes(r) &&
    !architectureResults.includes(r) &&
    !landmarkResults.includes(r)
  )

  // Calculer les scores pondérés
  let totalWeight = 0
  let weightedLat = 0
  let weightedLng = 0
  let maxConfidence = 0
  let bestAddress: string | null = null
  
  const breakdown = {
    streetViewMatch: 0,
    ocrStreet: 0,
    architectureStyle: 0,
    landmarkDistance: 0,
    generalSimilarity: 0,
  }

  // 40% StreetView Matching
  if (streetViewMatches.length > 0) {
    const bestStreetView = streetViewMatches.reduce((best, current) => 
      (current.confidence || 0) > (best.confidence || 0) ? current : best
    )
    const weight = 0.4 * (bestStreetView.confidence || 0)
    weightedLat += (bestStreetView.latitude || 0) * weight
    weightedLng += (bestStreetView.longitude || 0) * weight
    totalWeight += weight
    breakdown.streetViewMatch = weight
    if ((bestStreetView.confidence || 0) > maxConfidence) {
      maxConfidence = bestStreetView.confidence || 0
      bestAddress = bestStreetView.address
    }
  }

  // 20% OCR Rue
  if (ocrResults.length > 0) {
    const bestOCR = ocrResults.reduce((best, current) => 
      (current.confidence || 0) > (best.confidence || 0) ? current : best
    )
    const weight = 0.2 * (bestOCR.confidence || 0)
    weightedLat += (bestOCR.latitude || 0) * weight
    weightedLng += (bestOCR.longitude || 0) * weight
    totalWeight += weight
    breakdown.ocrStreet = weight
    if ((bestOCR.confidence || 0) > maxConfidence) {
      maxConfidence = bestOCR.confidence || 0
      bestAddress = bestOCR.address
    }
  }

  // 20% Architecture Style Match
  if (architectureResults.length > 0) {
    const bestArch = architectureResults.reduce((best, current) => 
      (current.confidence || 0) > (best.confidence || 0) ? current : best
    )
    const weight = 0.2 * (bestArch.confidence || 0)
    weightedLat += (bestArch.latitude || 0) * weight
    weightedLng += (bestArch.longitude || 0) * weight
    totalWeight += weight
    breakdown.architectureStyle = weight
  }

  // 10% Landmark Distance
  if (landmarkResults.length > 0) {
    const bestLandmark = landmarkResults.reduce((best, current) => 
      (current.confidence || 0) > (best.confidence || 0) ? current : best
    )
    const weight = 0.1 * (bestLandmark.confidence || 0)
    weightedLat += (bestLandmark.latitude || 0) * weight
    weightedLng += (bestLandmark.longitude || 0) * weight
    totalWeight += weight
    breakdown.landmarkDistance = weight
  }

  // 10% Similarité générale
  if (generalResults.length > 0) {
    const bestGeneral = generalResults.reduce((best, current) => 
      (current.confidence || 0) > (best.confidence || 0) ? current : best
    )
    const weight = 0.1 * (bestGeneral.confidence || 0)
    weightedLat += (bestGeneral.latitude || 0) * weight
    weightedLng += (bestGeneral.longitude || 0) * weight
    totalWeight += weight
    breakdown.generalSimilarity = weight
  }

  if (totalWeight === 0) {
    return null
  }

  // Normaliser les coordonnées
  const finalLat = weightedLat / totalWeight
  const finalLng = weightedLng / totalWeight
  
  // Calculer la confiance finale (moyenne pondérée)
  const finalConfidence = Math.min(0.95, totalWeight)

  return {
    latitude: finalLat,
    longitude: finalLng,
    confidence: finalConfidence,
    address: bestAddress,
    source: "WEIGHTED_CONSOLIDATION",
    breakdown,
  }
}







