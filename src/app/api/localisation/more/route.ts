import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateMoreCandidates } from '@/services/localisation/moreCandidatesService';
import { computePiscineHash, computeRoofHash } from '@/services/localisation/exclusionService';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 [MoreCandidates] API called');

    const body = await request.json();
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json({ error: 'requestId is required' }, { status: 400 });
    }

    // 1. Vérifier le nombre de runs précédents (max 3)
    const previousRunsCount = await prisma.localisationRun.count({
      where: { requestId },
    });

    if (previousRunsCount >= 3) {
      return NextResponse.json(
        {
          error: 'Maximum de 3 relances atteint',
          message: 'Vous avez déjà effectué 3 relances. Veuillez lancer une nouvelle analyse.',
        },
        { status: 400 }
      );
    }

    console.log(`[MoreCandidates] Previous runs: ${previousRunsCount}`);

    // 2. Charger la requête originale
    const localisationRequest = await prisma.localisationRequest.findUnique({
      where: { id: requestId },
      include: {
        candidates: {
          orderBy: { confidence: 'desc' },
          take: 1, // Prendre le meilleur candidat pour récupérer la zone
        },
      },
    });

    if (!localisationRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // 3. Récupérer les données originales
    const rawInput = localisationRequest.rawInput as any;
    const userHints = localisationRequest.userHints as any;

    // Reconstruire la zone de recherche depuis les hints ou le meilleur candidat
    let searchZone = {
      center: { lat: 48.8566, lng: 2.3522 }, // Paris par défaut
      radius: 3000, // 3km par défaut
      postalCode: userHints?.codePostal,
      city: userHints?.ville,
    };

    if (localisationRequest.candidates.length > 0) {
      const bestCandidate = localisationRequest.candidates[0];
      searchZone.center = {
        lat: bestCandidate.lat,
        lng: bestCandidate.lng,
      };
    } else if (userHints?.codePostal) {
      // Géocoder le code postal
      try {
        const geocodeResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${userHints.codePostal},France&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        const geocodeData = await geocodeResponse.json();
        if (geocodeData.results?.[0]) {
          const location = geocodeData.results[0].geometry.location;
          searchZone.center = { lat: location.lat, lng: location.lng };
        }
      } catch (error) {
        console.error('[MoreCandidates] Geocoding error:', error);
      }
    }

    // 4. Reconstruire l'analyse d'image (simplifiée - en production, on devrait la stocker)
    // Pour l'instant, on utilise les données du rawInput
    const imageAnalysis = rawInput.imageAnalysis || {
      elementsExterieurs: {
        piscine: {
          presente: userHints?.piscine === 'oui_rectangulaire' || userHints?.piscine === 'oui_autre_forme',
        },
      },
      materiaux: {
        toitureCouleur: userHints?.constructionPeriod || 'unknown',
      },
    };

    const searchForPool = imageAnalysis?.elementsExterieurs?.piscine?.presente || false;

    console.log(`[MoreCandidates] Search zone:`, searchZone);
    console.log(`[MoreCandidates] Search for pool:`, searchForPool);

    // 5. Générer de nouveaux candidats
    const { candidates, level, excludedCount, exclusionLog } = await generateMoreCandidates(
      requestId,
      searchZone,
      imageAnalysis,
      searchForPool
    );

    if (candidates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Aucun nouveau candidat trouvé après exclusion des précédents',
          level,
          excludedCount,
        },
        { status: 200 }
      );
    }

    // 6. Sauvegarder le run dans la DB
    const fingerprints = candidates.map(c => ({
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

    await prisma.localisationRun.create({
      data: {
        requestId,
        level,
        candidates: fingerprints,
        excludedCount,
      },
    });

    console.log(`[MoreCandidates] ✅ Saved run with ${candidates.length} candidates (level ${level}, excluded: ${excludedCount})`);

    // 7. Retourner les résultats
    return NextResponse.json({
      success: true,
      candidates,
      meta: {
        level,
        excludedCount,
        totalRuns: previousRunsCount + 1,
        exclusionLog: exclusionLog.slice(0, 10), // Limiter les logs
      },
    });
  } catch (error: any) {
    console.error('[MoreCandidates] Error:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la génération de nouveaux candidats',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Configuration Vercel pour timeout long
export const maxDuration = 300; // 5 minutes
export const runtime = 'nodejs';

