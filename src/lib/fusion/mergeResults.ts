/**
 * Fusion intelligente des résultats de localisation
 * Combine plusieurs méthodes de localisation selon leur priorité et confiance
 */

import type { LocationResult } from "@/types/location"

/**
 * Priorités des méthodes (plus élevé = plus prioritaire)
 */
const METHOD_PRIORITY: Record<string, number> = {
  MAPS_SCREENSHOT: 100,
  EXIF: 90,
  VISION_LANDMARK: 80,
  STREETVIEW_VISUAL_MATCH: 70,
  VISION_GEOCODING: 60,
  VISION_CONTEXT_FALLBACK: 40,
  AI_GEOGUESSR: 30,
  MANUAL: 50, // Correction manuelle a une priorité moyenne mais peut être utilisée
}

/**
 * Fusionne plusieurs résultats de localisation en un seul résultat optimal
 * @param results Liste des résultats à fusionner
 * @returns Résultat fusionné optimal
 */
export function mergeResults(
  results: LocationResult[],
): LocationResult | null {
  if (results.length === 0) {
    return null
  }

  // Filtrer les résultats invalides
  const validResults = results.filter(
    (r) =>
      r.latitude !== null &&
      r.longitude !== null &&
      !isNaN(r.latitude) &&
      !isNaN(r.longitude),
  )

  if (validResults.length === 0) {
    return null
  }

  // Si un seul résultat valide, le retourner
  if (validResults.length === 1) {
    return validResults[0]
  }

  // Trier par priorité de méthode puis par confiance
  const sortedResults = [...validResults].sort((a, b) => {
    const priorityA = METHOD_PRIORITY[a.source] || 0
    const priorityB = METHOD_PRIORITY[b.source] || 0

    if (priorityA !== priorityB) {
      return priorityB - priorityA // Priorité décroissante
    }

    return b.confidence - a.confidence // Confiance décroissante
  })

  // Prendre le meilleur résultat selon la priorité
  const bestResult = sortedResults[0]

  // Si le meilleur résultat a une très haute priorité et confiance, l'utiliser directement
  const bestPriority = METHOD_PRIORITY[bestResult.source] || 0
  if (bestPriority >= 80 && bestResult.confidence >= 0.85) {
    return bestResult
  }

  // Sinon, vérifier s'il y a plusieurs résultats cohérents pour augmenter la confiance
  const topResults = sortedResults.slice(0, 3) // Top 3 résultats

  // Calculer la distance entre les résultats
  const distances: number[] = []
  for (let i = 0; i < topResults.length - 1; i++) {
    for (let j = i + 1; j < topResults.length; j++) {
      const dist = haversineDistance(
        topResults[i].latitude!,
        topResults[i].longitude!,
        topResults[j].latitude!,
        topResults[j].longitude!,
      )
      distances.push(dist)
    }
  }

  // Si les résultats sont cohérents (distance moyenne < 100m), augmenter la confiance
  const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length
  let finalConfidence = bestResult.confidence

  if (avgDistance < 100 && topResults.length >= 2) {
    // Bonus de cohérence : +5% à +15% selon la cohérence
    const coherenceBonus = Math.min(0.15, (100 - avgDistance) / 1000)
    finalConfidence = Math.min(1, bestResult.confidence + coherenceBonus)
  } else if (avgDistance > 500) {
    // Pénalité si les résultats sont trop éloignés
    finalConfidence = Math.max(0.3, bestResult.confidence - 0.2)
  }

  // Calculer une moyenne pondérée des coordonnées si plusieurs résultats cohérents
  let finalLat = bestResult.latitude!
  let finalLng = bestResult.longitude!

  if (avgDistance < 200 && topResults.length >= 2) {
    // Moyenne pondérée par confiance
    let totalWeight = 0
    let weightedLat = 0
    let weightedLng = 0

    for (const result of topResults) {
      const weight = result.confidence
      weightedLat += result.latitude! * weight
      weightedLng += result.longitude! * weight
      totalWeight += weight
    }

    if (totalWeight > 0) {
      finalLat = weightedLat / totalWeight
      finalLng = weightedLng / totalWeight
    }
  }

  return {
    ...bestResult,
    latitude: finalLat,
    longitude: finalLng,
    confidence: finalConfidence,
    // Préserver streetViewEmbedUrl et heading du meilleur résultat
    streetViewEmbedUrl: bestResult.streetViewEmbedUrl,
    heading: bestResult.heading || 0,
  }
}

/**
 * Calcule la distance en mètres entre deux points GPS (formule de Haversine)
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000 // Rayon de la Terre en mètres
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Détecte si une adresse est trop vague (ex: "75000 Paris", "Paris, France")
 * @param address Adresse à vérifier
 * @param geocodingResult Résultat du géocodage Google (optionnel)
 * @returns true si l'adresse est trop vague
 */
export function isAddressTooVague(
  address: string,
  geocodingResult?: {
    address_components?: Array<{
      types: string[]
      long_name: string
      short_name: string
    }>
  },
): boolean {
  const addressLower = address.toLowerCase()

  // Patterns d'adresses vagues
  const vaguePatterns = [
    /^\d{5}\s+[a-z]+$/i, // "75000 Paris"
    /^[a-z]+,\s*france$/i, // "Paris, France"
    /^[a-z]+$/i, // Juste "Paris"
  ]

  // Vérifier les patterns
  if (vaguePatterns.some((pattern) => pattern.test(address))) {
    return true
  }

  // Si on a le résultat du géocodage, vérifier les composants
  if (geocodingResult?.address_components) {
    const components = geocodingResult.address_components

    // Vérifier si on a un numéro de rue
    const hasStreetNumber = components.some((c) =>
      c.types.includes("street_number"),
    )

    // Vérifier si on a une route
    const hasRoute = components.some((c) => c.types.includes("route"))

    // Si pas de numéro ET pas de route, c'est vague
    if (!hasStreetNumber && !hasRoute) {
      return true
    }

    // Si on a seulement le code postal et la ville, c'est vague
    const hasOnlyPostalAndCity =
      components.some((c) => c.types.includes("postal_code")) &&
      components.some((c) => c.types.includes("locality")) &&
      !hasStreetNumber &&
      !hasRoute

    if (hasOnlyPostalAndCity) {
      return true
    }
  }

  return false
}

