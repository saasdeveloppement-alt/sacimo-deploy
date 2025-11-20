/**
 * Module de priorisation et dépriorisation des résultats de localisation
 * Rééquilibre les scores selon les landmarks critiques et les screenshots détectés
 */

import type { LocationResult } from "@/types/location"

/**
 * Liste des landmarks critiques qui indiquent une localisation très précise
 */
const CRITICAL_LANDMARKS = [
  "Arc De Triomphe",
  "Arc de Triomphe",
  "Champs-Élysées",
  "Champs Élysées",
  "Louis Vuitton",
  "Five Guys Champs-Élysées",
  "Sephora Champs-Élysées",
  "Tour Eiffel",
  "Eiffel Tower",
  "Notre-Dame",
  "Sacré-Cœur",
  "Sacré Coeur",
]

/**
 * Vérifie si un landmark est critique (indique une localisation très précise)
 */
function isCriticalLandmark(name: string): boolean {
  const nameLower = name.toLowerCase()
  return CRITICAL_LANDMARKS.some((landmark) =>
    nameLower.includes(landmark.toLowerCase()),
  )
}

/**
 * Rééquilibre les scores des résultats selon les priorités :
 * - Landmark fort : +60 à +80%
 * - OCR précis : +40 à +60%
 * - Screenshot détecté : pénalité StreetView -50%
 * - StreetView reste utilisé mais avec priorité très basse si screenshot/landmark présent
 */
export function prioritizeResults(
  results: LocationResult[],
  options: {
    hasMapsScreenshot?: boolean
    landmarks?: Array<{ description?: string }>
  } = {},
): LocationResult[] {
  const { hasMapsScreenshot = false, landmarks = [] } = options

  // Filtrer les résultats qui ont des coordonnées valides (déjà fait par filterByDepartment)
  // On assume que tous les résultats passés ont des coordonnées valides

  // Détecter si on a un landmark critique
  const hasCriticalLandmark = landmarks.some((l) =>
    l.description ? isCriticalLandmark(l.description) : false,
  )

  console.log(
    `📊 [prioritizeResults] hasMapsScreenshot=${hasMapsScreenshot}, hasCriticalLandmark=${hasCriticalLandmark}`,
  )

  // Appliquer les coefficients de priorité
  const prioritizedResults = validResults.map((result) => {
    let score = result.confidence || 0.5

    // + Priorité landmark
    if (result.source?.includes("LANDMARK") || result.source === "VISION_LANDMARK") {
      score += hasCriticalLandmark ? 0.6 : 0.3
      console.log(
        `  ✅ [prioritizeResults] Landmark détecté: +${hasCriticalLandmark ? 0.6 : 0.3} → ${score.toFixed(2)}`,
      )
    }

    // + Priorité OCR précis
    if (
      result.source?.includes("OCR") ||
      result.source === "OCR_GEOCODING" ||
      result.source === "VISION_GEOCODING"
    ) {
      score += 0.4
      console.log(`  ✅ [prioritizeResults] OCR détecté: +0.4 → ${score.toFixed(2)}`)
    }

    // + Priorité EXIF (toujours très haute)
    if (result.source === "EXIF") {
      score += 0.2 // EXIF est déjà très fiable, on augmente juste un peu
      console.log(`  ✅ [prioritizeResults] EXIF détecté: +0.2 → ${score.toFixed(2)}`)
    }

    // + Priorité Screenshot Maps (toujours très haute)
    if (result.source === "MAPS_SCREENSHOT") {
      score += 0.3 // Screenshot est déjà très fiable
      console.log(`  ✅ [prioritizeResults] Screenshot Maps détecté: +0.3 → ${score.toFixed(2)}`)
    }

    // - Dépriorisation StreetView si screenshot ou landmark critique
    if (
      result.source?.includes("STREETVIEW") ||
      result.source === "STREETVIEW_VISUAL_MATCH"
    ) {
      if (hasCriticalLandmark) {
        score -= 0.5
        console.log(
          `  ⚠️ [prioritizeResults] StreetView dépriorisé (landmark critique): -0.5 → ${score.toFixed(2)}`,
        )
      }
      if (hasMapsScreenshot) {
        score -= 0.4
        console.log(
          `  ⚠️ [prioritizeResults] StreetView dépriorisé (screenshot détecté): -0.4 → ${score.toFixed(2)}`,
        )
      }
    }

    // Score borné entre 0 et 1
    score = Math.max(0, Math.min(1, score))

    return {
      ...result,
      confidence: score,
    }
  })

  // Trier par score décroissant
  prioritizedResults.sort((a, b) => (b.confidence || 0) - (a.confidence || 0))

  const best = prioritizedResults[0]
  if (best) {
    console.log(
      `🎯 [prioritizeResults] Meilleur candidat après rééquilibrage: ${best.source} (score: ${best.confidence.toFixed(2)})`,
    )
  }

  return prioritizedResults
}

