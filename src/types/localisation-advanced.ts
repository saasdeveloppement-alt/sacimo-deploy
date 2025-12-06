/**
 * Types TypeScript pour le système de localisation immobilière IA avancé
 */

// ============================================================================
// PHASE 1: ANALYSE VISUELLE
// ============================================================================

export interface ImageAnalysisResult {
  // Caractéristiques architecturales
  typeBien: 'maison' | 'appartement' | 'immeuble' | 'villa' | 'terrain' | 'inconnu';
  styleArchitectural: string; // "Provençale", "Contemporaine", "Haussmannienne", etc.
  materiaux: {
    facade: string[]; // ["Pierre", "Crépi blanc", "Brique"]
    toiture: string[]; // ["Tuiles rouges", "Ardoise", "Zinc"]
  };
  
  // Éléments distinctifs
  elementsExterieurs: {
    piscine?: {
      presente: boolean;
      forme: 'rectangulaire' | 'ronde' | 'haricot' | 'personnalisée' | 'inconnue';
      dimensions?: { longueur?: number; largeur?: number };
      position: string; // "arrière de la maison", "côté jardin"
    };
    jardin?: {
      present: boolean;
      surface: 'petit' | 'moyen' | 'grand' | 'inconnu';
      vegetation: string[]; // ["Palmiers", "Pins", "Pelouse"]
    };
    terrasse?: boolean;
    balcon?: boolean;
    garage?: boolean;
    portail?: boolean;
  };
  
  // Indices géographiques
  indicesGeographiques: {
    climat: 'méditerranéen' | 'océanique' | 'continental' | 'montagnard' | 'inconnu';
    vegetation: string[]; // Permet de déduire la région
    altitude: 'plaine' | 'colline' | 'montagne' | 'inconnu';
    proximite: string[]; // ["mer", "forêt", "ville"]
  };
  
  // Orientation et ensoleillement
  orientation?: {
    facadePrincipale: 'nord' | 'sud' | 'est' | 'ouest';
    confidence: number;
  };
  
  // Indices visuels uniques
  signesDistinctifs: string[]; // ["Volets bleus", "Cheminée apparente", "Arbre remarquable"]
  
  // Métadonnées de l'image
  metadata?: {
    gpsCoordinates?: { lat: number; lng: number };
    dateCapture?: string;
  };
  
  // Score de qualité de l'analyse
  confidenceScore: number; // 0-100
  
  // Détections explicites pour contraintes dures (NOUVEAU)
  hasPoolFromImage: boolean;           // Piscine détectée sur l'image
  poolConfidenceImage: number;        // 0-1
  hasGardenFromImage: boolean;         // Jardin/extérieur détecté sur l'image
  gardenConfidenceImage: number;       // 0-1
}

// ============================================================================
// PHASE 1: EXTRACTION URL
// ============================================================================

export interface UrlExtractionResult {
  source: 'leboncoin' | 'seloger' | 'pap' | 'bienici' | 'autre';
  
  // Informations structurées
  localisation?: {
    ville?: string;
    codePostal?: string;
    quartier?: string;
    departement?: string;
    region?: string;
  };
  
  // Caractéristiques du bien
  caracteristiques?: {
    surface?: number;
    pieces?: number;
    chambres?: number;
    typeBien?: string;
    prix?: number;
  };
  
  // Description textuelle
  description?: string;
  
  // Images supplémentaires
  images?: string[];
  
  // Coordonnées si présentes
  coordinates?: { lat: number; lng: number };
}

// ============================================================================
// PHASE 1: SIGNATURE VISUELLE (NOUVEAU - FOCALISÉE PISCINE)
// ============================================================================

/**
 * Signature visuelle extraite de l'image utilisateur
 * C'est l'empreinte qui servira à matcher avec les candidats
 */
export interface VisualSignature {
  // PISCINE (PRIORITÉ 1)
  hasPool: boolean;
  poolShape: 'rectangular' | 'kidney' | 'L' | 'round' | 'unknown';
  poolOrientation?: number; // angle approximatif en degrés (0-360)
  poolSizeCategory?: 'small' | 'medium' | 'large';
  poolStyle?: {
    color?: 'blue' | 'turquoise' | 'green' | 'unknown';
    border?: 'tile' | 'stone' | 'wood' | 'concrete' | 'unknown';
    position?: 'behind' | 'left' | 'right' | 'front';
    features?: string[]; // ["plage", "terrasse", "pool_house"]
  };
  
  // MAISON
  houseStories?: 1 | 2 | 3;
  roofType?: 'tile_red' | 'tile_flat' | 'slate' | 'flat' | 'unknown';
  roofColor?: string; // couleur précise
  facadeColor?: 'white' | 'beige' | 'stone' | 'other';
  facadeMaterial?: string[];
  
  // VÉGÉTATION
  vegetationHints?: string[]; // ["palmiers", "pins", "haie_dense"]
  
  // AUTRES ÉLÉMENTS DISTINCTIFS
  otherNotableFeatures?: string[]; // ["pergola", "portail", "cheminée"]
  
  // MÉTADONNÉES
  confidence: number; // 0-100
}

// ============================================================================
// PHASE 2: RÉDUCTION DE ZONE (MODE STRICT POSTAL)
// ============================================================================

/**
 * Zone de recherche STRICTEMENT bornée par code postal
 * Mode "machine de guerre" : aucune extension automatique
 */
export interface StrictSearchZone {
  // Code postal (OBLIGATOIRE en mode strict)
  postalCode: string;
  
  // Centre géographique du code postal
  center: { lat: number; lng: number };
  
  // Rayon optionnel (en km) - appliqué MAIS reste dans le CP
  radiusKm?: number; // Si défini, cercle autour du centre, mais filtré par CP
  
  // Polygon ou bounding box du code postal (pour filtrage strict)
  polygon?: GeoJSON.Polygon;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  
  // Mode de recherche
  mode: 'STRICT_POSTAL_ZONE'; // Mode strict activé
}

/**
 * Ancien SearchZone (gardé pour compatibilité)
 * @deprecated Utiliser StrictSearchZone pour le nouveau pipeline
 */
export interface SearchZone {
  // Zone géographique
  center: { lat: number; lng: number };
  radius: number; // en mètres
  
  // Contraintes
  constraints: {
    codePostaux?: string[];
    communes?: string[];
    departements?: string[];
    bbox?: { north: number; south: number; east: number; west: number };
  };
  
  // Critères de filtrage
  filters: {
    typeBien?: string;
    surfaceMin?: number;
    surfaceMax?: number;
    prixMin?: number;
    prixMax?: number;
  };
  
  // Niveau de confiance sur la zone
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Tuile géographique pour scan satellite
 */
export interface GeoTile {
  id: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  center: { lat: number; lng: number };
  zoom: number;
  satelliteUrl?: string;
}

// ============================================================================
// PHASE 3: DÉTECTION DE PISCINES (CANDIDAT LOCATION)
// ============================================================================

/**
 * Candidat localisation détecté par scan satellite
 * Avant scoring détaillé
 */
export interface CandidateLocation {
  id: string;
  lat: number;
  lng: number;
  source: 'pool_detection'; // Source de la détection
  rawSatelliteTileRef: string; // Référence à la tuile satellite utilisée
  poolDetected: boolean; // Piscine détectée sur satellite
  poolShape?: 'rectangular' | 'kidney' | 'L' | 'round' | 'unknown';
  poolSizeCategory?: 'small' | 'medium' | 'large';
  // Adresse (récupérée via reverse geocoding)
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
  };
}

// ============================================================================
// PHASE 4: SCORING DÉTAILLÉ
// ============================================================================

/**
 * Breakdown détaillé du score de matching
 */
export interface ScoreBreakdown {
  poolShapeMatch: number;      // 0-100
  poolOrientationMatch: number; // 0-100
  poolSizeMatch: number;        // 0-100
  houseStyleMatch: number;      // 0-100
  roofMatch: number;            // 0-100
  vegetationMatch: number;     // 0-100
  cadastreMatch: number;        // 0-100
  streetViewMatch: number;      // 0-100
}

/**
 * Candidat avec score détaillé
 */
export interface ScoredCandidate extends CandidateLocation {
  score: number; // Score global 0-100
  breakdown: ScoreBreakdown;
  explanation: string; // Explication textuelle du matching
  // Adresse complète (reverse geocoded)
  adresse: string;
  codePostal: string;
  ville: string;
}

// ============================================================================
// PHASE 5: ASSETS VISUELS
// ============================================================================

/**
 * Assets visuels pour un candidat
 * OBLIGATOIRE : cadastreUrl doit TOUJOURS être défini
 */
export interface CandidateVisuals {
  satelliteUrl: string;
  cadastreUrl: string; // OBLIGATOIRE - ne peut pas être undefined
  cadastreOverlayUrl?: string; // Alias pour compatibilité
  streetViewUrl?: string;
  streetViewAvailable: boolean;
  // Géométrie de la parcelle (optionnel, pour affichage avancé)
  parcelGeometry?: GeoJSON.Geometry;
}

// ============================================================================
// PHASE 3: CANDIDATS (ANCIEN - GARDÉ POUR COMPATIBILITÉ)
// ============================================================================

export interface SatelliteAnalysis {
  presencePiscine: boolean;
  formePiscine?: 'rectangulaire' | 'ronde' | 'haricot' | 'personnalisée' | 'inconnue';
  surfaceEstimee?: number;
  vegetationDense?: boolean;
  orientationBatiment?: string;
  formeTerrain?: string;
  // Détections explicites pour contraintes dures (NOUVEAU)
  hasPoolFromSatellite: boolean;      // Piscine détectée sur satellite
  poolConfidenceSatellite?: number;   // 0-1
  hasGardenFromSatellite: boolean;     // Jardin/extérieur détecté sur satellite
  gardenConfidenceSatellite?: number; // 0-1
}

export interface MatchingScore {
  global: number; // 0-100
  details: {
    architectureMatch: number;
    piscineSimilarity: number;
    vegetationMatch: number;
    surfaceMatch: number;
    orientationMatch: number;
    contextMatch: number;
  };
}

export interface PropertyCandidate {
  // Identification
  id: string;
  adresse: string;
  codePostal: string;
  ville: string;
  
  // Coordonnées
  coordinates: { lat: number; lng: number };
  
  // Type de bien détecté
  propertyType?: 'house' | 'apartment' | 'land' | 'building' | 'unknown';
  
  // Données cadastrales
  cadastre?: {
    parcelles: string[]; // ["AB 0123", "AB 0124"]
    surfaceTerrain?: number;
    formeParcelle?: string; // Géométrie simplifiée
  };
  
  // Données DVF (si disponibles)
  dvf?: {
    derniereVente?: {
      date: string;
      prix: number;
      surface: number;
    };
  };
  
  // Analyse visuelle satellite
  satelliteAnalysis?: SatelliteAnalysis;
  
  // Score de correspondance
  matchingScore: MatchingScore;
  
  // Justification
  explanation: string;
  
  // Explications détaillées par critère (NOUVEAU)
  explanations?: {
    zone: string;                    // Ex: "Dans la zone définie (33360 La Tresne, rayon 0km)"
    piscine: string;                 // Ex: "Piscine détectée sur la vue satellite"
    jardin: string;                  // Ex: "Jardin détecté sur l'image"
    typeBien: string;                 // Ex: "Correspond au type 'maison'"
    scoreBreakdown: { [key: string]: number }; // Contributions majeures
    violatedConstraints: string[];    // Ex: ["piscine_absente", "wrong_property_type"]
  };
  
  // Flags pour indiquer les problèmes (NOUVEAU)
  flags?: string[];                  // Ex: ["noPoolMatched", "noGardenMatched"]
  
  // Assets visuels
  visuals: VisualsPackage;
}

// ============================================================================
// PHASE 4: ASSETS VISUELS
// ============================================================================

export interface VisualsPackage {
  // Vue satellite haute résolution
  satellite: {
    url: string;
    zoom: number;
    mapType: 'satellite' | 'hybrid';
    markers?: { lat: number; lng: number; label: string }[];
  };
  
  // Street View (si disponible)
  streetView?: {
    url: string;
    panoId?: string;
    heading?: number;
    pitch?: number;
  };
  
  // Plan cadastral
  cadastre?: {
    url: string; // Image du plan cadastral IGN
    parcelles: string[];
    legend?: string;
  };
  
  // Orthophoto IGN
  orthophoto?: {
    url: string;
    resolution: string;
  };
  
  // Carte interactive (embed)
  interactiveMap: {
    embedUrl: string;
    center: { lat: number; lng: number };
    zoom: number;
  };
}

// ============================================================================
// CONTRAINTES DURES vs HINTS
// ============================================================================

/**
 * Contraintes DURES : doivent être respectées strictement
 * Si une contrainte dure n'est pas respectée, le candidat est éliminé ou fortement pénalisé
 */
export interface LocalizationHardConstraints {
  // Zone géographique (CONTRAINTE DURE)
  strictZone: boolean;       // true = commune stricte (radiusKm = 0), false = rayon
  centerLat: number;         // Centre de la zone
  centerLng: number;         // Centre de la zone
  radiusKm: number;          // 0 => commune stricte, >0 => cercle en km
  bounds?: {                 // Bounds de la commune (si strictZone = true)
    north: number;
    south: number;
    east: number;
    west: number;
  };
  communeName?: string;      // Nom de la commune (pour filtrage strict)
  postalCode?: string;        // Code postal (pour filtrage strict)

  // Propriétés structurelles (CONTRAINTES DURES)
  propertyType?: 'house' | 'apartment' | 'land' | 'building' | 'unknown';
  hasPool?: boolean;         // true = piscine obligatoire, false/undefined = optionnel
  hasGarden?: boolean;        // true = jardin/extérieur obligatoire, false/undefined = optionnel
}

/**
 * Hints utilisateur : informations optionnelles qui aident mais ne sont pas obligatoires
 */
export interface LocalisationHints {
  codePostal?: string;
  ville?: string;
  typeBien?: string;
  surfaceMin?: number;
  surfaceMax?: number;
  prixMin?: number;
  prixMax?: number;
}

// ============================================================================
// REQUÊTE/RÉPONSE API
// ============================================================================

export interface LocalizationRequest {
  imageUrl?: string;
  imageFile?: File;
  url?: string;
  description?: string;
  hints?: {
    codePostal?: string;
    ville?: string;
    typeBien?: string;
    surfaceMin?: number;
    surfaceMax?: number;
    prixMin?: number;
    prixMax?: number;
  };
}

/**
 * Réponse API pour le nouveau pipeline strict
 */
export interface StrictLocalizationResponse {
  status: 'ok' | 'no_candidates_in_postal_code' | 'no_pool_found_in_zone' | 'no_coverage_for_postal_code';
  postalCode: string;
  candidates: (ScoredCandidate & { visuals: CandidateVisuals })[];
  meta?: {
    totalCandidates: number;
    bestScore: number;
    worstScore: number;
  };
  message?: string; // Message explicatif si status != 'ok'
}

/**
 * Ancienne réponse (gardée pour compatibilité)
 */
export interface LocalizationResponse {
  success: boolean;
  analysis?: {
    imageAnalysis: ImageAnalysisResult;
    searchZone: SearchZone;
    candidatesCount: number;
    constraints?: LocalizationHardConstraints; // Contraintes appliquées
  };
  candidates: PropertyCandidate[];
  error?: string;
  // Flags pour indiquer les problèmes (NOUVEAU)
  noCandidatesInZone?: boolean;              // Aucun candidat dans la zone
  noCandidatesWithConstraints?: boolean;     // Aucun candidat respectant les contraintes
  fallbackExplanation?: string;              // Explication si fallback utilisé
}

