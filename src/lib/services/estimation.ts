import { z } from "zod"
import { prisma } from "@/lib/prisma"

/**
 * Constantes et helpers pour le calcul de distance géographique
 */
const EARTH_RADIUS_KM = 6371

function deg2rad(deg: number): number {
  return (deg * Math.PI) / 180
}

function haversineDistanceKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const dLat = deg2rad(bLat - aLat)
  const dLon = deg2rad(bLon - aLon)
  const lat1 = deg2rad(aLat)
  const lat2 = deg2rad(bLat)

  const sinDLat = Math.sin(dLat / 2)
  const sinDLon = Math.sin(dLon / 2)

  const a =
    sinDLat * sinDLat +
    sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}

export const estimationInputSchema = z.object({
  city: z.string().min(1),
  postalCode: z.string().min(2), // au moins le département
  surface: z.number().positive(),
  rooms: z.number().int().positive(),
  type: z.enum(["Appartement", "Maison"]),
  // Filtres optionnels pour affiner la recherche (observables par un agent immobilier)
  radiusKm: z.number().positive().max(50).optional(), // Rayon de recherche en km (max 50km)
  latitude: z.number().min(-90).max(90).optional(), // Latitude pour recherche géographique
  longitude: z.number().min(-180).max(180).optional(), // Longitude pour recherche géographique
  keywords: z.string().optional(), // Mots-clés à rechercher dans la description
  source: z.string().optional(), // Source de l'annonce (LEBONCOIN, etc.)
  // Filtres basés sur l'analyse textuelle (description/title) - Équipements
  hasBalcon: z.boolean().optional(), // Recherche "balcon" dans description/title
  hasTerrasse: z.boolean().optional(), // Recherche "terrasse" dans description/title
  hasParking: z.boolean().optional(), // Recherche "parking" ou "garage" dans description/title
  hasGarden: z.boolean().optional(), // Recherche "jardin" dans description/title
  hasElevator: z.boolean().optional(), // Recherche "ascenseur" dans description/title
  hasPool: z.boolean().optional(), // Recherche "piscine" dans description/title
  hasFireplace: z.boolean().optional(), // Recherche "cheminée" dans description/title
  hasCellar: z.boolean().optional(), // Recherche "cave" ou "cellier" dans description/title
  hasAttic: z.boolean().optional(), // Recherche "grenier" ou "combles" dans description/title
  // État du bien (observable lors d'une visite)
  condition: z.enum(["neuf", "rénové", "bon_état", "à_rafraîchir", "à_rénover"]).optional(), // État du bien
  // Caractéristiques supplémentaires
  floor: z.number().int().optional(), // Étage (pour appartement)
  hasView: z.boolean().optional(), // Recherche "vue" dans description/title
  hasDoubleGlazing: z.boolean().optional(), // Recherche "double vitrage" dans description/title
  hasAlarm: z.boolean().optional(), // Recherche "alarme" dans description/title
  hasIntercom: z.boolean().optional(), // Recherche "digicode" ou "interphone" dans description/title
})

export type EstimationInput = z.infer<typeof estimationInputSchema>

export type EstimationResult = {
  priceMedian: number
  priceLow: number
  priceHigh: number
  pricePerSqmMedian: number
  pricePerSqmAverage: number
  sampleSize: number
  confidence: number // 0–1
  strategy: string
  adjustments?: string[] // Ajustements appliqués (état, équipements, etc.)
  explanation?: string | null // Explication IA optionnelle
  comparables: {
    id?: string
    price: number
    surface: number
    pricePerSqm: number
    city: string
    postalCode: string
    rooms: number | null
    type: string | null
    url?: string | null
  }[]
}

/**
 * Calcul de stats robustes sur un tableau de nombres.
 */
function computeStats(values: number[]) {
  if (values.length === 0) {
    throw new Error("Aucune valeur pour calculer les statistiques")
  }

  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length

  const median = sorted[Math.floor(n / 2)]
  const average = sorted.reduce((sum, v) => sum + v, 0) / n
  const q1 = sorted[Math.floor(n * 0.25)]
  const q3 = sorted[Math.floor(n * 0.75)]

  return {
    median,
    average,
    q1,
    q3,
    min: sorted[0],
    max: sorted[n - 1],
  }
}

/**
 * Détermine un score de confiance entre 0 et 1
 * en fonction de la taille de l'échantillon et de la dispersion.
 */
function computeConfidence(sampleSize: number, dispersion: number): number {
  // Base sur la taille de l'échantillon
  // 0 comparables → 0, 80+ comparables → 1
  const sizeScore = Math.max(0, Math.min(1, sampleSize / 80))

  // Dispersion en % (écart entre Q3 et Q1 en relatif)
  // Plus c'est serré, plus la confiance est élevée
  let dispersionScore = 1
  if (dispersion > 0.6) dispersionScore = 0.3
  else if (dispersion > 0.4) dispersionScore = 0.5
  else if (dispersion > 0.25) dispersionScore = 0.7
  else dispersionScore = 0.9

  // Score combiné
  return Number(((sizeScore * 0.7 + dispersionScore * 0.3)).toFixed(2))
}

/**
 * Normalise légèrement le nom de ville (trim, majuscules).
 */
function normalizeCity(city: string): string {
  return city.trim()
}

/**
 * Étapes de recherche de comparables.
 * On commence strict, puis on élargit progressivement.
 */
const SEARCH_STRATEGIES = [
  {
    id: "strict_cp_surface15_rooms1_90j",
    surfaceTolerance: 0.15,
    roomsTolerance: 1,
    daysBack: 90,
    locationLevel: "postalCode" as const, // Code postal EXACT (33000 ≠ 33360)
    minSamples: 25,
  },
  {
    id: "cp_surface25_rooms1_180j",
    surfaceTolerance: 0.25,
    roomsTolerance: 1,
    daysBack: 180,
    locationLevel: "postalCode" as const, // Code postal EXACT (33000 ≠ 33360)
    minSamples: 20,
  },
  {
    id: "city_surface35_rooms2_365j",
    surfaceTolerance: 0.35,
    roomsTolerance: 2,
    daysBack: 365,
    locationLevel: "postalCode" as const, // Toujours code postal exact, mais tolérance surface/pièces plus large
    minSamples: 15,
  },
  {
    id: "dept_surface50_rooms3_730j",
    surfaceTolerance: 0.5,
    roomsTolerance: 3,
    daysBack: 730,
    locationLevel: "department" as const, // Dernier recours : département (33xxx)
    minSamples: 10,
  },
]

/**
 * Construit le filtre de localisation selon le niveau choisi.
 */
function buildLocationFilter(city: string, postalCode: string | null, level: "postalCode" | "department") {
  const filters: any[] = []

  const normalizedCity = normalizeCity(city)

  if (normalizedCity) {
    filters.push({
      city: {
        equals: normalizedCity,
        mode: "insensitive" as const,
      },
    })
  }

  if (postalCode) {
    if (level === "postalCode") {
      // Filtre strict par code postal exact (33000 ≠ 33360)
      // S'assurer que le code postal a au moins 5 caractères pour une correspondance exacte
      if (postalCode.length >= 5) {
        filters.push({
          postalCode: {
            equals: postalCode,
          },
        })
      } else if (postalCode.length >= 2) {
        // Si le code postal est incomplet, utiliser startsWith mais avec au moins 2 caractères
        // Cela permet de filtrer par département en dernier recours
        filters.push({
          postalCode: {
            startsWith: postalCode,
          },
        })
      }
    } else if (level === "department" && postalCode.length >= 2) {
      // Niveau département : utiliser uniquement les 2 premiers chiffres
      const dept = postalCode.substring(0, 2)
      filters.push({
        postalCode: {
          startsWith: dept,
        },
      })
    }
  }

  if (filters.length === 0) {
    // Fallback : aucun filtre de localisation, on ne met rien
    return undefined
  }

  if (filters.length === 1) {
    return filters[0]
  }

  return { OR: filters }
}

/**
 * Fonction helper pour calculer les ajustements de prix
 * Exportée pour être utilisée dans d'autres services (estimation-api.ts)
 */
export function calculatePriceAdjustments(
  input: EstimationInput,
  comparables: Array<{ surface: number; rooms: number | null; title: string | null }>,
  basePrice: number
): { factor: number; adjustments: string[] } {
  let adjustmentFactor = 1.0
  const adjustments: string[] = []
  
  const {
    type,
    rooms,
    surface,
    condition,
    hasPool,
    hasParking,
    hasGarden,
    hasTerrasse,
    hasBalcon,
    hasElevator,
    hasFireplace,
    hasView,
    hasDoubleGlazing,
    hasCellar,
    hasAttic,
    floor,
  } = input

  console.log("🔧 CALCUL AJUSTEMENTS - Input reçu:", {
    type,
    rooms,
    surface,
    condition: condition || "non spécifié",
    hasPool: !!hasPool,
    hasParking: !!hasParking,
    hasGarden: !!hasGarden,
    hasTerrasse: !!hasTerrasse,
    hasBalcon: !!hasBalcon,
    hasElevator: !!hasElevator,
    hasFireplace: !!hasFireplace,
    hasView: !!hasView,
    hasDoubleGlazing: !!hasDoubleGlazing,
    hasCellar: !!hasCellar,
    hasAttic: !!hasAttic,
    floor: floor !== undefined ? floor : "non spécifié",
    comparablesCount: comparables.length
  })

  // Ajustement selon le type de bien (appartement vs maison)
  if (type === "Maison" && comparables.length > 0) {
    const maisonCount = comparables.filter(c => 
      c.title?.toLowerCase().includes("maison") || 
      c.title?.toLowerCase().includes("villa")
    ).length
    const appartCount = comparables.filter(c => 
      c.title?.toLowerCase().includes("appartement") || 
      c.title?.toLowerCase().includes("appt") ||
      c.title?.toLowerCase().includes("apt")
    ).length
    
    if (appartCount > maisonCount && appartCount > comparables.length * 0.6) {
      adjustmentFactor *= 1.05
      adjustments.push("Type Maison vs Appartements (+5%)")
      console.log("✅ Ajustement type: +5%")
    }
  } else if (type === "Appartement" && comparables.length > 0) {
    const maisonCount = comparables.filter(c => 
      c.title?.toLowerCase().includes("maison") || 
      c.title?.toLowerCase().includes("villa")
    ).length
    const appartCount = comparables.filter(c => 
      c.title?.toLowerCase().includes("appartement") || 
      c.title?.toLowerCase().includes("appt") ||
      c.title?.toLowerCase().includes("apt")
    ).length
    
    if (maisonCount > appartCount && maisonCount > comparables.length * 0.6) {
      adjustmentFactor *= 0.95
      adjustments.push("Type Appartement vs Maisons (-5%)")
      console.log("✅ Ajustement type: -5%")
    }
  }

  // Ajustement selon le nombre de pièces
  // PRIORITÉ: Si on a des comparables avec des pièces, on compare
  // SINON: On applique un ajustement basique basé sur le nombre de pièces du bien
  if (rooms) {
    if (comparables.length > 0) {
      const roomsWithValue = comparables.filter(c => c.rooms !== null && c.rooms !== undefined)
      if (roomsWithValue.length > 0) {
        const avgRooms = roomsWithValue.reduce((sum, c) => sum + (c.rooms || 0), 0) / roomsWithValue.length
        if (avgRooms > 0) {
          const roomsDiff = rooms - avgRooms
          if (Math.abs(roomsDiff) >= 0.5) {
            const roomsAdjustment = Math.max(-0.12, Math.min(0.12, roomsDiff * 0.03))
            adjustmentFactor *= (1 + roomsAdjustment)
            if (roomsAdjustment > 0) {
              adjustments.push(`${Math.round(roomsDiff * 10) / 10} pièce(s) supplémentaire(s) (+${Math.round(roomsAdjustment * 100)}%)`)
            } else {
              adjustments.push(`${Math.round(Math.abs(roomsDiff) * 10) / 10} pièce(s) en moins (${Math.round(roomsAdjustment * 100)}%)`)
            }
            console.log(`✅ Ajustement pièces (vs comparables): ${Math.round(roomsAdjustment * 100)}%`)
          }
        }
      }
    }
    
    // AJUSTEMENT BASIQUE si pas de comparables avec pièces ou si pas de différence significative
    // Plus de pièces = prix plus élevé (environ +3% par pièce supplémentaire au-delà de 2)
    if (rooms >= 3) {
      const extraRooms = rooms - 2
      const basicRoomsAdjustment = Math.min(extraRooms * 0.03, 0.15) // Max +15% pour 5+ pièces
      if (basicRoomsAdjustment > 0) {
        adjustmentFactor *= (1 + basicRoomsAdjustment)
        adjustments.push(`${rooms} pièces (+${Math.round(basicRoomsAdjustment * 100)}%)`)
        console.log(`✅ Ajustement pièces (basique): +${Math.round(basicRoomsAdjustment * 100)}% pour ${rooms} pièces`)
      }
    } else if (rooms === 1) {
      // Studio ou 1 pièce = -5%
      adjustmentFactor *= 0.95
      adjustments.push("1 pièce (-5%)")
      console.log(`✅ Ajustement pièces (basique): -5% pour 1 pièce`)
    }
  }

  // Ajustement selon la surface
  // PRIORITÉ: Si on a des comparables, on compare
  // SINON: On applique un ajustement basique basé sur la surface du bien
  if (comparables.length > 0) {
    const avgSurface = comparables.reduce((sum, c) => sum + c.surface, 0) / comparables.length
    const surfaceDiff = ((surface - avgSurface) / avgSurface) * 100
    if (Math.abs(surfaceDiff) >= 10) {
      const surfaceAdjustment = Math.max(-0.10, Math.min(0.10, -(surfaceDiff / 10) * 0.01))
      adjustmentFactor *= (1 + surfaceAdjustment)
      if (surfaceAdjustment > 0) {
        adjustments.push(`Surface ${Math.round(Math.abs(surfaceDiff))}% supérieure (+${Math.round(surfaceAdjustment * 100)}%)`)
      } else {
        adjustments.push(`Surface ${Math.round(Math.abs(surfaceDiff))}% inférieure (${Math.round(surfaceAdjustment * 100)}%)`)
      }
      console.log(`✅ Ajustement surface (vs comparables): ${Math.round(surfaceAdjustment * 100)}%`)
    }
  }
  
  // AJUSTEMENT BASIQUE si pas de comparables ou si pas de différence significative
  // Petits biens (< 40m²) = prix au m² plus élevé (-5%)
  // Grands biens (> 100m²) = prix au m² plus faible (+5%)
  if (surface < 40) {
    adjustmentFactor *= 0.95
    adjustments.push(`Surface < 40m² (-5%)`)
    console.log(`✅ Ajustement surface (basique): -5% pour surface < 40m²`)
  } else if (surface > 100) {
    adjustmentFactor *= 1.05
    adjustments.push(`Surface > 100m² (+5%)`)
    console.log(`✅ Ajustement surface (basique): +5% pour surface > 100m²`)
  }

  // Ajustement selon l'état du bien
  if (condition && condition !== "" && condition !== "bon_état") {
    const conditionAdjustments: Record<string, number> = {
      neuf: 1.08,
      rénové: 1.04,
      bon_état: 1.0,
      à_rafraîchir: 0.92,
      à_rénover: 0.78,
    }
    const conditionAdj = conditionAdjustments[condition] || 1.0
    if (conditionAdj !== 1.0) {
      adjustmentFactor *= conditionAdj
      const adjLabel = 
        condition === "neuf" ? "Bien neuf (+8%)" :
        condition === "rénové" ? "Bien rénové (+4%)" :
        condition === "à_rafraîchir" ? "À rafraîchir (-8%)" :
        condition === "à_rénover" ? "À rénover (-22%)" :
        ""
      adjustments.push(adjLabel)
      console.log(`✅ Ajustement état: ${adjLabel}`)
    }
  }

  // Ajustements selon les équipements
  let equipmentBonus = 0
  if (hasPool === true) {
    equipmentBonus += 0.07
    adjustments.push("Piscine (+7%)")
    console.log("✅ Équipement: Piscine (+7%)")
  }
  if (hasParking === true) {
    equipmentBonus += 0.03
    adjustments.push("Parking/Garage (+3%)")
    console.log("✅ Équipement: Parking (+3%)")
  }
  if (hasGarden === true) {
    equipmentBonus += 0.05
    adjustments.push("Jardin (+5%)")
    console.log("✅ Équipement: Jardin (+5%)")
  }
  if (hasTerrasse === true) {
    equipmentBonus += 0.03
    adjustments.push("Terrasse (+3%)")
    console.log("✅ Équipement: Terrasse (+3%)")
  }
  if (hasBalcon === true) {
    equipmentBonus += 0.02
    adjustments.push("Balcon (+2%)")
    console.log("✅ Équipement: Balcon (+2%)")
  }
  if (hasElevator === true && type === "Appartement") {
    equipmentBonus += 0.04
    adjustments.push("Ascenseur (+4%)")
    console.log("✅ Équipement: Ascenseur (+4%)")
  }
  if (hasFireplace === true) {
    equipmentBonus += 0.02
    adjustments.push("Cheminée (+2%)")
    console.log("✅ Équipement: Cheminée (+2%)")
  }
  if (hasView === true) {
    equipmentBonus += 0.03
    adjustments.push("Vue (+3%)")
    console.log("✅ Équipement: Vue (+3%)")
  }
  if (hasDoubleGlazing === true) {
    equipmentBonus += 0.02
    adjustments.push("Double vitrage (+2%)")
    console.log("✅ Équipement: Double vitrage (+2%)")
  }
  if (hasCellar === true) {
    equipmentBonus += 0.02
    adjustments.push("Cave/Cellier (+2%)")
    console.log("✅ Équipement: Cave (+2%)")
  }
  if (hasAttic === true) {
    equipmentBonus += 0.02
    adjustments.push("Grenier/Combles (+2%)")
    console.log("✅ Équipement: Grenier (+2%)")
  }

  equipmentBonus = Math.min(equipmentBonus, 0.25)
  if (equipmentBonus > 0) {
    adjustmentFactor *= (1 + equipmentBonus)
    console.log(`✅ Bonus équipements total: +${Math.round(equipmentBonus * 100)}%`)
  }

  // Ajustement selon l'étage
  if (floor !== undefined && type === "Appartement") {
    if (floor === 0) {
      adjustmentFactor *= 0.97
      adjustments.push("Rez-de-chaussée (-3%)")
      console.log("✅ Ajustement étage: Rez-de-chaussée (-3%)")
    } else if (floor >= 1 && floor <= 5) {
      const floorBonus = Math.min(floor * 0.02, 0.10)
      adjustmentFactor *= (1 + floorBonus)
      adjustments.push(`Étage ${floor} (+${Math.round(floorBonus * 100)}%)`)
      console.log(`✅ Ajustement étage: Étage ${floor} (+${Math.round(floorBonus * 100)}%)`)
    }
  }

  console.log(`💰 Facteur d'ajustement final: ×${adjustmentFactor.toFixed(3)}`)
  console.log(`📋 Nombre d'ajustements: ${adjustments.length}`)

  return { factor: adjustmentFactor, adjustments }
}

/**
 * Estimation principale basée sur les comparables Melo.
 */
export async function estimateFromComparables(input: EstimationInput): Promise<EstimationResult> {
  const { 
    city, 
    postalCode, 
    surface, 
    rooms, 
    type,
    radiusKm,
    latitude,
    longitude,
    keywords,
    source,
    hasBalcon,
    hasTerrasse,
    hasParking,
    hasGarden,
    hasElevator,
    hasPool,
    hasFireplace,
    hasCellar,
    hasAttic,
    condition,
    floor,
    hasView,
    hasDoubleGlazing,
    hasAlarm,
    hasIntercom,
  } = input

  console.log("🔍 Début estimation pour:", { 
    city, 
    postalCode, 
    surface, 
    rooms, 
    type,
    condition: condition || "non spécifié",
    hasPool: !!hasPool,
    hasParking: !!hasParking,
    hasGarden: !!hasGarden,
  })

  const normalizedCity = normalizeCity(city)
  const pc = postalCode || null

  const now = new Date()

  let usedStrategyId = ""
  let comparables: { price: number; surface: number; city: string; postalCode: string; rooms: number | null; title: string | null }[] = []

  // On essaie chaque stratégie jusqu'à obtenir assez de comparables
  for (const strategy of SEARCH_STRATEGIES) {
    const {
      id,
      surfaceTolerance,
      roomsTolerance,
      daysBack: strategyDaysBack,
      locationLevel,
      minSamples,
    } = strategy

    const surfaceMin = Math.round(surface * (1 - surfaceTolerance))
    const surfaceMax = Math.round(surface * (1 + surfaceTolerance))

    const roomsMin = Math.max(1, rooms - roomsTolerance)
    const roomsMax = rooms + roomsTolerance

    const publishedAfter = new Date(now.getTime() - strategyDaysBack * 24 * 60 * 60 * 1000)

    const locationFilter = buildLocationFilter(normalizedCity, pc, locationLevel)

    const where: any = {
      price: {
        not: undefined,
        gt: 0,
      },
      surface: {
        not: undefined,
        gte: surfaceMin,
        lte: surfaceMax,
      },
      rooms: {
        not: undefined,
        gte: roomsMin,
        lte: roomsMax,
      },
      publishedAt: {
        gte: publishedAfter,
      },
    }

    // Filtre par source si fourni
    if (source) {
      where.source = {
        equals: source,
        mode: "insensitive",
      }
    }

    // Filtre par mots-clés dans la description si fourni
    if (keywords && keywords.trim().length > 0) {
      where.description = {
        contains: keywords.trim(),
        mode: "insensitive",
      }
    }

    if (locationFilter) {
      Object.assign(where, locationFilter)
    }

    if (type === "Appartement") {
      where.title = {
        contains: "appartement",
        mode: "insensitive",
      }
    } else if (type === "Maison") {
      where.title = {
        contains: "maison",
        mode: "insensitive",
      }
    }

    const results = await prisma.annonceScrape.findMany({
      where,
      select: {
        id: true,
        price: true,
        surface: true,
        city: true,
        postalCode: true,
        rooms: true,
        title: true,
        url: true,
        latitude: true,
        longitude: true,
        description: true, // Nécessaire pour les filtres textuels
      },
      take: 500, // Augmenté pour permettre le filtrage géographique et textuel
    })

    console.log(`📊 Stratégie ${id}: ${results.length} résultats bruts trouvés`)

    // Filtrage géographique par rayon si latitude/longitude et radiusKm sont fournis
    let geographicallyFiltered = results
    if (latitude !== undefined && longitude !== undefined && radiusKm !== undefined) {
      geographicallyFiltered = results.filter((a) => {
        if (a.latitude === null || a.longitude === null) {
          return false // Exclure les annonces sans coordonnées
        }
        const distance = haversineDistanceKm(latitude, longitude, a.latitude, a.longitude)
        return distance <= radiusKm
      })
      console.log(`📍 Après filtrage géographique (rayon ${radiusKm}km): ${geographicallyFiltered.length} résultats`)
    }
    
    // Filtrage supplémentaire par code postal exact si fourni (pour éviter 33000 vs 33360)
    // Ce filtre s'applique même après le filtrage géographique pour garantir la précision
    if (pc && pc.length >= 5) {
      const beforeCount = geographicallyFiltered.length
      geographicallyFiltered = geographicallyFiltered.filter((a) => {
        // Correspondance exacte du code postal (33000 = 33000, pas 33360)
        return a.postalCode === pc
      })
      if (beforeCount !== geographicallyFiltered.length) {
        console.log(`📮 Filtrage code postal exact (${pc}): ${beforeCount} → ${geographicallyFiltered.length} résultats`)
      }
    }

    // Fonction helper pour vérifier la présence de mots-clés dans le texte
    const hasKeyword = (text: string | null | undefined, keywords: string[]): boolean => {
      if (!text) return false
      const lowerText = text.toLowerCase()
      return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))
    }

    let cleaned = geographicallyFiltered
      .filter(
        (a) =>
          typeof a.price === "number" &&
          a.price > 0 &&
          typeof a.surface === "number" &&
          a.surface > 10,
      )
      // Filtres textuels (description/title) - Équipements et caractéristiques
      .filter((a) => {
        const searchText = `${a.title || ""} ${a.description || ""}`.toLowerCase()
        
        // Équipements
        if (hasBalcon === true && !hasKeyword(searchText, ["balcon", "balcons"])) return false
        if (hasTerrasse === true && !hasKeyword(searchText, ["terrasse", "terrasses"])) return false
        if (hasParking === true && !hasKeyword(searchText, ["parking", "garage", "garages", "place de parking"])) return false
        if (hasGarden === true && !hasKeyword(searchText, ["jardin", "jardins"])) return false
        if (hasElevator === true && !hasKeyword(searchText, ["ascenseur", "ascenseurs", "lift"])) return false
        if (hasPool === true && !hasKeyword(searchText, ["piscine", "piscines"])) return false
        if (hasFireplace === true && !hasKeyword(searchText, ["cheminée", "cheminées", "insert"])) return false
        if (hasCellar === true && !hasKeyword(searchText, ["cave", "cellier", "celliers"])) return false
        if (hasAttic === true && !hasKeyword(searchText, ["grenier", "greniers", "combles", "combles aménagés"])) return false
        
        // Caractéristiques
        if (hasView === true && !hasKeyword(searchText, ["vue", "vues", "panorama", "panoramique"])) return false
        if (hasDoubleGlazing === true && !hasKeyword(searchText, ["double vitrage", "double-vitrage"])) return false
        if (hasAlarm === true && !hasKeyword(searchText, ["alarme", "alarmes", "système d'alarme"])) return false
        if (hasIntercom === true && !hasKeyword(searchText, ["digicode", "interphone", "visiophone"])) return false
        
        // État du bien
        if (condition) {
          const conditionKeywords: Record<string, string[]> = {
            neuf: ["neuf", "nouveau", "construction neuve", "livraison"],
            rénové: ["rénové", "rénovation", "refait", "rénové à neuf"],
            bon_état: ["bon état", "bien entretenu", "entretenu"],
            à_rafraîchir: ["à rafraîchir", "rafraîchissement", "rafraîchir"],
            à_rénover: ["à rénover", "rénovation", "travaux", "à refaire"],
          }
          const keywords = conditionKeywords[condition] || []
          if (keywords.length > 0 && !hasKeyword(searchText, keywords)) return false
        }
        
        // Filtre par étage (extraction depuis le titre/description)
        if (floor !== undefined && type === "Appartement") {
          // Rechercher des patterns comme "3ème étage", "étage 3", "3e étage", etc.
          const floorPatterns = [
            `${floor}ème étage`,
            `${floor}e étage`,
            `étage ${floor}`,
            `au ${floor}ème`,
            `au ${floor}e`,
            `rez-de-chaussée`,
          ]
          
          // Si floor = 0, chercher "rez-de-chaussée" ou "rdc"
          if (floor === 0) {
            if (!hasKeyword(searchText, ["rez-de-chaussée", "rdc", "rez de chaussée", "rez"])) {
              return false
            }
          } else {
            // Pour les autres étages, chercher les patterns
            if (!hasKeyword(searchText, floorPatterns)) {
              return false
            }
          }
        }
        
        return true
      })
      .map((a) => ({
        id: a.id,
        price: a.price as number,
        surface: a.surface as number,
        city: a.city || "",
        postalCode: a.postalCode || "",
        rooms: a.rooms,
        title: a.title || null,
        url: a.url,
      }))

    if (cleaned.length >= minSamples) {
      usedStrategyId = id
      comparables = cleaned
      break
    }

    // On garde quand même la meilleure stratégie si aucune ne remplit le quota
    if (!usedStrategyId || cleaned.length > comparables.length) {
      usedStrategyId = id
      comparables = cleaned
    }
  }

  // Calcul du score de confiance basé sur le nombre de comparables
  console.log(`📈 Total comparables trouvés: ${comparables.length}`)
  
  let confidence = 100

  if (comparables.length >= 8) {
    confidence = 90
  } else if (comparables.length >= 5) {
    confidence = 60
  } else if (comparables.length >= 3) {
    confidence = 40
  } else if (comparables.length >= 1) {
    confidence = 20
  } else {
    // Fallback total → estimation départementale moyenne
    // Vérifier que postalCode existe et a au moins 2 caractères
    if (!postalCode || postalCode.length < 2) {
      throw new Error("NOT_ENOUGH_COMPARABLES")
    }

    const deptCode = postalCode.substring(0, 2)
    const average = await prisma.annonceScrape.aggregate({
      where: { 
        postalCode: { startsWith: deptCode },
        price: { not: undefined, gt: 0 },
        surface: { not: undefined, gt: 0 },
      },
      _avg: { price: true, surface: true }
    })

    if (!average._avg.price || !average._avg.surface || average._avg.surface === 0) {
      throw new Error("NOT_ENOUGH_COMPARABLES")
    }

    const fallbackPricePerSqm = average._avg.price / average._avg.surface

    return {
      priceMedian: Math.round(surface * fallbackPricePerSqm),
      priceLow: Math.round(surface * fallbackPricePerSqm * 0.9),
      priceHigh: Math.round(surface * fallbackPricePerSqm * 1.1),
      pricePerSqmMedian: Math.round(fallbackPricePerSqm),
      pricePerSqmAverage: Math.round(fallbackPricePerSqm),
      sampleSize: 0,
      confidence: 0.15, // 15% en décimal
      strategy: usedStrategyId || "fallback_departmental",
      comparables: []
    }
  }

  // Calcul du prix au m² et suppression des outliers (10% bas / 10% haut)
  const pricesPerSqm = comparables.map((c) => c.price / c.surface)

  const sorted = [...pricesPerSqm].sort((a, b) => a - b)
  const n = sorted.length
  const cutLowIdx = Math.floor(n * 0.1)
  const cutHighIdx = Math.ceil(n * 0.9)

  const trimmed = sorted.slice(cutLowIdx, cutHighIdx)

  if (trimmed.length < 5) {
    // sécurité : si on a trop coupé, on garde la version non tronquée
    trimmed.splice(0, trimmed.length, ...sorted)
  }

  const stats = computeStats(trimmed)

  // Dispersion relative entre Q1 et Q3
  const dispersion =
    stats.q1 > 0 ? (stats.q3 - stats.q1) / stats.q1 : 0

  // Le confidence a déjà été calculé plus haut basé sur le nombre de comparables
  // On le convertit en décimal (0-1) pour correspondre au type EstimationResult
  const confidenceDecimal = confidence / 100

  const pricePerSqmMedian = stats.median
  const pricePerSqmAverage = stats.average

  // Calculer le prix de base AVANT ajustements
  const basePriceMedian = Math.round(pricePerSqmMedian * surface)
  const basePriceLow = Math.round(stats.q1 * surface)
  const basePriceHigh = Math.round(stats.q3 * surface)

  // Calculer les ajustements avec la fonction helper
  const { factor: adjustmentFactor, adjustments } = calculatePriceAdjustments(
    input,
    comparables.map(c => ({ surface: c.surface, rooms: c.rooms, title: c.title })),
    basePriceMedian
  )

  console.log(`\n💰 ========== CALCUL PRIX ==========`)
  console.log(`💰 Prix AVANT ajustements: ${basePriceMedian.toLocaleString('fr-FR')}€ (médian)`)
  console.log(`🔧 Facteur d'ajustement: ×${adjustmentFactor.toFixed(3)}`)
  console.log(`📋 Ajustements appliqués: ${adjustments.length} ajustement(s)`)
  if (adjustments.length > 0) {
    console.log(`📋 Liste des ajustements:`, adjustments)
  } else {
    console.log(`⚠️ AUCUN AJUSTEMENT APPLIQUÉ - Le facteur est ${adjustmentFactor.toFixed(3)}`)
  }

  // Appliquer les ajustements au prix de base
  let priceMedian = Math.round(basePriceMedian * adjustmentFactor)
  let priceLow = Math.round(basePriceLow * adjustmentFactor)
  let priceHigh = Math.round(basePriceHigh * adjustmentFactor)

  const difference = priceMedian - basePriceMedian
  const differencePercent = ((adjustmentFactor - 1) * 100).toFixed(1)
  
  console.log(`💰 Prix APRÈS ajustements: ${priceMedian.toLocaleString('fr-FR')}€ (médian)`)
  console.log(`💰 Différence: ${difference > 0 ? '+' : ''}${difference.toLocaleString('fr-FR')}€ (${differencePercent > 0 ? '+' : ''}${differencePercent}%)`)
  console.log(`💰 =================================\n`)

  // Recalculer le prix au m² après ajustement
  const adjustedPricePerSqmMedian = Math.round(priceMedian / surface)
  const adjustedPricePerSqmAverage = Math.round(pricePerSqmAverage * adjustmentFactor)

  // Log des ajustements appliqués
  console.log(`\n💰 ========== RÉSUMÉ DES AJUSTEMENTS ==========`)
  console.log(`💰 Facteur d'ajustement total: ×${adjustmentFactor.toFixed(3)}`)
  console.log(`💰 Prix de base (sans ajustement): ${basePriceMedian.toLocaleString('fr-FR')}€`)
  console.log(`💰 Prix après ajustement: ${priceMedian.toLocaleString('fr-FR')}€`)
  console.log(`💰 Différence: ${(priceMedian - basePriceMedian).toLocaleString('fr-FR')}€ (${((adjustmentFactor - 1) * 100).toFixed(1)}%)`)
  if (adjustments.length > 0) {
    console.log(`📋 Ajustements détaillés (${adjustments.length}):`, adjustments)
  } else {
    console.log(`ℹ️ Aucun ajustement appliqué (facteur = 1.0)`)
  }
  console.log(`💰 ============================================\n`)

  // Préparer les comparables complets avec pricePerSqm et type
  // On garde tous les comparables qui sont dans la plage trimmed (après suppression des outliers)
  const trimmedMin = trimmed[0]
  const trimmedMax = trimmed[trimmed.length - 1]
  
  const fullComparables = comparables
    .map((comp) => {
      const pricePerSqm = comp.price / comp.surface
      return { comp, pricePerSqm }
    })
    .filter(({ pricePerSqm }) => pricePerSqm >= trimmedMin && pricePerSqm <= trimmedMax)
    .map(({ comp, pricePerSqm }) => {
      // Extraire le type depuis le title
      let propertyType: string | null = null
      if (comp.title) {
        const titleLower = comp.title.toLowerCase()
        if (titleLower.includes("appartement") || titleLower.includes("appt") || titleLower.includes("apt")) {
          propertyType = "Appartement"
        } else if (titleLower.includes("maison") || titleLower.includes("villa")) {
          propertyType = "Maison"
        } else if (titleLower.includes("studio")) {
          propertyType = "Studio"
        } else if (titleLower.includes("terrain")) {
          propertyType = "Terrain"
        }
      }
      
      return {
        id: comp.id,
        price: comp.price,
        surface: comp.surface,
        pricePerSqm: Math.round(pricePerSqm),
        city: comp.city,
        postalCode: comp.postalCode,
        rooms: comp.rooms,
        type: propertyType,
        url: comp.url,
      }
    })

  return {
    priceMedian,
    priceLow,
    priceHigh,
    pricePerSqmMedian: adjustedPricePerSqmMedian,
    pricePerSqmAverage: adjustedPricePerSqmAverage,
    sampleSize: trimmed.length,
    confidence: confidenceDecimal,
    strategy: usedStrategyId,
    adjustments: adjustments.length > 0 ? adjustments : [], // Toujours retourner un array, même vide
    comparables: fullComparables,
  }
}
