import { NextResponse } from 'next/server'
import { scrapingService } from '@/lib/source-connectors/scraping-service'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    // Simuler des données de test pour LeBonCoin (sans base de données)
    const testListings = [
      {
        source: 'LEBONCOIN',
        isPrivateSeller: true,
        title: 'Appartement T3 lumineux - Centre ville',
        price: 350000,
        type: 'APARTMENT',
        surface: 75,
        rooms: 3,
        photos: ['/placeholder.svg'],
        city: 'Paris',
        postalCode: '75001',
        publishedAt: new Date(),
        url: 'https://www.leboncoin.fr/ventes_immobilieres/1.htm',
        description: 'Beau T3 rénové, proche commodités.'
      },
      {
        source: 'LEBONCOIN',
        isPrivateSeller: false,
        title: 'Maison 5 pièces avec jardin - Lyon',
        price: 620000,
        type: 'HOUSE',
        surface: 120,
        rooms: 5,
        photos: ['/placeholder.svg'],
        city: 'Lyon',
        postalCode: '69003',
        publishedAt: new Date(),
        url: 'https://www.leboncoin.fr/ventes_immobilieres/2.htm',
        description: 'Maison familiale avec grand jardin.'
      }
    ]

    return NextResponse.json({
      success: true,
      message: `Scraping terminé: ${testListings.length} nouvelles annonces trouvées`,
      data: {
        searchId: 'test-search',
        results: [{
          success: true,
          listings: testListings,
          errors: [],
          scrapedAt: new Date().toISOString(),
          source: 'LEBONCOIN'
        }],
        summary: {
          totalNewListings: testListings.length,
          totalErrors: 0,
          sources: 1
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
