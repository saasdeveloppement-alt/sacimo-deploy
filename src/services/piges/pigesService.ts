/**
 * Service d'orchestration pour les Piges immobilières
 * Utilise MoteurImmo comme unique provider
 */

import { moteurImmoSearch, moteurImmoSearchSimple } from "@/lib/providers/moteurimmoClient";
import { normalizeMoteurImmoListings } from "@/lib/piges/normalize";
import { throttleUser } from "@/lib/piges/throttle";
import type { NormalizedListing } from "@/lib/piges/normalize";
import { harmonizeAdsWithMoteurImmoUI } from "@/lib/piges/harmonize";
import { filterByState } from "@/lib/piges/filterByState";

// Configuration de pagination
const MAX_PAGES = 10; // Maximum 10 pages par code postal (comme demandé)
const PER_PAGE_API = 100; // 100 annonces par page API
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
  // ÉTAPE 1 : RÉCUPÉRER TOUTES LES ANNONCES SANS FILTRES
  // ============================================
  // On récupère TOUTES les annonces disponibles pour chaque code postal
  // SANS AUCUN FILTRE - Seulement page, per_page, postcode
  // GET https://moteurimmo.fr/api/ads?page=X&per_page=100&postcode=XXXX
  
  console.log(`📥 [Piges] Récupération de TOUTES les annonces pour le(s) code(s) postal(aux): ${postalCodesToUse.join(", ")}`);
  console.log(`📥 [Piges] AUCUN FILTRE envoyé à l'API MoteurImmo (récupération brute)`);

  const allRawResults: NormalizedListing[] = []; // Toutes les annonces brutes récupérées
  let totalCountFromAPI: number | undefined = undefined; // Total réel depuis l'API (stats.total)
  let totalPagesLoaded = 0;

  // Boucler sur chaque code postal
  for (const postalCode of postalCodesToUse) {
    console.log(`\n📍 [Piges] Traitement du code postal: ${postalCode}`);
    
    const postalCodeResults: NormalizedListing[] = [];
    let pagesLoadedForCP = 0;

    // Pagination : 1 à 10 pages maximum par code postal
    for (let page = 1; page <= MAX_PAGES; page++) {
      try {
        console.log(`📄 [Piges] Code postal ${postalCode} - Récupération page ${page}...`);

        // REQUÊTE GET SIMPLE - Seulement page, per_page, postcode
        const response = await moteurImmoSearchSimple(
          page,
          PER_PAGE_API, // 100 annonces par page
          postalCode
        );

        // Stocker le total réel depuis l'API (stats.total) sur la première page du premier CP
        if (totalCountFromAPI === undefined && response.stats?.total !== undefined) {
          totalCountFromAPI = response.stats.total;
          console.log(`📊 [Piges] Total disponible sur MoteurImmo: ${totalCountFromAPI} annonces`);
        }

        // Normaliser les résultats depuis response.ads (SANS FILTRAGE)
        const normalized = normalizeMoteurImmoListings(response.ads || []);
        
        console.log(`📄 [Piges] Code postal ${postalCode} - Page ${page}: ${normalized.length} annonces brutes reçues`);

        // FUSIONNER correctement avec push(...) - IMPORTANT: ne pas écraser
        postalCodeResults.push(...normalized);
        pagesLoadedForCP++;

        console.log(`✅ [Piges] Code postal ${postalCode} - Page ${page}: ${normalized.length} annonces ajoutées (total pour ce CP: ${postalCodeResults.length})`);

        // Si la page renvoie moins de PER_PAGE_API résultats, c'est la dernière page
        if (normalized.length < PER_PAGE_API) {
          console.log(`🛑 [Piges] Code postal ${postalCode} - Dernière page atteinte (${normalized.length} < ${PER_PAGE_API})`);
          break;
        }

        // Petite pause pour éviter de surcharger l'API
        if (page < MAX_PAGES) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error: any) {
        console.error(`❌ [Piges] Code postal ${postalCode} - Erreur page ${page}:`, error);
        // En cas d'erreur, arrêter la pagination pour ce CP mais continuer avec les autres
        if (page === 1) {
          // Si c'est la première page qui échoue, propager l'erreur
          throw error;
        }
        break; // Arrêter la pagination pour ce CP
      }
    }

    // Fusionner les résultats de ce code postal avec les résultats globaux
    allRawResults.push(...postalCodeResults);
    totalPagesLoaded += pagesLoadedForCP;

    console.log(`✅ [Piges] Code postal ${postalCode} terminé: ${postalCodeResults.length} annonces récupérées sur ${pagesLoadedForCP} pages`);
  }

  // Logs de debug complets
  const countPublisher = allRawResults.filter(ad => ad.publisher && ad.publisher.trim().length > 0).length;
  const countNoPublisher = allRawResults.length - countPublisher;

  console.info(`\n[SACIMO] ➜ Total annonces récupérées : ${allRawResults.length}`);
  console.info(`[SACIMO] ➜ Pages complètes : ${totalPagesLoaded}`);
  console.info(`[SACIMO] ➜ Exemple titres :`, allRawResults.slice(0, 5).map(a => a.title));
  console.info(`[SACIMO] ➜ Nombre d'annonces avec publisher : ${countPublisher}`);
  console.info(`[SACIMO] ➜ Nombre d'annonces sans publisher : ${countNoPublisher}`);
  console.info(`[SACIMO] ➜ Total disponible sur MoteurImmo : ${totalCountFromAPI ?? "non disponible"}`);

  // ============================================
  // ÉTAPE 2 : APPLIQUER TOUS LES FILTRES EN LOCAL
  // ============================================
  // Maintenant que nous avons TOUTES les annonces brutes, on applique les filtres localement
  
  console.log(`🔍 [Piges] Application des filtres en local sur ${allRawResults.length} annonces brutes...`);
  
  let filteredResults = [...allRawResults]; // Copie pour appliquer les filtres
  
  // Filtrer par type (vente/location)
  if (filters.type && filters.type !== "all") {
    const beforeFilter = filteredResults.length;
    if (filters.type === "vente") {
      filteredResults = filteredResults.filter(ad => ad.type === "sale");
    } else if (filters.type === "location") {
      filteredResults = filteredResults.filter(ad => ad.type === "rental");
    }
    console.log(`🔍 [Piges] Filtrage par type (${filters.type}): ${filteredResults.length} résultats (${beforeFilter} avant filtrage)`);
  }
  
  // Filtrer par sources si spécifié
  if (filters.sources && filters.sources.length > 0) {
    const beforeFilter = filteredResults.length;
    const normalizedSources = filters.sources.map((s) => s.toLowerCase().trim());
    filteredResults = filteredResults.filter((ad) => {
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
      `🔍 [Piges] Filtrage par sources (${filters.sources.join(", ")}): ${filteredResults.length} résultats (${beforeFilter} avant filtrage)`
    );
  }

  // ============================================
  // ÉTAPE 3 : HARMONISATION AVEC MOTEURIMMO UI
  // ============================================
  // Appliquer les règles d'harmonisation MoteurImmo UI pour obtenir des résultats identiques
  console.log(`🔄 [Piges] Application de l'harmonisation MoteurImmo UI...`);
  
  const harmonizationFilters = {
    postalCodes: postalCodesToUse,
    state: undefined, // TODO: Ajouter le filtre state si disponible dans les filtres utilisateur
    vendor: filters.sellerType && filters.sellerType !== "all" ? filters.sellerType : undefined,
  };
  
  const beforeHarmonization = filteredResults.length;
  filteredResults = harmonizeAdsWithMoteurImmoUI(filteredResults, harmonizationFilters);
  console.log(
    `✅ [Piges] Harmonisation terminée: ${filteredResults.length} résultats (${beforeHarmonization} avant harmonisation)`
  );
  
  // Filtrer par prix
  if (filters.minPrice) {
    const beforeFilter = filteredResults.length;
    filteredResults = filteredResults.filter(ad => ad.price !== null && ad.price >= filters.minPrice!);
    console.log(`🔍 [Piges] Filtrage par prix min (${filters.minPrice}€): ${filteredResults.length} résultats (${beforeFilter} avant filtrage)`);
  }
  if (filters.maxPrice) {
    const beforeFilter = filteredResults.length;
    filteredResults = filteredResults.filter(ad => ad.price !== null && ad.price <= filters.maxPrice!);
    console.log(`🔍 [Piges] Filtrage par prix max (${filters.maxPrice}€): ${filteredResults.length} résultats (${beforeFilter} avant filtrage)`);
  }
  
  // Filtrer par surface
  if (filters.minSurface) {
    const beforeFilter = filteredResults.length;
    filteredResults = filteredResults.filter(ad => ad.surface !== null && ad.surface >= filters.minSurface!);
    console.log(`🔍 [Piges] Filtrage par surface min (${filters.minSurface}m²): ${filteredResults.length} résultats (${beforeFilter} avant filtrage)`);
  }
  if (filters.maxSurface) {
    const beforeFilter = filteredResults.length;
    filteredResults = filteredResults.filter(ad => ad.surface !== null && ad.surface <= filters.maxSurface!);
    console.log(`🔍 [Piges] Filtrage par surface max (${filters.maxSurface}m²): ${filteredResults.length} résultats (${beforeFilter} avant filtrage)`);
  }
  
  // Filtrer par nombre de pièces
  if (filters.minRooms) {
    const beforeFilter = filteredResults.length;
    filteredResults = filteredResults.filter(ad => ad.rooms !== null && ad.rooms >= filters.minRooms!);
    console.log(`🔍 [Piges] Filtrage par pièces min (${filters.minRooms}): ${filteredResults.length} résultats (${beforeFilter} avant filtrage)`);
  }
  if (filters.maxRooms) {
    const beforeFilter = filteredResults.length;
    filteredResults = filteredResults.filter(ad => ad.rooms !== null && ad.rooms <= filters.maxRooms!);
    console.log(`🔍 [Piges] Filtrage par pièces max (${filters.maxRooms}): ${filteredResults.length} résultats (${beforeFilter} avant filtrage)`);
  }

  // Filtrer par état du bien (LOCAL uniquement, jamais envoyé à l'API)
  if (filters.state && filters.state.length > 0) {
    const beforeFilter = filteredResults.length;
    filteredResults = filterByState(filteredResults, filters.state);
    console.log(`🔍 [Piges] Filtrage par état (${filters.state.join(", ")}): ${filteredResults.length} résultats (${beforeFilter} avant filtrage)`);
  }

  // Utiliser le total réel de l'API (stats.total) si disponible, sinon le nombre récupéré brut
  const totalToReturn = totalCountFromAPI !== undefined ? totalCountFromAPI : allRawResults.length;
  
  console.log(
    `🎉 [Piges] Récupération terminée: ${allRawResults.length} annonces brutes récupérées sur ${totalPagesLoaded} page(s)`
  );
  console.log(
    `✅ [Piges] Après filtrage local: ${filteredResults.length} annonces correspondant aux critères`
  );
  
  if (totalCountFromAPI !== undefined) {
    console.log(`📊 [Piges] Total disponible sur MoteurImmo: ${totalCountFromAPI} annonces`);
    if (totalCountFromAPI > allRawResults.length) {
      console.warn(
        `⚠️ [Piges] ${allRawResults.length} annonces récupérées sur ${totalCountFromAPI} disponibles. ` +
        `Limite de ${MAX_PAGES} pages par code postal atteinte.`
      );
    }
  } else {
    console.warn(`⚠️ [Piges] Total disponible non disponible (stats.total non retourné par l'API)`);
  }

  return {
    listings: filteredResults, // Résultats APRÈS filtrage local
    total: totalToReturn, // Total disponible sur MoteurImmo (stats.total) si disponible, sinon nombre récupéré
    pages: totalPagesLoaded,
    hasMore: totalCountFromAPI !== undefined && allRawResults.length < totalCountFromAPI,
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

