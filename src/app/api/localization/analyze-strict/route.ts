/**
 * API Route STRICTE pour l'analyse de localisation immobilière
 * POST /api/localization/analyze-strict
 * 
 * Pipeline "machine de guerre" focalisé sur :
 * 1. Image (maison + piscine)
 * 2. Zone géographique STRICTEMENT bornée (code postal + rayon)
 * 3. Système d'hypothèses multiples (jusqu'à 10) avec scoring détaillé
 * 
 * CONTRAINTE ABSOLUE : Si code postal fourni, AUCUNE hypothèse hors CP
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractVisualSignature } from '@/services/ai/imageAnalysis';
import { determineStrictPostalZone } from '@/services/geo/zoneReduction';
import { detectPoolsInZone } from '@/services/pool-detection/poolDetector';
import { scoreCandidate } from '@/services/matching/strictScoringEngine';
import { generateCandidateVisuals } from '@/services/visuals/assetGenerator';
import type { StrictLocalizationResponse, VisualSignature } from '@/types/localisation-advanced';

/**
 * Upload une image vers un storage (Vercel Blob ou S3)
 */
async function uploadImage(file: File): Promise<string> {
  // TODO: Implémenter l'upload réel vers Vercel Blob ou S3
  // Pour l'instant, on convertit en base64
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:${file.type};base64,${base64}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, imageFile, postalCode, radiusKm } = body;

    console.log('[StrictLocalizationAPI] Starting strict analysis...');
    console.log('[StrictLocalizationAPI] Postal code:', postalCode, 'Radius:', radiusKm);

    // VALIDATION : Code postal obligatoire
    if (!postalCode || postalCode.length !== 5) {
      return NextResponse.json(
        {
          status: 'no_coverage_for_postal_code',
          postalCode: postalCode || 'unknown',
          candidates: [],
          message: 'Code postal invalide ou manquant. Un code postal à 5 chiffres est obligatoire.',
        },
        { status: 400 }
      );
    }

    // VALIDATION : Image obligatoire
    if (!imageUrl && !imageFile) {
      return NextResponse.json(
        {
          status: 'no_coverage_for_postal_code',
          postalCode,
          candidates: [],
          message: 'Une image est requise pour l\'analyse.',
        },
        { status: 400 }
      );
    }

    // PHASE 1 : Analyse image → VisualSignature
    console.log('[StrictLocalizationAPI] PHASE 1: Extracting visual signature...');
    const imageToAnalyze = imageUrl || (await uploadImage(imageFile as any));
    const visualSignature: VisualSignature = await extractVisualSignature(imageToAnalyze);
    
    console.log('[StrictLocalizationAPI] Visual signature extracted:', {
      hasPool: visualSignature.hasPool,
      poolShape: visualSignature.poolShape,
      confidence: visualSignature.confidence,
    });

    // Si pas de piscine détectée, on peut quand même continuer mais avec un warning
    if (!visualSignature.hasPool) {
      console.warn('[StrictLocalizationAPI] No pool detected in image - continuing but results may be limited');
    }

    // PHASE 2 : Détermination zone STRICTE
    console.log('[StrictLocalizationAPI] PHASE 2: Determining strict postal zone...');
    const searchZone = await determineStrictPostalZone(postalCode, radiusKm);
    console.log('[StrictLocalizationAPI] Strict zone determined:', {
      postalCode: searchZone.postalCode,
      center: searchZone.center,
      radiusKm: searchZone.radiusKm,
    });

    // PHASE 3 : Détection piscines dans la zone
    console.log('[StrictLocalizationAPI] PHASE 3: Detecting pools in zone...');
    let candidateLocations;
    
    try {
      candidateLocations = await detectPoolsInZone(searchZone, visualSignature);
      console.log(`[StrictLocalizationAPI] Found ${candidateLocations.length} pool candidates`);
    } catch (error: any) {
      if (error.message === 'NO_POOL_FOUND_IN_ZONE') {
        return NextResponse.json({
          status: 'no_pool_found_in_zone',
          postalCode,
          candidates: [],
          message: `Aucune piscine correspondant à la photo n'a été trouvée dans le code postal ${postalCode}. La recherche n'a PAS été élargie en dehors de la zone définie.`,
        });
      } else if (error.message === 'NO_COVERAGE_FOR_POSTAL_CODE') {
        return NextResponse.json({
          status: 'no_coverage_for_postal_code',
          postalCode,
          candidates: [],
          message: `Aucune couverture satellite disponible pour le code postal ${postalCode}.`,
        });
      }
      throw error;
    }

    if (candidateLocations.length === 0) {
      return NextResponse.json({
        status: 'no_candidates_in_postal_code',
        postalCode,
        candidates: [],
        message: `Aucune hypothèse fiable n'a été trouvée dans le code postal ${postalCode}. La recherche n'a PAS été élargie en dehors de la zone définie.`,
      });
    }

    // PHASE 4 : Scoring détaillé de chaque candidat
    console.log('[StrictLocalizationAPI] PHASE 4: Scoring candidates...');
    const scoredCandidates = await Promise.all(
      candidateLocations.map(candidate =>
        scoreCandidate(candidate, visualSignature, imageToAnalyze)
      )
    );

    // Trier par score décroissant
    scoredCandidates.sort((a, b) => b.score - a.score);

    // PHASE 5 : Génération des assets visuels
    console.log('[StrictLocalizationAPI] PHASE 5: Generating visuals...');
    const candidatesWithVisuals = await Promise.all(
      scoredCandidates.slice(0, 10).map(async (candidate) => {
        const visuals = await generateCandidateVisuals(candidate.lat, candidate.lng);
        // Vérification : cadastralUrl DOIT être défini
        if (!visuals.cadastralUrl) {
          console.error(`[StrictLocalizationAPI] ❌ CRITICAL: cadastralUrl missing for candidate ${candidate.id}`);
          // Dernier recours : utiliser la route API cadastre
          const fallbackUrl = `/api/cadastre?lat=${candidate.lat}&lng=${candidate.lng}`;
          visuals.cadastralUrl = fallbackUrl;
          visuals.cadastreOverlayUrl = fallbackUrl;
          console.log(`[StrictLocalizationAPI] Using fallback cadastre URL: ${fallbackUrl}`);
        }
        
        return {
          ...candidate,
          visuals,
          // Mapper pour compatibilité frontend (cadastralUrl)
          cadastralUrl: visuals.cadastralUrl, // OBLIGATOIRE - toujours défini
          satelliteImageUrl: visuals.satelliteUrl,
        };
      })
    );

    // Calculer les métadonnées
    const scores = candidatesWithVisuals.map(c => c.score);
    const meta = {
      totalCandidates: candidatesWithVisuals.length,
      bestScore: scores.length > 0 ? Math.max(...scores) : 0,
      worstScore: scores.length > 0 ? Math.min(...scores) : 0,
    };

    // Retourner les résultats
    const response: StrictLocalizationResponse = {
      status: 'ok',
      postalCode,
      candidates: candidatesWithVisuals,
      meta,
    };

    console.log('[StrictLocalizationAPI] Analysis complete:', {
      postalCode,
      candidatesCount: candidatesWithVisuals.length,
      bestScore: meta.bestScore,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[StrictLocalizationAPI] Error:', error);
    return NextResponse.json(
      {
        status: 'no_coverage_for_postal_code',
        postalCode: 'unknown',
        candidates: [],
        message: error.message || 'Erreur lors de l\'analyse de localisation',
      },
      { status: 500 }
    );
  }
}

// Configuration Vercel pour timeout long
export const maxDuration = 300; // 5 minutes
export const runtime = 'nodejs';

