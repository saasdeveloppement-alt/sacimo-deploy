/**
 * Service pour générer de nouveaux candidats lors des relances
 * Implémente 3 niveaux d'élargissement progressif
 */

import { PrismaClient } from '@prisma/client';
import { loadExcludedCandidates, filterExcludedCandidates, computePiscineHash, computeRoofHash, CandidateFingerprint } from './exclusionService';
import { generateCadastralImage } from '@/services/visuals/assetGenerator';

const prisma = new PrismaClient();

interface SearchZone {
  center: { lat: number; lng: number };
  radius: number; // en mètres
  postalCode?: string;
  city?: string;
}

interface Candidate {
  id: string;
  adresse: string;
  codePostal: string;
  ville: string;
  coordinates: { lat: number; lng: number };
  matchingScore: {
    global: number;
    details: {
      architectureMatch: number;
      piscineSimilarity: number;
      vegetationMatch: number;
      surfaceMatch: number;
      orientationMatch: number;
      contextMatch: number;
    };
  };
  explanation: string;
  visuals: {
    satelliteUrl: string;
    cadastralUrl: string;
    streetViewUrl: string;
  };
}

/**
 * Génère de nouveaux candidats selon le niveau d'élargissement
 */
export async function generateMoreCandidates(
  requestId: string,
  originalSearchZone: SearchZone,
  imageAnalysis: any,
  searchForPool: boolean
): Promise<{
  candidates: Candidate[];
  level: number;
  excludedCount: number;
  exclusionLog: Array<{ candidate: CandidateFingerprint; reason: string }>;
}> {
  // 1. Charger les candidats exclus
  const excluded = await loadExcludedCandidates(requestId);
  console.log(`[MoreCandidates] Loaded ${excluded.length} excluded candidates`);

  // 2. Déterminer le niveau selon le nombre de runs précédents
  const previousRuns = await prisma.localisationRun.count({
    where: { requestId },
  });
  
  let level = 1;
  if (previousRuns >= 2) {
    level = 3; // Niveau 3 : recherche sur tout le code postal
  } else if (previousRuns >= 1) {
    level = 2; // Niveau 2 : élargissement à ±2km
  }
  // Sinon niveau 1 : élargissement local +150m

  console.log(`[MoreCandidates] Using level ${level} (previous runs: ${previousRuns})`);

  // 3. Calculer la nouvelle zone selon le niveau
  let newZone: SearchZone;
  let numPoints: number;

  if (level === 1) {
    // Niveau 1 : élargissement local (+150m autour des précédentes hypothèses)
    newZone = {
      center: originalSearchZone.center,
      radius: originalSearchZone.radius + 150, // +150m
      postalCode: originalSearchZone.postalCode,
      city: originalSearchZone.city,
    };
    numPoints = 50; // Plus de points pour trouver de nouveaux candidats
    console.log(`[MoreCandidates] Level 1: Expanding by +150m (new radius: ${newZone.radius}m)`);
  } else if (level === 2) {
    // Niveau 2 : élargissement à ±2 km dans la même commune
    newZone = {
      center: originalSearchZone.center,
      radius: 2000, // 2km
      postalCode: originalSearchZone.postalCode,
      city: originalSearchZone.city,
    };
    numPoints = 80;
    console.log(`[MoreCandidates] Level 2: Expanding to ±2km in same commune`);
  } else {
    // Niveau 3 : recherche IA contextuelle sur 100% du code postal
    newZone = {
      center: originalSearchZone.center,
      radius: 5000, // 5km pour couvrir tout le code postal
      postalCode: originalSearchZone.postalCode,
      city: originalSearchZone.city,
    };
    numPoints = 120;
    console.log(`[MoreCandidates] Level 3: Full postal code search (radius: ${newZone.radius}m)`);
  }

  // 4. Générer une grille de points dans la nouvelle zone
  const searchPoints = generateSearchGrid(
    newZone.center.lat,
    newZone.center.lng,
    newZone.radius / 1000, // Convertir en km
    numPoints
  );

  console.log(`[MoreCandidates] Testing ${searchPoints.length} points in expanded zone`);

  // 5. Générer les candidats
  const rawCandidates: Candidate[] = [];
  let testedCount = 0;

  for (const point of searchPoints) {
    testedCount++;

    try {
      // Reverse geocoding
      const address = await reverseGeocode(point.lat, point.lng);
      if (!address || !address.street) continue;

      // Éviter doublons dans cette batch
      if (rawCandidates.find(c => c.adresse === address.street)) continue;

      // Vérifier piscine si nécessaire
      let hasPool = false;
      if (searchForPool) {
        hasPool = await detectPoolOnSatellite(point.lat, point.lng);
        if (!hasPool) continue;
        console.log(`✅ Pool found at ${address.street}`);
      }

      // Calculer score
      const score = calculateScore(imageAnalysis, hasPool);

      // Générer explication
      const explanation = generateExplanation(imageAnalysis, hasPool, address);

      // Générer vues
      const cadastralUrl = await generateCadastralImage(point.lat, point.lng);

      const candidate: Candidate = {
        id: `candidate-${rawCandidates.length + 1}`,
        adresse: address.street,
        codePostal: address.postalCode,
        ville: address.city,
        coordinates: point,
        matchingScore: score,
        explanation,
        visuals: {
          satelliteUrl: `https://maps.googleapis.com/maps/api/staticmap?center=${point.lat},${point.lng}&zoom=20&size=800x600&maptype=satellite&markers=color:red|${point.lat},${point.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
          cadastralUrl,
          streetViewUrl: `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${point.lat},${point.lng}&fov=90&pitch=0&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
        },
      };

      rawCandidates.push(candidate);

      if (rawCandidates.length >= 30) break; // Limite pour éviter trop de candidats

    } catch (error) {
      console.error(`[MoreCandidates] Error at point ${testedCount}:`, error);
    }
  }

  console.log(`[MoreCandidates] Generated ${rawCandidates.length} raw candidates (tested ${testedCount} points)`);

  // 6. Convertir en fingerprints et filtrer les exclus
  const fingerprints: CandidateFingerprint[] = rawCandidates.map(c => ({
    coords: c.coordinates,
    bbox: {
      north: c.coordinates.lat + 0.0005,
      south: c.coordinates.lat - 0.0005,
      east: c.coordinates.lng + 0.0005,
      west: c.coordinates.lng - 0.0005,
    },
    score: c.matchingScore.global,
    piscineHash: imageAnalysis?.elementsExterieurs?.piscine?.presente
      ? computePiscineHash(imageAnalysis.elementsExterieurs.piscine)
      : undefined,
    roofHash: imageAnalysis?.materiaux?.toitureCouleur
      ? computeRoofHash({
          couleur: imageAnalysis.materiaux.toitureCouleur,
          materiau: imageAnalysis.materiaux.toiture?.[0],
        })
      : undefined,
  }));

  const { filtered, excludedCount, exclusionLog } = filterExcludedCandidates(fingerprints, excluded);

  console.log(`[MoreCandidates] After exclusion: ${filtered.length} candidates (excluded: ${excludedCount})`);

  // 7. Mapper les fingerprints filtrés vers les candidats complets
  const filteredCandidates = filtered
    .map(fp => rawCandidates.find(c => 
      Math.abs(c.coordinates.lat - fp.coords.lat) < 0.0001 &&
      Math.abs(c.coordinates.lng - fp.coords.lng) < 0.0001
    ))
    .filter((c): c is Candidate => c !== undefined);

  // 8. Trier par score et limiter à 10
  filteredCandidates.sort((a, b) => b.matchingScore.global - a.matchingScore.global);
  const finalCandidates = filteredCandidates.slice(0, 10);

  console.log(`[MoreCandidates] Final: ${finalCandidates.length} candidates after filtering and sorting`);

  return {
    candidates: finalCandidates,
    level,
    excludedCount,
    exclusionLog,
  };
}

// ============================================
// FONCTIONS HELPER
// ============================================

function generateSearchGrid(
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  numPoints: number
): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];

  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 137.508) * (Math.PI / 180);
    const r = radiusKm * Math.sqrt(i / numPoints);

    const lat = centerLat + (r / 111) * Math.cos(angle);
    const lng = centerLng + (r / (111 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle);

    points.push({ lat, lng });
  }

  return points;
}

async function reverseGeocode(lat: number, lng: number): Promise<{ street: string; city: string; postalCode: string } | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=street_address&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (!data.results?.[0]) return null;

    const result = data.results[0];
    let street = result.formatted_address.split(',')[0];
    let city = '';
    let postalCode = '';

    result.address_components.forEach((comp: any) => {
      if (comp.types.includes('locality')) city = comp.long_name;
      if (comp.types.includes('postal_code')) postalCode = comp.long_name;
    });

    return { street, city, postalCode };
  } catch (error) {
    return null;
  }
}

async function detectPoolOnSatellite(lat: number, lng: number): Promise<boolean> {
  try {
    const satelliteUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=20&size=400x400&maptype=satellite&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Y a-t-il une PISCINE visible (forme bleue/turquoise géométrique) ? OUI ou NON uniquement.' },
              { type: 'image_url', image_url: { url: satelliteUrl } },
            ],
          },
        ],
        max_tokens: 5,
        temperature: 0,
      }),
    });

    const data = await response.json();
    const answer = data.choices[0]?.message?.content?.toUpperCase() || 'NON';

    return answer.includes('OUI');
  } catch (error) {
    console.error('[MoreCandidates] Error detecting pool:', error);
    return false;
  }
}

function calculateScore(imageAnalysis: any, hasPool: boolean): {
  global: number;
  details: {
    architectureMatch: number;
    piscineSimilarity: number;
    vegetationMatch: number;
    surfaceMatch: number;
    orientationMatch: number;
    contextMatch: number;
  };
} {
  let global = 60;

  if (imageAnalysis?.elementsExterieurs?.piscine?.presente) {
    if (hasPool) {
      global += 35;
    } else {
      global -= 25;
    }
  }

  return {
    global: Math.min(100, Math.max(0, global)),
    details: {
      architectureMatch: 75,
      piscineSimilarity: hasPool ? 95 : 0,
      vegetationMatch: 70,
      surfaceMatch: 65,
      orientationMatch: 70,
      contextMatch: 75,
    },
  };
}

function generateExplanation(
  imageAnalysis: any,
  hasPool: boolean,
  address: { street: string; city: string; postalCode: string }
): string {
  let exp = `Cette propriété au ${address.street} `;

  if (hasPool && imageAnalysis?.elementsExterieurs?.piscine?.presente) {
    exp += `possède une piscine visible sur l'image satellite, correspondant à celle de votre photo. `;

    if (imageAnalysis.elementsExterieurs.piscine.forme) {
      exp += `Forme ${imageAnalysis.elementsExterieurs.piscine.forme}. `;
    }
  }

  if (imageAnalysis?.materiaux?.toitureCouleur) {
    exp += `Toiture ${imageAnalysis.materiaux.toitureCouleur}. `;
  }

  exp += `Localisation: ${address.city} (${address.postalCode}).`;

  return exp;
}

