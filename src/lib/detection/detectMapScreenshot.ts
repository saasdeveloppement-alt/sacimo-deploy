/**
 * Détection de screenshots Google Maps
 * Détecte si une image est une capture d'écran de Google Maps
 */

import { callVisionForImage } from "@/lib/google/locationClient"

export interface MapScreenshotDetection {
  isGoogleMaps: boolean
  confidence: number
  indicators: string[]
}

/**
 * Détecte si l'image est un screenshot Google Maps
 * @param imageBuffer Buffer de l'image
 * @returns Résultat de la détection
 */
export async function detectMapScreenshot(
  imageBuffer: Buffer,
): Promise<MapScreenshotDetection> {
  try {
    // Appeler Vision API pour OCR et détection de logos
    const visionResult = await callVisionForImage(imageBuffer)

    const indicators: string[] = []
    let confidence = 0

    // 1. Détection du texte "Google" dans l'image
    const fullText = visionResult.fullTextAnnotation?.text || ""
    const textLower = fullText.toLowerCase()

    // Indicateurs forts
    if (textLower.includes("google")) {
      indicators.push("Texte 'Google' détecté")
      confidence += 0.4
    }

    if (textLower.includes("street view") || textLower.includes("streetview")) {
      indicators.push("Texte 'Street View' détecté")
      confidence += 0.3
    }

    if (textLower.includes("© google") || textLower.includes("copyright google")) {
      indicators.push("Copyright Google détecté")
      confidence += 0.25
    }

    // 2. Détection de patterns de coordonnées Google Maps
    const coordPattern = /@([-0-9\.]+),([-0-9\.]+)/g
    const coordMatches = fullText.match(coordPattern)
    if (coordMatches && coordMatches.length > 0) {
      indicators.push(`Coordonnées Google Maps détectées: ${coordMatches[0]}`)
      confidence += 0.5
    }

    // 3. Détection d'URLs Google Maps
    const mapsUrlPattern = /maps\.google\.(com|fr|co\.uk)/gi
    const urlMatches = fullText.match(mapsUrlPattern)
    if (urlMatches && urlMatches.length > 0) {
      indicators.push("URL Google Maps détectée")
      confidence += 0.3
    }

    // 4. Détection de logos Google
    const logos = visionResult.logoAnnotations || []
    const googleLogos = logos.filter(
      (logo) => logo.description?.toLowerCase().includes("google"),
    )
    if (googleLogos.length > 0) {
      indicators.push(`Logo Google détecté (${googleLogos[0].description})`)
      confidence += 0.35
    }

    // 5. Détection de labels typiques de Google Maps
    const labels = visionResult.labelAnnotations || []
    const mapRelatedLabels = [
      "map",
      "navigation",
      "street view",
      "satellite",
      "geographic location",
      "route",
    ]
    const foundLabels = labels.filter((label) =>
      mapRelatedLabels.some((mapLabel) =>
        label.description?.toLowerCase().includes(mapLabel),
      ),
    )
    if (foundLabels.length > 0) {
      indicators.push(`Labels cartographiques détectés: ${foundLabels.map(l => l.description).join(", ")}`)
      confidence += 0.15
    }

    // 6. Détection de patterns d'adresse typiques de Google Maps UI
    const addressPatterns = [
      /\d+\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s]+,\s*\d{5}\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+/i,
      /[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+\s+\d+/i,
    ]
    const hasAddressPattern = addressPatterns.some((pattern) =>
      pattern.test(fullText),
    )
    if (hasAddressPattern && coordMatches) {
      indicators.push("Pattern d'adresse + coordonnées détecté")
      confidence += 0.2
    }

    // Normaliser la confiance entre 0 et 1
    confidence = Math.min(confidence, 1)

    // Seuil de détection : >= 0.5 pour considérer comme Google Maps
    const isGoogleMaps = confidence >= 0.5

    return {
      isGoogleMaps,
      confidence,
      indicators,
    }
  } catch (error: any) {
    console.error("❌ [detectMapScreenshot] Erreur:", error)
    return {
      isGoogleMaps: false,
      confidence: 0,
      indicators: [`Erreur: ${error.message}`],
    }
  }
}

