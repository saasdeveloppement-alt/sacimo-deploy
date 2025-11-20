/**
 * Extraction de localisation depuis un screenshot Google Maps
 * Extrait les coordonnées GPS et/ou l'adresse depuis une capture d'écran
 */

import { callVisionForImage } from "@/lib/google/locationClient"
import { geocodeAddressCandidates } from "@/lib/google/locationClient"
import type { AddressCandidate } from "@/types/location"

export interface MapsScreenshotLocation {
  lat: number | null
  lng: number | null
  address: string | null
  method: "MAPS_SCREENSHOT"
  confidence: number
  source: "coordinates" | "address" | "url" | null
}

/**
 * Extrait la localisation depuis un screenshot Google Maps
 * @param imageBuffer Buffer de l'image
 * @returns Localisation extraite
 */
export async function extractLocationFromMapsScreenshot(
  imageBuffer: Buffer,
): Promise<MapsScreenshotLocation> {
  try {
    // Appeler Vision API pour OCR complet
    const visionResult = await callVisionForImage(imageBuffer)
    const fullText = visionResult.fullTextAnnotation?.text || ""

    console.log("📍 [extractFromMapsScreenshot] Texte extrait:", fullText.substring(0, 200))

    // 1. Recherche de coordonnées Google Maps (@lat,lng)
    const coordPattern = /@([-0-9\.]+),([-0-9\.]+)/g
    const coordMatches = Array.from(fullText.matchAll(coordPattern))

    if (coordMatches.length > 0) {
      // Prendre la première occurrence (généralement la plus visible)
      const match = coordMatches[0]
      const lat = parseFloat(match[1])
      const lng = parseFloat(match[2])

      // Valider les coordonnées (France métropolitaine approximative)
      if (
        lat >= 41.0 &&
        lat <= 51.0 &&
        lng >= -5.0 &&
        lng <= 10.0
      ) {
        console.log(
          `✅ [extractFromMapsScreenshot] Coordonnées trouvées: ${lat}, ${lng}`,
        )

        // Essayer de trouver une adresse dans le texte pour enrichir
        const addressPattern = /(\d+\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s]+,\s*\d{5}\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+)/i
        const addressMatch = fullText.match(addressPattern)
        const address = addressMatch ? addressMatch[1].trim() : null

        return {
          lat,
          lng,
          address,
          method: "MAPS_SCREENSHOT",
          confidence: 0.98, // Très haute confiance pour coordonnées directes
          source: "coordinates",
        }
      }
    }

    // 2. Recherche d'adresse complète dans le texte
    const addressPatterns = [
      // Format: "45 Bd Raspail, 75006 Paris"
      /(\d+\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s]+,\s*\d{5}\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+)/i,
      // Format: "Rue de la Paix, 75001 Paris"
      /([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s]+,\s*\d{5}\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+)/i,
      // Format: "75006 Paris" (moins précis)
      /(\d{5}\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+)/i,
    ]

    for (const pattern of addressPatterns) {
      const matches = fullText.match(pattern)
      if (matches && matches.length > 0) {
        const addressText = matches[1].trim()
        console.log(
          `📍 [extractFromMapsScreenshot] Adresse trouvée: ${addressText}`,
        )

        // Géocoder l'adresse
        const candidates: AddressCandidate[] = [
          {
            rawText: `${addressText}, France`,
            score: 0.9,
          },
        ]

        const geocoded = await geocodeAddressCandidates(candidates, {
          country: "France",
        })

        if (geocoded.length > 0) {
          const best = geocoded[0]
          return {
            lat: best.latitude,
            lng: best.longitude,
            address: best.address,
            method: "MAPS_SCREENSHOT",
            confidence: 0.85, // Bonne confiance pour adresse géocodée
            source: "address",
          }
        }
      }
    }

    // 3. Recherche d'URL Google Maps partielle
    const urlPattern = /maps\.google\.(com|fr|co\.uk)[\/\?@]*([-0-9\.]+),([-0-9\.]+)/gi
    const urlMatches = Array.from(fullText.matchAll(urlPattern))

    if (urlMatches.length > 0) {
      const match = urlMatches[0]
      const lat = parseFloat(match[2])
      const lng = parseFloat(match[3])

      if (
        lat >= 41.0 &&
        lat <= 51.0 &&
        lng >= -5.0 &&
        lng <= 10.0
      ) {
        console.log(
          `✅ [extractFromMapsScreenshot] Coordonnées depuis URL: ${lat}, ${lng}`,
        )

        return {
          lat,
          lng,
          address: null,
          method: "MAPS_SCREENSHOT",
          confidence: 0.92,
          source: "url",
        }
      }
    }

    // Aucune localisation trouvée
    return {
      lat: null,
      lng: null,
      address: null,
      method: "MAPS_SCREENSHOT",
      confidence: 0,
      source: null,
    }
  } catch (error: any) {
    console.error("❌ [extractLocationFromMapsScreenshot] Erreur:", error)
    return {
      lat: null,
      lng: null,
      address: null,
      method: "MAPS_SCREENSHOT",
      confidence: 0,
      source: null,
    }
  }
}

