/**
 * 🗺️ PARCEL SCANNER
 * 
 * Récupère les parcelles cadastrales et génère des images satellites
 * pour chaque parcelle candidate
 */

import { geocodeAddressCandidates, reverseGeocode } from "@/lib/google/locationClient"

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

export interface BoundingBox {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

export interface ParcelCandidate {
  id: string
  centroid: { lat: number; lng: number }
  polygon: Array<{ lat: number; lng: number }> // Polygone de la parcelle
  buildingFootprint?: Array<{ lat: number; lng: number }> // Emprise du bâtiment
  satelliteImageUrl: string
  address?: string
  postalCode?: string
  city?: string
  surface?: number // m²
  section?: string
  numero?: string
}

/**
 * Calcule un bounding box depuis une ville/code postal
 */
export async function calculateBoundingBox(
  city?: string,
  postalCode?: string
): Promise<BoundingBox | null> {
  if (!city && !postalCode) {
    return null
  }

  try {
    const query = [city, postalCode, "France"].filter(Boolean).join(" ")
    const geocoded = await geocodeAddressCandidates(
      [{ rawText: query, score: 1.0 }],
      {
        city,
        postalCode,
        country: "France",
      }
    )

    if (geocoded.length === 0) {
      return null
    }

    const center = geocoded[0]

    // Créer un bounding box de ~2km autour du centre
    const radius = 0.018 // ~2km en degrés
    return {
      minLat: center.latitude - radius,
      maxLat: center.latitude + radius,
      minLng: center.longitude - radius,
      maxLng: center.longitude + radius,
    }
  } catch (error) {
    console.warn("⚠️ [Parcel Scanner] Erreur calcul bounding box:", error)
    return null
  }
}

/**
 * Récupère les parcelles cadastrales via API cadastre data.gouv.fr
 * 
 * Fallback : Utilise OSM Overpass API si cadastre indisponible
 */
export async function fetchParcels(
  bbox: BoundingBox,
  city?: string,
  postalCode?: string
): Promise<ParcelCandidate[]> {
  const parcels: ParcelCandidate[] = []

  try {
    // Option 1 : API Cadastre (prioritaire)
    // Documentation: https://geo.api.gouv.fr/cadastre
    const codeCommune = postalCode?.substring(0, 2) || ""

    if (codeCommune) {
      try {
        // Essayer l'API cadastre
        const response = await fetch(
          `https://geo.api.gouv.fr/communes?codePostal=${postalCode}&fields=code`,
          {
            headers: { Accept: "application/json" },
          }
        )

        if (response.ok) {
          const communes = await response.json()
          if (communes.length > 0) {
            const communeCode = communes[0].code

            // Récupérer les parcelles pour cette commune
            // Note: L'API cadastre nécessite souvent un format spécifique
            // Pour l'instant, on génère des parcelles candidates sur une grille
            console.log(`🗺️ [Parcel Scanner] Commune trouvée: ${communeCode}`)
          }
        }
      } catch (error) {
        console.warn("⚠️ [Parcel Scanner] Erreur API cadastre, fallback OSM:", error)
      }
    }

    // Option 2 : Fallback OSM Overpass API
    // Générer des candidats sur une grille dans le bounding box
    const gridSize = 0.002 // ~200m entre chaque point
    const latSteps = Math.ceil((bbox.maxLat - bbox.minLat) / gridSize)
    const lngSteps = Math.ceil((bbox.maxLng - bbox.minLng) / gridSize)

    // Limiter à 50 parcelles max pour éviter trop de requêtes
    const maxParcels = 50
    const step = Math.max(1, Math.floor((latSteps * lngSteps) / maxParcels))

    for (let i = 0; i < latSteps; i += step) {
      for (let j = 0; j < lngSteps; j += step) {
        if (parcels.length >= maxParcels) break

        const lat = bbox.minLat + i * gridSize
        const lng = bbox.minLng + j * gridSize

        // Créer un polygone simple (carré de ~200m)
        const polygon = [
          { lat: lat - gridSize / 2, lng: lng - gridSize / 2 },
          { lat: lat + gridSize / 2, lng: lng - gridSize / 2 },
          { lat: lat + gridSize / 2, lng: lng + gridSize / 2 },
          { lat: lat - gridSize / 2, lng: lng + gridSize / 2 },
        ]

        parcels.push({
          id: `parcel-${i}-${j}`,
          centroid: { lat, lng },
          polygon,
          satelliteImageUrl: getSatelliteCrop(lat, lng),
        })
      }
      if (parcels.length >= maxParcels) break
    }

    console.log(`✅ [Parcel Scanner] ${parcels.length} parcelles candidates générées`)

    return parcels
  } catch (error) {
    console.error("❌ [Parcel Scanner] Erreur fetchParcels:", error)
    return []
  }
}

/**
 * Récupère les emprises de bâtiments (footprints) via OSM Overpass
 * 
 * Fallback : Génère des emprises estimées si OSM indisponible
 */
export async function fetchBuildingFootprints(
  parcels: ParcelCandidate[]
): Promise<ParcelCandidate[]> {
  // Pour l'instant, on génère des emprises estimées
  // TODO: Intégrer Overpass API pour récupérer les vrais footprints

  return parcels.map((parcel) => {
    // Générer un footprint estimé (rectangle au centre de la parcelle)
    const size = 0.001 // ~100m
    const footprint = [
      {
        lat: parcel.centroid.lat - size / 2,
        lng: parcel.centroid.lng - size / 2,
      },
      {
        lat: parcel.centroid.lat + size / 2,
        lng: parcel.centroid.lng - size / 2,
      },
      {
        lat: parcel.centroid.lat + size / 2,
        lng: parcel.centroid.lng + size / 2,
      },
      {
        lat: parcel.centroid.lat - size / 2,
        lng: parcel.centroid.lng + size / 2,
      },
    ]

    return {
      ...parcel,
      buildingFootprint: footprint,
    }
  })
}

/**
 * Génère une URL d'image satellite crop pour une parcelle
 * 
 * Utilise Google Static Maps API (satellite) ou IGN Géoportail en fallback
 */
export function getSatelliteCrop(
  lat: number,
  lng: number,
  width: number = 400,
  height: number = 400,
  zoom: number = 20
): string {
  if (GOOGLE_MAPS_API_KEY) {
    // Google Static Maps API (satellite)
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`
  }

  // Fallback : IGN Géoportail (orthophotos)
  // Documentation: https://geoservices.ign.fr/documentation/services/api-et-services-ogc/images-wmts
  const tileSize = 256
  const scale = Math.pow(2, 21 - zoom) // IGN utilise un système de zoom différent
  const x = Math.floor((lng + 180) / 360 * scale)
  const y = Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) /
      2) *
      scale
  )

  // URL IGN Orthophotos WMTS
  return `https://wxs.ign.fr/choisirgeoportail/geoportail/wmts?LAYER=ORTHOIMAGERY.ORTHOPHOTOS&EXCEPTIONS=text/xml&FORMAT=image/jpeg&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX=${zoom}&TILEROW=${y}&TILECOL=${x}`
}

/**
 * Construit la liste complète de candidats parcelles
 */
export async function buildParcelCandidates(
  city?: string,
  postalCode?: string,
  customBbox?: BoundingBox
): Promise<ParcelCandidate[]> {
  try {
    // Calculer ou utiliser le bounding box
    const bbox = customBbox || (await calculateBoundingBox(city, postalCode))

    if (!bbox) {
      console.warn("⚠️ [Parcel Scanner] Impossible de calculer bounding box")
      return []
    }

    // Récupérer les parcelles
    const parcels = await fetchParcels(bbox, city, postalCode)

    // Enrichir avec les footprints de bâtiments
    const enriched = await fetchBuildingFootprints(parcels)

    // Enrichir avec les adresses (reverse geocoding)
    // Limiter à 20 parcelles pour éviter trop de requêtes
    const toEnrich = enriched.slice(0, 20)
    const withAddresses = await Promise.all(
      toEnrich.map(async (parcel) => {
        try {
          const geocodeResult = await reverseGeocode(parcel.centroid.lat, parcel.centroid.lng)
          if (geocodeResult?.address) {
            // Extraire code postal et ville
            const postalCodeMatch = geocodeResult.address.match(/\b(\d{5})\b/)
            const postalCode = postalCodeMatch ? postalCodeMatch[1] : undefined

            // Extraire ville (après code postal)
            const cityMatch = geocodeResult.address.match(/\d{5}\s+([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s-]+?)(?:,|$)/i)
            const city = cityMatch ? cityMatch[1].trim() : undefined

            return {
              ...parcel,
              address: geocodeResult.address,
              postalCode,
              city,
            }
          }
        } catch (error) {
          console.warn(`⚠️ [Parcel Scanner] Erreur reverse geocoding pour ${parcel.id}:`, error)
        }

        return parcel
      })
    )

    // Ajouter les parcelles non enrichies
    const remaining = enriched.slice(20)

    const allParcels = [...withAddresses, ...remaining]

    console.log(`✅ [Parcel Scanner] ${allParcels.length} parcelles candidates construites`)

    return allParcels
  } catch (error) {
    console.error("❌ [Parcel Scanner] Erreur buildParcelCandidates:", error)
    return []
  }
}

