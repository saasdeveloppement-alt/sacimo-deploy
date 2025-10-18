import { NextResponse } from 'next/server'
import { ScrapingService } from '@/lib/source-connectors/scraping-service'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { searchId } = await request.json()
    
    if (!searchId) {
      return NextResponse.json({
        success: false,
        message: 'ID de recherche requis'
      }, { status: 400 })
    }

    // Vérifier que la recherche existe
    const search = await prisma.search.findUnique({
      where: { id: searchId }
    })

    if (!search) {
      return NextResponse.json({
        success: false,
        message: 'Recherche non trouvée'
      }, { status: 404 })
    }

    // Lancer le scraping
    const scrapingService = new ScrapingService()
    const results = await scrapingService.scrapeListings(searchId)

    // Compter les nouvelles annonces
    const totalNewListings = results.reduce((sum, result) => sum + result.listings.length, 0)
    const totalErrors = results.reduce((sum, result) => sum + result.errors.length, 0)

    return NextResponse.json({
      success: true,
      message: `Scraping terminé: ${totalNewListings} nouvelles annonces trouvées`,
      data: {
        searchId,
        results,
        summary: {
          totalNewListings,
          totalErrors,
          sources: results.length
        }
      }
    })

  } catch (error) {
    console.error('❌ Erreur API scraping:', error)
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du scraping',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Vérifier la santé des connecteurs
    const scrapingService = new ScrapingService()
    const health = await scrapingService.getConnectorHealth()

    return NextResponse.json({
      success: true,
      message: 'État des connecteurs',
      data: {
        connectors: health,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Erreur vérification santé:', error)
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la vérification',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
