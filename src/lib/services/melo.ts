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
  page?: number // Numéro de page pour la pagination
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
  'hydra:view'?: {
    'hydra:first'?: string
    'hydra:last'?: string
    'hydra:next'?: string
    'hydra:previous'?: string
  }
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
      
      // Nombre de résultats par page (maximum 100 selon l'API Hydra)
      const itemsPerPage = Math.min(params.itemsPerPage || 100, 100)
      queryParams.append('itemsPerPage', itemsPerPage.toString())
      
      // Pagination : page (commence à 1)
      if (params.page) {
        queryParams.append('page', params.page.toString())
      }
      
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
        hasResults: !!data['hydra:member'],
        hasNextPage: !!data['hydra:view']?.['hydra:next'],
        currentPage: params.page || 1
      })
      
      // Convertir le format Melo vers notre format
      const annonces = this.convertMeloToAnnonce(data['hydra:member'] || [])
      console.log(`✅ Melo.io - ${annonces.length} annonces converties (page ${params.page || 1})`)
      
      return annonces
      
    } catch (error) {
      console.error('❌ Erreur Melo.io:', error)
      throw error
    }
  }
  
  /**
   * Récupère TOUTES les annonces en paginant automatiquement
   * @param params Paramètres de recherche
   * @param maxPages Nombre maximum de pages à récupérer (sécurité)
   * @returns Toutes les annonces correspondant aux critères
   */
  async searchAnnoncesWithPagination(params: MeloSearchParams = {}, maxPages: number = 20): Promise<LeBonCoinAnnonce[]> {
    if (!this.apiKey) {
      throw new Error('❌ MELO_API_KEY non configurée ! Le scraping ne peut pas fonctionner.')
    }
    
    try {
      let allAnnonces: LeBonCoinAnnonce[] = []
      let currentPage = 1
      let hasMore = true
      let totalItems = 0
      const itemsPerPage = 100 // Maximum par page selon l'API
      
      console.log('🔄 Démarrage recherche paginée Melo.io...')
      
      while (hasMore && currentPage <= maxPages) {
        console.log(`📄 Récupération page ${currentPage}/${maxPages}...`)
        
        // Construire les paramètres avec pagination
        const pageParams: MeloSearchParams = {
          ...params,
          page: currentPage,
          itemsPerPage: itemsPerPage
        }
        
        // Faire la requête pour cette page
        const queryParams = new URLSearchParams()
        
        // Construire les mêmes paramètres que searchAnnonces mais avec la page
        const propertyTypes: number[] = []
        if (pageParams.typeBien) {
          if (pageParams.typeBien === 'appartement') propertyTypes.push(0)
          else if (pageParams.typeBien === 'maison') propertyTypes.push(1)
          else if (pageParams.typeBien === 'immeuble') propertyTypes.push(2)
          else if (pageParams.typeBien === 'parking') propertyTypes.push(3)
          else if (pageParams.typeBien === 'bureau') propertyTypes.push(4)
          else if (pageParams.typeBien === 'terrain') propertyTypes.push(5)
          else if (pageParams.typeBien === 'commerce') propertyTypes.push(6)
        }
        
        if (propertyTypes.length > 0) {
          propertyTypes.forEach(type => queryParams.append('propertyTypes[]', type.toString()))
        }
        
        const transactionType = pageParams.transactionType === 'location' ? '1' : '0'
        queryParams.append('transactionType', transactionType)
        
        if (pageParams.minPrix !== undefined && pageParams.minPrix !== null) {
          queryParams.append('budgetMin', pageParams.minPrix.toString())
        }
        if (pageParams.maxPrix !== undefined && pageParams.maxPrix !== null) {
          queryParams.append('budgetMax', pageParams.maxPrix.toString())
        }
        if (pageParams.minSurface !== undefined && pageParams.minSurface !== null) {
          queryParams.append('surfaceMin', pageParams.minSurface.toString())
        }
        if (pageParams.maxSurface !== undefined && pageParams.maxSurface !== null) {
          queryParams.append('surfaceMax', pageParams.maxSurface.toString())
        }
        if (pageParams.chambres !== undefined && pageParams.chambres !== null) {
          queryParams.append('bedroomMin', pageParams.chambres.toString())
        }
        if (pageParams.pieces !== undefined && pageParams.pieces !== null) {
          queryParams.append('roomMin', pageParams.pieces.toString())
        }
        
        if (pageParams.ville) {
          const villeLower = pageParams.ville.toLowerCase().trim()
          const dept = this.villesToDept[villeLower]
          if (dept) {
            queryParams.append('includedDepartments[]', `departments/${dept}`)
          }
        }
        
        queryParams.append('withCoherentPrice', 'true')
        queryParams.append('itemsPerPage', itemsPerPage.toString())
        queryParams.append('page', currentPage.toString())
        
        const apiUrl = `${this.baseUrl}/documents/properties?${queryParams.toString()}`
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': this.apiKey
          }
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ Erreur page ${currentPage}:`, errorText)
          hasMore = false
          break
        }
        
        const data: MeloResponse = await response.json()
        const annonces = this.convertMeloToAnnonce(data['hydra:member'] || [])
        
        // Récupérer le total depuis la première page
        if (currentPage === 1) {
          totalItems = data['hydra:totalItems'] || 0
          console.log(`📊 Total d'annonces disponibles: ${totalItems}`)
        }
        
        allAnnonces = [...allAnnonces, ...annonces]
        
        console.log(`✅ Page ${currentPage}: ${annonces.length} annonces (Total: ${allAnnonces.length}/${totalItems || '?'})`)
        
        // Vérifier s'il y a une page suivante
        const hasNextPage = !!data['hydra:view']?.['hydra:next']
        hasMore = hasNextPage && annonces.length === itemsPerPage
        
        // Si on a atteint le total, arrêter
        if (totalItems > 0 && allAnnonces.length >= totalItems) {
          console.log(`✅ Toutes les annonces récupérées (${allAnnonces.length}/${totalItems})`)
          hasMore = false
        }
        
        currentPage++
        
        // Petite pause entre les requêtes pour éviter de surcharger l'API
        if (hasMore && currentPage <= maxPages) {
          await new Promise(resolve => setTimeout(resolve, 500)) // 500ms de pause
        }
      }
      
      if (currentPage > maxPages) {
        console.warn(`⚠️ Limite de pages atteinte (${maxPages}). ${allAnnonces.length} annonces récupérées.`)
      }
      
      console.log(`🎉 Recherche terminée : ${allAnnonces.length} annonces au total`)
      
      return allAnnonces
      
    } catch (error: any) {
      console.error('❌ Erreur récupération paginée Melo.io:', error)
      // Retourner ce qu'on a récupéré même en cas d'erreur
      if (allAnnonces.length > 0) {
        console.log(`⚠️ Retour de ${allAnnonces.length} annonces récupérées avant l'erreur`)
      }
      return allAnnonces
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
      // DÉBOGUER LA STRUCTURE COMPLÈTE
      if (index === 0) {
        console.log('🔍 STRUCTURE COMPLÈTE D\'UNE PROPRIÉTÉ MELO.IO:', JSON.stringify(property, null, 2))
        console.log('🏙️ Structure city:', {
          'property.city': property.city,
          'property.city?.name': property.city?.name,
          'property.city?.zipcode': property.city?.zipcode,
          'property.city?.department': property.city?.department,
          'property.city?.department?.name': property.city?.department?.name,
          'property.city?.department?.code': property.city?.department?.code,
        })
      }
      
      // Extraire la ville depuis différentes sources possibles
      let cityName = ''
      let postalCode = ''
      
      // Source 1 : property.city.name (structure principale)
      if (property.city?.name) {
        cityName = property.city.name
        postalCode = property.city.zipcode || ''
      }
      
      // Source 2 : Si pas de nom, essayer le département
      if (!cityName && property.city?.department?.name) {
        cityName = property.city.department.name
      }
      
      // Source 3 : Si toujours pas de ville, essayer depuis le code postal
      if (!cityName && property.city?.zipcode) {
        // On garde le code postal mais on ne peut pas deviner la ville
        postalCode = property.city.zipcode
        console.warn(`⚠️ Propriété ${index + 1}: Ville manquante, code postal: ${postalCode}`)
      }
      
      // Log pour les premières annonces
      if (index < 5) {
        console.log(`📍 Annonce ${index + 1} - Ville extraite: "${cityName}" (CP: ${postalCode})`)
      }
      
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

