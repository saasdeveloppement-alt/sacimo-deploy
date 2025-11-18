/**
 * Client Google pour la localisation par images
 * - Google Cloud Vision API (OCR)
 * - Google Geocoding API
 * - Google Street View Static API
 * - Lecture EXIF
 */

import exifr from "exifr"
import type {
  VisionResult,
  AddressCandidate,
  GeocodedCandidate,
  ExifData,
} from "@/types/location"

const GOOGLE_VISION_API_KEY = process.env.GOOGLE_CLOUD_VISION_API_KEY
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

/**
 * Appelle Google Cloud Vision API pour extraire le texte d'une image
 */
export async function callVisionForImage(
  imageBuffer: Buffer,
): Promise<VisionResult> {
  if (!GOOGLE_VISION_API_KEY) {
    throw new Error("GOOGLE_CLOUD_VISION_API_KEY non configurée")
  }

  // Encoder l'image en base64
  const base64Image = imageBuffer.toString("base64")

  const url = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: "TEXT_DETECTION",
              maxResults: 10,
            },
            {
              type: "LABEL_DETECTION",
              maxResults: 10,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Google Vision API error: ${response.status} - ${errorText}`,
    )
  }

  const data = await response.json()

  if (data.responses?.[0]?.error) {
    throw new Error(
      `Google Vision API error: ${data.responses[0].error.message}`,
    )
  }

  return data.responses[0] || {}
}

/**
 * Extrait les candidats d'adresse depuis le résultat Vision
 */
export function extractAddressCandidatesFromVision(
  visionResult: VisionResult,
  context?: { city?: string; postalCode?: string; country?: string },
): AddressCandidate[] {
  const candidates: AddressCandidate[] = []
  const fullText = visionResult.fullTextAnnotation?.text || ""

  if (!fullText) {
    return candidates
  }

  // Patterns pour détecter les adresses françaises
  const addressPatterns = [
    // Numéro + Rue (ex: "15 Rue de la Paix")
    /\d+\s+(?:rue|avenue|boulevard|place|chemin|impasse|allée|route|passage)\s+[^\n,]+/gi,
    // Code postal + Ville (ex: "75001 Paris")
    /\d{5}\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s-]+/gi,
    // Adresse complète (ex: "15 Rue de la Paix, 75001 Paris")
    /\d+\s+(?:rue|avenue|boulevard|place|chemin|impasse|allée|route|passage)\s+[^\n,]+,\s*\d{5}\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s-]+/gi,
  ]

  const foundAddresses = new Set<string>()

  for (const pattern of addressPatterns) {
    const matches = fullText.match(pattern)
    if (matches) {
      for (const match of matches) {
        const cleaned = match.trim()
        if (cleaned.length > 5 && !foundAddresses.has(cleaned)) {
          foundAddresses.add(cleaned)

          // Calculer un score de confiance
          let score = 0.5

          // Bonus si contient un code postal
          if (/\d{5}/.test(cleaned)) {
            score += 0.2
          }

          // Bonus si contient un numéro de rue
          if (/^\d+/.test(cleaned)) {
            score += 0.1
          }

          // Bonus si correspond au contexte (ville, code postal)
          if (context) {
            if (context.postalCode && cleaned.includes(context.postalCode)) {
              score += 0.15
            }
            if (context.city && cleaned.toLowerCase().includes(context.city.toLowerCase())) {
              score += 0.15
            }
          }

          // Bonus si contient des mots-clés d'adresse
          const addressKeywords = [
            "rue",
            "avenue",
            "boulevard",
            "place",
            "chemin",
            "impasse",
            "allée",
          ]
          if (
            addressKeywords.some((keyword) =>
              cleaned.toLowerCase().includes(keyword),
            )
          ) {
            score += 0.1
          }

          score = Math.min(1, score) // Cap à 1

          candidates.push({
            rawText: cleaned,
            score,
          })
        }
      }
    }
  }

  // Si aucun pattern trouvé, essayer d'extraire des textes qui ressemblent à des adresses
  if (candidates.length === 0) {
    // Chercher des lignes qui contiennent un code postal
    const lines = fullText.split("\n").filter((line) => line.trim().length > 0)
    for (const line of lines) {
      if (/\d{5}/.test(line)) {
        const cleaned = line.trim()
        if (cleaned.length > 5 && !foundAddresses.has(cleaned)) {
          foundAddresses.add(cleaned)
          candidates.push({
            rawText: cleaned,
            score: 0.4, // Score plus bas car moins sûr
          })
        }
      }
    }
  }

  // Trier par score décroissant
  return candidates.sort((a, b) => b.score - a.score)
}

/**
 * Géocode une liste de candidats d'adresse
 */
export async function geocodeAddressCandidates(
  candidates: AddressCandidate[],
): Promise<GeocodedCandidate[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY non configurée")
  }

  const geocoded: GeocodedCandidate[] = []

  for (const candidate of candidates) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        candidate.rawText,
      )}&key=${GOOGLE_MAPS_API_KEY}&region=fr`

      const response = await fetch(url)

      if (!response.ok) {
        console.warn(
          `Erreur géocodage pour "${candidate.rawText}": ${response.status}`,
        )
        continue
      }

      const data = await response.json()

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const result = data.results[0]
        const location = result.geometry.location

        // Calculer un score de géocodage basé sur la précision
        let geocodingScore = 0.7 // Base

        // Bonus selon le type de résultat
        const locationType = result.geometry.location_type
        if (locationType === "ROOFTOP") {
          geocodingScore = 0.95
        } else if (locationType === "RANGE_INTERPOLATED") {
          geocodingScore = 0.85
        } else if (locationType === "GEOMETRIC_CENTER") {
          geocodingScore = 0.75
        } else if (locationType === "APPROXIMATE") {
          geocodingScore = 0.65
        }

        // Score global = moyenne pondérée
        const globalScore = (candidate.score * 0.4 + geocodingScore * 0.6)

        const streetViewUrl = fetchStreetViewPreview(
          location.lat,
          location.lng,
        )

        geocoded.push({
          address: result.formatted_address,
          latitude: location.lat,
          longitude: location.lng,
          geocodingScore,
          streetViewUrl,
          sourceText: candidate.rawText,
          globalScore,
        })
      } else {
        console.warn(
          `Géocodage échoué pour "${candidate.rawText}": ${data.status}`,
        )
      }
    } catch (error) {
      console.error(
        `Erreur lors du géocodage de "${candidate.rawText}":`,
        error,
      )
    }
  }

  // Trier par score global décroissant
  return geocoded.sort((a, b) => b.globalScore - a.globalScore)
}

/**
 * Génère une URL d'image Street View Static
 */
export function fetchStreetViewPreview(
  lat: number,
  lng: number,
  size: string = "400x300",
): string {
  if (!GOOGLE_MAPS_API_KEY) {
    return ""
  }

  return `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&heading=0&pitch=0&fov=90`
}

/**
 * Lit les données EXIF d'une image pour extraire les coordonnées GPS
 */
export async function readExifFromImage(
  imageBuffer: Buffer,
): Promise<ExifData> {
  try {
    const exifData = await exifr.parse(imageBuffer, {
      gps: true,
      translateKeys: false,
    })

    if (exifData?.latitude && exifData?.longitude) {
      return {
        lat: exifData.latitude,
        lng: exifData.longitude,
      }
    }

    // Essayer avec les clés alternatives
    if (exifData?.GPSLatitude && exifData?.GPSLongitude) {
      return {
        lat: exifData.GPSLatitude,
        lng: exifData.GPSLongitude,
      }
    }

    return {}
  } catch (error) {
    console.warn("Erreur lors de la lecture EXIF:", error)
    return {}
  }
}

