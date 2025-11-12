import { NextRequest, NextResponse } from "next/server";
import { meloSyncService } from "@/lib/services/melo-sync";

/**
 * Endpoint de nettoyage des anciennes annonces
 * 
 * POST /api/melo/sync/clean
 * 
 * Body JSON (optionnel):
 * {
 *   "daysToKeep": 30  // Nombre de jours à conserver (défaut: 30)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const daysToKeep = body.daysToKeep || 30;

    console.log(`🗑️  Nettoyage des annonces de plus de ${daysToKeep} jours...`);

    const deletedCount = await meloSyncService.cleanOldAnnonces(daysToKeep);

    return NextResponse.json({
      success: true,
      message: `${deletedCount} annonces supprimées`,
      deletedCount,
      daysToKeep,
    });
  } catch (error: any) {
    console.error('❌ Erreur nettoyage:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Erreur lors du nettoyage',
    }, { status: 500 });
  }
}

