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
      const annonces = await meloService.searchAnnonces({
        ville: params.ville,
        minPrix: params.minPrix,
        maxPrix: params.maxPrix,
        minSurface: params.minSurface,
        maxSurface: params.maxSurface,
        typeBien: params.typeBien,
        pieces: params.pieces,
        sources: ['leboncoin', 'seloger', 'pap', 'bienici']
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

