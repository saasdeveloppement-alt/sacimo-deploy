/**
 * 🎯 PARCEL MATCHER
 * 
 * Match les parcelles candidates avec les images utilisateur et hints
 * Calcule des scores détaillés pour chaque parcelle
 */

import OpenAI from "openai"
import type { LocalizationUserHints } from "@/types/localisation"
import type { LocalizationHardConstraints } from "@/types/localisation-advanced"
import type { ParcelCandidate } from "./parcel-scanner"
import { getDVFData } from "./dvf"
import { scorePrixSurfaceDVF, scoreQuartier, scoreTypologie } from "./hints-scoring"
import { generateSatelliteImage, generateStreetViewImage, generateCadastralImage } from "@/services/visuals/assetGenerator"

// Debug mode
const DEBUG = process.env.LOCALISATION_DEBUG === "true" || process.env.NODE_ENV === "development"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null

export interface MatchedParcel {
  parcel: ParcelCandidate
  scoreTotal: number // 0-100
  scoreImage: number // 0-100
  scorePiscine: number // 0-100
  scoreToiture: number // 0-100
  scoreTerrain: number // 0-100
  scoreHints: number // 0-100
  scoreDVF: number // 0-100
  reasons: string[] // Explications textuelles
  satelliteImageUrl?: string
  cadastralUrl?: string
  streetViewUrl?: string
  // Informations de piscine pour filtrage final
  hasPoolFromImage?: boolean
  hasPoolFromSatellite?: boolean
  hasGardenFromImage?: boolean
  hasGardenFromSatellite?: boolean
  // Type de bien détecté
  propertyType?: 'house' | 'apartment' | 'land' | 'building' | 'unknown'
  // Explications détaillées
  explanations?: {
    zone: string
    piscine: string
    jardin: string
    typeBien: string
    scoreBreakdown: { [key: string]: number }
    violatedConstraints: string[]
  }
  // Flags pour indiquer les problèmes
  flags?: string[]
}

/**
 * Détecte la présence d'une piscine sur une image
 */
async function detectPiscineOnImage(imageUrl: string): Promise<{
  hasPiscine: boolean
  confidence: number
  shape?: "rectangulaire" | "ronde" | "autre"
  position?: { x: number; y: number } // Position relative dans l'image
}> {
  if (!openai) {
    return { hasPiscine: false, confidence: 0 }
  }

  try {
    // Utiliser gpt-4o-mini pour plus de rapidité et moins de coût
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyse cette image immobilière et détecte si une piscine est visible.
              Si oui, indique :
              - hasPiscine: true
              - confidence: score de confiance 0-1
              - shape: "rectangulaire", "ronde", ou "autre"
              - position: {x: 0-1, y: 0-1} position relative dans l'image
              
              Réponds en JSON uniquement.`,
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 150, // Réduire pour plus de rapidité
      response_format: { type: "json_object" },
    })

    const parsed = JSON.parse(response.choices[0].message.content || "{}")
    return {
      hasPiscine: parsed.hasPiscine === true,
      confidence: parsed.confidence || 0,
      shape: parsed.shape,
      position: parsed.position,
    }
  } catch (error) {
    console.warn("⚠️ [Parcel Matcher] Erreur détection piscine:", error)
    return { hasPiscine: false, confidence: 0 }
  }
}

/**
 * Applique les contraintes dures et retourne un score delta + contraintes violées
 */
export function applyHardConstraintsScore(
  candidate: MatchedParcel,
  constraints: LocalizationHardConstraints
): { scoreDelta: number; violatedConstraints: string[]; explanations: { [key: string]: string } } {
  const violatedConstraints: string[] = [];
  const explanations: { [key: string]: string } = {};
  let scoreDelta = 0;

  // 1. CONTRAINTE PISCINE
  if (constraints.hasPool === true) {
    const hasPool = candidate.hasPoolFromImage || candidate.hasPoolFromSatellite;
    if (hasPool) {
      scoreDelta += 30; // Bonus fort
      explanations.piscine = candidate.hasPoolFromImage && candidate.hasPoolFromSatellite
        ? "Piscine détectée sur l'image utilisateur et la vue satellite"
        : candidate.hasPoolFromImage
        ? "Piscine détectée sur l'image utilisateur"
        : "Piscine détectée sur la vue satellite";
    } else {
      scoreDelta -= 50; // Pénalité très forte
      violatedConstraints.push("piscine_absente");
      explanations.piscine = "Aucune piscine détectée alors que l'utilisateur en a indiqué une";
    }
  } else {
    // Pas de contrainte piscine, bonus léger si détectée
    if (candidate.hasPoolFromImage || candidate.hasPoolFromSatellite) {
      scoreDelta += 5;
      explanations.piscine = "Piscine détectée (bonus)";
    }
  }

  // 2. CONTRAINTE JARDIN
  if (constraints.hasGarden === true) {
    const hasGarden = candidate.hasGardenFromImage || candidate.hasGardenFromSatellite;
    if (hasGarden) {
      scoreDelta += 20; // Bonus modéré
      explanations.jardin = candidate.hasGardenFromImage && candidate.hasGardenFromSatellite
        ? "Jardin détecté sur l'image utilisateur et la vue satellite"
        : candidate.hasGardenFromImage
        ? "Jardin détecté sur l'image utilisateur"
        : "Jardin détecté sur la vue satellite";
    } else {
      scoreDelta -= 30; // Pénalité forte
      violatedConstraints.push("jardin_absent");
      explanations.jardin = "Aucun jardin détecté alors que l'utilisateur en a indiqué un";
    }
  } else {
    // Pas de contrainte jardin, bonus léger si détecté
    if (candidate.hasGardenFromImage || candidate.hasGardenFromSatellite) {
      scoreDelta += 3;
      explanations.jardin = "Jardin détecté (bonus)";
    }
  }

  // 3. CONTRAINTE TYPE DE BIEN
  if (constraints.propertyType && constraints.propertyType !== 'unknown') {
    const candidateType = candidate.propertyType || 'unknown';
    if (candidateType === constraints.propertyType) {
      scoreDelta += 20; // Bonus si correspond
      explanations.typeBien = `Correspond au type '${constraints.propertyType}'`;
    } else if (
      (constraints.propertyType === 'house' && candidateType === 'apartment') ||
      (constraints.propertyType === 'apartment' && candidateType === 'house')
    ) {
      scoreDelta -= 40; // Pénalité forte si type opposé
      violatedConstraints.push("wrong_property_type");
      explanations.typeBien = `Type de bien différent : attendu '${constraints.propertyType}', détecté '${candidateType}'`;
    } else {
      scoreDelta -= 20; // Pénalité modérée
      violatedConstraints.push("wrong_property_type");
      explanations.typeBien = `Type de bien différent : attendu '${constraints.propertyType}', détecté '${candidateType}'`;
    }
  }

  if (DEBUG) {
    console.log(`[CONSTRAINTS] Candidat ${candidate.parcel.id}: scoreDelta=${scoreDelta}, violations=${violatedConstraints.length}`);
  }

  return { scoreDelta, violatedConstraints, explanations };
}

/**
 * Score piscine : compare piscine détectée sur image user vs satellite
 * 
 * PONDÉRATIONS (si userHints.piscine indique qu'il y a une piscine) :
 * - +30 points si piscine détectée sur image OU satellite
 * - -40 points si AUCUNE piscine détectée (pénalité forte, presque éliminatoire)
 * 
 * Si l'utilisateur n'a rien dit :
 * - +5 points si piscine détectée (petit bonus, non bloquant)
 */
export async function scorePiscine(
  parcel: ParcelCandidate,
  userImages: string[],
  hints?: LocalizationUserHints
): Promise<{ score: number; reasons: string[]; hasPoolFromImage?: boolean; hasPoolFromSatellite?: boolean }> {
  const reasons: string[] = []
  let score = 50 // Score neutre de base
  let hasPoolFromImage = false
  let hasPoolFromSatellite = false

  // Si hints indiquent "aucune piscine", pénaliser si piscine détectée
  if (hints?.piscine === "aucune") {
    // Détecter piscine sur image satellite
    const satellitePiscine = await detectPiscineOnImage(parcel.satelliteImageUrl)
    hasPoolFromSatellite = satellitePiscine.hasPiscine
    
    if (satellitePiscine.hasPiscine) {
      score -= 30 // Pénalité si piscine détectée mais utilisateur dit "aucune"
      reasons.push("Piscine détectée sur satellite mais utilisateur indique 'aucune'")
    } else {
      score += 10 // Bonus si cohérent
      reasons.push("Aucune piscine détectée, cohérent avec les hints")
    }
    return { score: Math.max(0, Math.min(100, score)), reasons, hasPoolFromImage, hasPoolFromSatellite }
  }

  // Si hints indiquent une piscine (CRITÈRE ULTRA DISCRIMINANT)
  if (hints?.piscine && hints.piscine !== "inconnu" && hints.piscine !== "aucune") {
    console.log(`[POOL] Utilisateur a indiqué piscine: ${hints.piscine}, vérification pour candidat ${parcel.id}`);
    
    // Détecter piscine sur image user
    let userHasPiscine = false
    let userPiscineShape: string | undefined

    for (const img of userImages) {
      const detection = await detectPiscineOnImage(img)
      if (detection.hasPiscine) {
        userHasPiscine = true
        hasPoolFromImage = true
        userPiscineShape = detection.shape
        break
      }
    }

    // Détecter piscine sur image satellite
    const satellitePiscine = await detectPiscineOnImage(parcel.satelliteImageUrl)
    hasPoolFromSatellite = satellitePiscine.hasPiscine

    if (userHasPiscine && satellitePiscine.hasPiscine) {
      // Piscine détectée sur les deux → BONUS FORT
      score += 30
      reasons.push("Piscine détectée sur image utilisateur et satellite")

      // Vérifier la forme si spécifiée
      if (hints.piscine === "oui_rectangulaire" && userPiscineShape === "rectangulaire") {
        score += 10
        reasons.push("Forme rectangulaire confirmée")
      }
    } else if (userHasPiscine && !satellitePiscine.hasPiscine) {
      // Piscine sur user mais pas sur satellite → BONUS MODÉRÉ (peut être masquée)
      score += 20
      reasons.push("Piscine sur image utilisateur (non visible sur satellite, peut être masquée)")
    } else if (!userHasPiscine && satellitePiscine.hasPiscine) {
      // Piscine sur satellite mais pas sur user → BONUS MODÉRÉ
      score += 20
      reasons.push("Piscine détectée sur satellite")
    } else {
      // AUCUNE piscine détectée alors que l'utilisateur en a indiqué une → PÉNALITÉ FORTE
      score -= 40
      reasons.push("Aucune piscine détectée alors que l'utilisateur en a indiqué une (pénalité forte)")
    }
    
    console.log(`[POOL] Candidat ${parcel.id}: hasPoolImage=${hasPoolFromImage}, hasPoolSatellite=${hasPoolFromSatellite}, finalScore=${score}`);
  } else {
    // Si l'utilisateur n'a rien dit, on peut donner un petit bonus mais pas bloquant
    // Détecter piscine sur image user
    for (const img of userImages) {
      const detection = await detectPiscineOnImage(img)
      if (detection.hasPiscine) {
        hasPoolFromImage = true
        score += 5 // Petit bonus
        reasons.push("Piscine détectée sur image utilisateur")
        break
      }
    }

    // Détecter piscine sur image satellite
    const satellitePiscine = await detectPiscineOnImage(parcel.satelliteImageUrl)
    if (satellitePiscine.hasPiscine) {
      hasPoolFromSatellite = true
      if (!hasPoolFromImage) {
        score += 5 // Petit bonus
        reasons.push("Piscine détectée sur satellite")
      }
    }
  }

  return { score: Math.max(0, Math.min(100, score)), reasons, hasPoolFromImage, hasPoolFromSatellite }
}

/**
 * Score toiture : compare couleur et forme de toit
 */
export async function scoreToiture(
  parcel: ParcelCandidate,
  userImages: string[]
): Promise<{ score: number; reasons: string[] }> {
  const reasons: string[] = []
  let score = 50

  if (!openai || userImages.length === 0) {
    return { score, reasons }
  }

  try {
    // Analyser la toiture sur l'image utilisateur
    // Utiliser gpt-4o-mini pour plus de rapidité
    const userAnalysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyse la toiture de ce bâtiment :
              - couleur (rouge, grise, noire, etc.)
              - forme (2 pans, 4 pans, plat, etc.)
              - matériau estimé (tuiles, ardoise, etc.)
              
              Réponds en JSON : {color, shape, material, confidence}`,
            },
            {
              type: "image_url",
              image_url: { url: userImages[0] },
            },
          ],
        },
      ],
      max_tokens: 150,
      response_format: { type: "json_object" },
    })

    const userRoof = JSON.parse(userAnalysis.choices[0].message.content || "{}")

    // Analyser la toiture sur l'image satellite
    const satelliteAnalysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyse la toiture de ce bâtiment sur cette image satellite :
              - couleur
              - forme
              - matériau estimé
              
              Réponds en JSON : {color, shape, material, confidence}`,
            },
            {
              type: "image_url",
              image_url: { url: parcel.satelliteImageUrl },
            },
          ],
        },
      ],
      max_tokens: 150,
      response_format: { type: "json_object" },
    })

    const satelliteRoof = JSON.parse(satelliteAnalysis.choices[0].message.content || "{}")

    // Comparer les caractéristiques
    if (userRoof.color && satelliteRoof.color) {
      if (userRoof.color.toLowerCase() === satelliteRoof.color.toLowerCase()) {
        score += 20
        reasons.push(`Couleur de toiture correspondante : ${userRoof.color}`)
      } else {
        score -= 10
        reasons.push(`Couleur de toiture différente (user: ${userRoof.color}, satellite: ${satelliteRoof.color})`)
      }
    }

    if (userRoof.shape && satelliteRoof.shape) {
      if (userRoof.shape.toLowerCase() === satelliteRoof.shape.toLowerCase()) {
        score += 15
        reasons.push(`Forme de toiture correspondante : ${userRoof.shape}`)
      }
    }

    return { score: Math.max(0, Math.min(100, score)), reasons }
  } catch (error) {
    console.warn("⚠️ [Parcel Matcher] Erreur scoreToiture:", error)
    return { score, reasons }
  }
}

/**
 * Score terrain : compare forme, ombrage, distance piscine → maison
 * Retourne aussi les informations de jardin détecté
 */
export async function scoreTerrain(
  parcel: ParcelCandidate,
  userImages: string[],
  hints?: LocalizationUserHints
): Promise<{ 
  score: number; 
  reasons: string[];
  hasGardenFromImage?: boolean;
  hasGardenFromSatellite?: boolean;
}> {
  const reasons: string[] = []
  let score = 50

  if (!openai || userImages.length === 0) {
    return { score, reasons }
  }

  try {
    // Analyser le terrain sur l'image utilisateur
    const userAnalysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyse le terrain de cette propriété :
              - forme générale (rectangulaire, irrégulière, etc.)
              - présence de terrasse
              - distance estimée entre piscine et maison (si piscine visible)
              - orientation des ombres (pour estimer orientation)
              
              Réponds en JSON : {shape, hasTerrace, poolDistance, shadowOrientation}`,
            },
            {
              type: "image_url",
              image_url: { url: userImages[0] },
            },
          ],
        },
      ],
      max_tokens: 200,
      response_format: { type: "json_object" },
    })

    const userTerrain = JSON.parse(userAnalysis.choices[0].message.content || "{}")
    
    // Détecter jardin sur image utilisateur
    if (userTerrain.hasGarden || userTerrain.hasJardin || userTerrain.hasGarden === true) {
      hasGardenFromImage = true
    }

    // Analyser le terrain sur l'image satellite
    const satelliteAnalysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyse le terrain de cette propriété sur cette image satellite :
              - forme générale
              - présence de terrasse/patio
              - distance entre piscine et bâtiment (si visible)
              - orientation des ombres
              
              Réponds en JSON : {shape, hasTerrace, poolDistance, shadowOrientation}`,
            },
            {
              type: "image_url",
              image_url: { url: parcel.satelliteImageUrl },
            },
          ],
        },
      ],
      max_tokens: 200,
      response_format: { type: "json_object" },
    })

    const satelliteTerrain = JSON.parse(satelliteAnalysis.choices[0].message.content || "{}")
    
    // Détecter jardin sur image satellite
    if (satelliteTerrain.hasGarden || satelliteTerrain.hasJardin || satelliteTerrain.hasGarden === true) {
      hasGardenFromSatellite = true
    }

    // Comparer les caractéristiques
    if (userTerrain.shape && satelliteTerrain.shape) {
      if (userTerrain.shape.toLowerCase() === satelliteTerrain.shape.toLowerCase()) {
        score += 15
        reasons.push("Forme de terrain correspondante")
      }
    }

    if (userTerrain.hasTerrace === satelliteTerrain.hasTerrace) {
      score += 10
      reasons.push("Présence de terrasse cohérente")
    }

    // Vérifier la surface terrain si hint fourni
    if (hints?.housingTypeDetails?.terrainSurfaceRange) {
      // Estimer la surface depuis le satellite
      const estimatedSurface = estimateTerrainSurface(parcel.polygon)
      const { min, max } = hints.housingTypeDetails.terrainSurfaceRange

      if (estimatedSurface >= min * 0.9 && estimatedSurface <= max * 1.1) {
        score += 15
        reasons.push(`Surface terrain cohérente (estimée: ${Math.round(estimatedSurface)}m²)`)
      } else {
        score -= 10
        reasons.push(`Surface terrain différente (estimée: ${Math.round(estimatedSurface)}m², attendu: ${min}-${max}m²)`)
      }
    }

    return { 
      score: Math.max(0, Math.min(100, score)), 
      reasons,
      hasGardenFromImage,
      hasGardenFromSatellite,
    }
  } catch (error) {
    console.warn("⚠️ [Parcel Matcher] Erreur scoreTerrain:", error)
    return { score, reasons, hasGardenFromImage, hasGardenFromSatellite }
  }
}

/**
 * Estime la surface d'un terrain depuis son polygone (formule de Shoelace)
 */
function estimateTerrainSurface(polygon: Array<{ lat: number; lng: number }>): number {
  if (polygon.length < 3) return 0

  let area = 0
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length
    area += polygon[i].lng * polygon[j].lat
    area -= polygon[j].lng * polygon[i].lat
  }
  area = Math.abs(area) / 2

  // Convertir de degrés² en m² (approximation pour la France)
  // 1 degré ≈ 111km, donc 1 degré² ≈ 12,321 km² = 12,321,000,000 m²
  const metersSquared = area * 12321000000

  return Math.round(metersSquared)
}

/**
 * Score basé sur les hints contextuels
 */
export async function scoreContextHints(
  parcel: ParcelCandidate,
  hints?: LocalizationUserHints
): Promise<{ score: number; reasons: string[] }> {
  const reasons: string[] = []
  let score = 50

  if (!hints) {
    return { score, reasons }
  }

  // Score typologie
  const typologieScore = scoreTypologie(
    {
      lat: parcel.centroid.lat,
      lng: parcel.centroid.lng,
      address: parcel.address || "",
      postalCode: parcel.postalCode,
      city: parcel.city,
      sources: {},
      scores: {},
    },
    hints
  )
  score += typologieScore * 20 // 0-20 points
  if (typologieScore > 0.7) {
    reasons.push("Typologie cohérente avec les hints")
  }

  // Score quartier
  const quartierScore = scoreQuartier(
    {
      lat: parcel.centroid.lat,
      lng: parcel.centroid.lng,
      address: parcel.address || "",
      postalCode: parcel.postalCode,
      city: parcel.city,
      sources: {},
      scores: {},
    },
    hints
  )
  score += quartierScore * 10 // 0-10 points
  if (quartierScore > 0.6) {
    reasons.push("Type de quartier cohérent")
  }

  // Score prix/surface DVF
  const dvfScore = await scorePrixSurfaceDVF(
    {
      lat: parcel.centroid.lat,
      lng: parcel.centroid.lng,
      address: parcel.address || "",
      postalCode: parcel.postalCode,
      city: parcel.city,
      sources: {},
      scores: {},
    },
    hints
  )
  score += dvfScore * 20 // 0-20 points
  if (dvfScore > 0.7) {
    reasons.push("Prix et surface cohérents avec DVF")
  }

  return { score: Math.max(0, Math.min(100, score)), reasons }
}

/**
 * Score image globale (comparaison visuelle générale)
 */
export async function scoreImage(
  parcel: ParcelCandidate,
  userImages: string[]
): Promise<{ score: number; reasons: string[] }> {
  const reasons: string[] = []
  let score = 50

  if (!openai || userImages.length === 0) {
    return { score, reasons }
  }

  try {
    // Comparer l'image utilisateur avec l'image satellite
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Compare ces deux images d'une propriété immobilière.
              La première est une photo fournie par l'utilisateur, la seconde est une vue satellite.
              
              Évalue la similarité globale (style architectural, environnement, position relative des éléments).
              Réponds avec un score de 0 à 1 et une explication courte.`,
            },
            {
              type: "image_url",
              image_url: { url: userImages[0] },
            },
            {
              type: "image_url",
              image_url: { url: parcel.satelliteImageUrl },
            },
          ],
        },
      ],
      max_tokens: 150,
      response_format: { type: "json_object" },
    })

    const comparison = JSON.parse(response.choices[0].message.content || "{}")
    const similarity = comparison.similarity || 0.5

    score = similarity * 100
    if (similarity > 0.7) {
      reasons.push("Similarité visuelle élevée entre photo et satellite")
    } else if (similarity < 0.3) {
      reasons.push("Faible similarité visuelle")
    }

    return { score: Math.max(0, Math.min(100, score)), reasons }
  } catch (error) {
    console.warn("⚠️ [Parcel Matcher] Erreur scoreImage:", error)
    return { score, reasons }
  }
}

/**
 * Match principal : calcule tous les scores pour une parcelle
 */
export async function matchParcel(
  parcel: ParcelCandidate,
  userImages: string[],
  hints?: LocalizationUserHints,
  constraints?: LocalizationHardConstraints
): Promise<MatchedParcel> {
  const reasons: string[] = []

  // Calculer tous les scores en parallèle
  const [
    imageScore,
    piscineScore,
    toitureScore,
    terrainScore,
    hintsScore,
  ] = await Promise.all([
    scoreImage(parcel, userImages),
    scorePiscine(parcel, userImages, hints),
    scoreToiture(parcel, userImages),
    scoreTerrain(parcel, userImages, hints),
    scoreContextHints(parcel, hints),
  ])

  // Score DVF (densité)
  let dvfScore = 50
  try {
    const dvfData = await getDVFData(parcel.centroid.lat, parcel.centroid.lng, 500)
    if (dvfData) {
      dvfScore = Math.min(100, 50 + dvfData.densite * 5) // Normaliser
      if (dvfData.densite > 5) {
        reasons.push("Zone active avec ventes DVF récentes")
      }
    }
  } catch (error) {
    console.warn("⚠️ [Parcel Matcher] Erreur DVF:", error)
  }

  // Détecter le type de bien (heuristique basée sur les données cadastrales et DVF)
  // TODO: Améliorer avec analyse IA si nécessaire
  let propertyType: 'house' | 'apartment' | 'land' | 'building' | 'unknown' = 'unknown';
  if (parcel.address) {
    // Heuristique simple : si "appartement" dans l'adresse ou type bâti, c'est un appartement
    const addressLower = parcel.address.toLowerCase();
    if (addressLower.includes('appartement') || addressLower.includes('apt') || addressLower.includes('appt')) {
      propertyType = 'apartment';
    } else if (addressLower.includes('terrain') || addressLower.includes('lot')) {
      propertyType = 'land';
    } else {
      // Par défaut, on assume une maison si pas d'indication contraire
      propertyType = 'house';
    }
  }

  // Score total pondéré (avant application des contraintes dures)
  let scoreTotal =
    imageScore.score * 0.25 +
    piscineScore.score * 0.15 +
    toitureScore.score * 0.15 +
    terrainScore.score * 0.15 +
    hintsScore.score * 0.20 +
    dvfScore * 0.10

  // Appliquer les contraintes dures si fournies
  let violatedConstraints: string[] = [];
  let constraintExplanations: { [key: string]: string } = {};
  if (constraints) {
    const candidate: MatchedParcel = {
      parcel,
      scoreTotal,
      scoreImage: imageScore.score,
      scorePiscine: piscineScore.score,
      scoreToiture: toitureScore.score,
      scoreTerrain: terrainScore.score,
      scoreHints: hintsScore.score,
      scoreDVF: dvfScore,
      reasons: [],
      hasPoolFromImage: piscineScore.hasPoolFromImage,
      hasPoolFromSatellite: piscineScore.hasPoolFromSatellite,
      hasGardenFromImage: terrainScore.hasGardenFromImage,
      hasGardenFromSatellite: terrainScore.hasGardenFromSatellite,
      propertyType,
    };
    
    const constraintResult = applyHardConstraintsScore(candidate, constraints);
    scoreTotal += constraintResult.scoreDelta;
    violatedConstraints = constraintResult.violatedConstraints;
    constraintExplanations = constraintResult.explanations;
  }

  // Générer les 3 URLs d'images en parallèle
  const [satelliteImageUrl, cadastralUrl, streetViewUrl] = await Promise.all([
    generateSatelliteImage(parcel.centroid.lat, parcel.centroid.lng),
    generateCadastralImage(parcel.centroid.lat, parcel.centroid.lng),
    generateStreetViewImage(parcel.centroid.lat, parcel.centroid.lng),
  ])

  // Collecter toutes les raisons
  reasons.push(...imageScore.reasons)
  reasons.push(...piscineScore.reasons)
  reasons.push(...toitureScore.reasons)
  reasons.push(...terrainScore.reasons)
  reasons.push(...hintsScore.reasons)

  // Construire les explications détaillées
  const explanations = constraints ? {
    zone: constraints.strictZone 
      ? `Dans la zone définie (${constraints.communeName || 'commune stricte'}, rayon 0km)`
      : `Dans la zone définie (rayon ${constraints.radiusKm}km)`,
    piscine: constraintExplanations.piscine || "Aucune contrainte piscine",
    jardin: constraintExplanations.jardin || "Aucune contrainte jardin",
    typeBien: constraintExplanations.typeBien || "Aucune contrainte type de bien",
    scoreBreakdown: {
      image: imageScore.score,
      piscine: piscineScore.score,
      toiture: toitureScore.score,
      terrain: terrainScore.score,
      hints: hintsScore.score,
      dvf: dvfScore,
    },
    violatedConstraints,
  } : undefined;

  return {
    parcel,
    scoreTotal: Math.max(0, Math.min(100, Math.round(scoreTotal))),
    scoreImage: Math.round(imageScore.score),
    scorePiscine: Math.round(piscineScore.score),
    scoreToiture: Math.round(toitureScore.score),
    scoreTerrain: Math.round(terrainScore.score),
    scoreHints: Math.round(hintsScore.score),
    scoreDVF: Math.round(dvfScore),
    reasons: reasons.filter((r) => r.length > 0),
    satelliteImageUrl: satelliteImageUrl || undefined,
    cadastralUrl: cadastralUrl || undefined,
    streetViewUrl: streetViewUrl || undefined,
    // Informations de piscine et jardin pour filtrage final
    hasPoolFromImage: piscineScore.hasPoolFromImage,
    hasPoolFromSatellite: piscineScore.hasPoolFromSatellite,
    hasGardenFromImage: terrainScore.hasGardenFromImage,
    hasGardenFromSatellite: terrainScore.hasGardenFromSatellite,
    // Type de bien détecté
    propertyType,
    // Explications détaillées
    explanations,
    // Flags pour indiquer les problèmes
    flags: violatedConstraints.length > 0 ? violatedConstraints : undefined,
  }
}

/**
 * Match toutes les parcelles et retourne les meilleures
 */
export async function matchParcels(
  parcels: ParcelCandidate[],
  userImages: string[],
  hints?: LocalizationUserHints,
  topN: number = 15,
  constraints?: LocalizationHardConstraints
): Promise<MatchedParcel[]> {
  console.log(`🎯 [Parcel Matcher] Matching ${parcels.length} parcelles...`)
  if (constraints && DEBUG) {
    console.log(`[Parcel Matcher] Contraintes dures appliquées:`, {
      strictZone: constraints.strictZone,
      hasPool: constraints.hasPool,
      hasGarden: constraints.hasGarden,
      propertyType: constraints.propertyType,
    });
  }

  // OPTIMISATION : Limiter le nombre de parcelles à analyser pour éviter les timeouts
  // On analyse d'abord les 30 meilleures parcelles (basées sur la distance/zone)
  const maxParcelsToAnalyze = 30
  const parcelsToAnalyze = parcels.slice(0, maxParcelsToAnalyze)
  
  console.log(`[Parcel Matcher] Analyse de ${parcelsToAnalyze.length} parcelles (sur ${parcels.length} disponibles)`)

  // Matcher toutes les parcelles (en parallèle par batch pour éviter surcharge)
  // Réduire la taille du batch pour éviter les timeouts
  const batchSize = 3 // Réduit de 5 à 3 pour plus de réactivité
  const matched: MatchedParcel[] = []

  for (let i = 0; i < parcelsToAnalyze.length; i += batchSize) {
    const batch = parcelsToAnalyze.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map((parcel) => matchParcel(parcel, userImages, hints, constraints))
    )
    matched.push(...batchResults)
  }

  // Trier par score décroissant
  matched.sort((a, b) => b.scoreTotal - a.scoreTotal)

  // Retourner les top N
  const top = matched.slice(0, topN)

  console.log(`✅ [Parcel Matcher] Top ${top.length} parcelles sélectionnées (scores: ${top.map((t) => t.scoreTotal).join(", ")})`)

  return top
}


