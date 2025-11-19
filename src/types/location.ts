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
    pages?: Array<{
      property?: {
        detectedLanguages?: Array<{ languageCode: string; confidence: number }>
      }
    }>
  }
  labelAnnotations?: Array<{
    description: string
    score: number
    mid?: string
  }>
  landmarkAnnotations?: Array<{
    description: string
    score: number
    locations?: Array<{
      latLng?: {
        latitude: number
        longitude: number
      }
    }>
  }>
  logoAnnotations?: Array<{
    description: string
    score: number
    boundingPoly?: {
      vertices: Array<{ x?: number; y?: number }>
    }
  }>
}

export type ExifData = {
  lat?: number
  lng?: number
}

export type LLMLocationGuess = {
  city: string | null
  area: string | null
  latitude: number | null
  longitude: number | null
  confidence: number // 0-1
}

export type LLMLocationContext = {
  departementCode: string
  departementName: string
  city?: string | null
  postalCode?: string | null
  categories?: string[]
  notes?: string | null
}

export type MultiImageRawResult = {
  imageIndex: number
  source: string // EXIF, VISION_LANDMARK, VISION_GEOCODING, VISION_CONTEXT_FALLBACK, AI_GEOGUESSR
  latitude: number | null
  longitude: number | null
  confidence: number
  address?: string
}

export type ConsolidatedLocalization = {
  latitude: number | null
  longitude: number | null
  confidence: number // 0-1
  source: "MULTI_IMAGE_CONSOLIDATED"
  address: string
  individualResults?: MultiImageRawResult[]
  warning?: string
}

export type LocationFromImageResult = {
  status: "ok" | "error"
  source?: "EXIF" | "VISION_GEOCODING" | "VISION_LANDMARK" | "VISION_CONTEXT_FALLBACK" | "AI_GEOGUESSR" | "MANUAL" | "MULTI_IMAGE_CONSOLIDATED"
  error?: string
  warning?: string
  autoLocation?: {
    address: string
    latitude: number
    longitude: number
    confidence: number
    streetViewUrl?: string
  }
  candidates?: GeocodedCandidate[]
  individualResults?: MultiImageRawResult[] // Pour multi-images
}
