import { LeBonCoinAnnonce } from '../scrapers/leboncoin-zenrows'

interface MeloSearchParams {
  ville: string
  minPrix?: number
  maxPrix?: number
  minSurface?: number
  maxSurface?: number
  typeBien?: string
  pieces?: number
  sources?: string[]
}

export class MeloService {
  private apiKey: string
  private baseUrl: string
  
  constructor() {
    this.apiKey = process.env.MELO_API_KEY || ''
    const env = process.env.MELO_ENV || 'sandbox'
    this.baseUrl = env === 'sandbox' 
      ? 'https://api-sandbox.melo.io/v1'
      : 'https://api.melo.io/v1'
    
    if (!this.apiKey) {
      console.warn('⚠️ MELO_API_KEY non configurée')
    }
  }
  
  async searchAnnonces(params: MeloSearchParams): Promise<LeBonCoinAnnonce[]> {
    if (!this.apiKey) {
      console.log('Mode MOCK : pas de clé Melo.io')
      return []
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: params.ville,
          property_type: params.typeBien,
          price_min: params.minPrix,
          price_max: params.maxPrix,
          surface_min: params.minSurface,
          surface_max: params.maxSurface,
          rooms: params.pieces,
          sources: params.sources || ['leboncoin', 'seloger', 'pap']
        })
      })
      
      if (!response.ok) {
        throw new Error(`Melo API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Convertir le format Melo vers notre format
      return this.convertMeloToAnnonce(data.results || [])
      
    } catch (error) {
      console.error('❌ Erreur Melo.io:', error)
      return []
    }
  }
  
  private convertMeloToAnnonce(meloResults: any[]): LeBonCoinAnnonce[] {
    return meloResults.map((item: any) => ({
      title: item.title || '',
      price: item.price?.toString() || '0',
      surface: item.surface ? `${item.surface} m²` : undefined,
      rooms: item.rooms,
      postalCode: item.postal_code,
      city: item.city || '',
      url: item.url || '',
      publishedAt: new Date(item.published_at || Date.now()),
      images: item.photos || [],
      description: item.description
    }))
  }
}

export const meloService = new MeloService()

