/**
 * Service de synchronisation Melo.io
 * 
 * Gère la synchronisation des annonces depuis l'API Melo.io vers la base de données
 * - Récupération des annonces depuis Melo.io
 * - Détection et élimination des doublons
 * - Transformation AnnonceScrape → Listing (optionnel)
 * - Calcul des statistiques
 */

import { prisma } from '@/lib/prisma';
import { meloService } from './melo';
import { meloCityService } from './melo-city';
import { LeBonCoinAnnonce } from '../scrapers/leboncoin-zenrows';

export interface SyncResult {
  success: boolean;
  newAnnonces: number;
  duplicates: number;
  errors: number;
  totalProcessed: number;
  stats: {
    prixMoyen: number;
    surfaceMoyenne: number;
    nouvellesVilles: string[];
  };
  debugLogs?: {
    firstPropertyStructure?: any;
    firstAnnonceStructure?: any;
    cityDistribution?: Record<string, number>;
  };
}

export interface SyncOptions {
  filters?: {
    ville?: string;
    codePostal?: string; // Code postal pour filtrage post-récupération
    minPrix?: number;
    maxPrix?: number;
    minSurface?: number; // Surface minimale en m²
    maxSurface?: number; // Surface maximale en m²
    typeBien?: 'appartement' | 'maison' | 'immeuble' | 'parking' | 'bureau' | 'terrain' | 'commerce';
    pieces?: number;
    chambres?: number;
    transactionType?: 'vente' | 'location';
  };
  limit?: number;
  transformToListing?: boolean; // Transformer en Listing structuré
}

class MeloSyncService {
  /**
   * Synchronise les annonces depuis Melo.io vers la BDD
   */
  async syncAnnonces(options: SyncOptions = {}, includeDebug: boolean = false): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      newAnnonces: 0,
      duplicates: 0,
      errors: 0,
      totalProcessed: 0,
      stats: {
        prixMoyen: 0,
        surfaceMoyenne: 0,
        nouvellesVilles: [],
      },
    };

    try {
      // Augmenter la limite par défaut à 2000
      const limit = options.limit || 2000
      console.log(`🔄 Démarrage de la synchronisation Melo.io (limite: ${limit})...`);

      // 1. Récupérer les annonces depuis Melo.io
      const { annonces, debugLogs: fetchDebugLogs } = await this.fetchAnnoncesFromMelo({ ...options, limit }, includeDebug);
      result.totalProcessed = annonces.length;

      console.log(`📥 ${annonces.length} annonces récupérées depuis Melo.io`);

      // 2. Filtrer les doublons
      const { newAnnonces, duplicates } = await this.filterDuplicates(annonces);
      result.newAnnonces = newAnnonces.length;
      result.duplicates = duplicates;

      console.log(`✅ ${newAnnonces.length} nouvelles annonces`);
      console.log(`⏭️  ${duplicates} doublons ignorés`);

      // 3. Sauvegarder les nouvelles annonces
      if (newAnnonces.length > 0) {
        const filterVille = options.filters?.ville
        await this.saveAnnonces(newAnnonces, filterVille);
        console.log(`💾 ${newAnnonces.length} annonces sauvegardées`);

        // 4. Transformer en Listing si demandé
        if (options.transformToListing) {
          await this.transformToListings(newAnnonces);
          console.log(`🔄 Annonces transformées en Listings`);
        }

        // 5. Calculer les statistiques
        result.stats = await this.calculateStats(newAnnonces);
      }

      result.success = true;
      console.log('✅ Synchronisation terminée avec succès');

      // Ajouter les logs de débogage si demandé
      if (includeDebug && fetchDebugLogs) {
        result.debugLogs = fetchDebugLogs;
      }

      return result;
    } catch (error: any) {
      console.error('❌ Erreur lors de la synchronisation:', error);
      result.errors = 1;
      result.success = false;
      return result;
    }
  }

  /**
   * Récupère les annonces depuis l'API Melo.io
   */
  private async fetchAnnoncesFromMelo(options: SyncOptions, includeDebug: boolean = false): Promise<{ annonces: LeBonCoinAnnonce[], debugLogs?: any }> {
    try {
      // Construire les paramètres de recherche pour MeloService
      const searchParams: any = {
        itemsPerPage: 100,
      };
      
      if (options.filters) {
        const filters = options.filters

        // Si on a un code postal exact, utiliser includedDepartments[]
        if (filters.codePostal && /^\d{5}$/.test(filters.codePostal)) {
          const postalCode = filters.codePostal
          
          if (postalCode.startsWith('75')) {
            searchParams.department = '75'
            console.log(`📍 Code postal ${postalCode} → includedDepartments[]=75`)
          } else if (postalCode.startsWith('06')) {
            searchParams.department = '06'
            console.log(`📍 Code postal ${postalCode} → includedDepartments[]=06`)
          } else {
            const dept = postalCode.substring(0, 2)
            searchParams.department = dept
            console.log(`📍 Code postal ${postalCode} → includedDepartments[]=${dept}`)
          }
        }

        // Conversion ville → ID Melo
        if (filters.ville) {
          const cityName = filters.ville.trim()
          if (cityName.length > 0) {
            const city = await meloCityService.searchCity(cityName)

            if (city) {
              searchParams.cityId = city.id
              console.log(`🏙️ Ville détectée: ${city.name} → ID ${city.id}`)
            } else {
              console.warn(`⚠️ Ville "${cityName}" introuvable dans Melo /cities`)
            }
          }
        }

        if (filters.minPrix) searchParams.minPrix = filters.minPrix
        if (filters.maxPrix) searchParams.maxPrix = filters.maxPrix
        if (filters.minSurface) searchParams.minSurface = filters.minSurface
        if (filters.maxSurface) searchParams.maxSurface = filters.maxSurface
        if (filters.typeBien) searchParams.typeBien = filters.typeBien
        if (filters.pieces) searchParams.pieces = filters.pieces
        if (filters.chambres) searchParams.chambres = filters.chambres
        if (filters.transactionType) searchParams.transactionType = filters.transactionType
      }

      console.log('🔍 Paramètres de recherche Melo.io:', searchParams);

            // UTILISER LA PAGINATION AUTOMATIQUE pour récupérer TOUTES les annonces
            // Calculer le nombre de pages nécessaires (max 100 pages = 10000 annonces)
            const requestedLimit = options.limit || 10000
            const maxPages = Math.ceil(requestedLimit / 100)
            const actualMaxPages = Math.min(maxPages, 100) // Maximum 100 pages = 10000 annonces
      
      console.log(`📤 Paramètres EXACTS envoyés à Melo.io:`, JSON.stringify(searchParams, null, 2))
      console.log(`🎯 Limite demandée: ${requestedLimit} annonces`)
      console.log(`🔄 Utilisation de la pagination automatique (max 200 pages = 20000 annonces max)...`)
      console.log(`🔍 APPEL DE searchAnnoncesWithPagination avec:`, {
        searchParams,
        'searchParams.department': searchParams.department
      })
      
      const annonces = await meloService.searchAnnoncesWithPagination(searchParams)
      
      console.log(`✅ searchAnnoncesWithPagination terminée - ${annonces.length} annonces retournées`)
      
      console.log(`📥 ${annonces.length} annonces BRUTES récupérées depuis Melo.io`)
      
      // Si on a un code postal exact, filtrer les annonces par code postal après récupération
      // Car on utilise includedDepartments[] qui retourne TOUT le département, pas seulement le code postal
      let filteredAnnonces = annonces
      if (options.filters?.codePostal && /^\d{5}$/.test(options.filters.codePostal)) {
        const targetPostalCode = options.filters.codePostal
        console.log(`🔍 FILTRAGE par code postal ${targetPostalCode} après récupération...`)
        console.log(`   Annonces totales récupérées (département): ${annonces.length}`)
        
        // Analyser les codes postaux avant filtrage
        const postalCodeCount = annonces.reduce((acc: Record<string, number>, annonce) => {
          const postal = annonce.postalCode || 'Sans CP'
          acc[postal] = (acc[postal] || 0) + 1
          return acc
        }, {})
        console.log(`   Répartition avant filtrage:`, Object.entries(postalCodeCount)
          .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
          .slice(0, 10)
          .map(([postal, count]: [string, number]) => `${postal}: ${count}`)
          .join(', '))
        
        // Filtrer par code postal exact
        filteredAnnonces = annonces.filter(a => (a.postalCode || '') === targetPostalCode)
        
        const matchingCount = filteredAnnonces.length
        console.log(`🎯 Après filtrage: ${matchingCount} annonces avec code postal ${targetPostalCode} sur ${annonces.length} récupérées`)
        
        if (matchingCount === 0 && annonces.length > 0) {
          console.warn(`⚠️ AUCUNE annonce avec le code postal ${targetPostalCode} !`)
          console.warn(`   Codes postaux trouvés: ${Object.keys(postalCodeCount).slice(0, 20).join(', ')}`)
          console.warn(`   Cela signifie que le département a été récupéré mais pas d'annonces pour ce code postal exact`)
        }
      }
      
      // Analyser les codes postaux des annonces récupérées (ou filtrées)
      if (filteredAnnonces.length > 0) {
        const postalCodeCount = filteredAnnonces.reduce((acc: Record<string, number>, annonce) => {
          const postal = annonce.postalCode || 'Sans CP'
          acc[postal] = (acc[postal] || 0) + 1
          return acc
        }, {})
        const postalCodeDistributionStr = Object.entries(postalCodeCount)
          .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
          .slice(0, 20)
          .map(([postal, count]: [string, number]) => `${postal}: ${count}`)
          .join(', ')
        console.log('📮 Répartition des codes postaux dans les annonces:', postalCodeDistributionStr)
      }
      
      // Analyser la répartition des villes
      if (annonces.length > 0) {
        const cityCount = annonces.reduce((acc: Record<string, number>, annonce) => {
          const city = annonce.city || 'Ville manquante'
          acc[city] = (acc[city] || 0) + 1
          return acc
        }, {})
        const cityDistributionStr = Object.entries(cityCount)
          .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
          .slice(0, 15)
          .map(([city, count]: [string, number]) => `${city}: ${count}`)
          .join(', ')
        console.log('🏙️ Répartition des villes dans les annonces récupérées:', cityDistributionStr);
        
        // DÉBOGUER LA STRUCTURE D'UNE ANNONCE (seulement la première)
        const debugLogs: any = {};
        const firstAnnonce = annonces[0];
        console.log('🔍 STRUCTURE D\'UNE ANNONCE MELO.IO (après conversion):', JSON.stringify(firstAnnonce, null, 2));
        console.log('🏙️ Ville dans l\'annonce convertie:', {
          city: firstAnnonce?.city,
          postalCode: firstAnnonce?.postalCode,
          title: firstAnnonce?.title?.substring(0, 50),
        });
        
        if (includeDebug) {
          debugLogs.firstAnnonceStructure = firstAnnonce;
          debugLogs.cityDistribution = cityCount;
        }
      }
      
      // Utiliser les annonces filtrées si on a un code postal exact
      const finalAnnonces = filteredAnnonces.length > 0 ? filteredAnnonces : annonces
      
      // Respecter la limite demandée seulement à la fin (max 10000)
      const maxLimit = Math.min(requestedLimit, 10000)
      const limitedAnnonces = finalAnnonces.slice(0, maxLimit);
      
      if (limitedAnnonces.length < finalAnnonces.length) {
        console.log(`⚠️ Limité à ${limitedAnnonces.length} annonces (sur ${finalAnnonces.length} disponibles)`);
      }
      
      console.log(`✅ ${limitedAnnonces.length} annonces finales retournées (${finalAnnonces.length} après filtrage code postal, ${annonces.length} brutes depuis Melo.io)`)
      
      return { annonces: limitedAnnonces };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération depuis Melo.io:', error);
      throw error;
    }
  }

  /**
   * Filtre les doublons en comparant avec la BDD
   */
  private async filterDuplicates(
    annonces: LeBonCoinAnnonce[]
  ): Promise<{ newAnnonces: LeBonCoinAnnonce[]; duplicates: number }> {
    const newAnnonces: LeBonCoinAnnonce[] = [];
    let duplicates = 0;

    for (const annonce of annonces) {
      try {
        // Vérifier si l'annonce existe déjà (par URL, qui est unique)
        const exists = await prisma.annonceScrape.findUnique({
          where: {
            url: annonce.url || '',
          },
        });

        if (exists) {
          duplicates++;
        } else {
          newAnnonces.push(annonce);
        }
      } catch (error: any) {
        console.error('❌ Erreur lors de la vérification de doublon:', error);
        // En cas d'erreur, considérer comme nouvelle annonce
        newAnnonces.push(annonce);
      }
    }

    return { newAnnonces, duplicates };
  }

  /**
   * Sauvegarde les annonces en base de données (AnnonceScrape)
   */
  private async saveAnnonces(annonces: LeBonCoinAnnonce[], filterVille?: string): Promise<void> {
    console.log(`💾 Sauvegarde de ${annonces.length} annonces en base de données...`)
    
    const savePromises = annonces.map(async (annonce, index) => {
      try {
        // DÉBOGUER CHAQUE ANNONCE (seulement les 5 premières)
        if (index < 5) {
          console.log(`💾 [${index + 1}] Sauvegarde annonce:`, {
            title: annonce.title?.substring(0, 50),
            city: annonce.city,
            postalCode: annonce.postalCode,
            url: annonce.url?.substring(0, 50),
          })
        }
        
        // Parser le prix
        const price = parseInt(annonce.price.replace(/[^\d]/g, '')) || 0;
        
        // Parser la surface
        const surface = annonce.surface 
          ? parseInt(annonce.surface.replace(/[^\d]/g, '')) 
          : null;

        // EXTRAIRE ET VALIDER LA VILLE - Amélioration pour éviter "Ville non précisée"
        let city = (annonce.city || '').trim()
        const postalCode = annonce.postalCode || null
        
        // Si la ville est vide mais qu'on a un code postal, essayer de déduire
        if (!city && postalCode) {
          // Mapping code postal → ville pour les cas courants (liste étendue)
          const postalCodeToCity: Record<string, string> = {
            // Nice (06xxx) - Liste complète
            '06000': 'Nice', '06100': 'Nice', '06200': 'Nice', '06300': 'Nice', '06400': 'Nice', '06500': 'Nice',
            '06001': 'Nice', '06002': 'Nice', '06003': 'Nice', '06004': 'Nice', '06005': 'Nice',
            // Cannes (06xxx)
            '06400': 'Cannes', '06150': 'Cannes',
            // Antibes (06xxx)
            '06600': 'Antibes',
            // Menton (06xxx)
            '06500': 'Menton',
            // Paris (75xxx)
            '75001': 'Paris', '75002': 'Paris', '75003': 'Paris', '75004': 'Paris', '75005': 'Paris',
            '75006': 'Paris', '75007': 'Paris', '75008': 'Paris', '75009': 'Paris', '75010': 'Paris',
            '75011': 'Paris', '75012': 'Paris', '75013': 'Paris', '75014': 'Paris', '75015': 'Paris',
            '75016': 'Paris', '75017': 'Paris', '75018': 'Paris', '75019': 'Paris', '75020': 'Paris',
            // Lyon (69xxx)
            '69001': 'Lyon', '69002': 'Lyon', '69003': 'Lyon', '69004': 'Lyon', '69005': 'Lyon',
            '69006': 'Lyon', '69007': 'Lyon', '69008': 'Lyon', '69009': 'Lyon',
            // Marseille (13xxx)
            '13001': 'Marseille', '13002': 'Marseille', '13003': 'Marseille', '13004': 'Marseille', '13005': 'Marseille',
            '13006': 'Marseille', '13007': 'Marseille', '13008': 'Marseille', '13009': 'Marseille', '13010': 'Marseille',
            '13011': 'Marseille', '13012': 'Marseille', '13013': 'Marseille', '13014': 'Marseille', '13015': 'Marseille', '13016': 'Marseille',
          }
          
          if (postalCodeToCity[postalCode]) {
            city = postalCodeToCity[postalCode]
            if (index < 5) {
              console.log(`📍 Ville déduite depuis code postal ${postalCode}: ${city}`)
            }
          } else {
            // Si le code postal commence par 06 et qu'on filtre par Nice, c'est probablement Nice
            if (postalCode.startsWith('06') && filterVille?.toLowerCase().includes('nice')) {
              city = 'Nice'
              if (index < 5) {
                console.log(`📍 Ville déduite (code postal 06xxx + filtre Nice): ${city}`)
              }
            } else if (postalCode.startsWith('06')) {
              // Si code postal 06xxx mais pas dans la liste, mettre "Nice" par défaut si filtre Nice
              // Sinon mettre "Alpes-Maritimes" comme ville générique
              if (filterVille?.toLowerCase().includes('nice')) {
                city = 'Nice'
              } else {
                city = 'Alpes-Maritimes' // Ville générique pour le département 06
              }
              if (index < 5) {
                console.log(`📍 Ville générique déduite (code postal 06xxx): ${city}`)
              }
            } else if (index < 5) {
              console.warn(`⚠️ Ville manquante pour code postal ${postalCode}`)
            }
          }
        }
        
        // Si la ville est toujours vide après toutes les tentatives, utiliser une valeur par défaut
        if (!city) {
          if (postalCode && postalCode.startsWith('06')) {
            // Si on a un code postal 06xxx, mettre "Nice" par défaut si filtre Nice, sinon "Alpes-Maritimes"
            city = filterVille?.toLowerCase().includes('nice') ? 'Nice' : 'Alpes-Maritimes'
            console.warn(`⚠️ Ville non trouvée, utilisation de "${city}" par défaut pour code postal ${postalCode}`)
          } else {
            city = 'Ville non précisée' // Dernier recours
            console.warn(`⚠️ Annonce sans ville ni code postal: "${annonce.title?.substring(0, 50)}"`)
          }
        }

        return await prisma.annonceScrape.create({
          data: {
            title: annonce.title || 'Sans titre',
            price: price,
            surface: surface,
            rooms: annonce.rooms || null,
            city: city, // Ville extraite ou déduite
            postalCode: postalCode,
            url: annonce.url || '',
            publishedAt: annonce.publishedAt || new Date(),
            images: annonce.images || [],
            description: annonce.description || '',
            source: 'MELO', // Source Melo.io
            isNew: true,
            lastScrapedAt: new Date(),
          },
        });
      } catch (error: any) {
        // Gérer les erreurs de validation ou doublons
        if (error.code === 'P2002') {
          // Doublon (URL unique) - ignorer silencieusement
          console.log(`⚠️ Doublon ignoré: ${annonce.url?.substring(0, 50)}...`);
          return null;
        }
        console.error(`❌ Erreur sauvegarde annonce:`, error.message);
        throw error;
      }
    });

    await Promise.all(savePromises);
  }

  /**
   * Transforme les AnnonceScrape en Listing structurés
   */
  private async transformToListings(annonces: LeBonCoinAnnonce[]): Promise<void> {
    for (const annonce of annonces) {
      try {
        // EXTRAIRE ET VALIDER LA VILLE (même logique que saveAnnonces)
        let city = annonce.city || ''
        const postalCode = annonce.postalCode || ''
        
        // Si la ville est vide mais qu'on a un code postal, essayer de déduire
        if (!city && postalCode) {
          const postalCodeToCity: Record<string, string> = {
            '06000': 'Nice',
            '06100': 'Nice',
            '06200': 'Nice',
            '06300': 'Nice',
            '06400': 'Nice',
            '06500': 'Nice',
            '75001': 'Paris',
            '75002': 'Paris',
            '75003': 'Paris',
            '75004': 'Paris',
            '75005': 'Paris',
            '75006': 'Paris',
            '75007': 'Paris',
            '75008': 'Paris',
            '75009': 'Paris',
            '75010': 'Paris',
            '75011': 'Paris',
            '75012': 'Paris',
            '75013': 'Paris',
            '75014': 'Paris',
            '75015': 'Paris',
            '75016': 'Paris',
            '75017': 'Paris',
            '75018': 'Paris',
            '75019': 'Paris',
            '75020': 'Paris',
          }
          
          if (postalCodeToCity[postalCode]) {
            city = postalCodeToCity[postalCode]
          } else if (postalCode.startsWith('06')) {
            // Si code postal 06xxx, c'est probablement Nice ou une autre ville des Alpes-Maritimes
            // On ne peut pas deviner, mais on peut au moins mettre "Alpes-Maritimes"
            // Pour l'instant, on laisse vide et on log
            console.warn(`⚠️ Code postal ${postalCode} non mappé (06xxx mais pas Nice connu)`)
          }
        }
        
        // Vérifier si le Listing existe déjà (par URL)
        const existingListing = await prisma.listing.findFirst({
          where: {
            url: annonce.url || '',
          },
        });

        if (!existingListing) {
          // Parser le prix
          const price = parseInt(annonce.price.replace(/[^\d]/g, '')) || 0;
          
          // Parser la surface
          const surface = annonce.surface 
            ? parseInt(annonce.surface.replace(/[^\d]/g, '')) 
            : null;

          // Créer un nouveau Listing
          await prisma.listing.create({
            data: {
              title: annonce.title || 'Sans titre',
              price: price,
              surface: surface || undefined,
              rooms: annonce.rooms || undefined,
              city: city, // Ville extraite ou déduite
              postalCode: postalCode || '',
              url: annonce.url || '',
              publishedAt: annonce.publishedAt || new Date(),
              photos: annonce.images || [],
              description: annonce.description || undefined,
              type: this.determineListingType(annonce),
              source: 'LEBONCOIN', // Melo.io récupère depuis LeBonCoin (via leur API)
              isPrivateSeller: true, // Par défaut, à affiner selon les données
            },
          });
        }
      } catch (error: any) {
        console.error('❌ Erreur lors de la transformation en Listing:', error);
        // Continuer avec les autres annonces
      }
    }
  }

  /**
   * Détermine le type de listing à partir de l'annonce
   */
  private determineListingType(annonce: LeBonCoinAnnonce): 'APARTMENT' | 'HOUSE' | 'STUDIO' | 'LOFT' | 'PENTHOUSE' | 'VILLA' | 'TOWNHOUSE' | 'OTHER' {
    // Utiliser les types de l'enum ListingType du schéma Prisma
    const title = (annonce.title || '').toLowerCase();
    
    if (title.includes('maison') || title.includes('villa')) {
      return 'HOUSE';
    }
    if (title.includes('appartement') || title.includes('apt') || title.includes('t2') || title.includes('t3') || title.includes('t4') || title.includes('t5')) {
      return 'APARTMENT';
    }
    if (title.includes('studio') || title.includes('t1')) {
      return 'STUDIO';
    }
    if (title.includes('loft')) {
      return 'LOFT';
    }
    if (title.includes('penthouse')) {
      return 'PENTHOUSE';
    }
    if (title.includes('townhouse') || title.includes('maison de ville')) {
      return 'TOWNHOUSE';
    }

    return 'OTHER';
  }

  /**
   * Calcule les statistiques des nouvelles annonces
   */
  private async calculateStats(annonces: LeBonCoinAnnonce[]): Promise<{
    prixMoyen: number;
    surfaceMoyenne: number;
    nouvellesVilles: string[];
  }> {
    const prices: number[] = [];
    const surfaces: number[] = [];
    const villesSet = new Set<string>();

    annonces.forEach((annonce) => {
      // Prix
      const price = parseInt(annonce.price.replace(/[^\d]/g, '')) || 0;
      if (price > 0) prices.push(price);

      // Surface
      if (annonce.surface) {
        const surface = parseInt(annonce.surface.replace(/[^\d]/g, '')) || 0;
        if (surface > 0) surfaces.push(surface);
      }

      // Villes
      if (annonce.city) {
        villesSet.add(annonce.city);
      }
    });

    return {
      prixMoyen: prices.length > 0
        ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        : 0,
      surfaceMoyenne: surfaces.length > 0
        ? Math.round(surfaces.reduce((a, b) => a + b, 0) / surfaces.length)
        : 0,
      nouvellesVilles: Array.from(villesSet),
    };
  }

  /**
   * Récupère les statistiques globales depuis la BDD
   */
  async getGlobalStats(): Promise<{
    totalAnnonces: number;
    annoncesAujourdhui: number;
    prixMoyen: number;
    surfaceMoyenne: number;
    topVilles: { ville: string; count: number }[];
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Total d'annonces
    const totalAnnonces = await prisma.annonceScrape.count();

    // Annonces aujourd'hui
    const annoncesAujourdhui = await prisma.annonceScrape.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    // Prix moyen
    const avgPrice = await prisma.annonceScrape.aggregate({
      _avg: {
        price: true,
      },
      where: {
        price: {
          gt: 0,
        },
      },
    });

    // Surface moyenne
    const avgSurface = await prisma.annonceScrape.aggregate({
      _avg: {
        surface: true,
      },
      where: {
        surface: {
          gt: 0,
          not: null,
        },
      },
    });

    // Top villes
    const allAnnonces = await prisma.annonceScrape.findMany({
      where: {
        city: {
          not: '',
        },
      },
      select: {
        city: true,
      },
    });

    // Compter les villes manuellement (Prisma groupBy peut avoir des limitations)
    const villeCounts = allAnnonces.reduce((acc, annonce) => {
      const ville = annonce.city || 'Inconnu';
      acc[ville] = (acc[ville] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topVilles = Object.entries(villeCounts)
      .map(([ville, count]) => ({ ville, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalAnnonces,
      annoncesAujourdhui,
      prixMoyen: Math.round(avgPrice._avg.price || 0),
      surfaceMoyenne: Math.round(avgSurface._avg.surface || 0),
      topVilles,
    };
  }

  /**
   * Nettoie les anciennes annonces (plus de X jours)
   */
  async cleanOldAnnonces(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.annonceScrape.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`🗑️  ${result.count} annonces supprimées (+ de ${daysToKeep} jours)`);
    return result.count;
  }

  /**
   * Synchronise avec mise à jour des annonces existantes
   */
  async syncWithUpdate(options: SyncOptions = {}): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      newAnnonces: 0,
      duplicates: 0,
      errors: 0,
      totalProcessed: 0,
      stats: {
        prixMoyen: 0,
        surfaceMoyenne: 0,
        nouvellesVilles: [],
      },
    };

    try {
      console.log('🔄 Démarrage de la synchronisation avec mise à jour...');

      // 1. Récupérer les annonces depuis Melo.io
      const annonces = await this.fetchAnnoncesFromMelo(options);
      result.totalProcessed = annonces.length;

      console.log(`📥 ${annonces.length} annonces récupérées depuis Melo.io`);

      // 2. Traiter chaque annonce (créer ou mettre à jour)
      let newCount = 0;
      let updateCount = 0;
      let errorCount = 0;

      for (const annonce of annonces) {
        try {
          const price = parseInt(annonce.price.replace(/[^\d]/g, '')) || 0;
          const surface = annonce.surface 
            ? parseInt(annonce.surface.replace(/[^\d]/g, '')) 
            : null;

          const existing = await prisma.annonceScrape.findUnique({
            where: { url: annonce.url || '' }
          });

          if (existing) {
            // Mettre à jour
            await prisma.annonceScrape.update({
              where: { url: annonce.url || '' },
              data: {
                title: annonce.title || 'Sans titre',
                price: price,
                surface: surface,
                rooms: annonce.rooms || null,
                city: annonce.city || '',
                postalCode: annonce.postalCode || null,
                publishedAt: annonce.publishedAt || new Date(),
                images: annonce.images || [],
                description: annonce.description || '',
                isNew: false,
                lastScrapedAt: new Date(),
              },
            });
            updateCount++;
          } else {
            // Créer
            await prisma.annonceScrape.create({
              data: {
                title: annonce.title || 'Sans titre',
                price: price,
                surface: surface,
                rooms: annonce.rooms || null,
                city: annonce.city || '',
                postalCode: annonce.postalCode || null,
                url: annonce.url || '',
                publishedAt: annonce.publishedAt || new Date(),
                images: annonce.images || [],
                description: annonce.description || '',
                source: 'MELO',
                isNew: true,
                lastScrapedAt: new Date(),
              },
            });
            newCount++;
          }
        } catch (error: any) {
          if (error.code !== 'P2002') { // Ignorer les doublons
            console.error(`❌ Erreur traitement annonce:`, error.message);
            errorCount++;
          }
        }
      }

      result.newAnnonces = newCount;
      result.duplicates = updateCount; // Utiliser ce champ pour les mises à jour
      result.errors = errorCount;

      // Calculer les statistiques sur les nouvelles annonces uniquement
      const newAnnonces = annonces.filter((_, index) => {
        // Simplification : on considère les premières comme nouvelles
        return index < newCount;
      });
      result.stats = await this.calculateStats(newAnnonces);

      result.success = true;
      console.log(`✅ Synchronisation terminée: ${newCount} nouvelles, ${updateCount} mises à jour`);

      return result;
    } catch (error: any) {
      console.error('❌ Erreur lors de la synchronisation:', error);
      result.errors = 1;
      result.success = false;
      return result;
    }
  }
}

export const meloSyncService = new MeloSyncService();
export default meloSyncService;

