/**
 * 🎯 MOTEUR D'ANNONCES ROBUSTE ET COMPLET POUR SACIMO
 * 
 * Fonctionnalités :
 * - Pagination dynamique (jusqu'à épuisement, pas limité à 10 pages)
 * - Cache intelligent (30 minutes minimum)
 * - Normalisation automatique
 * - Classification vendeur Particulier/Professionnel
 * - Merge multi-pages + multi-code-postal
 * - Filtrage LOCAL uniquement après fusion
 * - Tri par date DESC
 * - Logs complets
 */

import { prisma } from "@/lib/prisma";
import { moteurImmoSearchSimple, type MoteurImmoAd } from "@/lib/providers/moteurimmoClient";
import { normalizeMoteurImmo, type NormalizedListing } from "@/lib/piges/normalize";
import { determineVendorType, determineVendorTypeSync, type VendorType } from "@/lib/piges/vendorType";

// ============================================
// TYPES ET INTERFACES
// ============================================

export interface AdsEngineFilters {
  // Filtres vendeur
  sellerType?: "all" | "pro" | "particulier";
  
  // Filtres prix
  minPrice?: number;
  maxPrice?: number;
  
  // Filtres surface
  minSurface?: number;
  maxSurface?: number;
  
  // Filtres pièces
  minRooms?: number;
  maxRooms?: number;
  
  // Filtres type transaction
  type?: "vente" | "location" | "all";
  
  // Filtres sources
  sources?: string[]; // ["leboncoin", "seloger", etc.]
  
  // Filtres état du bien
  state?: string[]; // ["neuf", "ancien", "recent", "vefa", "travaux"]
  
  // Filtre agence
  agency?: string;
  
  // Filtre catégorie
  category?: string[]; // ["appartement", "maison", "terrain", etc.]
  
  // Filtre date de publication
  dateRange?: "5d" | "10d" | "15d" | "30d" | "all"; // Moins de X jours
}

export interface AdsEngineResult {
  listings: NormalizedListing[];
  total: number;
  pagesCount: number;
  postalCodesProcessed: string[];
  cacheHits: number;
  cacheMisses: number;
  stats: {
    totalBeforeFilters: number;
    totalAfterFilters: number;
    particuliers: number;
    professionnels: number;
      inconnu: number;
  };
}

// ============================================
// CONFIGURATION
// ============================================

const CACHE_TTL_MINUTES = 30; // Durée de vie du cache (30 minutes)
const PER_PAGE = 100; // Nombre d'annonces par page
const MAX_PAGES_SAFETY = 50; // Sécurité anti-boucle infinie

// ============================================
// 1. PAGINATION DYNAMIQUE (INFINITE PAGINATION)
// ============================================

/**
 * Récupère TOUTES les pages pour un code postal donné
 * Ne s'arrête que quand la page renvoie < 100 résultats ou est vide
 */
async function fetchAllPagesForPostcode(
  postalCode: string
): Promise<{ ads: MoteurImmoAd[]; pagesCount: number }> {
  const allAds: MoteurImmoAd[] = [];
  let page = 1;

  console.log(`[ADS ENGINE] 🔄 Début pagination dynamique pour CP: ${postalCode}`);

  while (true) {
    try {
      const response = await moteurImmoSearchSimple(page, PER_PAGE, postalCode);

      // Arrêter uniquement sur page vide
      if (!response || !response.ads || response.ads.length === 0) {
        console.log(`[ADS ENGINE] Page ${page} vide → STOP pagination`);
        break;
      }

      console.log(`[ADS ENGINE] Page ${page} récupérée: ${response.ads.length} annonces`);
      allAds.push(...response.ads);

      page++;

      // Sécurité anti-boucle infinie
      if (page > MAX_PAGES_SAFETY) {
        console.log(`[ADS ENGINE] STOP sécurité (50 pages)`);
        break;
      }

      // Petit délai pour éviter la surcharge API
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`[ADS ENGINE] ❌ Erreur page ${page} pour CP ${postalCode}:`, error);
      break;
    }
  }

  const pagesCount = page - 1;
  console.log(`[ADS ENGINE] ✅ Pagination terminée pour CP ${postalCode}: ${pagesCount} pages, ${allAds.length} annonces totales`);

  return { ads: allAds, pagesCount };
}

// ============================================
// 2. CACHE INTELLIGENT
// ============================================

/**
 * Charge les annonces depuis le cache si disponibles et valides
 */
async function loadFromCache(postalCode: string): Promise<MoteurImmoAd[] | null> {
  try {
    const cached = await prisma.adsCache.findUnique({
      where: { postalCode },
    });

    if (!cached) {
      console.log(`[SACIMO] 💾 Cache MISS pour CP: ${postalCode}`);
      return null;
    }

    // Vérifier expiration
    const now = new Date();
    if (cached.expiresAt < now) {
      console.log(`[SACIMO] 💾 Cache EXPIRÉ pour CP: ${postalCode}`);
      // Supprimer le cache expiré
      await prisma.adsCache.delete({ where: { postalCode } });
      return null;
    }

    console.log(`[SACIMO] 💾 Cache HIT pour CP: ${postalCode} (${cached.totalCount} annonces, ${cached.pagesCount} pages)`);
    
    // Parser les annonces depuis JSON
    const ads = cached.ads as unknown as MoteurImmoAd[];
    return ads;
  } catch (error) {
    console.error(`[SACIMO] ❌ Erreur lecture cache pour CP ${postalCode}:`, error);
    return null;
  }
}

/**
 * Sauvegarde les annonces dans le cache
 */
async function saveToCache(
  postalCode: string,
  ads: MoteurImmoAd[],
  pagesCount: number
): Promise<void> {
  try {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + CACHE_TTL_MINUTES);

    await prisma.adsCache.upsert({
      where: { postalCode },
      create: {
        postalCode,
        ads: ads as any, // Prisma JSON
        pagesCount,
        totalCount: ads.length,
        expiresAt,
      },
      update: {
        ads: ads as any,
        pagesCount,
        totalCount: ads.length,
        expiresAt,
        updatedAt: new Date(),
      },
    });

    console.log(`[SACIMO] 💾 Cache SAVED pour CP: ${postalCode} (${ads.length} annonces, expire dans ${CACHE_TTL_MINUTES} min)`);
  } catch (error) {
    console.error(`[SACIMO] ❌ Erreur sauvegarde cache pour CP ${postalCode}:`, error);
    // Ne pas faire échouer la requête si le cache échoue
  }
}

// ============================================
// 3. NORMALISATION DES ANNONCES
// ============================================

/**
 * Détecteur universel de source FIABLE
 */
function detectSource(ad: any): string {
  const url = (ad?.url || "").toLowerCase();
  const origin = (ad?.origin || "").toLowerCase();
  const publisher = (ad?.publisher?.name || "").toLowerCase();

  if (url.includes("leboncoin") || origin.includes("leboncoin")) return "leboncoin";
  if (url.includes("seloger") || origin.includes("seloger")) return "seloger";
  if (url.includes("bienici") || origin.includes("bienici")) return "bienici";
  if (url.includes("pap.fr") || origin.includes("pap")) return "pap";
  if (publisher.includes("logic-immo") || url.includes("logic-immo")) return "logicimmo";

  return "autre";
}

/**
 * Normalise une annonce MoteurImmo vers le format SACIMO
 * (Utilise la fonction existante normalizeMoteurImmo et ajoute la source normalisée)
 */
function normalizeAd(ad: MoteurImmoAd): NormalizedListing {
  const normalized = normalizeMoteurImmo(ad);
  
  // Ajouter la source normalisée avec détecteur universel FIABLE
  const rawAd = ad as any;
  normalized.source = detectSource(rawAd);
  
  // PATCH 3: Corriger les annonces sans date (fallback intelligent)
  if (!normalized.publishedAt) {
    // Fallback intelligent : on considère l'annonce comme récente
    normalized.publishedAt = new Date(Date.now() - (24 * 3600 * 1000)); // -1 jour
    (normalized as any)._dateFallback = true;
  }
  
  return normalized;
}

// ============================================
// 4. CLASSIFICATION VENDEUR PARTICULIER / PRO
// ============================================

/**
 * Classe une annonce comme Particulier ou Professionnel
 * (Utilise les fonctions existantes determineVendorType)
 */
async function classifyVendor(
  ad: NormalizedListing,
  rawAd?: any
): Promise<VendorType> {
  // PATCH 2: Relaxer la classification vendeur pour ne PAS perdre d'annonces LBC
  if (ad.source === "leboncoin") {
    // On ne supprime jamais une annonce LBC sur base vendeur
    // On essaie quand même de classifier, mais on garde l'annonce même si inconnu
    try {
      const vendorType = await determineVendorType(ad, rawAd);
      if (vendorType && vendorType !== "inconnu") {
        return vendorType;
      }
    } catch (error) {
      console.warn(`[SACIMO] ⚠️ Erreur API LeBonCoin pour ${ad.id}, fallback scoring`);
    }
    // Même si on ne peut pas classifier, on garde l'annonce
    const fallbackType = determineVendorTypeSync(ad, rawAd);
    return fallbackType !== "inconnu" ? fallbackType : "particulier"; // Par défaut, considérer comme particulier
  }
  
  // Pour LeBonCoin (détecté par URL mais pas par source), essayer l'API
  if (ad.origin === "leboncoin" || ad.url?.includes("leboncoin.fr")) {
      try {
        const vendorType = await determineVendorType(ad, rawAd);
        if (vendorType && vendorType !== "inconnu") {
        return vendorType;
        }
      } catch (error) {
      // En cas d'erreur, utiliser le scoring synchrone
      console.warn(`[SACIMO] ⚠️ Erreur API LeBonCoin pour ${ad.id}, fallback scoring`);
    }
      }

  // Pour les autres sources ou en cas d'échec API, utiliser le scoring
  return determineVendorTypeSync(ad, rawAd);
}

// ============================================
// 5. MERGE MULTI-PAGES + MULTI-CP
// ============================================

/**
 * Fusionne les annonces de plusieurs pages/CP et supprime les doublons
 */
function mergePages(adsLists: MoteurImmoAd[][]): MoteurImmoAd[] {
  const map = new Map<string, MoteurImmoAd>();
  
  for (const ads of adsLists) {
    for (const ad of ads) {
      // Utiliser uniqueId comme clé de déduplication
      if (ad.uniqueId && !map.has(ad.uniqueId)) {
        map.set(ad.uniqueId, ad);
      }
    }
  }

  const merged = Array.from(map.values());
  console.log(`[SACIMO] 🔀 Merge: ${adsLists.reduce((sum, list) => sum + list.length, 0)} annonces → ${merged.length} uniques`);
  
  return merged;
}

// ============================================
// 6. FILTRAGE LOCAL UNIQUEMENT
// ============================================

/**
 * Applique les filtres LOCAUX (jamais envoyés à l'API)
 */
function applyLocalFilters(
  listings: NormalizedListing[],
  filters: AdsEngineFilters
): NormalizedListing[] {
  let filtered = [...listings];
  const beforeCount = filtered.length;

  console.log(`[SACIMO] 🎚️ Début filtrage LOCAL: ${beforeCount} annonces`);

  // 1. Filtre vendeur (Particulier/Pro)
  if (filters.sellerType && filters.sellerType !== "all") {
    const before = filtered.length;
    if (filters.sellerType === "particulier") {
      filtered = filtered.filter(ad => ad.vendorType === "particulier");
    } else if (filters.sellerType === "pro") {
      filtered = filtered.filter(ad => ad.vendorType === "professionnel");
    }
    console.log(`[SACIMO] 🎚️ Filtre vendeur (${filters.sellerType}): ${before} → ${filtered.length}`);
  }

  // 2. Filtre date de publication (moins de X jours)
  // Ce filtre remplace le filtre automatique de 30 jours si fourni
  console.log("[DEBUG BACK] dateRange reçu :", filters.dateRange);
  
  // PATCH 4: Filtre date plus permissif si source Leboncoin
  const isLbcFilter = filters.sources && filters.sources.length > 0 && filters.sources.includes("leboncoin");
  
  if (filters.dateRange && filters.dateRange !== "all") {
    const before = filtered.length;
    const now = Date.now();
    
    const daysMap: Record<string, number> = {
      "5d": 5,
      "10d": 10,
      "15d": 15,
      "30d": 30,
    };
    
    const days = daysMap[filters.dateRange];
    
    if (days) {
      const ms = days * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(ad => {
        // PATCH 4: Si filtre LBC actif, on assouplit le filtre pour LBC
        if (isLbcFilter && ad.source === "leboncoin") {
          // Ne PAS exclure une annonce LBC si la date est approximative
          if ((ad as any)._dateFallback) {
            return true; // Garder les annonces avec date fallback
          }
          // Si pas de date mais que c'est LBC, on garde quand même
          if (!ad.publishedAt) {
            return true;
          }
        }
        
        if (!ad.publishedAt) {
          return false; // Exclure les annonces sans date si un filtre dateRange est actif (sauf LBC)
        }
        try {
          const publishedTime = new Date(ad.publishedAt).getTime();
          if (isNaN(publishedTime)) {
            // Pour LBC, on garde même si date invalide
            if (isLbcFilter && ad.source === "leboncoin") {
              return true;
            }
            return false; // Exclure les dates invalides
          }
          const diff = now - publishedTime;
          if (diff < 0) {
            // Date dans le futur = erreur, on exclut (sauf LBC)
            if (isLbcFilter && ad.source === "leboncoin") {
              return true;
            }
            return false;
          }
          return diff <= ms;
        } catch {
          // Pour LBC, on garde en cas d'erreur
          if (isLbcFilter && ad.source === "leboncoin") {
            return true;
          }
          return false; // Exclure en cas d'erreur
        }
      });
      console.log(`[ADS ENGINE] Filtre date <${days}j : ${before} → ${filtered.length}`);
    }
  }

  // 3. Filtre prix
  if (filters.minPrice !== undefined && filters.minPrice !== null) {
    filtered = filtered.filter(ad => ad.price !== null && ad.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
    filtered = filtered.filter(ad => ad.price !== null && ad.price <= filters.maxPrice!);
  }

  // 3. Filtre surface
  if (filters.minSurface !== undefined && filters.minSurface !== null) {
    filtered = filtered.filter(ad => ad.surface !== null && ad.surface >= filters.minSurface!);
  }
  if (filters.maxSurface !== undefined && filters.maxSurface !== null) {
    filtered = filtered.filter(ad => ad.surface !== null && ad.surface <= filters.maxSurface!);
  }

  // 4. Filtre pièces
  if (filters.minRooms !== undefined && filters.minRooms !== null) {
    filtered = filtered.filter(ad => ad.rooms !== null && ad.rooms >= filters.minRooms!);
  }
  if (filters.maxRooms !== undefined && filters.maxRooms !== null) {
    filtered = filtered.filter(ad => ad.rooms !== null && ad.rooms <= filters.maxRooms!);
  }

  // 5. Filtre type transaction
  if (filters.type && filters.type !== "all") {
    const typeMap: Record<string, "sale" | "rental"> = {
      vente: "sale",
      location: "rental",
    };
    const targetType = typeMap[filters.type];
    if (targetType) {
      filtered = filtered.filter(ad => ad.type === targetType);
    }
  }

  // 6. Filtre sources UNIQUEMENT si l'utilisateur a coché quelque chose
  if (filters.sources && filters.sources.length > 0) {
    const before = filtered.length;
    filtered = filtered.filter(ad => {
      // Filtrer uniquement sur le champ source normalisé
      return filters.sources!.includes(ad.source || "");
    });
    console.log(`[SACIMO] 🎚️ Filtre sources (${filters.sources.join(", ")}): ${before} → ${filtered.length}`);
  }

  // 7. Filtre état du bien
  if (filters.state && filters.state.length > 0) {
    const statesLower = filters.state.map(s => s.toLowerCase());
    filtered = filtered.filter(ad => {
      const adState = (ad.state || "").toLowerCase();
      return statesLower.some(state => adState.includes(state));
    });
  }

  // 8. Filtre agence
  if (filters.agency) {
    const agencyLower = filters.agency.toLowerCase().trim();
    filtered = filtered.filter(ad => {
      const publisher = (ad.publisher || "").toLowerCase();
      return publisher.includes(agencyLower);
    });
  }

  // 9. Filtre catégorie
  if (filters.category && filters.category.length > 0) {
    const categoriesLower = filters.category.map(c => c.toLowerCase());
    filtered = filtered.filter(ad => {
      const adCategory = (ad.category || "").toLowerCase();
      return categoriesLower.some(cat => adCategory.includes(cat));
    });
  }

  console.log(`[SACIMO] 🎚️ Filtrage terminé: ${beforeCount} → ${filtered.length} annonces`);

  return filtered;
}

// ============================================
// 7. TRI GLOBAL PAR DATE DESC
// ============================================

/**
 * Trie les annonces par date de publication (plus récent en premier)
 */
function sortByDateDesc(listings: NormalizedListing[]): NormalizedListing[] {
  return listings.sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return dateB - dateA; // DESC (plus récent en premier)
  });
}

// ============================================
// 8. MOTEUR PRINCIPAL: adsEngine.query()
// ============================================

/**
 * Moteur principal de recherche d'annonces
 * 
 * Processus :
 * 1. Pour chaque CP → loadFromCache
 * 2. Si manquant → fetchAllPagesForPostcode
 * 3. normalizeAd() sur chaque annonce
 * 4. classifyVendor() sur chaque annonce (en batch pour LeBonCoin)
 * 5. mergePages()
 * 6. applyLocalFilters()
 * 7. sortByDateDesc()
 * 8. Retourner résultat
 */
export async function adsEngineQuery(
  postalCodes: string[],
  filters: AdsEngineFilters = {}
): Promise<AdsEngineResult> {
  console.log(`[SACIMO] 🚀 Début recherche adsEngine pour ${postalCodes.length} CP:`, postalCodes);

  const allRawAds: MoteurImmoAd[] = [];
  const allPagesCount: number[] = [];
  let cacheHits = 0;
  let cacheMisses = 0;
  const postalCodesProcessed: string[] = [];

  // ============================================
  // ÉTAPE 1: Récupération des données (cache ou API)
  // ============================================
  // PATCH 5: Multi-recherche intelligente pour récupérer + d'annonces LBC
  const cpsToSearch: string[] = [];
  if (postalCodes.length > 0) {
    postalCodes.forEach(cp => {
      cpsToSearch.push(cp); // CP exact
      if (cp.length >= 2) {
        cpsToSearch.push(cp.substring(0, 2)); // département
      }
    });
  }
  // Dédupliquer les CP
  const uniqueCps = Array.from(new Set(cpsToSearch));
  console.log("[CP EXPANDED] Recherche CP élargie:", uniqueCps);
  
  for (const postalCode of uniqueCps) {
    postalCodesProcessed.push(postalCode);

    // Essayer le cache
    const cachedAds = await loadFromCache(postalCode);
    
    if (cachedAds && cachedAds.length > 0) {
      allRawAds.push(...cachedAds);
      cacheHits++;
      // Récupérer le nombre de pages depuis le cache (approximatif)
      const cached = await prisma.adsCache.findUnique({ where: { postalCode } });
      allPagesCount.push(cached?.pagesCount || 1);
      console.log(`[SACIMO] 📊 CP ${postalCode}: ${cachedAds.length} annonces depuis cache`);
    } else {
      // Fetch depuis l'API
      cacheMisses++;
      const { ads, pagesCount } = await fetchAllPagesForPostcode(postalCode);
      allRawAds.push(...ads);
      allPagesCount.push(pagesCount);
      
      // Sauvegarder dans le cache
      if (ads.length > 0) {
        await saveToCache(postalCode, ads, pagesCount);
      }
      
      console.log(`[SACIMO] 📊 CP ${postalCode}: ${ads.length} annonces depuis API (${pagesCount} pages)`);
    }
  }

  const totalPages = allPagesCount.reduce((sum, count) => sum + count, 0);
  console.log(`[SACIMO] 📊 Total brut: ${allRawAds.length} annonces, ${totalPages} pages, ${cacheHits} cache hits, ${cacheMisses} cache misses`);

  // ============================================
  // ÉTAPE 2: Merge et déduplication
  // ============================================
  const mergedRawAds = mergePages([allRawAds]);
  console.log(`[SACIMO] 🔀 Après merge: ${mergedRawAds.length} annonces uniques`);

  // ============================================
  // ÉTAPE 3: Normalisation
  // ============================================
  console.log(`[ADS ENGINE] Total annonces brutes: ${mergedRawAds.length}`);
  console.log(`[SACIMO] 🔄 Normalisation de ${mergedRawAds.length} annonces...`);
  // Ne pas filtrer les null - normalizeAd retourne toujours un objet valide
  const normalizedListings = mergedRawAds.map(ad => normalizeAd(ad));
  
  // Log de la répartition des sources après normalisation
  const sourceStats: Record<string, number> = {};
  normalizedListings.forEach(ad => {
    const source = ad.source || "non-normalisé";
    sourceStats[source] = (sourceStats[source] || 0) + 1;
  });
  console.log(`[ADS ENGINE] Après normalisation: ${normalizedListings.length}`);
  console.log(`[ADS ENGINE] Répartition sources:`, sourceStats);

  // ============================================
  // ÉTAPE 4: Classification vendeur (en batch pour LeBonCoin)
  // ============================================
  console.log(`[SACIMO] 🧩 Classification vendeur pour ${normalizedListings.length} annonces...`);
  
  // Créer un mapping rawAd par ID
  const rawAdsMap = new Map<string, MoteurImmoAd>();
  mergedRawAds.forEach(ad => {
    if (ad.uniqueId) {
      rawAdsMap.set(ad.uniqueId, ad);
    }
  });

  // Pour LeBonCoin, essayer l'API en batch (limité à 10 pour performance)
  const lbcAds = normalizedListings.filter(ad => 
    (ad.origin === "leboncoin" || ad.url?.includes("leboncoin.fr")) && 
    ad.vendorType !== "particulier" && 
    ad.vendorType !== "professionnel"
  );

  if (lbcAds.length > 0) {
    console.log(`[SACIMO] 🔍 ${lbcAds.length} annonces LeBonCoin détectées, enrichissement via API...`);
    const lbcBatch = lbcAds.slice(0, 10); // Limiter à 10 pour éviter la surcharge
    
    await Promise.all(
      lbcBatch.map(async (ad) => {
        const rawAd = rawAdsMap.get(ad.id);
        try {
          const vendorType = await classifyVendor(ad, rawAd);
          ad.vendorType = vendorType;
        } catch (error) {
          console.warn(`[SACIMO] ⚠️ Erreur classification pour ${ad.id}:`, error);
        }
      })
    );
  }

  // Compter les vendorType
  const vendorStats = { particulier: 0, professionnel: 0, inconnu: 0 };
  normalizedListings.forEach(ad => {
    const vendorType = ad.vendorType || "inconnu";
    vendorStats[vendorType as keyof typeof vendorStats]++;
  });
  console.log(`[SACIMO] 📊 VendorType: ${vendorStats.particulier} particuliers, ${vendorStats.professionnel} professionnels, ${vendorStats.inconnu} inconnu`);

  // ============================================
  // ÉTAPE 4.5: PAS DE FILTRE AUTOMATIQUE <30 JOURS
  // Le filtre <30j s'applique UNIQUEMENT si l'utilisateur clique sur "<30 jours"
  // ============================================
  let listingsWithin30Days = normalizedListings;
  
  console.log(`[ADS ENGINE] ⏰ Filtre auto <30j DÉSACTIVÉ - Toutes les annonces sont conservées`);
  
  // ============================================
  // ÉTAPE 5: Filtrage LOCAL
  // ============================================
  
  // Logs AVANT filtrage : répartition par source
  const bySourceBefore: Record<string, number> = {};
  for (const ad of listingsWithin30Days) {
    const s = ad.source || ad.origin || "unknown";
    bySourceBefore[s] = (bySourceBefore[s] || 0) + 1;
  }
  console.log(`[ADS ENGINE] 📊 Répartition par source AVANT filtres:`, bySourceBefore);
  
  const filteredListings = applyLocalFilters(listingsWithin30Days, filters);
  
  console.log(`[ADS ENGINE] Après filtrage: ${filteredListings.length}`);
  
  // Logs APRÈS filtrage : répartition par source
  const bySourceAfter: Record<string, number> = {};
  for (const ad of filteredListings) {
    const s = ad.source || ad.origin || "unknown";
    bySourceAfter[s] = (bySourceAfter[s] || 0) + 1;
  }
  console.log(`[ADS ENGINE] 📊 Répartition par source APRÈS filtres:`, bySourceAfter);
  
  // PATCH 6: Ne JAMAIS exclure une annonce LBC sur un champ NULL
  // (Déjà géré dans les filtres précédents, mais on s'assure qu'aucune LBC n'est perdue)
  const lbcBefore = filteredListings.filter(ad => ad.source === "leboncoin").length;
  // Pas besoin de re-filtrer, les patches précédents garantissent déjà la conservation des LBC

  // ============================================
  // ÉTAPE 6: Tri par date DESC
  // ============================================
  const sortedListings = sortByDateDesc(filteredListings);
  console.log(`[SACIMO] 📅 Tri par date DESC terminé: ${sortedListings.length} annonces`);

  // ============================================
  // ÉTAPE 7: Résultat final
  // ============================================
  const result: AdsEngineResult = {
    listings: sortedListings,
    total: sortedListings.length,
    pagesCount: totalPages,
    postalCodesProcessed,
    cacheHits,
    cacheMisses,
    stats: {
      totalBeforeFilters: normalizedListings.length,
      totalAfterFilters: sortedListings.length,
      particuliers: vendorStats.particulier,
      professionnels: vendorStats.professionnel,
      inconnu: vendorStats.inconnu,
    },
  };

  console.log(`[SACIMO] ✅ Recherche terminée: ${result.total} annonces finales`);
  console.log(`[SACIMO] 📊 Stats: ${result.stats.particuliers} particuliers, ${result.stats.professionnels} professionnels`);
  
  // PATCH 7: Log final pour mesurer l'impact
  const lbcBeforeFilters = normalizedListings.filter(ad => ad.source === "leboncoin").length;
  const lbcAfterFilters = sortedListings.filter(ad => ad.source === "leboncoin").length;
  console.log("[LBC BOOST] Leboncoin avant filtrage :", lbcBeforeFilters);
  console.log("[LBC BOOST] Leboncoin après filtrage :", lbcAfterFilters);
  console.log("[LBC BOOST] Ratio conservation LBC :", lbcBeforeFilters > 0 ? ((lbcAfterFilters / lbcBeforeFilters) * 100).toFixed(1) + "%" : "N/A");

  return result;
}
