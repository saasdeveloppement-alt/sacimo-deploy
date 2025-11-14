import { NextRequest, NextResponse } from "next/server";
import { meloSyncService } from "@/lib/services/melo-sync";

/**
 * Endpoint de synchronisation COMPLÈTE de toutes les annonces Melo.io
 * 
 * POST /api/melo/sync-all
 * 
 * Récupère TOUTES les annonces disponibles sur Melo.io (tous codes postaux)
 * et les synchronise dans la base de données.
 * 
 * Body JSON (optionnel):
 * {
 *   "limit": 1000,  // Nombre max d'annonces à récupérer (défaut: 1000)
 *   "transformToListing": false,  // Transformer en Listing structuré
 *   "updateExisting": false  // Mettre à jour les annonces existantes
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    console.log("🔄 ===== SYNCHRONISATION COMPLÈTE MELO.IO =====");
    console.log("📋 Paramètres:", body);

    const limit = body.limit || 1000;
    const transformToListing = body.transformToListing || false;
    const updateExisting = body.updateExisting || false;

    if (!process.env.MELO_API_KEY) {
      return NextResponse.json({
        success: false,
        message: "❌ MELO_API_KEY non configurée",
      }, { status: 500 });
    }

    console.log("🔍 Récupération de TOUTES les annonces Melo.io (sans filtre)...");
    
    // Utiliser le service de synchronisation avec des options vides (pas de filtres)
    // Cela récupérera TOUTES les annonces disponibles sur Melo.io
    let result;
    
    if (updateExisting) {
      // Mode mise à jour : créer ou mettre à jour les annonces existantes
      result = await meloSyncService.syncWithUpdate({
        // Pas de filtres = récupère TOUT (tous codes postaux, toutes villes)
        filters: undefined,
        limit: limit,
        transformToListing: transformToListing,
      });
    } else {
      // Mode normal : créer uniquement les nouvelles annonces
      result = await meloSyncService.syncAnnonces({
        // Pas de filtres = récupère TOUT (tous codes postaux, toutes villes)
        filters: undefined,
        limit: limit,
        transformToListing: transformToListing,
      });
    }

    console.log(`📥 ${result.totalProcessed} annonces récupérées depuis Melo.io (toutes zones)`);

    console.log("✅ ===== SYNCHRONISATION TERMINÉE =====");
    console.log(`📊 Résultat: ${result.newAnnonces} nouvelles, ${result.duplicates} doublons, ${result.errors} erreurs`);

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `Synchronisation complète réussie: ${result.newAnnonces} nouvelles annonces, ${result.duplicates} doublons`
        : "Erreur lors de la synchronisation",
      result: {
        newAnnonces: result.newAnnonces,
        duplicates: result.duplicates,
        errors: result.errors,
        totalProcessed: result.totalProcessed,
        stats: result.stats,
      },
    });
  } catch (error: any) {
    console.error("❌ Erreur synchronisation complète Melo.io:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Erreur lors de la synchronisation complète",
      error: error.message,
    }, { status: 500 });
  }
}

/**
 * GET /api/melo/sync-all
 * 
 * Récupère les statistiques de la synchronisation complète
 */
export async function GET(req: NextRequest) {
  try {
    const stats = await meloSyncService.getGlobalStats();

    return NextResponse.json({
      success: true,
      message: "Statistiques de la base de données",
      stats,
    });
  } catch (error: any) {
    console.error("❌ Erreur récupération stats:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Erreur lors de la récupération des statistiques",
    }, { status: 500 });
  }
}

