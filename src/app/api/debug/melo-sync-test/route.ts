import { NextRequest, NextResponse } from "next/server"
import { meloSyncService } from "@/lib/services/melo-sync"
import { isMeloSyncAllowed } from "@/lib/melo-safe"

export async function GET(request: NextRequest) {
  if (!isMeloSyncAllowed()) {
    return NextResponse.json(
      {
        success: false,
        error: "Sync Melo bloquée (environnement non autorisé) : exécution uniquement en production sur Vercel.",
      },
      { status: 403 }
    )
  }
  const { searchParams } = new URL(request.url)
  const department = searchParams.get("department")

  const options: any = {
    filters: undefined,
    limit: department ? 1000 : 6000, // Limiter à 1000 si département spécifié
    transformToListing: false,
  }

  // Si un département est fourni, le passer directement au service
  if (department && /^\d{2}$/.test(department)) {
    options.department = department
  }

  try {
    console.log(`🔄 Démarrage synchro Melo${department ? ` (département ${department})` : " (toute la France)"}`)
    console.log('\n🔥🔥🔥 ROUTE DEBUG : Les logs détaillés apparaîtront ci-dessous lors de la synchro 🔥🔥🔥')
    console.log('   → Cherchez les logs "PREMIÈRE PROPRIÉTÉ COMPLÈTE" et "FULL ADVERT" dans la console\n')
    
    const result = await meloSyncService.syncAnnonces(options, false)

    return NextResponse.json({
      success: result.success,
      totalFetched: result.totalProcessed ?? null,
      newAnnonces: result.newAnnonces ?? null,
      duplicates: result.duplicates ?? null,
      errors: result.errors ?? null,
      department: department || null,
    })
  } catch (error) {
    console.error("❌ Erreur /api/debug/melo-sync-test:", error)
    return NextResponse.json(
      { success: false, error: "SYNC_FAILED", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

