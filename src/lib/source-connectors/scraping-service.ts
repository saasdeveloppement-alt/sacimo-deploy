import { SourceConnector, SearchParams, ScrapingResult, ListingData } from './types'
import { LeBonCoinConnector } from './leboncoin-connector'
import { prisma } from '@/lib/prisma'

export class ScrapingService {
  private connectors: Map<string, SourceConnector> = new Map()

  constructor() {
    // Enregistrer les connecteurs disponibles
    this.connectors.set('LEBONCOIN', new LeBonCoinConnector())
    // Ajouter d'autres connecteurs ici (SeLoger, PAP, etc.)
  }

  async scrapeListings(searchId: string): Promise<ScrapingResult[]> {
    try {
      // Récupérer la recherche depuis la base de données
      const search = await prisma.search.findUnique({
        where: { id: searchId }
      })

      if (!search) {
        throw new Error(`Recherche ${searchId} non trouvée`)
      }

      const params = search.params as SearchParams
      const results: ScrapingResult[] = []

      // Scraper chaque source
      for (const [sourceName, connector] of this.connectors) {
        try {
          console.log(`🔍 Scraping ${sourceName}...`)
          
          // Vérifier que le connecteur est en bonne santé
          const isHealthy = await connector.isHealthy()
          if (!isHealthy) {
            console.warn(`⚠️ ${sourceName} non accessible`)
            results.push({
              success: false,
              listings: [],
              errors: [`${sourceName} non accessible`],
              scrapedAt: new Date(),
              source: sourceName
            })
            continue
          }

          // Scraper les annonces
          const listings = await connector.searchListings(params)
          
          // Sauvegarder les nouvelles annonces
          const savedListings = await this.saveListings(listings, sourceName)
          
          results.push({
            success: true,
            listings: savedListings,
            errors: [],
            scrapedAt: new Date(),
            source: sourceName
          })

          console.log(`✅ ${sourceName}: ${savedListings.length} annonces sauvegardées`)

        } catch (error) {
          console.error(`❌ Erreur ${sourceName}:`, error)
          results.push({
            success: false,
            listings: [],
            errors: [`Erreur ${sourceName}: ${error}`],
            scrapedAt: new Date(),
            source: sourceName
          })
        }
      }

      return results

    } catch (error) {
      console.error('❌ Erreur scraping service:', error)
      throw error
    }
  }

  private async saveListings(listings: ListingData[], source: string): Promise<ListingData[]> {
    const savedListings: ListingData[] = []

    for (const listing of listings) {
      try {
        // Vérifier si l'annonce existe déjà
        const existing = await prisma.listing.findFirst({
          where: {
            url: listing.url,
            source: listing.source as any
          }
        })

        if (existing) {
          console.log(`📋 Annonce déjà existante: ${listing.title}`)
          continue
        }

        // Créer la nouvelle annonce
        const savedListing = await prisma.listing.create({
          data: {
            source: listing.source as any,
            isPrivateSeller: listing.isPrivateSeller,
            title: listing.title,
            price: listing.price,
            type: listing.type as any,
            surface: listing.surface,
            rooms: listing.rooms,
            photos: listing.photos,
            city: listing.city,
            postalCode: listing.postalCode,
            geo: listing.geo,
            publishedAt: listing.publishedAt,
            url: listing.url,
            description: listing.description
          }
        })

        savedListings.push({
          ...listing,
          id: savedListing.id
        })

      } catch (error) {
        console.error(`❌ Erreur sauvegarde annonce:`, error)
      }
    }

    return savedListings
  }

  async getConnectorHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {}
    
    for (const [name, connector] of this.connectors) {
      try {
        health[name] = await connector.isHealthy()
      } catch (error) {
        health[name] = false
      }
    }
    
    return health
  }
}
