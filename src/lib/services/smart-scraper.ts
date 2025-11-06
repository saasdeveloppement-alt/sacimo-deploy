import { meloService } from './melo'
import { LeBonCoinSearchParams, LeBonCoinAnnonce } from '../scrapers/leboncoin-zenrows'

export class SmartScraper {
  async scrape(params: LeBonCoinSearchParams): Promise<{
    annonces: LeBonCoinAnnonce[]
    source: 'melo'
  }> {
    console.log('🔵 Mode PRODUCTION - Utilisation exclusive de Melo.io')
    
    if (!process.env.MELO_API_KEY) {
      throw new Error('❌ MELO_API_KEY non configurée ! Le scraping ne peut pas fonctionner.')
    }
    
    try {
      // Mapper les types LeBonCoin vers Melo.io
      let typeBienMelo: 'appartement' | 'maison' | undefined = undefined
      if (params.typeBien === 'appartement' || params.typeBien === 'studio' || params.typeBien === 'loft' || params.typeBien === 'penthouse') {
        typeBienMelo = 'appartement'
      } else if (params.typeBien === 'maison') {
        typeBienMelo = 'maison'
      }
      
      const annonces = await meloService.searchAnnonces({
        ville: params.ville,
        minPrix: params.minPrix,
        maxPrix: params.maxPrix,
        minSurface: params.minSurface,
        maxSurface: params.maxSurface,
        typeBien: typeBienMelo,
        pieces: params.pieces,
        transactionType: 'vente',
        itemsPerPage: 50
      })
      
      console.log(`✅ ${annonces.length} annonces récupérées depuis Melo.io`)
      
      return { annonces, source: 'melo' }
      
    } catch (error) {
      console.error('❌ Erreur Melo.io:', error)
      throw new Error('Le scraping Melo.io a échoué. Vérifiez votre clé API et votre connexion.')
    }
  }
}

export const smartScraper = new SmartScraper()

