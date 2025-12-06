/**
 * Service de recherche et scoring des candidats immobiliers
 */

import type {
  ImageAnalysisResult,
  SearchZone,
  UrlExtractionResult,
  PropertyCandidate,
  SatelliteAnalysis,
} from '@/types/localisation-advanced';
import { calculateMatchingScore, generateExplanation } from './scoringEngine';
import { generateVisuals } from '../visuals/assetGenerator';
import { generateSatelliteImage, generateStreetViewImage, generateCadastralImage } from '../visuals/assetGenerator';

/**
 * Récupère les parcelles cadastrales dans une zone
 */
async function getCadastreInZone(searchZone: SearchZone): Promise<any[]> {
  // TODO: Implémenter la récupération réelle des parcelles IGN
  // Pour l'instant, on simule avec des données mockées
  
  console.log('[CandidateFinder] Fetching cadastre parcels in zone...');
  
  // Simulation : retourner quelques parcelles autour du centre
  const mockParcelles = [];
  const center = searchZone.center;
  
  // Générer 20 parcelles autour du centre (simulation)
  for (let i = 0; i < 20; i++) {
    const offsetLat = (Math.random() - 0.5) * (searchZone.radius / 111000); // ~1 degré = 111km
    const offsetLng = (Math.random() - 0.5) * (searchZone.radius / 111000);
    
    mockParcelles.push({
      id: `parcelle-${i}`,
      coordinates: {
        lat: center.lat + offsetLat,
        lng: center.lng + offsetLng,
      },
      adresse: `Rue de la Simulation ${i + 1}`,
      codePostal: searchZone.constraints.codePostaux?.[0] || '75000',
      ville: searchZone.constraints.communes?.[0] || 'Paris',
      cadastreData: {
        parcelles: [`AB ${String(i + 1).padStart(4, '0')}`],
        surfaceTerrain: 200 + Math.random() * 300, // 200-500 m²
      },
      typeBati: 'maison_individuelle',
    });
  }
  
  return mockParcelles;
}

/**
 * Analyse une image satellite pour une parcelle
 */
async function analyzeSatelliteImage(
  coordinates: { lat: number; lng: number },
  imageAnalysis: ImageAnalysisResult
): Promise<SatelliteAnalysis> {
  // TODO: Implémenter l'analyse réelle avec Google Vision ou OpenAI Vision
  // Pour l'instant, on simule
  
  console.log('[CandidateFinder] Analyzing satellite image for:', coordinates);
  
  // Simulation basée sur l'analyse de l'image
  const hasPool = imageAnalysis.elementsExterieurs.piscine?.presente || false;
  
  return {
    presencePiscine: hasPool && Math.random() > 0.3, // 70% de chance si piscine dans l'image
    formePiscine: hasPool
      ? (imageAnalysis.elementsExterieurs.piscine?.forme || 'inconnue')
      : undefined,
    vegetationDense: imageAnalysis.elementsExterieurs.jardin?.present || false,
    orientationBatiment: imageAnalysis.orientation?.facadePrincipale || 'sud',
    surfaceEstimee: 150 + Math.random() * 200, // 150-350 m²
  };
}

/**
 * Trouve les candidats immobiliers correspondants
 */
export async function findPropertyCandidates(
  imageAnalysis: ImageAnalysisResult,
  searchZone: SearchZone,
  urlData?: UrlExtractionResult
): Promise<PropertyCandidate[]> {
  console.log('[CandidateFinder] Finding candidates...');

  // 1. Récupération des parcelles dans la zone
  const parcelles = await getCadastreInZone(searchZone);

  // 2. Filtrage par type de bien
  let filteredParcelles = parcelles;
  if (imageAnalysis.typeBien === 'maison') {
    filteredParcelles = parcelles.filter(
      (p) => p.typeBati === 'maison_individuelle'
    );
  }

  // 3. Limite à 50 pour performance
  const parcellesToAnalyze = filteredParcelles.slice(0, 50);

  // 4. Analyse satellite et scoring de chaque parcelle
  const candidates: PropertyCandidate[] = [];

  for (const parcelle of parcellesToAnalyze) {
    // Analyse satellite
    const satelliteAnalysis = await analyzeSatelliteImage(
      parcelle.coordinates,
      imageAnalysis
    );

    // Calcul du score de matching
    const score = calculateMatchingScore(
      imageAnalysis,
      satelliteAnalysis,
      parcelle,
      urlData
    );

    // Seuil minimum de pertinence : 30%
    if (score.global > 30) {
      // Génération des URLs d'images (en parallèle pour performance)
      const [satelliteUrl, cadastralUrl, streetViewUrl] = await Promise.all([
        generateSatelliteImage(parcelle.coordinates.lat, parcelle.coordinates.lng),
        generateCadastralImage(parcelle.coordinates.lat, parcelle.coordinates.lng),
        generateStreetViewImage(parcelle.coordinates.lat, parcelle.coordinates.lng),
      ]);

      // Génération des visuels complets (pour compatibilité)
      const visuals = await generateVisuals(parcelle.coordinates);

      // Enrichir les visuels avec les URLs simples
      if (satelliteUrl) visuals.satellite.url = satelliteUrl;
      if (streetViewUrl) {
        visuals.streetView = {
          url: streetViewUrl,
          panoId: undefined,
          heading: 0,
          pitch: 0,
        };
      }
      if (cadastralUrl) {
        visuals.cadastre = {
          url: cadastralUrl,
          parcelles: parcelle.cadastreData?.parcelles || [],
        };
      }

      // Génération de l'explication
      const explanation = generateExplanation(
        imageAnalysis,
        satelliteAnalysis,
        score,
        parcelle.adresse
      );

      candidates.push({
        id: parcelle.id,
        adresse: parcelle.adresse,
        codePostal: parcelle.codePostal,
        ville: parcelle.ville,
        coordinates: parcelle.coordinates,
        cadastre: parcelle.cadastreData,
        satelliteAnalysis,
        matchingScore: score,
        explanation,
        visuals,
      });
    }
  }

  // 5. Tri par score décroissant
  candidates.sort((a, b) => b.matchingScore.global - a.matchingScore.global);

  console.log(`[CandidateFinder] Found ${candidates.length} candidates`);

  // 6. Retour des 10 meilleurs
  return candidates.slice(0, 10);
}

