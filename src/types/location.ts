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
  streetViewMode?: boolean // Mode spécialisé pour Street View
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
  source?: "MAPS_SCREENSHOT" | "EXIF" | "VISION_LANDMARK" | "STREETVIEW_VISUAL_MATCH" | "VISION_GEOCODING" | "VISION_CONTEXT_FALLBACK" | "AI_GEOGUESSR" | "MANUAL" | "MULTI_IMAGE_CONSOLIDATED" | "OCR_GEOCODING"
  error?: string
  warning?: string
  autoLocation?: {
    address: string
    latitude: number
    longitude: number
    confidence: number
    streetViewUrl?: string // Image statique
    streetViewEmbedUrl?: string // Iframe interactive
    heading?: number // Angle de vue en degrés (0-360)
  }
  candidates?: GeocodedCandidate[]
  individualResults?: MultiImageRawResult[] // Pour multi-images
  needsManualCorrection?: boolean // Si score < 70%
  explanation?: LocationExplanation // Explication de la localisation
}

export type LocationResult = {
  source: string
  latitude: number | null
  longitude: number | null
  address: string | null
  confidence: number
  streetViewUrl?: string // Image statique
  streetViewEmbedUrl?: string // Iframe interactive
  heading?: number // Angle de vue en degrés (0-360)
  method?: string
  evidences?: EvidenceItem[] // Indices utilisés pour cette localisation
}

export type EvidenceItem = {
  type:
    | "OCR_TEXT"
    | "LANDMARK"
    | "STREETVIEW_MATCH"
    | "GOOGLE_MAPS_SCREENSHOT"
    | "ARCHITECTURE_STYLE"
    | "ROAD_MARKING"
    | "SHOP_SIGN"
    | "LLM_REASONING"
    | "DEPARTMENT_LOCK"
    | "EXIF_GPS"
  label: string // ex: "Enseigne SEPHORA détectée"
  detail: string // ex: "Texte OCR : 'SEPHORA'"
  weight: number // 0–1 importance relative
}

export type LocationExplanation = {
  summary: string // phrase courte récapitulative
  evidences: EvidenceItem[] // liste des indices utilisés
}
