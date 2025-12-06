/**
 * API Route principale pour l'analyse de localisation immobilière
 * POST /api/localization/analyze
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzePropertyImage } from '@/services/ai/imageAnalysis';
import { extractFromUrl } from '@/services/scraping/urlExtractor';
import { determineSearchZone } from '@/services/geo/zoneReduction';
import { findPropertyCandidates } from '@/services/matching/candidateFinder';
import type { LocalizationRequest, LocalizationResponse } from '@/types/localisation-advanced';

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
    const body: LocalizationRequest = await request.json();
    const { imageUrl, imageFile, url, description, hints } = body;

    console.log('[LocalizationAPI] Starting analysis...');

    // PHASE 1: Analyse
    let imageAnalysis = null;
    let urlData = null;

    // Analyse d'image
    if (imageUrl || imageFile) {
      const imageToAnalyze = imageUrl || (await uploadImage(imageFile as any));
      console.log('[LocalizationAPI] Analyzing image...');
      imageAnalysis = await analyzePropertyImage(imageToAnalyze);
    }

    // Extraction depuis URL
    if (url) {
      console.log('[LocalizationAPI] Extracting from URL...');
      urlData = await extractFromUrl(url);

      // Si URL contient des images et pas d'image fournie
      if (!imageAnalysis && urlData.images && urlData.images.length > 0) {
        console.log('[LocalizationAPI] Using image from URL...');
        imageAnalysis = await analyzePropertyImage(urlData.images[0]);
      }
    }

    if (!imageAnalysis) {
      return NextResponse.json(
        { success: false, error: 'Au moins une image est requise' },
        { status: 400 }
      );
    }

    // PHASE 2: Détermination zone
    console.log('[LocalizationAPI] Determining search zone...');
    const searchZone = await determineSearchZone(imageAnalysis, urlData, hints);

    // PHASE 3: Recherche candidates
    console.log('[LocalizationAPI] Finding candidates...');
    const candidates = await findPropertyCandidates(
      imageAnalysis,
      searchZone,
      urlData
    );

    // Retour des résultats
    const response: LocalizationResponse = {
      success: true,
      analysis: {
        imageAnalysis,
        searchZone,
        candidatesCount: candidates.length,
      },
      candidates: candidates.slice(0, 10), // Top 10
    };

    console.log('[LocalizationAPI] Analysis complete, found', candidates.length, 'candidates');

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[LocalizationAPI] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de l\'analyse de localisation',
      },
      { status: 500 }
    );
  }
}

// Configuration Vercel pour timeout long
export const maxDuration = 300; // 5 minutes
export const runtime = 'nodejs';

