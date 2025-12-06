/**
 * Détecteur de piscines sur images satellite
 * PHASE 3 du pipeline : scan de la zone pour trouver les piscines
 */

import type { StrictSearchZone, CandidateLocation, GeoTile } from '@/types/localisation-advanced';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Génère les tuiles géographiques à scanner dans la zone
 */
export async function getSearchTilesForZone(zone: StrictSearchZone): Promise<GeoTile[]> {
  console.log(`[PoolDetector] Generating search tiles for postal code ${zone.postalCode}`);
  
  const tiles: GeoTile[] = [];
  
  // Déterminer le bounding box à scanner
  const bbox = zone.bounds || {
    north: zone.center.lat + 0.01,
    south: zone.center.lat - 0.01,
    east: zone.center.lng + 0.01,
    west: zone.center.lng - 0.01,
  };
  
  // Si radiusKm est défini, ajuster le bbox pour rester dans le cercle
  if (zone.radiusKm && zone.radiusKm > 0) {
    const radiusDeg = zone.radiusKm / 111; // Approximation : 1 degré ≈ 111 km
    bbox.north = Math.min(bbox.north, zone.center.lat + radiusDeg);
    bbox.south = Math.max(bbox.south, zone.center.lat - radiusDeg);
    bbox.east = Math.min(bbox.east, zone.center.lng + radiusDeg);
    bbox.west = Math.max(bbox.west, zone.center.lng - radiusDeg);
  }
  
  // Générer une grille de points dans le bbox
  const gridSize = 20; // 20x20 = 400 points à tester
  const latStep = (bbox.north - bbox.south) / gridSize;
  const lngStep = (bbox.east - bbox.west) / gridSize;
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const lat = bbox.south + (i * latStep);
      const lng = bbox.west + (j * lngStep);
      
      // Vérifier que le point est dans le rayon si défini
      if (zone.radiusKm && zone.radiusKm > 0) {
        const distance = haversineDistance(
          zone.center.lat,
          zone.center.lng,
          lat,
          lng
        );
        if (distance > zone.radiusKm) continue;
      }
      
      tiles.push({
        id: `tile-${i}-${j}`,
        bounds: {
          north: lat + latStep / 2,
          south: lat - latStep / 2,
          east: lng + lngStep / 2,
          west: lng - lngStep / 2,
        },
        center: { lat, lng },
        zoom: 20, // Zoom élevé pour détecter les piscines
      });
    }
  }
  
  console.log(`[PoolDetector] Generated ${tiles.length} tiles to scan`);
  return tiles;
}

/**
 * Distance Haversine entre deux points GPS (en km)
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
 * Détecte une piscine sur une image satellite
 * Utilise OpenAI Vision pour une détection précise
 */
async function detectPoolOnSatelliteTile(
  tile: GeoTile,
  visualSignature: { hasPool: boolean; poolShape?: string }
): Promise<CandidateLocation | null> {
  // Si on ne cherche pas de piscine, skip
  if (!visualSignature.hasPool) {
    return null;
  }
  
  try {
    // Générer l'URL de l'image satellite
    const satelliteUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${tile.center.lat},${tile.center.lng}&zoom=20&size=400x400&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`;
    
    // Utiliser OpenAI Vision pour détecter la piscine
    if (!OPENAI_API_KEY) {
      console.warn('[PoolDetector] OpenAI API key not configured, skipping pool detection');
      return null;
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Modèle rapide et moins cher
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Y a-t-il une PISCINE visible sur cette image satellite ? 
Réponds UNIQUEMENT avec un JSON :
{
  "hasPool": true/false,
  "poolShape": "rectangular" | "kidney" | "L" | "round" | "unknown",
  "poolSizeCategory": "small" | "medium" | "large" | "unknown",
  "confidence": 0-100
}`
              },
              {
                type: 'image_url',
                image_url: { url: satelliteUrl, detail: 'high' },
              },
            ],
          },
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    });
    
    if (!response.ok) {
      console.error(`[PoolDetector] OpenAI API error: ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      return null;
    }
    
    // Parser le JSON de la réponse
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }
    
    const detection = JSON.parse(jsonMatch[0]);
    
    // Si piscine détectée avec confiance suffisante
    if (detection.hasPool && detection.confidence >= 60) {
      // Reverse geocode pour obtenir l'adresse
      const address = await reverseGeocode(tile.center.lat, tile.center.lng);
      
      // Vérifier que l'adresse est dans le bon code postal (CONTRAINTE STRICTE)
      if (address && address.postalCode) {
        // Le reverse geocoding peut retourner un CP voisin, on vérifie strictement
        // Pour l'instant, on accepte si le CP commence par les mêmes chiffres
        // TODO: Améliorer avec vérification polygon stricte
        const targetCP = address.postalCode;
        
        return {
          id: `candidate-${tile.id}`,
          lat: tile.center.lat,
          lng: tile.center.lng,
          source: 'pool_detection',
          rawSatelliteTileRef: satelliteUrl,
          poolDetected: true,
          poolShape: detection.poolShape || 'unknown',
          poolSizeCategory: detection.poolSizeCategory || 'unknown',
          address: {
            street: address.street,
            city: address.city,
            postalCode: targetCP,
          },
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error(`[PoolDetector] Error detecting pool on tile ${tile.id}:`, error);
    return null;
  }
}

/**
 * Reverse geocode pour obtenir l'adresse d'un point GPS
 */
async function reverseGeocode(lat: number, lng: number): Promise<{ street?: string; city?: string; postalCode?: string } | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    return null;
  }
  
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return null;
    }
    
    const result = data.results[0];
    let street = result.formatted_address.split(',')[0];
    let city = '';
    let postalCode = '';
    
    result.address_components.forEach((comp: any) => {
      if (comp.types.includes('locality')) {
        city = comp.long_name;
      }
      if (comp.types.includes('postal_code')) {
        postalCode = comp.long_name;
      }
    });
    
    return { street, city, postalCode };
  } catch (error) {
    console.error('[PoolDetector] Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Fonction principale : détecte toutes les piscines dans la zone
 */
export async function detectPoolsInZone(
  zone: StrictSearchZone,
  visualSignature: { hasPool: boolean; poolShape?: string }
): Promise<CandidateLocation[]> {
  console.log(`[PoolDetector] Starting pool detection in postal code ${zone.postalCode}`);
  
  // Si pas de piscine recherchée, retourner vide
  if (!visualSignature.hasPool) {
    console.log('[PoolDetector] No pool in visual signature, skipping detection');
    return [];
  }
  
  // 1. Générer les tuiles à scanner
  const tiles = await getSearchTilesForZone(zone);
  
  if (tiles.length === 0) {
    throw new Error('NO_COVERAGE_FOR_POSTAL_CODE');
  }
  
  console.log(`[PoolDetector] Scanning ${tiles.length} tiles for pools...`);
  
  // 2. Scanner les tuiles (en batch pour performance)
  const candidates: CandidateLocation[] = [];
  const batchSize = 10; // Traiter 10 tuiles en parallèle
  
  for (let i = 0; i < tiles.length; i += batchSize) {
    const batch = tiles.slice(i, i + batchSize);
    
    const batchResults = await Promise.all(
      batch.map(tile => detectPoolOnSatelliteTile(tile, visualSignature))
    );
    
    // Filtrer les nulls et vérifier le code postal strict
    for (const candidate of batchResults) {
      if (candidate && candidate.address?.postalCode === zone.postalCode) {
        candidates.push(candidate);
      } else if (candidate) {
        console.log(`[PoolDetector] Rejected candidate outside postal code: ${candidate.address?.postalCode} != ${zone.postalCode}`);
      }
    }
    
    // Limiter à 30 candidats max pour performance
    if (candidates.length >= 30) {
      console.log(`[PoolDetector] Reached limit of 30 candidates, stopping scan`);
      break;
    }
  }
  
  console.log(`[PoolDetector] Found ${candidates.length} pool candidates in postal code ${zone.postalCode}`);
  
  // 3. Si aucune piscine trouvée, lever une erreur métier
  if (candidates.length === 0) {
    throw new Error('NO_POOL_FOUND_IN_ZONE');
  }
  
  return candidates;
}

