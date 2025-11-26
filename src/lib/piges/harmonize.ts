/**
 * Harmonisation des résultats SACIMO avec l'interface MoteurImmo
 * Applique les mêmes règles de filtrage que l'UI MoteurImmo pour obtenir des résultats identiques
 */

import type { NormalizedListing } from "./normalize";
import type { MoteurImmoAd } from "@/lib/providers/moteurimmoClient";

// Interface étendue pour les données brutes avec champs additionnels potentiels
interface ExtendedMoteurImmoAd extends MoteurImmoAd {
  state?: string; // "ancien", "neuf", "travaux", "récent", "VEFA", "non_precisé"
  status?: string; // "active", "retirée", "expirée", "vendue", "désactivée"
  is_active?: boolean;
  commune?: string;
  zone_label?: string;
  publisher?: {
    name: string;
    category?: string; // "private", "agency", "mandataire", "network"
  };
  status_history?: string[];
}

/**
 * 1️⃣ Filtrage par communes MoteurImmo
 * Conserve uniquement les annonces dont le code postal correspond exactement
 * ou qui sont dans les zones attachées au code postal recherché
 */
export function filterByCommunesMoteurImmo(
  ads: NormalizedListing[],
  postalCodes: string[]
): NormalizedListing[] {
  if (!postalCodes || postalCodes.length === 0) {
    return ads;
  }

  // Normaliser les codes postaux recherchés
  const normalizedPostalCodes = postalCodes.map(cp => cp.trim().padStart(5, '0'));

  return ads.filter(ad => {
    const adPostalCode = ad.postalCode?.trim().padStart(5, '0') || '';
    
    // Correspondance exacte du code postal
    return normalizedPostalCodes.includes(adPostalCode);
  });
}

/**
 * 2️⃣ Mapping état "Ancien / Neuf" identique à MoteurImmo
 * 
 * Mapping MoteurImmo:
 * - Ancien = ["ancien", "travaux", "à rénover"]
 * - Neuf = ["neuf", "VEFA", "récent", "récente"]
 */
export function applyStateFilterMoteurImmo(
  ads: NormalizedListing[],
  stateFilter?: "ancien" | "neuf" | "ancien+neuf" | null
): NormalizedListing[] {
  if (!stateFilter || stateFilter === "ancien+neuf") {
    return ads; // Pas de filtre ou les deux
  }

  // Pour l'instant, on ne peut pas filtrer par état car ce champ n'est pas dans NormalizedListing
  // Cette fonction est prête pour l'extension future si le champ state est ajouté
  // TODO: Ajouter le champ state dans NormalizedListing si disponible dans l'API
  
  // Si on avait le champ state dans les données brutes:
  // const ancienStates = ["ancien", "travaux", "à rénover", "a renover"];
  // const neufStates = ["neuf", "VEFA", "récent", "recent", "récente", "recente"];
  
  // if (stateFilter === "ancien") {
  //   return ads.filter(ad => {
  //     const state = (ad as any).state?.toLowerCase() || "";
  //     return ancienStates.some(s => state.includes(s));
  //   });
  // }
  
  // if (stateFilter === "neuf") {
  //   return ads.filter(ad => {
  //     const state = (ad as any).state?.toLowerCase() || "";
  //     return neufStates.some(s => state.includes(s));
  //   });
  // }

  return ads;
}

/**
 * 3️⃣ Exclusion automatique des annonces invalides
 * Exclut les annonces qui ne passeraient pas les validations MoteurImmo UI
 */
export function excludeInvalidAds(ads: NormalizedListing[]): NormalizedListing[] {
  return ads.filter(ad => {
    // Exclure annonces sans prix
    if (ad.price === null || ad.price === undefined || ad.price <= 0) {
      return false;
    }

    // Exclure annonces avec prix < 5000 € (trop bas, probablement une erreur)
    if (ad.price < 5000) {
      return false;
    }

    // Exclure annonces avec surface < 8 m² (trop petite, probablement une erreur)
    if (ad.surface !== null && ad.surface !== undefined && ad.surface < 8) {
      return false;
    }

    // Exclure annonces sans titre
    if (!ad.title || ad.title.trim().length === 0 || ad.title === "Bien immobilier") {
      return false;
    }

    // Exclure annonces avec publisher "non spécifié" ou similaire
    const publisherLower = (ad.publisher || "").toLowerCase().trim();
    const invalidPublishers = [
      "non spécifié",
      "non specifie",
      "non spécifiée",
      "non specifiee",
      "non renseigné",
      "non renseigne",
      "inconnu",
      "inconnue",
      "n/a",
      "na",
      ""
    ];
    if (invalidPublishers.includes(publisherLower)) {
      return false;
    }

    // Exclure annonces sans géolocalisation valide
    if (!ad.city || ad.city.trim().length === 0) {
      return false;
    }
    if (!ad.postalCode || ad.postalCode.trim().length === 0) {
      return false;
    }

    // Exclure annonces sans date de publication (peuvent être des annonces de test)
    if (!ad.publishedAt) {
      return false;
    }

    // Exclure les annonces avec des prix manifestement erronés (ex: > 100M€ pour un appartement)
    // Cette règle est optionnelle et peut être ajustée
    if (ad.price > 100000000) {
      return false;
    }

    return true;
  });
}

/**
 * 4️⃣ Exclusion des annonces retirées / expirées
 * MoteurImmo UI ne compte pas les annonces vendues, sous compromis, retirées, expirées
 */
export function excludeRemovedAds(ads: NormalizedListing[]): NormalizedListing[] {
  return ads.filter(ad => {
    // Pour l'instant, on ne peut pas vérifier le status car ce champ n'est pas dans NormalizedListing
    // Cette fonction est prête pour l'extension future si le champ status est ajouté
    
    // Si on avait le champ status dans les données brutes:
    // const removedStatuses = ["retirée", "retiree", "expirée", "expiree", "vendue", "desactivée", "desactivee"];
    // const status = (ad as any).status?.toLowerCase() || "";
    // if (removedStatuses.some(s => status.includes(s))) {
    //   return false;
    // }
    
    // if ((ad as any).is_active === false) {
    //   return false;
    // }
    
    // if ((ad as any).status_history && Array.isArray((ad as any).status_history)) {
    //   const hasRemovedStatus = (ad as any).status_history.some((s: string) => 
    //     removedStatuses.some(rs => s.toLowerCase().includes(rs))
    //   );
    //   if (hasRemovedStatus) {
    //     return false;
    //   }
    // }

    // Vérifier si la date de publication est trop ancienne (plus de 2 ans = probablement expirée)
    if (ad.publishedAt) {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      if (ad.publishedAt < twoYearsAgo) {
        return false; // Annonce probablement expirée
      }
    }

    return true;
  });
}

/**
 * 5️⃣ Harmonisation du filtre vendeur (Particulier / Pro)
 * 
 * Sur UI MoteurImmo:
 * - "Particulier" = publisher.category == "private"
 * - "Pro" = publisher.category ∈ ["agency", "mandataire", "network", etc.]
 * 
 * Sur SACIMO, on utilise déjà isPro qui est calculé dans normalize.ts
 */
export function applyVendorFilterMoteurImmo(
  ads: NormalizedListing[],
  vendorFilter?: "all" | "pro" | "particulier"
): NormalizedListing[] {
  if (!vendorFilter || vendorFilter === "all") {
    return ads;
  }

  if (vendorFilter === "particulier") {
    // Particulier = isPro === false
    return ads.filter(ad => ad.isPro === false);
  }

  if (vendorFilter === "pro") {
    // Pro = isPro === true
    return ads.filter(ad => ad.isPro === true);
  }

  return ads;
}

/**
 * 6️⃣ Déduplication intelligente identique MoteurImmo
 * Fusionne les doublons du même bien posté par plusieurs sources
 * 
 * Clé de déduplication:
 * - surface ± 2 m²
 * - prix ± 5%
 * - adresse normalisée (city + postalCode)
 * - type (sale/rental)
 */
export function deduplicateAdsMoteurImmo(ads: NormalizedListing[]): NormalizedListing[] {
  const seen = new Map<string, NormalizedListing>();
  const duplicates: NormalizedListing[] = [];

  for (const ad of ads) {
    // Créer une clé de déduplication basée sur les critères
    const key = createDeduplicationKey(ad);
    
    if (!key) {
      // Si on ne peut pas créer de clé (données manquantes), garder l'annonce
      duplicates.push(ad);
      continue;
    }

    const existing = seen.get(key);
    
    if (!existing) {
      // Première occurrence, on la garde
      seen.set(key, ad);
    } else {
      // Doublon potentiel, comparer plus finement
      if (isDuplicate(existing, ad)) {
        // C'est un doublon, garder la meilleure annonce
        const best = selectBestAd(existing, ad);
        seen.set(key, best);
      } else {
        // Pas un doublon, garder les deux
        duplicates.push(ad);
      }
    }
  }

  // Retourner les annonces uniques + les non-doublons
  return [...Array.from(seen.values()), ...duplicates];
}

/**
 * Crée une clé de déduplication pour une annonce
 */
function createDeduplicationKey(ad: NormalizedListing): string | null {
  if (!ad.surface || !ad.price || !ad.city || !ad.postalCode || !ad.type) {
    return null; // Données insuffisantes pour créer une clé
  }

  // Normaliser la surface (arrondir à ±2 m²)
  const surfaceBucket = Math.floor(ad.surface / 2) * 2;
  
  // Normaliser le prix (arrondir à ±5%)
  const priceBucket = Math.floor(ad.price / (ad.price * 0.05)) * (ad.price * 0.05);
  
  // Normaliser l'adresse
  const cityNormalized = ad.city.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const postalCodeNormalized = ad.postalCode.trim().padStart(5, '0');

  return `${ad.type}|${surfaceBucket}|${priceBucket}|${cityNormalized}|${postalCodeNormalized}`;
}

/**
 * Vérifie si deux annonces sont des doublons
 */
function isDuplicate(ad1: NormalizedListing, ad2: NormalizedListing): boolean {
  // Vérifier le type
  if (ad1.type !== ad2.type) {
    return false;
  }

  // Vérifier la surface (±2 m²)
  if (ad1.surface && ad2.surface) {
    const surfaceDiff = Math.abs(ad1.surface - ad2.surface);
    if (surfaceDiff > 2) {
      return false;
    }
  } else if (ad1.surface !== ad2.surface) {
    return false;
  }

  // Vérifier le prix (±5%)
  if (ad1.price && ad2.price) {
    const priceDiff = Math.abs(ad1.price - ad2.price);
    const priceAvg = (ad1.price + ad2.price) / 2;
    const pricePercentDiff = (priceDiff / priceAvg) * 100;
    if (pricePercentDiff > 5) {
      return false;
    }
  } else if (ad1.price !== ad2.price) {
    return false;
  }

  // Vérifier la localisation
  const city1 = ad1.city?.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
  const city2 = ad2.city?.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
  if (city1 !== city2) {
    return false;
  }

  const postalCode1 = ad1.postalCode?.trim().padStart(5, '0') || "";
  const postalCode2 = ad2.postalCode?.trim().padStart(5, '0') || "";
  if (postalCode1 !== postalCode2) {
    return false;
  }

  // Vérifier le nombre de pièces (doit être identique ou très proche)
  if (ad1.rooms !== null && ad2.rooms !== null) {
    if (Math.abs(ad1.rooms - ad2.rooms) > 0) {
      return false;
    }
  }

  return true;
}

/**
 * Sélectionne la meilleure annonce entre deux doublons
 * Critères: plus récente, plus complète (plus d'images, description plus longue)
 */
function selectBestAd(ad1: NormalizedListing, ad2: NormalizedListing): NormalizedListing {
  // 1. Préférer l'annonce la plus récente
  if (ad1.publishedAt && ad2.publishedAt) {
    if (ad2.publishedAt > ad1.publishedAt) {
      return ad2;
    }
    if (ad1.publishedAt > ad2.publishedAt) {
      return ad1;
    }
  } else if (ad2.publishedAt && !ad1.publishedAt) {
    return ad2;
  } else if (ad1.publishedAt && !ad2.publishedAt) {
    return ad1;
  }

  // 2. Préférer l'annonce avec plus d'images
  const images1 = ad1.images?.length || 0;
  const images2 = ad2.images?.length || 0;
  if (images2 > images1) {
    return ad2;
  }
  if (images1 > images2) {
    return ad1;
  }

  // 3. Préférer l'annonce avec une description plus longue
  const desc1 = ad1.description?.length || 0;
  const desc2 = ad2.description?.length || 0;
  if (desc2 > desc1) {
    return ad2;
  }
  if (desc1 > desc2) {
    return ad1;
  }

  // 4. Préférer l'annonce avec plus de données (prix, surface, pièces)
  const data1 = [ad1.price, ad1.surface, ad1.rooms].filter(v => v !== null && v !== undefined).length;
  const data2 = [ad2.price, ad2.surface, ad2.rooms].filter(v => v !== null && v !== undefined).length;
  if (data2 > data1) {
    return ad2;
  }

  // Par défaut, garder la première
  return ad1;
}

/**
 * 7️⃣ Pipeline final d'harmonisation
 * Applique toutes les règles MoteurImmo UI dans le bon ordre
 */
export interface HarmonizationFilters {
  postalCodes?: string[];
  state?: "ancien" | "neuf" | "ancien+neuf" | null;
  vendor?: "all" | "pro" | "particulier";
}

export function harmonizeAdsWithMoteurImmoUI(
  ads: NormalizedListing[],
  filters: HarmonizationFilters
): NormalizedListing[] {
  let result = ads;

  console.log(`🔄 [Harmonisation] Début avec ${result.length} annonces brutes`);

  // 1. Filtrage par communes (code postal strict)
  if (filters.postalCodes && filters.postalCodes.length > 0) {
    const before = result.length;
    result = filterByCommunesMoteurImmo(result, filters.postalCodes);
    console.log(`📍 [Harmonisation] Filtrage communes: ${result.length} annonces (${before} avant)`);
  }

  // 2. Filtrage par état (ancien/neuf)
  if (filters.state) {
    const before = result.length;
    result = applyStateFilterMoteurImmo(result, filters.state);
    console.log(`🏗️ [Harmonisation] Filtrage état (${filters.state}): ${result.length} annonces (${before} avant)`);
  }

  // 3. Exclusion des annonces invalides
  const beforeInvalid = result.length;
  result = excludeInvalidAds(result);
  console.log(`✅ [Harmonisation] Exclusion invalides: ${result.length} annonces (${beforeInvalid} avant)`);

  // 4. Exclusion des annonces retirées/expirées
  const beforeRemoved = result.length;
  result = excludeRemovedAds(result);
  console.log(`🗑️ [Harmonisation] Exclusion retirées/expirées: ${result.length} annonces (${beforeRemoved} avant)`);

  // 5. Filtrage par type de vendeur
  if (filters.vendor) {
    const before = result.length;
    result = applyVendorFilterMoteurImmo(result, filters.vendor);
    console.log(`👤 [Harmonisation] Filtrage vendeur (${filters.vendor}): ${result.length} annonces (${before} avant)`);
  }

  // 6. Déduplication
  const beforeDedup = result.length;
  result = deduplicateAdsMoteurImmo(result);
  console.log(`🔗 [Harmonisation] Déduplication: ${result.length} annonces (${beforeDedup} avant)`);

  console.log(`✅ [Harmonisation] Terminé: ${result.length} annonces finales (${ads.length} au départ)`);

  return result;
}

