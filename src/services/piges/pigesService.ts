/**
 * Service d'orchestration pour les Piges immobilières
 * Utilise MoteurImmo comme unique provider
 */

import { moteurImmoSearch } from "@/lib/providers/moteurimmoClient";
import { normalizeMoteurImmoListings } from "@/lib/piges/normalize";
import { throttleUser } from "@/lib/piges/throttle";
import type { NormalizedListing } from "@/lib/piges/normalize";

// Hardcaps de sécurité
const MAX_TOTAL_RESULTS = 150;
const MAX_PAGES = 3;
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

  const results: NormalizedListing[] = [];
  let page = 1;
  let hasMore = true;

  console.log(`🔍 [Piges] Démarrage recherche MoteurImmo pour utilisateur ${userId}`);
  console.log(`📋 [Piges] Filtres:`, filters);

  // Préparer les paramètres MoteurImmo
  const types = mapTypeToMoteurImmo(filters.type);
  
  // Priorité à postalCodes (nouveau système)
  const postalCodesToUse = filters.postalCodes && filters.postalCodes.length > 0 
    ? filters.postalCodes 
    : filters.postalCode 
      ? [filters.postalCode] 
      : [];
  
  const locations = buildMoteurImmoLocations(postalCodesToUse);

  // Pagination jusqu'à MAX_PAGES ou MAX_TOTAL_RESULTS
  while (page <= MAX_PAGES && results.length < MAX_TOTAL_RESULTS && hasMore) {
    try {
      console.log(`📄 [Piges] Récupération page ${page}...`);

      const response = await moteurImmoSearch({
        page,
        maxLength: 50, // Maximum autorisé par page
        types,
        locations,
        priceMin: filters.minPrice ?? null,
        priceMax: filters.maxPrice ?? null,
        surfaceMin: filters.minSurface ?? null,
        surfaceMax: filters.maxSurface ?? null,
        roomsMin: filters.minRooms ?? null,
        roomsMax: filters.maxRooms ?? null,
        withCount: false, // Plus rapide
      });

      // Normaliser les résultats depuis response.ads
      let normalized = normalizeMoteurImmoListings(response.ads || []);
      
      // Filtrer par sources si spécifié
      if (filters.sources && filters.sources.length > 0) {
        const normalizedSources = filters.sources.map((s) => s.toLowerCase().trim());
        normalized = normalized.filter((ad) => {
          if (!ad.origin) return false;
          // L'origine est déjà normalisée en minuscules dans normalizeMoteurImmo
          return normalizedSources.some((source) => {
            // Correspondance exacte ou partielle
            return (
              ad.origin === source ||
              ad.origin.includes(source) ||
              source.includes(ad.origin)
            );
          });
        });
        console.log(
          `🔍 [Piges] Filtrage par sources: ${filters.sources.join(", ")} → ${normalized.length} résultats après filtrage`
        );
      }

      // Filtrer par type de vendeur si spécifié
      if (filters.sellerType && filters.sellerType !== "all") {
        const beforeFilter = normalized.length;
        normalized = normalized.filter((ad) => {
          // Si isPro n'est pas défini, on ne peut pas filtrer (on garde l'annonce)
          if (ad.isPro === undefined) return true;
          
          if (filters.sellerType === "pro") {
            return ad.isPro === true;
          } else if (filters.sellerType === "particulier") {
            return ad.isPro === false;
          }
          return true;
        });
        console.log(
          `🔍 [Piges] Filtrage par type de vendeur: ${filters.sellerType} → ${normalized.length} résultats (${beforeFilter} avant filtrage)`
        );
      }
      
      results.push(...normalized);

      console.log(
        `✅ [Piges] Page ${page}: ${normalized.length} résultats (total: ${results.length})`
      );

      // Vérifier s'il y a plus de pages
      // Si on a reçu moins de maxLength résultats, c'est la dernière page
      hasMore = normalized.length === 50 && results.length < MAX_TOTAL_RESULTS;

      // Si pas de résultats, arrêter
      if (normalized.length === 0) {
        hasMore = false;
      }

      page++;
    } catch (error: any) {
      console.error(`❌ [Piges] Erreur page ${page}:`, error);
      // En cas d'erreur, arrêter la pagination
      hasMore = false;
      if (page === 1) {
        // Si c'est la première page qui échoue, propager l'erreur
        throw error;
      }
    }
  }

  // Limiter au maximum autorisé
  const finalResults = results.slice(0, MAX_TOTAL_RESULTS);

  console.log(
    `🎉 [Piges] Recherche terminée: ${finalResults.length} résultats sur ${page - 1} page(s)`
  );

  return {
    listings: finalResults,
    total: finalResults.length,
    pages: page - 1,
    hasMore,
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

