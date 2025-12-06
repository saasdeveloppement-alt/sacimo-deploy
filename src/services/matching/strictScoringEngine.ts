/**
 * Moteur de scoring STRICT pour le nouveau pipeline
 * Compare VisualSignature avec CandidateLocation via analyse satellite
 */

import type { VisualSignature, CandidateLocation, ScoreBreakdown, ScoredCandidate } from '@/types/localisation-advanced';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/**
 * Compare la photo utilisateur avec une vue satellite candidate
 * Utilise OpenAI Vision pour un matching précis
 */
async function compareImageWithSatellite(
  userImageUrl: string,
  candidateLocation: CandidateLocation,
  visualSignature: VisualSignature
): Promise<ScoreBreakdown> {
  console.log(`[StrictScoring] Comparing user image with candidate at ${candidateLocation.lat}, ${candidateLocation.lng}`);
  
  // Générer l'URL de la vue satellite du candidat
  const satelliteUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${candidateLocation.lat},${candidateLocation.lng}&zoom=20&size=800x600&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`;
  
  if (!OPENAI_API_KEY) {
    console.warn('[StrictScoring] OpenAI API key not configured, using fallback scoring');
    return calculateFallbackScore(visualSignature, candidateLocation);
  }
  
  try {
    const prompt = `Compare ces deux images :
1. Image 1 : Photo du bien immobilier (maison + piscine)
2. Image 2 : Vue satellite d'un candidat potentiel

Évalue chaque critère sur une échelle de 0 à 100 :

1. **PISCINE** (CRITIQUE - coefficient x3) :
   - Forme de la piscine correspond-elle ? (rectangulaire, haricot, L, ronde)
   - Taille relative de la piscine correspond-elle ?
   - Position de la piscine par rapport à la maison correspond-elle ?

2. **MAISON** (coefficient x1.5) :
   - Style architectural correspond-il ?
   - Type de toiture correspond-il ? (tuiles rouges, ardoise, etc.)
   - Couleur de la toiture correspond-elle ?

3. **VÉGÉTATION** (coefficient x1) :
   - Types d'arbres/végétation correspondent-ils ?

4. **CADASTRE** (coefficient x1) :
   - La forme du terrain correspond-elle ?

5. **STREET VIEW** (coefficient x1) :
   - Si disponible, la vue de la rue correspond-elle ?

Retourne UNIQUEMENT un JSON :
{
  "poolShapeMatch": 0-100,
  "poolOrientationMatch": 0-100,
  "poolSizeMatch": 0-100,
  "houseStyleMatch": 0-100,
  "roofMatch": 0-100,
  "vegetationMatch": 0-100,
  "cadastreMatch": 0-100,
  "streetViewMatch": 0-100
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: userImageUrl, detail: 'high' } },
              { type: 'image_url', image_url: { url: satelliteUrl, detail: 'high' } },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });
    
    if (!response.ok) {
      console.error(`[StrictScoring] OpenAI API error: ${response.statusText}`);
      return calculateFallbackScore(visualSignature, candidateLocation);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      return calculateFallbackScore(visualSignature, candidateLocation);
    }
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return calculateFallbackScore(visualSignature, candidateLocation);
    }
    
    const breakdown = JSON.parse(jsonMatch[0]);
    
    // Normaliser les valeurs entre 0-100
    return {
      poolShapeMatch: Math.max(0, Math.min(100, breakdown.poolShapeMatch || 0)),
      poolOrientationMatch: Math.max(0, Math.min(100, breakdown.poolOrientationMatch || 0)),
      poolSizeMatch: Math.max(0, Math.min(100, breakdown.poolSizeMatch || 0)),
      houseStyleMatch: Math.max(0, Math.min(100, breakdown.houseStyleMatch || 0)),
      roofMatch: Math.max(0, Math.min(100, breakdown.roofMatch || 0)),
      vegetationMatch: Math.max(0, Math.min(100, breakdown.vegetationMatch || 0)),
      cadastreMatch: Math.max(0, Math.min(100, breakdown.cadastreMatch || 0)),
      streetViewMatch: Math.max(0, Math.min(100, breakdown.streetViewMatch || 0)),
    };
  } catch (error) {
    console.error('[StrictScoring] Error comparing images:', error);
    return calculateFallbackScore(visualSignature, candidateLocation);
  }
}

/**
 * Score de fallback si OpenAI n'est pas disponible
 */
function calculateFallbackScore(
  visualSignature: VisualSignature,
  candidateLocation: CandidateLocation
): ScoreBreakdown {
  const breakdown: ScoreBreakdown = {
    poolShapeMatch: 50,
    poolOrientationMatch: 50,
    poolSizeMatch: 50,
    houseStyleMatch: 50,
    roofMatch: 50,
    vegetationMatch: 50,
    cadastreMatch: 50,
    streetViewMatch: 50,
  };
  
  // Matching basique sur la forme de piscine
  if (visualSignature.hasPool && candidateLocation.poolDetected) {
    if (visualSignature.poolShape === candidateLocation.poolShape) {
      breakdown.poolShapeMatch = 90;
    } else {
      breakdown.poolShapeMatch = 60;
    }
  } else if (visualSignature.hasPool && !candidateLocation.poolDetected) {
    breakdown.poolShapeMatch = 0;
  }
  
  return breakdown;
}

/**
 * Calcule le score global pondéré à partir du breakdown
 */
function calculateGlobalScore(breakdown: ScoreBreakdown): number {
  // Coefficients selon les spécifications
  const weights = {
    poolShapeMatch: 3.0,      // Piscine = coeur du système
    poolOrientationMatch: 2.0,
    poolSizeMatch: 2.0,
    houseStyleMatch: 1.5,
    roofMatch: 1.5,
    vegetationMatch: 1.0,
    cadastreMatch: 1.0,
    streetViewMatch: 1.0,
  };
  
  const weightedSum = 
    breakdown.poolShapeMatch * weights.poolShapeMatch +
    breakdown.poolOrientationMatch * weights.poolOrientationMatch +
    breakdown.poolSizeMatch * weights.poolSizeMatch +
    breakdown.houseStyleMatch * weights.houseStyleMatch +
    breakdown.roofMatch * weights.roofMatch +
    breakdown.vegetationMatch * weights.vegetationMatch +
    breakdown.cadastreMatch * weights.cadastreMatch +
    breakdown.streetViewMatch * weights.streetViewMatch;
  
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  
  return Math.round(weightedSum / totalWeight);
}

/**
 * Génère une explication textuelle du score
 */
function generateExplanation(
  breakdown: ScoreBreakdown,
  candidateLocation: CandidateLocation,
  visualSignature: VisualSignature
): string {
  const reasons: string[] = [];
  
  // Piscine
  if (breakdown.poolShapeMatch > 80) {
    reasons.push(`Piscine ${visualSignature.poolShape} détectée et correspondante`);
  } else if (breakdown.poolShapeMatch < 30) {
    reasons.push('Forme de piscine ne correspond pas');
  }
  
  if (breakdown.poolSizeMatch > 80) {
    reasons.push('Taille de piscine correspondante');
  }
  
  // Maison
  if (breakdown.houseStyleMatch > 70) {
    reasons.push('Style architectural correspondant');
  }
  
  if (breakdown.roofMatch > 70) {
    reasons.push('Type de toiture correspondant');
  }
  
  // Végétation
  if (breakdown.vegetationMatch > 70) {
    reasons.push('Végétation environnante correspondante');
  }
  
  if (reasons.length === 0) {
    return `Candidat dans le code postal ${candidateLocation.address?.postalCode || 'inconnu'}, correspondance partielle avec la photo.`;
  }
  
  return `Cette localisation est proposée car : ${reasons.join(', ')}. Score de confiance : ${calculateGlobalScore(breakdown)}%.`;
}

/**
 * Fonction principale : score un candidat
 */
export async function scoreCandidate(
  candidateLocation: CandidateLocation,
  visualSignature: VisualSignature,
  userImageUrl: string
): Promise<ScoredCandidate> {
  console.log(`[StrictScoring] Scoring candidate ${candidateLocation.id}`);
  
  // 1. Comparer l'image avec la vue satellite
  const breakdown = await compareImageWithSatellite(
    userImageUrl,
    candidateLocation,
    visualSignature
  );
  
  // 2. Calculer le score global
  const score = calculateGlobalScore(breakdown);
  
  // 3. Générer l'explication
  const explanation = generateExplanation(breakdown, candidateLocation, visualSignature);
  
  // 4. Construire le ScoredCandidate
  const scoredCandidate: ScoredCandidate = {
    ...candidateLocation,
    score,
    breakdown,
    explanation,
    adresse: candidateLocation.address?.street || 'Adresse non disponible',
    codePostal: candidateLocation.address?.postalCode || candidateLocation.id,
    ville: candidateLocation.address?.city || 'Ville inconnue',
  };
  
  console.log(`[StrictScoring] Candidate ${candidateLocation.id} scored: ${score}/100`);
  
  return scoredCandidate;
}

