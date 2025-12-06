/**
 * 🎯 Types pour le module de localisation
 */

/**
 * Hints structurés fournis par l'utilisateur pour enrichir la localisation
 */
export type LocalizationUserHints = {
  // A. Infos de base
  city?: string
  postalCode?: string
  propertyType?: "maison" | "appartement" | "immeuble" | "terrain" | "local" | "autre"
  roomsApprox?: "T1" | "T2" | "T3" | "T4" | "T5plus"
  priceRange?: { min?: number; max?: number } // en euros
  surfaceHabitableRange?: { min?: number; max?: number } // m²

  // B. Gabarit
  housingTypeDetails?: {
    maisonMitoyennete?: 0 | 1 | 2 // 0 = isolée, 1 = mitoyenne 1 côté, 2 = mitoyenne 2 côtés
    terrainSurfaceRange?: { min?: number; max?: number } // m²
    appartEtage?: "rdc" | "1-2" | "3plus" | "inconnu"
    balconOuTerrasse?: boolean
  }
  constructionPeriod?: "avant1950" | "1950-1980" | "1980-2000" | "2000-2015" | "apres2015" | "inconnu"

  // C. Environnement
  quartierType?: "centre_bourg" | "lotissement_recent" | "zone_pavillonnaire" | "campagne_isolee" | "bord_route" | "inconnu"
  piscine?: "aucune" | "oui_rectangulaire" | "oui_autre_forme" | "inconnu"
  vue?: "village" | "vignes" | "foret" | "champs" | "rue_commercante" | "autre" | "inconnu"
  repereProche?: {
    type?: "ecole" | "mairie" | "supermarche" | "autre"
    nom?: string // ex: "Carrefour Market", "Ecole Jules Ferry"
    distanceMinutes?: number // ex: 5
  }

  // D. Divers
  notesLibres?: string // texte court supplémentaire
}

/**
 * Input brut pour une requête de localisation
 */
export type LocalisationRawInput = {
  url?: string
  text?: string
  images?: string[] // URLs ou base64
  hintPostalCode?: string
  hintCity?: string
}

/**
 * Input utilisateur pour la localisation (nouvelle interface)
 */
export interface LocalisationInput {
  method: 'image' | 'url' | 'text'
  imageFile?: File // Première image (pour compatibilité)
  imageFiles?: File[] // Toutes les images
  imageUrl?: string // URL de la première image (pour compatibilité)
  imageUrls?: string[] // URLs de toutes les images
  url?: string
  description?: string
  hints?: LocalisationHints
  selectedZone?: SearchZone // Zone de recherche géographique
}

/**
 * Hints simplifiés pour la nouvelle interface
 */
export interface LocalisationHints {
  codePostal?: string
  ville?: string
  typeBien?: 'appartement' | 'maison' | 'terrain' | 'commerce'
  surfaceMin?: number
  surfaceMax?: number
  prixMin?: number
  prixMax?: number
  pieces?: number
  caracteristiques?: {
    piscine?: boolean
    jardin?: boolean
    vueMer?: boolean
    balcon?: boolean
    parking?: boolean
  }
}

/**
 * Hypothèse de localisation
 */
export interface LocalisationHypothese {
  id: string
  adresse: string
  codePostal: string
  ville: string
  coordonnees: { lat: number; lng: number }
  scoreConfiance: number // 0-100
  distanceHints: number // km
  parcellesCadastrales?: string[]
  images?: string[]
  similarieteVisuelle?: number
  scoreImage?: number
  scorePiscine?: number
  scoreToiture?: number
  scoreTerrain?: number
  scoreHints?: number
  satelliteImageUrl?: string
  cadastralUrl?: string
  streetViewUrl?: string
}

/**
 * Zone de recherche géographique
 */
export interface SearchZone {
  placeId: string
  label: string
  lat: number
  lng: number
  radiusKm: number // 0 = strictement dans les bounds, > 0 = rayon en km
  bounds?: {
    north: number
    south: number
    east: number
    west: number
  }
}

/**
 * Résultat complet de localisation
 */
export interface LocalisationResult {
  id: string
  timestamp: Date
  input: LocalisationInput
  hypotheses: LocalisationHypothese[]
  precisionMoyenne: number
  tempsAnalyse: number // ms
  // Flag pour indiquer qu'aucun candidat n'a été trouvé dans la zone (contrainte dure)
  noCandidatesInZone?: boolean
}


