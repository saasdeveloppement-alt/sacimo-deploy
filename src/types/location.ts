/**
 * Types partagés pour le système de localisation par images
 */

export type AddressCandidate = {
  rawText: string
  score: number // Confiance heuristique (0-1)
}

export type GeocodedCandidate = {
  address: string
  latitude: number
  longitude: number
  geocodingScore: number // Score de confiance du géocodage (0-1)
  streetViewUrl?: string
  sourceText: string
  globalScore: number // Score global combiné (0-1)
}

export type VisionResult = {
  textAnnotations?: Array<{
    description: string
    boundingPoly?: {
      vertices: Array<{ x?: number; y?: number }>
    }
  }>
  fullTextAnnotation?: {
    text: string
  }
  labelAnnotations?: Array<{
    description: string
    score: number
  }>
}

export type ExifData = {
  lat?: number
  lng?: number
}

export type LocationFromImageResult = {
  status: "ok" | "error"
  source?: "EXIF" | "VISION_GEOCODING" | "MANUAL"
  error?: string
  autoLocation?: {
    address: string
    latitude: number
    longitude: number
    confidence: number
    streetViewUrl?: string
  }
  candidates?: GeocodedCandidate[]
}

