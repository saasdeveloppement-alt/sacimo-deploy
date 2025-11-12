import { NextRequest, NextResponse } from "next/server";
import { meloSyncService } from "@/lib/services/melo-sync";

/**
 * Endpoint de synchronisation Melo.io
 * 
 * POST /api/melo/sync
 * 
 * Body JSON:
 * {
 *   "filters": {
 *     "ville": "Paris",
 *     "minPrix": 200000,
 *     "maxPrix": 500000,
 *     "typeBien": "appartement",
 *     "pieces": 2
 *   },
 *   "limit": 50,
 *   "transformToListing": false
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("🔄 Synchronisation Melo.io - Paramètres:", body);

    const options = {
      filters: body.filters,
      limit: body.limit || 100,
      transformToListing: body.transformToListing || false,
    };

    const result = await meloSyncService.syncAnnonces(options);

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `Synchronisation réussie: ${result.newAnnonces} nouvelles annonces, ${result.duplicates} doublons`
        : 'Erreur lors de la synchronisation',
      result: {
        newAnnonces: result.newAnnonces,
        duplicates: result.duplicates,
        errors: result.errors,
        totalProcessed: result.totalProcessed,
        stats: result.stats,
      },
    });
  } catch (error: any) {
    console.error('❌ Erreur synchronisation Melo.io:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Erreur lors de la synchronisation',
      error: error.message,
    }, { status: 500 });
  }
}

/**
 * GET /api/melo/sync
 * 
 * Récupère les statistiques globales
 */
export async function GET(req: NextRequest) {
  try {
    const stats = await meloSyncService.getGlobalStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('❌ Erreur récupération stats:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des statistiques',
    }, { status: 500 });
  }
}

