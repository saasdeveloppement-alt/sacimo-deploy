/**
 * Service de réduction de zone de recherche géographique
 * 
 * NOUVEAU : Mode STRICT_POSTAL_ZONE pour contrainte absolue sur le code postal
 */

import type { ImageAnalysisResult, UrlExtractionResult, SearchZone, LocalisationHints, StrictSearchZone } from '@/types/localisation-advanced';

/**
 * Récupère les bounds d'un code postal
 */
async function getCodePostalBounds(codePostal: string): Promise<{ center: { lat: number; lng: number }; bounds: any }> {
  // Utiliser Google Geocoding API
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?` +
      `address=${encodeURIComponent(codePostal + ', France')}` +
      `&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const bounds = data.results[0].geometry.bounds;
      
      return {
        center: { lat: location.lat, lng: location.lng },
        bounds: bounds ? {
          north: bounds.northeast.lat,
          south: bounds.southwest.lat,
          east: bounds.northeast.lng,
          west: bounds.southwest.lng,
        } : undefined,
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  
  // Fallback: centre approximatif de la France
  return {
    center: { lat: 46.6034, lng: 1.8883 },
    bounds: undefined,
  };
}

/**
 * Récupère les bounds d'une ville
 */
async function getCityBounds(ville: string): Promise<{ center: { lat: number; lng: number }; bounds: any }> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?` +
      `address=${encodeURIComponent(ville + ', France')}` +
      `&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const viewport = data.results[0].geometry.viewport;
      
      return {
        center: { lat: location.lat, lng: location.lng },
        bounds: viewport ? {
          north: viewport.northeast.lat,
          south: viewport.southwest.lat,
          east: viewport.northeast.lng,
          west: viewport.southwest.lng,
        } : undefined,
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  
  return {
    center: { lat: 46.6034, lng: 1.8883 },
    bounds: undefined,
  };
}

/**
 * Infère les régions possibles depuis les indices climatiques
 */
function inferRegionsFromClimate(
  indices: ImageAnalysisResult['indicesGeographiques']
): string[] {
  const regions: string[] = [];
  
  switch (indices.climat) {
    case 'méditerranéen':
      regions.push('13', '06', '83', '84', '30', '34', '11', '66'); // PACA, Occitanie
      break;
    case 'océanique':
      regions.push('33', '44', '29', '35', '56', '17', '85'); // Nouvelle-Aquitaine, Bretagne
      break;
    case 'continental':
      regions.push('75', '77', '78', '91', '92', '93', '94', '95'); // Île-de-France
      break;
    case 'montagnard':
      regions.push('73', '74', '38', '05', '04'); // Alpes, Pyrénées
      break;
  }
  
  return regions;
}

/**
 * Détermine la zone de recherche optimale
 */
export async function determineSearchZone(
  imageAnalysis: ImageAnalysisResult,
  urlData?: UrlExtractionResult,
  userHints?: LocalisationHints
): Promise<SearchZone> {
  console.log('[ZoneReduction] Determining search zone...');

  // 1. Si GPS dans image → zone très précise (500m radius)
  if (imageAnalysis.metadata?.gpsCoordinates) {
    console.log('[ZoneReduction] Using GPS coordinates from image');
    return {
      center: imageAnalysis.metadata.gpsCoordinates,
      radius: 500,
      constraints: {},
      filters: {},
      confidence: 'high',
    };
  }

  // 2. Si code postal connu → zone communale
  const codePostal = urlData?.localisation?.codePostal || userHints?.codePostal;
  if (codePostal) {
    console.log('[ZoneReduction] Using postal code:', codePostal);
    const bounds = await getCodePostalBounds(codePostal);
    return {
      center: bounds.center,
      radius: 3000, // 3km
      constraints: {
        codePostaux: [codePostal],
        bbox: bounds.bounds,
      },
      filters: {
        typeBien: imageAnalysis.typeBien !== 'inconnu' ? imageAnalysis.typeBien : undefined,
        surfaceMin: userHints?.surfaceMin,
        surfaceMax: userHints?.surfaceMax,
        prixMin: userHints?.prixMin,
        prixMax: userHints?.prixMax,
      },
      confidence: 'high',
    };
  }

  // 3. Si ville connue → zone large
  const ville = urlData?.localisation?.ville || userHints?.ville;
  if (ville) {
    console.log('[ZoneReduction] Using city:', ville);
    const bounds = await getCityBounds(ville);
    return {
      center: bounds.center,
      radius: 10000, // 10km
      constraints: {
        communes: [ville],
        bbox: bounds.bounds,
      },
      filters: {
        typeBien: imageAnalysis.typeBien !== 'inconnu' ? imageAnalysis.typeBien : undefined,
        surfaceMin: userHints?.surfaceMin,
        surfaceMax: userHints?.surfaceMax,
        prixMin: userHints?.prixMin,
        prixMax: userHints?.prixMax,
      },
      confidence: 'medium',
    };
  }

  // 4. Si seulement indices climatiques → région
  if (imageAnalysis.indicesGeographiques.climat !== 'inconnu') {
    console.log('[ZoneReduction] Using climate indices');
    const possibleRegions = inferRegionsFromClimate(imageAnalysis.indicesGeographiques);
    return {
      center: { lat: 46.6034, lng: 1.8883 }, // Centre France
      radius: 50000, // 50km
      constraints: {
        departements: possibleRegions,
      },
      filters: {
        typeBien: imageAnalysis.typeBien !== 'inconnu' ? imageAnalysis.typeBien : undefined,
      },
      confidence: 'low',
    };
  }

  // Cas par défaut : erreur
  throw new Error('Zone de recherche trop large - besoin de plus d\'indices (code postal, ville, ou coordonnées GPS)');
}

/**
 * NOUVEAU : Détermine une zone STRICTEMENT bornée par code postal
 * Mode "machine de guerre" : aucune extension automatique
 */
export async function determineStrictPostalZone(
  postalCode: string,
  radiusKm?: number
): Promise<StrictSearchZone> {
  console.log(`[ZoneReduction] Determining STRICT postal zone for ${postalCode}${radiusKm ? ` (radius: ${radiusKm}km)` : ''}`);
  
  if (!postalCode || postalCode.length !== 5) {
    throw new Error('Code postal invalide (doit être 5 chiffres)');
  }
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }
  
  try {
    // 1. Géocoder le code postal pour obtenir le centre et les bounds
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?` +
      `address=${encodeURIComponent(postalCode + ', France')}` +
      `&key=${apiKey}`
    );
    
    const geocodeData = await geocodeResponse.json();
    
    if (!geocodeData.results || geocodeData.results.length === 0) {
      throw new Error(`Code postal ${postalCode} non trouvé`);
    }
    
    // Prendre le premier résultat (le plus pertinent)
    const result = geocodeData.results[0];
    const location = result.geometry.location;
    const viewport = result.geometry.viewport || result.geometry.bounds;
    
    // 2. Construire les bounds du code postal
    const bounds = viewport ? {
      north: viewport.northeast.lat,
      south: viewport.southwest.lat,
      east: viewport.northeast.lng,
      west: viewport.southwest.lng,
    } : {
      // Fallback : créer un bbox approximatif autour du centre
      north: location.lat + 0.01,
      south: location.lat - 0.01,
      east: location.lng + 0.01,
      west: location.lng - 0.01,
    };
    
    // 3. Si radiusKm est défini, ajuster le bbox pour rester dans le cercle
    // MAIS on garde toujours le filtrage strict par code postal
    let finalBounds = bounds;
    
    if (radiusKm && radiusKm > 0) {
      const radiusDeg = radiusKm / 111; // Approximation : 1 degré ≈ 111 km
      finalBounds = {
        north: Math.min(bounds.north, location.lat + radiusDeg),
        south: Math.max(bounds.south, location.lat - radiusDeg),
        east: Math.min(bounds.east, location.lng + radiusDeg),
        west: Math.max(bounds.west, location.lng - radiusDeg),
      };
    }
    
    // 4. Extraire le nom de la commune si disponible
    let communeName: string | undefined;
    result.address_components.forEach((comp: any) => {
      if (comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')) {
        communeName = comp.long_name;
      }
    });
    
    const strictZone: StrictSearchZone = {
      postalCode,
      center: { lat: location.lat, lng: location.lng },
      radiusKm,
      bounds: finalBounds,
      mode: 'STRICT_POSTAL_ZONE',
    };
    
    console.log(`[ZoneReduction] Strict zone determined:`, {
      postalCode,
      center: strictZone.center,
      radiusKm: strictZone.radiusKm,
      bounds: strictZone.bounds,
    });
    
    return strictZone;
  } catch (error) {
    console.error('[ZoneReduction] Error determining strict postal zone:', error);
    throw new Error(`Impossible de déterminer la zone pour le code postal ${postalCode}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

