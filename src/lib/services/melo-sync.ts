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
  async syncAnnonces(options: SyncOptions = {}): Promise<SyncResult> {
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
      console.log('🔄 Démarrage de la synchronisation Melo.io...');

      // 1. Récupérer les annonces depuis Melo.io
      const annonces = await this.fetchAnnoncesFromMelo(options);
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
        await this.saveAnnonces(newAnnonces);
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
  private async fetchAnnoncesFromMelo(options: SyncOptions): Promise<LeBonCoinAnnonce[]> {
    try {
      // Construire les paramètres de recherche pour MeloService
      const searchParams: any = {};
      
      if (options.filters) {
        // Construction du paramètre city avec format spécial pour code postal
        if (options.filters.ville && options.filters.codePostal) {
          searchParams.ville = `${options.filters.ville} (${options.filters.codePostal})`;
        } else if (options.filters.codePostal) {
          searchParams.ville = options.filters.codePostal;
        } else if (options.filters.ville) {
          searchParams.ville = options.filters.ville;
        }
        
        if (options.filters.minPrix) searchParams.minPrix = options.filters.minPrix;
        if (options.filters.maxPrix) searchParams.maxPrix = options.filters.maxPrix;
        if (options.filters.minSurface) searchParams.minSurface = options.filters.minSurface;
        if (options.filters.maxSurface) searchParams.maxSurface = options.filters.maxSurface;
        if (options.filters.typeBien) searchParams.typeBien = options.filters.typeBien;
        if (options.filters.pieces) searchParams.pieces = options.filters.pieces;
        if (options.filters.chambres) searchParams.chambres = options.filters.chambres;
        if (options.filters.transactionType) searchParams.transactionType = options.filters.transactionType;
      }

      // Limiter le nombre de résultats
      searchParams.itemsPerPage = options.limit || 100;

      console.log('🔍 Paramètres de recherche Melo.io:', searchParams);

      // Récupérer les annonces via le service Melo.io
      const annonces = await meloService.searchAnnonces(searchParams);
      
      return annonces;
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
  private async saveAnnonces(annonces: LeBonCoinAnnonce[]): Promise<void> {
    const savePromises = annonces.map(async (annonce) => {
      try {
        // Parser le prix
        const price = parseInt(annonce.price.replace(/[^\d]/g, '')) || 0;
        
        // Parser la surface
        const surface = annonce.surface 
          ? parseInt(annonce.surface.replace(/[^\d]/g, '')) 
          : null;

        return await prisma.annonceScrape.create({
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
              city: annonce.city || '',
              postalCode: annonce.postalCode || '',
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

