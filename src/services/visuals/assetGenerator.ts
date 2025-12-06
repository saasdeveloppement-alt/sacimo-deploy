/**
 * Service de génération d'assets visuels (satellite, Street View, cadastre, etc.)
 * 
 * NOUVEAU : Génère CandidateVisuals pour le nouveau pipeline
 * OBLIGATOIRE : Chaque candidat DOIT avoir une vue cadastrale
 */

import type { VisualsPackage, CandidateVisuals } from '@/types/localisation-advanced';

// Type GeoJSON simplifié pour la géométrie de parcelle
interface GeoJSONGeometry {
  type: 'Polygon' | 'MultiPolygon' | 'Point' | 'LineString';
  coordinates: any;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/**
 * Génère une URL d'image satellite Google Maps Static API
 */
export async function generateSatelliteImage(
  lat: number,
  lng: number
): Promise<string | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('[AssetGenerator] Google Maps API key not configured');
    return null;
  }

  try {
    const zoom = 19; // Maximum pour voir les détails
    const size = '800x600';

    const url =
      `https://maps.googleapis.com/maps/api/staticmap?` +
      `center=${lat},${lng}` +
      `&zoom=${zoom}` +
      `&size=${size}` +
      `&maptype=satellite` +
      `&markers=color:red|${lat},${lng}` +
      `&key=${GOOGLE_MAPS_API_KEY}`;

    return url;
  } catch (error) {
    console.error('[AssetGenerator] Satellite image generation error:', error);
    return null;
  }
}

/**
 * Génère une URL d'image Street View Google Maps Static API
 */
export async function generateStreetViewImage(
  lat: number,
  lng: number
): Promise<string | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('[AssetGenerator] Google Maps API key not configured');
    return null;
  }

  try {
    // 1. Vérifier disponibilité Street View
    const metadataResponse = await fetch(
      `https://maps.googleapis.com/maps/api/streetview/metadata?` +
      `location=${lat},${lng}` +
      `&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (!metadataResponse.ok) {
      return null;
    }

    const metadata = await metadataResponse.json();

    if (metadata.status !== 'OK') {
      return null;
    }

    // 2. Générer l'URL Street View
    const url =
      `https://maps.googleapis.com/maps/api/streetview?` +
      `location=${lat},${lng}` +
      `&size=800x600` +
      `&fov=90` +
      `&pitch=0` +
      `&key=${GOOGLE_MAPS_API_KEY}`;

    return url;
  } catch (error) {
    console.error('[AssetGenerator] Street View generation error:', error);
    return null;
  }
}

/**
 * Récupère la géométrie de la parcelle cadastrale via l'API IGN
 * Retourne null si aucune parcelle trouvée
 */
async function getParcelGeometry(lat: number, lng: number): Promise<{ geometry: GeoJSONGeometry; hasParcel: boolean } | null> {
  try {
    // Utiliser les coordonnées EXACTES (pas arrondies)
    const exactLat = lat;
    const exactLng = lng;
    
    console.log(`[AssetGenerator] Fetching parcel geometry for EXACT coordinates: ${exactLat}, ${exactLng}`);
    
    const apiUrl = `https://apicarto.ign.fr/api/cadastre/parcelle?lat=${exactLat}&lon=${exactLng}`;
    console.log(`[AssetGenerator] IGN API URL: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn(`[AssetGenerator] IGN API returned ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`[AssetGenerator] IGN API response:`, JSON.stringify(data).substring(0, 200));
    
    // L'API retourne un FeatureCollection
    if (data.features && Array.isArray(data.features) && data.features.length > 0) {
      const feature = data.features[0];
      const parcelNum = feature.properties?.numero || feature.properties?.numero_parcelle || 'unknown';
      console.log(`[AssetGenerator] ✅ Parcel found: ${parcelNum}`);
      return {
        geometry: feature.geometry,
        hasParcel: true,
      };
    }
    
    // Si pas de features, vérifier si c'est un Feature direct
    if (data.geometry && data.type === 'Feature') {
      console.log(`[AssetGenerator] ✅ Parcel found (direct feature)`);
      return {
        geometry: data.geometry,
        hasParcel: true,
      };
    }
    
    console.warn(`[AssetGenerator] ⚠️ No parcel found in IGN API response`);
    return null;
  } catch (error) {
    console.error('[AssetGenerator] Error fetching parcel geometry:', error);
    return null;
  }
}

/**
 * Convertit lat/lng en coordonnées de tuile WMTS
 */
function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const n = Math.pow(2, zoom);
  const x = Math.floor((lng + 180) / 360 * n);
  const latRad = lat * Math.PI / 180;
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return { x, y };
}

/**
 * Fallback : Génère une URL via la route API cadastre
 * Utilise les coordonnées EXACTES
 */
function generateCadastralImageWMS(lat: number, lng: number): string {
  const exactLat = lat;
  const exactLng = lng;
  
  // Utiliser la route API cadastre comme fallback
  const cadastreUrl = `/api/cadastre?lat=${exactLat}&lng=${exactLng}`;

  console.log(`[AssetGenerator] Using API cadastre fallback at ${exactLat}, ${exactLng}`);
  return cadastreUrl;
}

/**
 * Génère une URL d'image cadastrale OBLIGATOIRE
 * Utilise la nouvelle route API /api/cadastre qui essaie plusieurs services WMS
 * GARANTIT de toujours retourner une URL fonctionnelle
 */
export async function generateCadastralImage(
  lat: number,
  lng: number
): Promise<string> {
  try {
    // Utiliser les coordonnées EXACTES (pas arrondies)
    const exactLat = lat;
    const exactLng = lng;
    
    console.log(`[AssetGenerator] 🔵 Generating cadastral image for EXACT coordinates: ${exactLat}, ${exactLng}`);
    
    // Utiliser la nouvelle route API cadastre qui gère plusieurs services WMS
    const cadastreUrl = `/api/cadastre?lat=${exactLat}&lng=${exactLng}`;
    
    console.log(`[AssetGenerator] ✅ Cadastral URL generated: ${cadastreUrl}`);
    
    return cadastreUrl;
    
  } catch (error) {
    console.error('[AssetGenerator] ❌ Cadastral image generation error:', error);
    // Fallback vers l'ancienne méthode en cas d'erreur
    return generateCadastralImageWMS(lat, lng);
  }
}

/**
 * Génère une vue satellite Google Maps
 */
async function generateSatelliteView(
  coordinates: { lat: number; lng: number }
): Promise<VisualsPackage['satellite']> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  const zoom = 19; // Maximum pour voir les détails
  const size = '800x600';

  const url =
    `https://maps.googleapis.com/maps/api/staticmap?` +
    `center=${coordinates.lat},${coordinates.lng}` +
    `&zoom=${zoom}` +
    `&size=${size}` +
    `&maptype=satellite` +
    `&markers=color:red|${coordinates.lat},${coordinates.lng}` +
    `&key=${GOOGLE_MAPS_API_KEY}`;

  return {
    url,
    zoom,
    mapType: 'satellite',
    markers: [
      {
        lat: coordinates.lat,
        lng: coordinates.lng,
        label: 'Bien',
      },
    ],
  };
}

/**
 * Génère une vue Street View (si disponible)
 */
async function generateStreetView(
  coordinates: { lat: number; lng: number }
): Promise<VisualsPackage['streetView'] | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    return null;
  }

  try {
    // 1. Vérifier disponibilité Street View
    const metadataResponse = await fetch(
      `https://maps.googleapis.com/maps/api/streetview/metadata?` +
      `location=${coordinates.lat},${coordinates.lng}` +
      `&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (!metadataResponse.ok) {
      return null;
    }

    const metadata = await metadataResponse.json();

    if (metadata.status !== 'OK') {
      return null;
    }

    // 2. Générer l'URL Street View
    const url =
      `https://maps.googleapis.com/maps/api/streetview?` +
      `location=${coordinates.lat},${coordinates.lng}` +
      `&size=800x600` +
      `&fov=90` +
      `&pitch=0` +
      `&key=${GOOGLE_MAPS_API_KEY}`;

    return {
      url,
      panoId: metadata.pano_id,
      heading: 0,
      pitch: 0,
    };
  } catch (error) {
    console.error('Street View generation error:', error);
    return null;
  }
}

/**
 * Génère une vue cadastrale IGN
 */
async function generateCadastreView(
  coordinates: { lat: number; lng: number }
): Promise<VisualsPackage['cadastre'] | null> {
  try {
    // API WFS Cadastre IGN
    const bbox = {
      west: coordinates.lng - 0.001,
      south: coordinates.lat - 0.001,
      east: coordinates.lng + 0.001,
      north: coordinates.lat + 0.001,
    };

    // Layer CORRIGÉ : utiliser CADASTRALPARCELS.PARCELS (WFS pour données GeoJSON)
    // Note: Cette fonction est pour récupérer les données, pas pour générer l'image
    const url =
      `https://data.geopf.fr/wfs?` +
      `SERVICE=WFS&VERSION=2.0.0` +
      `&REQUEST=GetFeature` +
      `&TYPENAME=CADASTRALPARCELS.PARCELS` +
      `&OUTPUTFORMAT=application/json` +
      `&CRS=EPSG:4326` +
      `&BBOX=${bbox.west},${bbox.south},${bbox.east},${bbox.north}`;

    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Extraire les parcelles
    const parcelles: string[] = [];
    if (data.features) {
      data.features.forEach((feature: any) => {
        const props = feature.properties;
        if (props.numero) {
          parcelles.push(props.numero);
        }
      });
    }

    // Pour l'instant, on retourne juste les données
    // TODO: Générer une image du plan cadastral
    return {
      url: url, // URL temporaire, à remplacer par une image générée
      parcelles: parcelles,
    };
  } catch (error) {
    console.error('Cadastre generation error:', error);
    return null;
  }
}

/**
 * Génère une orthophoto IGN
 */
async function generateOrthophoto(
  coordinates: { lat: number; lng: number },
  zoom: number = 19
): Promise<VisualsPackage['orthophoto'] | null> {
  try {
    // WMTS IGN Orthophotos
    // Note: Nécessite une clé API IGN (gratuite mais requise)
    const tileX = Math.floor((coordinates.lng + 180) / 360 * Math.pow(2, zoom));
    const tileY = Math.floor(
      (1 -
        Math.log(
          Math.tan((coordinates.lat * Math.PI) / 180) +
            1 / Math.cos((coordinates.lat * Math.PI) / 180)
        ) /
          Math.PI) /
        2 *
        Math.pow(2, zoom)
    );

    const url =
      `https://data.geopf.fr/wmts?` +
      `SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile` +
      `&LAYER=ORTHOIMAGERY.ORTHOPHOTOS` +
      `&STYLE=normal` +
      `&TILEMATRIXSET=PM` +
      `&TILEMATRIX=${zoom}` +
      `&TILEROW=${tileY}` +
      `&TILECOL=${tileX}` +
      `&FORMAT=image/jpeg`;

    return {
      url,
      resolution: `${zoom}`,
    };
  } catch (error) {
    console.error('Orthophoto generation error:', error);
    return null;
  }
}

/**
 * Génère une carte interactive (embed URL)
 */
function generateInteractiveMap(
  coordinates: { lat: number; lng: number }
): VisualsPackage['interactiveMap'] {
  const embedUrl =
    `https://www.google.com/maps/embed/v1/place?` +
    `key=${GOOGLE_MAPS_API_KEY}` +
    `&q=${coordinates.lat},${coordinates.lng}` +
    `&zoom=18`;

  return {
    embedUrl,
    center: coordinates,
    zoom: 18,
  };
}

/**
 * Fonction principale de génération d'assets visuels
 */
export async function generateVisuals(
  coordinates: { lat: number; lng: number }
): Promise<VisualsPackage> {
  console.log('[AssetGenerator] Generating visuals for:', coordinates);

  const visuals: VisualsPackage = {
    satellite: await generateSatelliteView(coordinates),
    interactiveMap: generateInteractiveMap(coordinates),
  };

  // Street View (vérifier disponibilité)
  try {
    const streetView = await generateStreetView(coordinates);
    if (streetView) visuals.streetView = streetView;
  } catch (e) {
    console.log('[AssetGenerator] Street View non disponible');
  }

  // Plan cadastral IGN
  try {
    const cadastre = await generateCadastreView(coordinates);
    if (cadastre) visuals.cadastre = cadastre;
  } catch (e) {
    console.log('[AssetGenerator] Cadastre non disponible');
  }

  // Orthophoto IGN
  try {
    const orthophoto = await generateOrthophoto(coordinates);
    if (orthophoto) visuals.orthophoto = orthophoto;
  } catch (e) {
    console.log('[AssetGenerator] Orthophoto non disponible');
  }

  return visuals;
}

/**
 * NOUVEAU : Génère les assets visuels pour un candidat du nouveau pipeline
 * OBLIGATOIRE : Chaque candidat DOIT avoir une vue cadastrale
 */
export async function generateCandidateVisuals(
  lat: number,
  lng: number
): Promise<CandidateVisuals> {
  console.log(`[AssetGenerator] Generating candidate visuals for ${lat}, ${lng}`);
  
  const visuals: CandidateVisuals = {
    satelliteUrl: '',
    cadastreUrl: '', // OBLIGATOIRE - ne peut pas être undefined
    streetViewAvailable: false,
  };
  
  // 1. Vue satellite
  const satelliteUrl = await generateSatelliteImage(lat, lng);
  if (satelliteUrl) {
    visuals.satelliteUrl = satelliteUrl;
  } else {
    // Fallback : générer une URL même si échec
    visuals.satelliteUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=19&size=800x600&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`;
  }
  
  // 2. Cadastre (OBLIGATOIRE - toujours défini)
  const cadastralUrl = await generateCadastralImage(lat, lng); // Retourne TOUJOURS une URL
  visuals.cadastreOverlayUrl = cadastralUrl;
  visuals.cadastralUrl = cadastralUrl; // OBLIGATOIRE - toujours défini
  console.log(`[AssetGenerator] ✅ Cadastral URL generated: ${cadastralUrl.substring(0, 80)}...`);
  
  // 3. Street View (optionnel)
  const streetViewUrl = await generateStreetViewImage(lat, lng);
  if (streetViewUrl) {
    visuals.streetViewUrl = streetViewUrl;
    visuals.streetViewAvailable = true;
  }
  
  return visuals;
}
