/**
 * Service d'orchestration pour les Piges immobilières
 * Utilise le nouveau moteur adsEngine pour une gestion robuste et complète
 */

import { throttleUser } from "@/lib/piges/throttle";
import type { NormalizedListing } from "@/lib/piges/normalize";
import { adsEngineQuery, type AdsEngineFilters } from "@/services/adsEngine";

const MAX_SCANS_PER_HOUR = 20;

export interface PigeSearchFilters {
  city?: string;
  postalCode?: string; // Conservé pour compatibilité
  postalCodes?: string[]; // Nouveau: liste de codes postaux
  minPrice?: number;
  maxPrice?: number;
  minSurface?: number;
  maxSurface?: number;
  minRooms?: number;
  maxRooms?: number;
  type?: "vente" | "location" | "all" | "";
  sellerType?: "all" | "pro" | "particulier";
  sources?: string[]; // Origines des annonces à filtrer (leboncoin, seloger, etc.)
  state?: string[]; // État du bien: neuf, ancien, recent, vefa, travaux (filtrage LOCAL uniquement)
  agency?: string; // Nom d'agence à filtrer (filtrage LOCAL uniquement, jamais envoyé à l'API)
}

export interface PigeSearchResult {
  listings: NormalizedListing[];
  total: number;
  pages: number;
  hasMore: boolean;
}

/**
 * Mappe le type SACIMO vers le format MoteurImmo
 */
function mapTypeToMoteurImmo(type: string | undefined): string[] {
  if (!type || type === "all" || type === "tous") {
    return ["sale", "rental"];
  }
  if (type === "vente") {
    return ["sale"];
  }
  if (type === "location") {
    return ["rental"];
  }
  return ["sale", "rental"];
}

/**
 * Construit le tableau locations pour MoteurImmo selon les règles :
 * - CP générique (75000, 33000, etc.) → departmentCode
 * - CP réel (75001, etc.) → postalCode
 * - Code postal obligatoire (la ville est ignorée)
 * - Supporte maintenant plusieurs codes postaux
 */
function buildMoteurImmoLocations(
  postalCodes: string[]
): Array<{ postalCode?: string; departmentCode?: number }> {
  const locations: Array<{ postalCode?: string; departmentCode?: number }> = [];

  // Code postal obligatoire
  if (!postalCodes || postalCodes.length === 0) {
    throw new Error("Au moins un code postal est obligatoire pour utiliser MoteurImmo.");
  }

  // Traiter chaque code postal
  for (const postalCode of postalCodes) {
    const trimmed = postalCode.trim();

    if (!trimmed) continue;

    // Cas CP générique (33000, 75000, 13000, etc.) → departmentCode
    if (/^\d{5}$/.test(trimmed) && trimmed.endsWith("000")) {
      const dep = Number(trimmed.substring(0, 2));
      if (!isNaN(dep) && dep >= 1 && dep <= 95) {
        // Éviter les doublons de département
        if (!locations.some(loc => loc.departmentCode === dep)) {
          locations.push({ departmentCode: dep });
          console.log(`📍 [Piges] CP générique ${trimmed} → département ${dep}`);
        }
      } else {
        throw new Error(`Code postal invalide : département non reconnu (${trimmed}).`);
      }
    } 
    // Cas CP réel normal (75001, etc.) → postalCode
    else if (/^\d{5}$/.test(trimmed)) {
      // Éviter les doublons
      if (!locations.some(loc => loc.postalCode === trimmed)) {
        locations.push({ postalCode: trimmed });
        console.log(`📍 [Piges] CP réel: ${trimmed}`);
      }
    } 
    // CP invalide
    else {
      throw new Error(`Code postal invalide: ${trimmed}. Veuillez entrer un code postal à 5 chiffres (ex: 75001, 75000).`);
    }
  }

  if (locations.length === 0) {
    throw new Error("Aucun code postal valide fourni.");
  }

  return locations;
}

/**
 * Valide les filtres de recherche
 * @throws Error si les filtres sont invalides
 */
function validateFilters(filters: PigeSearchFilters): void {
  // Code postal obligatoire pour MoteurImmo
  // Priorité à postalCodes (nouveau système)
  if (filters.postalCodes && filters.postalCodes.length > 0) {
    // Validation déjà faite dans buildMoteurImmoLocations
  } else if (!filters.postalCode || filters.postalCode.trim() === "") {
    throw new Error("Au moins un code postal est obligatoire pour utiliser MoteurImmo.");
  }

  // Validation des prix
  if (filters.minPrice && filters.maxPrice) {
    if (filters.minPrice > filters.maxPrice) {
      throw new Error("Le prix minimum ne peut pas être supérieur au prix maximum.");
    }
  }

  // Validation des surfaces
  if (filters.minSurface && filters.maxSurface) {
    if (filters.minSurface > filters.maxSurface) {
      throw new Error("La surface minimum ne peut pas être supérieure à la surface maximum.");
    }
  }

  // Validation des pièces
  if (filters.minRooms && filters.maxRooms) {
    if (filters.minRooms > filters.maxRooms) {
      throw new Error("Le nombre de pièces minimum ne peut pas être supérieur au maximum.");
    }
  }
}

/**
 * Exécute une recherche de Piges via MoteurImmo
 * @param filters Filtres de recherche
 * @param userId ID de l'utilisateur (pour throttling)
 * @returns Résultats normalisés
 */
export async function runPigeSearch(
  filters: PigeSearchFilters,
  userId: string
): Promise<PigeSearchResult> {
  // Validation des filtres
  validateFilters(filters);

  // Throttling utilisateur
  // Si le throttling échoue (ex: Prisma non initialisé), on continue quand même (fallback)
  try {
    await throttleUser(userId, MAX_SCANS_PER_HOUR);
  } catch (error: any) {
    // Si c'est une erreur de limite dépassée, on la propage
    if (error.message?.includes("Limite de scans atteinte")) {
      throw error;
    }
    // Sinon, on log l'erreur mais on continue (le throttling est une protection, pas un blocage)
    console.warn("⚠️ [Piges] Erreur de throttling, continuation sans limitation:", error.message);
  }

  console.log(`🔍 [Piges] Démarrage recherche MoteurImmo pour utilisateur ${userId}`);
  console.log(`📋 [Piges] Filtres demandés par l'utilisateur:`, filters);
  console.log(`📋 [Piges] IMPORTANT: Tous les filtres seront appliqués LOCALEMENT après récupération de toutes les annonces`);

  // Priorité à postalCodes (nouveau système)
  const postalCodesToUse = filters.postalCodes && filters.postalCodes.length > 0 
    ? filters.postalCodes 
    : filters.postalCode 
      ? [filters.postalCode] 
      : [];

  if (postalCodesToUse.length === 0) {
    throw new Error("Au moins un code postal est obligatoire");
  }

  // ============================================
  // UTILISATION DU NOUVEAU MOTEUR adsEngine
  // ============================================
  // Le moteur adsEngine gère :
  // - Pagination dynamique (infinite pagination, pas limitée à 10 pages)
  // - Cache intelligent (30 min TTL)
  // - Normalisation automatique
  // - Classification vendeur Particulier/Professionnel
  // - Merge multi-pages + multi-CP
  // - Filtrage LOCAL uniquement
  // - Tri par date DESC
  // - Logs complets
  
  console.log(`📥 [Piges] Utilisation du moteur adsEngine pour ${postalCodesToUse.length} code(s) postal(aux)`);
  console.log(`📥 [Piges] AUCUN FILTRE envoyé à l'API MoteurImmo (récupération brute)`);

  // Mapper les filtres PigeSearchFilters vers AdsEngineFilters
  const engineFilters: AdsEngineFilters = {
    sellerType: filters.sellerType === "particulier" ? "particulier" : 
                filters.sellerType === "pro" ? "pro" : "all",
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minSurface: filters.minSurface,
    maxSurface: filters.maxSurface,
    minRooms: filters.minRooms,
    maxRooms: filters.maxRooms,
    state: filters.state && filters.state.length > 0 ? filters.state : undefined,
    sources: filters.sources && filters.sources.length > 0 ? filters.sources : undefined,
    agency: filters.agency && filters.agency.trim().length > 0 ? filters.agency.trim() : undefined,
    type: filters.type === "vente" ? "vente" : 
          filters.type === "location" ? "location" : "all",
    dateRange: filters.dateRange && filters.dateRange !== "all" ? filters.dateRange : undefined,
  };

  // Appeler le moteur adsEngine
  const engineResult = await adsEngineQuery(postalCodesToUse, engineFilters);

  // Les résultats du moteur adsEngine sont déjà :
  // - Normalisés
  // - Classifiés (vendorType)
  // - Filtrés localement
  // - Triés par date DESC

  // Logs finaux
  console.log(`\n🎉 [Piges] RÉSULTAT FINAL:`);
  console.log(`  → Total avant filtrage: ${engineResult.stats.totalBeforeFilters}`);
  console.log(`  → Après filtrage: ${engineResult.stats.totalAfterFilters}`);
  console.log(`  → Pages récupérées: ${engineResult.pagesCount}`);
  console.log(`  → CP traités: ${engineResult.postalCodesProcessed.join(", ")}`);
  console.log(`  → Cache hits: ${engineResult.cacheHits}, misses: ${engineResult.cacheMisses}`);
  console.log(`  → Particuliers: ${engineResult.stats.particuliers}`);
  console.log(`  → Professionnels: ${engineResult.stats.professionnels}`);

  return {
    listings: engineResult.listings, // Résultats déjà filtrés et triés par adsEngine
    total: engineResult.total, // Nombre après filtrage
    pages: engineResult.pagesCount,
    hasMore: false, // Toujours false (pas de limitation visible)
  };
}

/**
 * Récupère l'historique des recherches de Piges pour un utilisateur
 */
export async function getPigeHistory(userId: string) {
  // TODO: Implémenter l'historique si nécessaire
  // Pour l'instant, retourner un tableau vide
  return [];
}

