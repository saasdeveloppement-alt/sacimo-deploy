/**
 * Moteur de scoring pour comparer les candidats avec l'analyse d'image
 */

import type { ImageAnalysisResult, SatelliteAnalysis, MatchingScore, UrlExtractionResult } from '@/types/localisation-advanced';

/**
 * Compare la végétation
 */
function compareVegetation(
  jardinImage?: ImageAnalysisResult['elementsExterieurs']['jardin'],
  vegetationSatellite?: boolean
): number {
  if (!jardinImage?.present && !vegetationSatellite) return 50; // Neutre si pas d'info
  if (jardinImage?.present && vegetationSatellite) return 80;
  if (jardinImage?.present && !vegetationSatellite) return 30;
  return 50;
}

/**
 * Compare l'orientation
 */
function compareOrientation(
  orientationImage?: string,
  orientationSatellite?: string
): number {
  if (!orientationImage || !orientationSatellite) return 50;
  if (orientationImage === orientationSatellite) return 90;
  // Orientation opposée = pénalité
  const opposites: Record<string, string> = {
    'nord': 'sud',
    'sud': 'nord',
    'est': 'ouest',
    'ouest': 'est',
  };
  if (opposites[orientationImage] === orientationSatellite) return 20;
  return 50; // Perpendiculaire = neutre
}

/**
 * Calcule le score de matching contextuel (prix DVF, quartier, etc.)
 */
function calculateContextMatch(
  parcelle: any,
  urlData?: UrlExtractionResult
): number {
  let score = 50; // Base neutre

  // Si prix dans URL et prix DVF disponible
  if (urlData?.caracteristiques?.prix && parcelle.dvf?.derniereVente?.prix) {
    const priceDiff = Math.abs(
      urlData.caracteristiques.prix - parcelle.dvf.derniereVente.prix
    ) / urlData.caracteristiques.prix;
    
    if (priceDiff < 0.2) score += 30; // Prix très proche
    else if (priceDiff < 0.4) score += 15; // Prix proche
    else score -= 20; // Prix éloigné
  }

  // Si surface dans URL et surface DVF disponible
  if (urlData?.caracteristiques?.surface && parcelle.dvf?.derniereVente?.surface) {
    const surfaceDiff = Math.abs(
      urlData.caracteristiques.surface - parcelle.dvf.derniereVente.surface
    ) / urlData.caracteristiques.surface;
    
    if (surfaceDiff < 0.1) score += 20; // Surface très proche
    else if (surfaceDiff < 0.2) score += 10; // Surface proche
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calcule le score de matching global
 */
export function calculateMatchingScore(
  imageAnalysis: ImageAnalysisResult,
  satelliteAnalysis: SatelliteAnalysis,
  parcelle: any,
  urlData?: UrlExtractionResult
): MatchingScore {
  const scores = {
    architectureMatch: 50, // TODO: Implémenter matching architectural
    piscineSimilarity: 0,
    vegetationMatch: 0,
    surfaceMatch: 50,
    orientationMatch: 50,
    contextMatch: 0,
  };

  // 1. Matching piscine (TRÈS DISCRIMINANT - poids x3)
  if (imageAnalysis.elementsExterieurs.piscine?.presente) {
    if (satelliteAnalysis.presencePiscine) {
      scores.piscineSimilarity = 80;

      // Bonus si forme identique
      if (
        imageAnalysis.elementsExterieurs.piscine.forme === satelliteAnalysis.formePiscine
      ) {
        scores.piscineSimilarity = 95;
      }
    } else {
      scores.piscineSimilarity = 0; // ÉLIMINATOIRE
      return { global: 0, details: scores }; // Pas de piscine = pas la bonne maison
    }
  } else {
    // Si pas de piscine dans l'image, on ne pénalise pas
    scores.piscineSimilarity = 50;
  }

  // 2. Matching végétation
  scores.vegetationMatch = compareVegetation(
    imageAnalysis.elementsExterieurs.jardin,
    satelliteAnalysis.vegetationDense
  );

  // 3. Matching surface
  if (urlData?.caracteristiques?.surface && parcelle.surfaceTerrain) {
    const surfaceDiff =
      Math.abs(urlData.caracteristiques.surface - parcelle.surfaceTerrain) /
      urlData.caracteristiques.surface;
    scores.surfaceMatch = Math.max(0, 100 - surfaceDiff * 100);
  }

  // 4. Matching orientation
  if (imageAnalysis.orientation && satelliteAnalysis.orientationBatiment) {
    scores.orientationMatch = compareOrientation(
      imageAnalysis.orientation.facadePrincipale,
      satelliteAnalysis.orientationBatiment
    );
  }

  // 5. Contexte géographique (prix DVF, quartier, etc.)
  scores.contextMatch = calculateContextMatch(parcelle, urlData);

  // Calcul du score global pondéré
  const weights = {
    piscineSimilarity: 3.0, // TRÈS important
    architectureMatch: 1.5,
    vegetationMatch: 1.2,
    surfaceMatch: 1.0,
    orientationMatch: 1.0,
    contextMatch: 0.8,
  };

  const weightedSum = Object.entries(scores).reduce((sum, [key, value]) => {
    return sum + value * (weights[key as keyof typeof weights] || 1);
  }, 0);

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const globalScore = Math.round(weightedSum / totalWeight);

  return {
    global: Math.min(100, globalScore),
    details: scores,
  };
}

/**
 * Génère une explication textuelle du score
 */
export function generateExplanation(
  imageAnalysis: ImageAnalysisResult,
  satelliteAnalysis: SatelliteAnalysis,
  score: MatchingScore,
  adresse: string
): string {
  const reasons: string[] = [];

  // Piscine
  if (score.details.piscineSimilarity > 80) {
    reasons.push('Une piscine est présente et correspond à celle de la photo');
  } else if (score.details.piscineSimilarity === 0) {
    reasons.push('Aucune piscine détectée alors que la photo en montre une');
  }

  // Végétation
  if (score.details.vegetationMatch > 70) {
    reasons.push('La végétation environnante correspond');
  }

  // Surface
  if (score.details.surfaceMatch > 80) {
    reasons.push('La surface correspond aux informations de l\'annonce');
  }

  // Orientation
  if (score.details.orientationMatch > 80) {
    reasons.push('L\'orientation du bâtiment correspond');
  }

  // Contexte
  if (score.details.contextMatch > 70) {
    reasons.push('Le prix et les caractéristiques sont cohérents avec les données DVF');
  }

  if (reasons.length === 0) {
    return `Cette adresse présente certaines similarités avec la photo, mais la correspondance n'est pas évidente.`;
  }

  return `Cette adresse à ${adresse} est proposée car : ${reasons.join(', ')}. Score de confiance : ${score.global}%.`;
}

