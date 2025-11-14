import { NextResponse } from "next/server"
import { meloSyncService } from "@/lib/services/melo-sync"

export async function GET() {
  const options = {
    filters: undefined,
    limit: 6000,
    transformToListing: false,
  }

  try {
    const result = await meloSyncService.syncAnnonces(options, false)

    return NextResponse.json({
      success: result.success,
      totalFetched:
        (result as any).totalFetched ??
        (result as any).fetchedCount ??
        null,
      createdCount: (result as any).createdCount ?? null,
      updatedCount: (result as any).updatedCount ?? null,
    })
  } catch (error) {
    console.error("❌ Erreur /api/debug/melo-sync-test:", error)
    return NextResponse.json(
      { success: false, error: "SYNC_FAILED" },
      { status: 500 }
    )
  }
}

