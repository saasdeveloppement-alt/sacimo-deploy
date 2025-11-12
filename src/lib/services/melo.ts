import { LeBonCoinAnnonce } from '../scrapers/leboncoin-zenrows'

interface MeloSearchParams {
  ville?: string
  minPrix?: number
  maxPrix?: number
  minSurface?: number
  maxSurface?: number
  typeBien?: 'appartement' | 'maison' | 'immeuble' | 'parking' | 'bureau' | 'terrain' | 'commerce'
  pieces?: number
  chambres?: number
  transactionType?: 'vente' | 'location'
  itemsPerPage?: number
}

interface MeloProperty {
  '@id': string
  '@type': string
  propertyType?: number
  price?: number
  surface?: number
  room?: number
  title?: string | null
  description?: string | null
  pictures?: string[]
  createdAt?: string
  city?: {
    name: string
    zipcode: string
    department?: {
      code: string
      name: string
    }
  }
  adverts?: Array<{
    title?: string | null
    price: number
    surface: number
    room: number
    bedroom?: number | null
    description?: string | null
    pictures?: string[]
    picturesRemote?: string[]
    url: string
    createdAt: string
    updatedAt?: string
  }>
}

interface MeloResponse {
  'hydra:member': MeloProperty[]
  'hydra:totalItems': number
}

export class MeloService {
  private apiKey: string
  private baseUrl: string
  private environment: string
  
  // Mapping villes → départements
  private villesToDept: Record<string, string> = {
    'paris': '75',
    'lyon': '69',
    'marseille': '13',
    'bordeaux': '33',
    'toulouse': '31',
    'nice': '06',
    'nantes': '44',
    'lille': '59',
    'strasbourg': '67',
    'montpellier': '34',
    'rennes': '35',
    'reims': '51',
    'saint-étienne': '42',
    'toulon': '83',
    'le havre': '76',
    'grenoble': '38',
    'dijon': '21',
    'angers': '49',
    'villeurbanne': '69',
    'saint-denis': '93',
    'nîmes': '30',
    'aix-en-provence': '13'
  }
  
  constructor() {
    this.apiKey = process.env.MELO_API_KEY || ''
    this.environment = process.env.MELO_ENV || 'preprod'
    
    // Base URL selon l'environnement
    if (this.environment === 'production') {
      this.baseUrl = 'https://api.notif.immo'
    } else {
      this.baseUrl = 'https://preprod-api.notif.immo'
    }
    
    if (!this.apiKey) {
      console.warn('⚠️ MELO_API_KEY non configurée')
    } else {
      console.log(`✅ Melo.io configuré - Environnement: ${this.environment}, Base URL: ${this.baseUrl}`)
    }
  }
  
  async searchAnnonces(params: MeloSearchParams): Promise<LeBonCoinAnnonce[]> {
    if (!this.apiKey) {
      throw new Error('❌ MELO_API_KEY non configurée ! Le scraping ne peut pas fonctionner.')
    }
    
    try {
      // Construire les paramètres de requête
      const queryParams = new URLSearchParams()
      
      // Property types (0=Appartement, 1=Maison, 2=Immeuble, 3=Parking, 4=Bureau, 5=Terrain, 6=Commerce)
      // Déclarer propertyTypes en dehors du if pour les logs
      const propertyTypes: number[] = []
      
      // Si aucun type spécifié, ne pas ajouter de filtre (récupère tout)
      if (params.typeBien) {
        if (params.typeBien === 'appartement') {
          propertyTypes.push(0)
        } else if (params.typeBien === 'maison') {
          propertyTypes.push(1)
        } else if (params.typeBien === 'immeuble') {
          propertyTypes.push(2)
        } else if (params.typeBien === 'parking') {
          propertyTypes.push(3)
        } else if (params.typeBien === 'bureau') {
          propertyTypes.push(4)
        } else if (params.typeBien === 'terrain') {
          propertyTypes.push(5)
        } else if (params.typeBien === 'commerce') {
          propertyTypes.push(6)
        }
      }
      
      // Ajouter les types seulement s'ils sont définis
      if (propertyTypes.length > 0) {
        propertyTypes.forEach(type => {
          queryParams.append('propertyTypes[]', type.toString())
        })
      }
      
      // Transaction type (0=Vente, 1=Location)
      const transactionType = params.transactionType === 'location' ? '1' : '0'
      queryParams.append('transactionType', transactionType)
      
      // Budget
      if (params.minPrix !== undefined && params.minPrix !== null) {
        queryParams.append('budgetMin', params.minPrix.toString())
      }
      if (params.maxPrix !== undefined && params.maxPrix !== null) {
        queryParams.append('budgetMax', params.maxPrix.toString())
      }
      
      // Surface
      if (params.minSurface !== undefined && params.minSurface !== null) {
        queryParams.append('surfaceMin', params.minSurface.toString())
      }
      if (params.maxSurface !== undefined && params.maxSurface !== null) {
        queryParams.append('surfaceMax', params.maxSurface.toString())
      }
      
      // Chambres
      if (params.chambres !== undefined && params.chambres !== null) {
        queryParams.append('bedroomMin', params.chambres.toString())
      }
      
      // Pièces
      if (params.pieces !== undefined && params.pieces !== null) {
        queryParams.append('roomMin', params.pieces.toString())
      }
      
      // Département par ville
      if (params.ville) {
        const villeLower = params.ville.toLowerCase().trim()
        const dept = this.villesToDept[villeLower]
        if (dept) {
          queryParams.append('includedDepartments[]', `departments/${dept}`)
          console.log(`📍 Ville "${params.ville}" → Département ${dept}`)
        } else {
          console.warn(`⚠️ Ville "${params.ville}" non reconnue dans le mapping. Recherche sans filtre département.`)
        }
      }
      
      // Prix cohérents (recommandé)
      queryParams.append('withCoherentPrice', 'true')
      
      // Nombre de résultats
      queryParams.append('itemsPerPage', (params.itemsPerPage || 50).toString())
      
      const apiUrl = `${this.baseUrl}/documents/properties?${queryParams.toString()}`
      
      console.log('🔵 Melo.io - Requête API:', {
        environment: this.environment,
        baseUrl: this.baseUrl,
        params: {
          propertyTypes,
          transactionType,
          ville: params.ville,
          minPrix: params.minPrix,
          maxPrix: params.maxPrix,
          minSurface: params.minSurface,
          maxSurface: params.maxSurface,
          pieces: params.pieces,
          chambres: params.chambres,
          itemsPerPage: params.itemsPerPage || 50
        },
        url: apiUrl.replace(this.apiKey, 'XXX')
      })
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey
        }
      })
      
      console.log('📡 Melo.io - Réponse status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Melo.io - Erreur réponse:', errorText)
        
        // Gestion spécifique des codes d'erreur
        let errorMessage = `Melo API error: ${response.status}`
        
        if (response.status === 401) {
          errorMessage = '❌ Erreur d\'authentification - Vérifiez votre MELO_API_KEY'
        } else if (response.status === 403) {
          errorMessage = '❌ Accès refusé - Vérifiez les permissions de votre clé API'
        } else if (response.status === 429) {
          errorMessage = '❌ Limite de requêtes atteinte - Attendez quelques minutes'
        } else if (response.status >= 500) {
          errorMessage = '❌ Erreur serveur Melo.io - Réessayez plus tard'
        }
        
        throw new Error(`${errorMessage} - ${errorText}`)
      }
      
      const data: MeloResponse = await response.json()
      
      console.log('📦 Melo.io - Données reçues:', {
        totalItems: data['hydra:totalItems'],
        resultCount: data['hydra:member']?.length || 0,
        hasResults: !!data['hydra:member']
      })
      
      // Convertir le format Melo vers notre format
      const annonces = this.convertMeloToAnnonce(data['hydra:member'] || [])
      console.log(`✅ Melo.io - ${annonces.length} annonces converties`)
      
      return annonces
      
    } catch (error) {
      console.error('❌ Erreur Melo.io:', error)
      throw error
    }
  }
  
  private convertMeloToAnnonce(meloProperties: MeloProperty[]): LeBonCoinAnnonce[] {
    console.log(`🔄 Conversion de ${meloProperties.length} propriétés Melo.io`)
    
    if (meloProperties.length > 0) {
      console.log('📋 Exemple de propriété brute Melo.io:', JSON.stringify(meloProperties[0], null, 2))
    }
    
    const annonces: LeBonCoinAnnonce[] = []
    
    meloProperties.forEach((property: MeloProperty, index: number) => {
      // Prendre le premier advert (le plus récent généralement)
      const advert = property.adverts?.[0]
      
      if (!advert) {
        console.warn(`⚠️ Propriété ${property['@id']} n'a pas d'advert`)
        return
      }
      
      // Extraire le titre depuis advert.title ou description
      let title = advert.title || ''
      if (!title && advert.description) {
        // Prendre les premiers mots de la description comme titre
        title = advert.description.substring(0, 100).replace(/\n/g, ' ').trim()
      }
      if (!title) {
        title = 'Annonce immobilière'
      }
      
      // Extraire la ville depuis property.city (structure Melo.io)
      const cityName = property.city?.name || ''
      const postalCode = property.city?.zipcode || ''
      
      // Extraire les images depuis advert.pictures ou property.pictures
      const images = advert.pictures && advert.pictures.length > 0 
        ? advert.pictures 
        : (property.pictures && property.pictures.length > 0 ? property.pictures : [])
      
      // Déterminer le type depuis propertyType
      let typeLabel = 'Appartement'
      if (property.propertyType === 1) typeLabel = 'Maison'
      else if (property.propertyType === 2) typeLabel = 'Immeuble'
      else if (property.propertyType === 3) typeLabel = 'Parking'
      else if (property.propertyType === 4) typeLabel = 'Bureau'
      else if (property.propertyType === 5) typeLabel = 'Terrain'
      else if (property.propertyType === 6) typeLabel = 'Commerce'
      
      // Construire le titre complet avec ville si disponible
      let fullTitle = title
      if (cityName && !title.includes(cityName)) {
        fullTitle = `${title} - ${cityName}`
      }
      
      const converted: LeBonCoinAnnonce = {
        title: fullTitle || 'Sans titre',
        price: (advert.price || property.price || 0).toString(),
        surface: (advert.surface || property.surface) ? `${advert.surface || property.surface} m²` : undefined,
        rooms: advert.room || property.room || undefined,
        postalCode: postalCode || undefined,
        city: cityName || '',
        url: advert.url || '',
        publishedAt: advert.createdAt ? new Date(advert.createdAt) : (property.createdAt ? new Date(property.createdAt) : new Date()),
        images: images,
        description: advert.description || property.description || ''
      }
      
      // Log les premières conversions pour debug
      if (index < 3) {
        console.log(`  [${index + 1}] Converti:`, {
          title: converted.title.substring(0, 50),
          city: converted.city,
          postalCode: converted.postalCode,
          price: converted.price,
          surface: converted.surface,
          rooms: converted.rooms,
          type: typeLabel,
          imagesCount: converted.images?.length || 0
        })
      }
      
      annonces.push(converted)
    })
    
    return annonces
  }
}

export const meloService = new MeloService()

