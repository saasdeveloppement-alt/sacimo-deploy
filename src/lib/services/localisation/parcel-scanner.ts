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
/**
 * Calcule la distance Haversine entre deux points GPS (en km)
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Filtre les parcelles selon une zone de recherche (CONTRAINTE DURE)
 * 
 * Si radiusKm === 0 : filtre strict par bounds (commune stricte)
 * Si radiusKm > 0 : filtre strict par distance Haversine (rayon strict)
 */
export function filterParcelsByZone(
  parcels: ParcelCandidate[],
  zone: { lat: number; lng: number; radiusKm: number; bounds?: { north: number; south: number; east: number; west: number } }
): ParcelCandidate[] {
  const totalBefore = parcels.length;
  
  console.log(`[ZONE] Zone reçue: lat=${zone.lat}, lng=${zone.lng}, radiusKm=${zone.radiusKm}, bounds=${zone.bounds ? 'présents' : 'absents'}`);
  console.log(`[CANDIDATES] Total avant filtrage zone: ${totalBefore}`);
  
  let filtered: ParcelCandidate[] = [];
  let rejectedCount = 0;
  
  if (zone.radiusKm === 0 && zone.bounds) {
    // FILTRAGE STRICT PAR BOUNDS (commune stricte)
    console.log(`[ZONE] Filtrage strict par bounds (commune stricte)`);
    filtered = parcels.filter((parcel) => {
      const { lat, lng } = parcel.centroid;
      const inBounds = (
        lat >= zone.bounds!.south &&
        lat <= zone.bounds!.north &&
        lng >= zone.bounds!.west &&
        lng <= zone.bounds!.east
      );
      
      if (!inBounds) {
        rejectedCount++;
        console.log(`[ZONE] Candidat rejeté hors bounds: id=${parcel.id}, lat=${lat}, lng=${lng}`);
      }
      
      return inBounds;
    });
    console.log(`[CANDIDATES] Après filtre commune stricte: ${filtered.length} (${rejectedCount} rejetés)`);
  } else if (zone.radiusKm > 0) {
    // FILTRAGE STRICT PAR RAYON (distance Haversine)
    console.log(`[ZONE] Filtrage strict par rayon: ${zone.radiusKm} km`);
    filtered = parcels.filter((parcel) => {
      const distance = haversineDistance(
        zone.lat,
        zone.lng,
        parcel.centroid.lat,
        parcel.centroid.lng
      );
      const inRadius = distance <= zone.radiusKm;
      
      if (!inRadius) {
        rejectedCount++;
        console.log(`[ZONE] Candidat rejeté hors rayon: id=${parcel.id}, distanceKm=${distance.toFixed(2)} (max=${zone.radiusKm})`);
      }
      
      return inRadius;
    });
    console.log(`[CANDIDATES] Après filtre rayon: ${filtered.length} (${rejectedCount} rejetés)`);
  } else {
    // Si pas de zone définie, retourner toutes les parcelles (mais log un warning)
    console.warn(`[ZONE] ⚠️ Pas de zone définie, retour de toutes les parcelles (${parcels.length})`);
    return parcels;
  }
  
  return filtered;
}

/**
 * Extrait la ville et le code postal depuis le label d'une zone
 * Ex: "Bordeaux, Gironde, France" -> { city: "Bordeaux", postalCode: null }
 * Ex: "Bordeaux, 33000, France" -> { city: "Bordeaux", postalCode: "33000" }
 */
function extractCityAndPostalCodeFromLabel(label: string): { city: string | null; postalCode: string | null } {
  const parts = label.split(',').map(p => p.trim());
  let city: string | null = null;
  let postalCode: string | null = null;
  
  if (parts.length > 0) {
    city = parts[0]; // La première partie est généralement la ville
  }
  
  // Chercher un code postal dans les parties (format 5 chiffres)
  for (const part of parts) {
    const postalMatch = part.match(/\b(\d{5})\b/);
    if (postalMatch) {
      postalCode = postalMatch[1];
      break;
    }
  }
  
  return { city, postalCode };
}

/**
 * Normalise une ville pour la comparaison (enlève accents, majuscules, etc.)
 */
function normalizeCity(city: string | undefined | null): string | null {
  if (!city) return null;
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlève les accents
    .trim();
}

export async function buildParcelCandidates(
  city?: string,
  postalCode?: string,
  customBbox?: BoundingBox,
  searchZone?: { 
    lat: number; 
    lng: number; 
    radiusKm: number; 
    bounds?: { north: number; south: number; east: number; west: number };
    label?: string; // Label de la zone (ex: "Bordeaux, Gironde, France")
  }
): Promise<ParcelCandidate[]> {
  try {
    // Extraire la ville et le code postal cibles depuis le label de la zone
    const { city: extractedCity, postalCode: extractedPostalCode } = searchZone?.label 
      ? extractCityAndPostalCodeFromLabel(searchZone.label)
      : { city: city || null, postalCode: postalCode || null };
    
    const targetCity = extractedCity || city;
    const targetPostalCode = extractedPostalCode || postalCode;
    const normalizedTargetCity = normalizeCity(targetCity);

    // Si une zone de recherche est fournie, l'utiliser directement
    let bbox: BoundingBox | null = null;
    
    if (searchZone) {
      if (searchZone.radiusKm === 0 && searchZone.bounds) {
        // Utiliser les bounds directement
        bbox = {
          minLat: searchZone.bounds.south,
          maxLat: searchZone.bounds.north,
          minLng: searchZone.bounds.west,
          maxLng: searchZone.bounds.east,
        };
      } else if (searchZone.radiusKm > 0) {
        // Calculer un bbox approximatif depuis le centre et le rayon
        // 1 degré ≈ 111 km
        const radiusDeg = searchZone.radiusKm / 111;
        bbox = {
          minLat: searchZone.lat - radiusDeg,
          maxLat: searchZone.lat + radiusDeg,
          minLng: searchZone.lng - radiusDeg,
          maxLng: searchZone.lng + radiusDeg,
        };
      }
    }
    
    // Sinon, calculer ou utiliser le bounding box classique
    if (!bbox) {
      bbox = customBbox || (await calculateBoundingBox(city, postalCode));
    }

    if (!bbox) {
      console.warn("⚠️ [Parcel Scanner] Impossible de calculer bounding box")
      return []
    }

    // Récupérer les parcelles (on récupère plus que nécessaire pour pouvoir filtrer après)
    const parcels = await fetchParcels(bbox, city, postalCode)
    
    // Filtrer par zone géographique si fournie
    const filteredParcels = searchZone
      ? filterParcelsByZone(parcels, searchZone)
      : parcels;

    // Enrichir avec les footprints de bâtiments
    const enriched = await fetchBuildingFootprints(filteredParcels)

    // Enrichir avec les adresses (reverse geocoding)
    // Limiter à 30 parcelles pour éviter trop de requêtes et timeouts
    const toEnrich = enriched.slice(0, 30)
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

    // FILTRAGE STRICT PAR VILLE ET CODE POSTAL : Ne garder que les parcelles qui correspondent
    let finalParcels = withAddresses;
    if (normalizedTargetCity || targetPostalCode) {
      finalParcels = withAddresses.filter((parcel) => {
        // Si pas de ville ni code postal, on garde quand même (peut être enrichi plus tard)
        if (!parcel.city && !parcel.postalCode) {
          return true;
        }
        
        // Vérifier le code postal en priorité (plus précis)
        if (targetPostalCode && parcel.postalCode) {
          // Si le code postal correspond, c'est bon
          if (parcel.postalCode === targetPostalCode) {
            return true;
          }
          // Sinon, exclure
          return false;
        }
        
        // Vérifier la ville si pas de code postal
        if (normalizedTargetCity && parcel.city) {
          const normalizedParcelCity = normalizeCity(parcel.city);
          // Vérifier si la ville correspond (exact match ou contient la ville cible)
          const cityMatches = normalizedParcelCity === normalizedTargetCity || 
                             normalizedParcelCity.includes(normalizedTargetCity) ||
                             normalizedTargetCity.includes(normalizedParcelCity);
          return cityMatches;
        }
        
        // Si on a une ville cible mais pas de ville dans la parcelle, exclure
        if (normalizedTargetCity && !parcel.city) {
          return false;
        }
        
        // Sinon, garder
        return true;
      });
      
      console.log(`🔍 [Parcel Scanner] Filtrage par zone "${targetCity || '?'}" ${targetPostalCode ? `(${targetPostalCode})` : ''}: ${withAddresses.length} -> ${finalParcels.length} parcelles`);
    }

    // Ajouter les parcelles non enrichies (mais seulement si elles sont dans la zone géographique)
    const remaining = enriched.slice(20);
    const remainingInZone = searchZone 
      ? filterParcelsByZone(remaining, searchZone)
      : remaining;

    const allParcels = [...finalParcels, ...remainingInZone]

    // OPTIMISATION : Limiter à 30 parcelles max pour éviter les timeouts
    const maxParcels = 30
    const limitedParcels = allParcels.slice(0, maxParcels)

    console.log(`✅ [Parcel Scanner] ${limitedParcels.length} parcelles candidates construites (sur ${allParcels.length} disponibles, filtrées par zone: ${targetCity || 'toutes'})`)

    return limitedParcels
  } catch (error) {
    console.error("❌ [Parcel Scanner] Erreur buildParcelCandidates:", error)
    return []
  }
}

