/**
 * ⚠️ MELO.AI DÉSACTIVÉ
 * Ce service est désactivé. Utilisez MoteurImmo comme provider.
 * Tous les appels sont protégés par MELO_DISABLED.
 */

import { MELO_DISABLED, assertMeloDisabled } from "@/lib/melo-disabled";
import { LeBonCoinAnnonce } from '../scrapers/leboncoin-zenrows'

interface MeloSearchParams {
  ville?: string
  cityId?: number
  department?: string
  itemsPerPage?: number
  page?: number
}

interface MeloProperty {
  '@id': string
  '@type': string
  propertyType?: number
  pictures?: string[] // Images au niveau property
  picturesRemote?: string[] // Images remote au niveau property
  adverts?: Array<{
    price: number
    surface: number
    rooms: number
    bedrooms: number
    city: string
    zipCode: string
    description: string
    images?: string[]
    pictures?: string[]
    picturesRemote?: string[]
    url: string
    createdAt: string
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
  
  /**
   * Construit les paramètres de requête pour l'API Melo.io
   */
  private buildQueryParams(params: MeloSearchParams): URLSearchParams {
    const queryParams = new URLSearchParams()
    
    if (params.cityId) {
      queryParams.append('includedCities[]', `cities/${params.cityId}`)
      console.log(`⭐ Filtre ville ID: includedCities[]=cities/${params.cityId}`)
    } else if (params.department) {
      queryParams.append('includedDepartments[]', `departments/${params.department}`)
      console.log(`📍 Département explicite: ${params.department} → includedDepartments[]=departments/${params.department}`)
    }
    
    queryParams.append('itemsPerPage', (params.itemsPerPage || 100).toString())
    
    if (params.page && params.page > 1) {
      queryParams.append('page', params.page.toString())
    }
    
    return queryParams
  }

  async searchAnnonces(params: MeloSearchParams): Promise<LeBonCoinAnnonce[]> {
    // Protection: vérifier si Melo est désactivé
    assertMeloDisabled("MeloService.searchAnnonces");
    
    if (!this.apiKey) {
      throw new Error('❌ MELO_API_KEY non configurée ! Le scraping ne peut pas fonctionner.')
    }
    
    try {
      // Construire les paramètres de requête
      const queryParams = this.buildQueryParams(params)
      
      // Log pour debug
      if (params.ville) {
        const villeLower = params.ville.toLowerCase().trim()
        const dept = this.villesToDept[villeLower]
        if (dept) {
          console.log(`📍 Ville "${params.ville}" → Département ${dept}`)
        } else {
          console.warn(`⚠️ Ville "${params.ville}" non reconnue dans le mapping. Recherche sans filtre département.`)
        }
      }
      
      // Si params.ville contient un code postal, essayer d'ajouter un paramètre zipCode si l'API le supporte
      if (params.ville) {
        const postalCodeMatch = params.ville.match(/\((\d{5})\)/)
        if (postalCodeMatch) {
          const postalCode = postalCodeMatch[1]
          // Essayer d'ajouter le code postal comme paramètre séparé si l'API le supporte
          // queryParams.append('zipCode', postalCode) // Décommenter si l'API supporte ce paramètre
          console.log(`📍 Code postal extrait: ${postalCode} depuis "${params.ville}"`)
        }
      }
      
      const apiUrl = `${this.baseUrl}/documents/properties?${queryParams.toString()}`
      
      console.log('🔵 Melo.io - Requête API:', {
        environment: this.environment,
        baseUrl: this.baseUrl,
        url: apiUrl.replace(this.apiKey, 'XXX'),
        params: {
          ville: params.ville,
          department: params.department,
          itemsPerPage: params.itemsPerPage || 100,
        }
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
        pagination: data['hydra:view']
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
  
  /**
   * Recherche avec pagination automatique Hydra
   * Récupère TOUTES les annonces disponibles en suivant les liens hydra:next
   * Boucle simple : tant que hydra:next existe, on continue à fetch
   */
  async searchAnnoncesWithPagination(params: MeloSearchParams): Promise<LeBonCoinAnnonce[]> {
    // Protection: vérifier si Melo est désactivé
    assertMeloDisabled("MeloService.searchAnnoncesWithPagination");
    console.log(`🚀 searchAnnoncesWithPagination APPELÉE`)
    console.log(`📥 Paramètres reçus:`, JSON.stringify(params, null, 2))
    
    let allAnnonces: LeBonCoinAnnonce[] = []
    let nextUrl: string | null = null
    let pageCount = 0
    const maxPagesSafe = 200
    
    try {
      // 1. Construire l'URL de la première page
      const firstPageParams: MeloSearchParams = {
        ...params,
        itemsPerPage: 100, // Maximum par page autorisé par Melo.io
        page: 1
      }
      
      const queryParams = this.buildQueryParams(firstPageParams)
      nextUrl = `${this.baseUrl}/documents/properties?${queryParams.toString()}`
      
      console.log(`🔄 Démarrage pagination Hydra Melo.io...`)
      console.log(`📋 Paramètres de recherche:`, {
        ville: params.ville,
        department: params.department,
        itemsPerPage: firstPageParams.itemsPerPage
      })
      console.log(`🌐 URL première page: ${nextUrl.replace(this.apiKey, 'XXX')}`)
      console.log(`   ⭐ Filtre département: ${params.department ? `includedDepartments[]=departments/${params.department}` : 'NON'}`)
      
      // 2. Boucle de pagination Hydra
      console.log(">>> Melo pagination START:", nextUrl.replace(this.apiKey, 'XXX'))
      while (nextUrl && pageCount < maxPagesSafe) {
        const currentPage = pageCount + 1
        console.log(">>> PAGE FETCH:", currentPage, nextUrl)
        console.log(`📄 Récupération page ${currentPage}...`)
        console.log(`   URL: ${nextUrl.replace(this.apiKey, 'XXX')}`)
        pageCount++
        
        try {
          // Fetch de la page courante
          const response = await fetch(nextUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-API-KEY': this.apiKey
            }
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error(`❌ Erreur HTTP ${response.status} pour la page ${currentPage}:`, errorText)
            break
          }
          
          const json: MeloResponse = await response.json()
          
          console.log(">>> Melo page received:", nextUrl.replace(this.apiKey, 'XXX'))
          console.log("hydra:view:", json["hydra:view"])
          console.log("hydra:next:", json["hydra:view"]?.["hydra:next"])
          console.log("Annonces page size:", json["hydra:member"]?.length)
          console.log(">>> MELO SYNC URL:", nextUrl)
          console.log(">>> MELO PAGE SIZE:", json["hydra:member"]?.length)
          console.log(">>> MELO NEXT:", json["hydra:view"]?.["hydra:next"])
          
          // 🔥 LOG ULTRA DÉTAILLÉ : Premier élément complet de la réponse Melo
          if (pageCount === 1 && json['hydra:member'] && json['hydra:member'].length > 0) {
            const firstProperty = json['hydra:member'][0] as any
            console.log('\n🔥🔥🔥 PREMIÈRE PROPRIÉTÉ COMPLÈTE MELO.IO (searchAnnoncesWithPagination) 🔥🔥🔥')
            console.log('📦 Structure complète de la première propriété:')
            console.log(JSON.stringify(firstProperty, null, 2))
            
            // Log spécifique du premier advert si présent
            if (firstProperty.adverts && firstProperty.adverts.length > 0) {
              console.log('\n🔥🔥🔥 PREMIER ADVERT[0] COMPLET 🔥🔥🔥')
              console.log('📦 Structure complète du premier advert:')
              console.log(JSON.stringify(firstProperty.adverts[0], null, 2))
            } else {
              console.log('\n⚠️ Aucun advert trouvé dans la première propriété')
            }
          }
          
          // Extraire les annonces de cette page
          const pageAnnonces = this.convertMeloToAnnonce(json['hydra:member'] || [])
          allAnnonces = [...allAnnonces, ...pageAnnonces]
          
          // Log des informations
          const totalItems = json['hydra:totalItems'] || 0
          const hydraView = json['hydra:view'] || {}
          const nextPageUrl = hydraView['hydra:next'] || null
          
          console.log(`✅ Page ${currentPage}: ${pageAnnonces.length} annonces récupérées`)
          console.log(`   Total cumulé: ${allAnnonces.length}`)
          console.log(`   Total disponible (hydra:totalItems): ${totalItems}`)
          console.log(`   Page suivante (hydra:next): ${nextPageUrl ? 'OUI' : 'NON'}`)
          
          // Mettre à jour nextUrl pour la prochaine itération
          if (nextPageUrl) {
            if (nextPageUrl.startsWith("/")) {
              nextUrl = `${this.baseUrl}${nextPageUrl}`
            } else {
              nextUrl = nextPageUrl
            }
          } else {
            nextUrl = null
          }
          console.log(">>> NEXT PAGE ABS:", nextUrl ? nextUrl.replace(this.apiKey, 'XXX') : null)
          console.log(">>> next page:", nextUrl ? nextUrl.replace(this.apiKey, 'XXX') : null)
          
          // Si pas de page suivante, arrêter
          if (!nextUrl) {
            console.log(`✅ Toutes les pages récupérées (${allAnnonces.length} annonces sur ${totalItems} disponibles)`)
            break
          }
          
          // Vérifier si on a récupéré toutes les annonces disponibles
          if (totalItems > 0 && allAnnonces.length >= totalItems) {
            console.log(`🎉 Toutes les annonces récupérées (${allAnnonces.length}/${totalItems})`)
            break
          }
          
          // Arrêter si on atteint 10000 annonces (limite maximale)
          if (allAnnonces.length >= 10000) {
            console.log(`⚠️ Limite de 10000 annonces atteinte`)
            break
          }
          
          // Petit délai entre pages pour éviter de surcharger l'API
          await new Promise(resolve => setTimeout(resolve, 200)) // 200ms entre chaque page
          
        } catch (error) {
          console.error(`❌ Erreur lors de la récupération de la page ${currentPage}:`, error)
          break
        }
      }
      
      console.log(`🎉 Pagination terminée: ${allAnnonces.length} annonces récupérées en ${pageCount} pages`)
      
      // Log de répartition par ville pour diagnostic
      if (allAnnonces.length > 0) {
        const cityDistribution = allAnnonces.reduce((acc: Record<string, number>, annonce) => {
          const city = annonce.city || 'Ville non définie'
          acc[city] = (acc[city] || 0) + 1
          return acc
        }, {})
        const cityStats = Object.entries(cityDistribution)
          .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
          .slice(0, 15)
          .map(([city, count]: [string, number]) => `${city}: ${count}`)
          .join(', ')
        console.log(`🏙️ Répartition par ville (top 15):`, cityStats)
      }
      
      return allAnnonces
      
    } catch (error) {
      console.error('❌ Erreur pagination Melo.io:', error)
      // Retourner ce qu'on a récupéré même en cas d'erreur
      return allAnnonces
    }
  }
  
  private convertMeloToAnnonce(meloProperties: MeloProperty[]): LeBonCoinAnnonce[] {
    console.log(`🔄 Conversion de ${meloProperties.length} propriétés Melo.io`)
    
    const annonces: LeBonCoinAnnonce[] = []
    
    meloProperties.forEach((property: MeloProperty, index: number) => {
      const raw = property as any
      const meloCity = raw.city?.name || raw.city?.originalName || ''
      const meloZip = raw.city?.zipcode || ''
      // Prendre le premier advert (ou le dernier si plusieurs)
      const advert = property.adverts?.[0]
      
      if (!advert) {
        console.warn(`⚠️ Propriété ${property['@id']} n'a pas d'advert`)
        return
      }
      
      // 🔥 LOG FULL ADVERT - Objet brut complet pour les 3 premières propriétés
      if (index < 3) {
        console.log(`\n🔥 FULL ADVERT [${index + 1}] - Propriété ${property['@id']} 🔥`)
        console.log('📦 Objet advert brut complet (convertMeloToAnnonce):')
        console.log(JSON.stringify(advert, null, 2))
        
        console.log(`\n📸 [${index + 1}] ANALYSE IMAGES - Propriété ${property['@id']}`)
        console.log('   Property level:', {
          hasPictures: !!raw.pictures,
          picturesCount: raw.pictures?.length || 0,
          hasPicturesRemote: !!raw.picturesRemote,
          picturesRemoteCount: raw.picturesRemote?.length || 0,
        })
        console.log('   Advert level:', {
          hasImages: !!advert.images,
          imagesCount: advert.images?.length || 0,
          hasPictures: !!(advert as any).pictures,
          picturesCount: (advert as any).pictures?.length || 0,
          hasPicturesRemote: !!(advert as any).picturesRemote,
          picturesRemoteCount: (advert as any).picturesRemote?.length || 0,
        })
      }
      
      // Extraire le titre depuis la description (premiers 100 caractères)
      const title = advert.description 
        ? advert.description.substring(0, 100).replace(/\n/g, ' ').trim()
        : 'Annonce immobilière'
      
      // Déterminer le type depuis propertyType
      let typeLabel = 'Appartement'
      if (property.propertyType === 1) typeLabel = 'Maison'
      else if (property.propertyType === 2) typeLabel = 'Immeuble'
      else if (property.propertyType === 3) typeLabel = 'Parking'
      else if (property.propertyType === 4) typeLabel = 'Bureau'
      else if (property.propertyType === 5) typeLabel = 'Terrain'
      else if (property.propertyType === 6) typeLabel = 'Commerce'
      
      // 🔍 Extraction des images selon la structure Melo
      // Priorité : advert > property (root)
      const primaryAdvert = property.adverts?.[0] as any
      
      // Extraire pictures depuis advert puis property
      const picturesFromRoot = Array.isArray(raw.pictures) ? raw.pictures : []
      const picturesFromAdvert = Array.isArray(primaryAdvert?.pictures) ? primaryAdvert.pictures : []
      
      // Extraire picturesRemote depuis advert puis property
      const picturesRemoteFromRoot = Array.isArray(raw.picturesRemote) ? raw.picturesRemote : []
      const picturesRemoteFromAdvert = Array.isArray(primaryAdvert?.picturesRemote) ? primaryAdvert.picturesRemote : []
      
      // Construire les tableaux finaux avec priorité advert > root
      const images: string[] = picturesFromAdvert.length > 0
        ? picturesFromAdvert
        : picturesFromRoot
      
      const picturesRemote: string[] = picturesRemoteFromAdvert.length > 0
        ? picturesRemoteFromAdvert
        : picturesRemoteFromRoot
      
      // pictures = miroir de images (pour compatibilité)
      const pictures: string[] = images
      
      const converted: LeBonCoinAnnonce = {
        title: title || 'Sans titre',
        price: advert.price?.toString() || '0',
        surface: advert.surface ? `${advert.surface} m²` : undefined,
        rooms: advert.rooms || undefined,
        postalCode: meloZip,
        city: meloCity,
        url: advert.url || '',
        publishedAt: advert.createdAt ? new Date(advert.createdAt) : new Date(),
        images: images, // Priorité : advert.pictures > property.pictures
        picturesRemote: picturesRemote, // Priorité : advert.picturesRemote > property.picturesRemote
        pictures: pictures, // Miroir de images pour compatibilité
        description: advert.description || ''
      }
      
      // Log détaillé pour les 3 premières conversions
      if (index < 3) {
        console.log(`   ✅ Images extraites:`)
        console.log(`      - images: ${converted.images.length} URL(s)`)
        console.log(`      - picturesRemote: ${converted.picturesRemote.length} URL(s)`)
        console.log(`      - pictures: ${converted.pictures.length} URL(s)`)
        if (converted.images.length > 0) {
          console.log(`      - Première image: ${converted.images[0]?.substring(0, 100)}`)
        } else if (converted.picturesRemote.length > 0) {
          console.log(`      - Première pictureRemote: ${converted.picturesRemote[0]?.substring(0, 100)}`)
        } else {
          console.log(`      ⚠️ Aucune image trouvée pour cette annonce`)
        }
      }
      
      // Log les premières conversions pour debug
      if (index < 3) {
        console.log(`  [${index + 1}] Converti:`, {
          title: converted.title.substring(0, 50),
          city: converted.city,
          price: converted.price,
          surface: converted.surface,
          rooms: converted.rooms,
          type: typeLabel
        })
      }
      
      annonces.push(converted)
    })
    
    return annonces
  }
}

export const meloService = new MeloService()

