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
  explanation?: string | null // Explication IA optionnelle
  comparables: {
    price: number
    surface: number
    pricePerSqm: number
    city: string
    postalCode: string
    rooms: number | null
    type: string | null
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
    locationLevel: "postalCode" as const,
    minSamples: 25,
  },
  {
    id: "cp_surface25_rooms1_180j",
    surfaceTolerance: 0.25,
    roomsTolerance: 1,
    daysBack: 180,
    locationLevel: "postalCode",
    minSamples: 20,
  },
  {
    id: "dept_surface35_rooms2_365j",
    surfaceTolerance: 0.35,
    roomsTolerance: 2,
    daysBack: 365,
    locationLevel: "department" as const,
    minSamples: 15,
  },
  {
    id: "dept_surface50_rooms3_730j",
    surfaceTolerance: 0.5,
    roomsTolerance: 3,
    daysBack: 730,
    locationLevel: "department",
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
      filters.push({
        postalCode: {
          equals: postalCode,
        },
      })
    } else if (level === "department" && postalCode.length >= 2) {
      const dept = postalCode.slice(0, 2)
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
 * Estimation principale basée sur les comparables Melo.
 */
export async function estimateFromComparables(input: EstimationInput): Promise<EstimationResult> {
  const { city, postalCode, surface, rooms, type } = input

  console.log("🔍 Début estimation pour:", { city, postalCode, surface, rooms, type })

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
      daysBack,
      locationLevel,
      minSamples,
    } = strategy

    const surfaceMin = Math.round(surface * (1 - surfaceTolerance))
    const surfaceMax = Math.round(surface * (1 + surfaceTolerance))

    const roomsMin = Math.max(1, rooms - roomsTolerance)
    const roomsMax = rooms + roomsTolerance

    const publishedAfter = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

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
        price: true,
        surface: true,
        city: true,
        postalCode: true,
        rooms: true,
        title: true,
      },
      take: 200, // limite de sécurité
    })

    console.log(`📊 Stratégie ${id}: ${results.length} résultats bruts trouvés`)

    const cleaned = results
      .filter(
        (a) =>
          typeof a.price === "number" &&
          a.price > 0 &&
          typeof a.surface === "number" &&
          a.surface > 10,
      )
      .map((a) => ({
        price: a.price as number,
        surface: a.surface as number,
        city: a.city || "",
        postalCode: a.postalCode || "",
        rooms: a.rooms,
        title: a.title || null,
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

  const priceMedian = Math.round(pricePerSqmMedian * surface)
  const priceLow = Math.round(stats.q1 * surface)
  const priceHigh = Math.round(stats.q3 * surface)

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
        price: comp.price,
        surface: comp.surface,
        pricePerSqm: Math.round(pricePerSqm),
        city: comp.city,
        postalCode: comp.postalCode,
        rooms: comp.rooms,
        type: propertyType,
      }
    })

  return {
    priceMedian,
    priceLow,
    priceHigh,
    pricePerSqmMedian: Math.round(pricePerSqmMedian),
    pricePerSqmAverage: Math.round(pricePerSqmAverage),
    sampleSize: trimmed.length,
    confidence: confidenceDecimal,
    strategy: usedStrategyId,
    comparables: fullComparables,
  }
}
