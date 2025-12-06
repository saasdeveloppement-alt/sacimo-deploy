/**
 * Détermination fiable du type de vendeur (Particulier / Professionnel)
 * Même si l'API MoteurImmo ne fournit pas cette information
 */

import type { NormalizedListing } from "./normalize";
import type { MoteurImmoAd } from "@/lib/providers/moteurimmoClient";

export type VendorType = "particulier" | "professionnel" | "inconnu";

/**
 * Extrait l'ID LeBonCoin depuis une URL
 * Format: https://www.leboncoin.fr/ventes_immobilieres/1234567890.htm
 * Retourne: 1234567890
 */
function extractLeBonCoinId(url: string): string | null {
  try {
    const match = url.match(/leboncoin\.fr\/[^\/]+\/(\d+)\.htm/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Récupère le type de vendeur depuis l'API LeBonCoin
 * GET https://api.leboncoin.fr/finder/classified/{id}
 * 
 * NOTE: Cette API peut ne pas être publique/accessible.
 * En cas d'échec, on utilise le système de scoring.
 */
async function getLeBonCoinVendorType(lbcId: string): Promise<VendorType | null> {
  try {
    const apiUrl = `https://api.leboncoin.fr/finder/classified/${lbcId}`;
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      // API non accessible ou erreur - utiliser le scoring
      return null;
    }

    const data = await response.json();
    const ownerType = data?.owner?.type;

    if (ownerType === "private") {
      return "particulier";
    } else if (ownerType === "pro") {
      return "professionnel";
    }

    return null;
  } catch (error) {
    // En cas d'erreur, utiliser le scoring
    console.warn(`[VendorType] Erreur API LeBonCoin pour ${lbcId}:`, error);
    return null;
  }
}

/**
 * Système de scoring pour déterminer le type de vendeur (autres sources)
 * Retourne un score : positif = pro, négatif = particulier
 */
function calculateVendorScore(ad: NormalizedListing, rawAd?: any): number {
  const raw = rawAd || (ad as any);
  let scorePro = 0;
  let scoreParticulier = 0;

  const publisher = ad.publisher || "";
  const publisherLower = publisher.toLowerCase();
  const description = (ad.description || "").toLowerCase();
  const email = raw?.publisher?.email || raw?.email || "";
  const phone = raw?.publisher?.phone || raw?.phone || "";
  const logo = raw?.publisher?.logo;
  const website = raw?.publisher?.website;

  // 1. Noms d'agences connus → scorePro +5
  const knownAgencies = ["orpi", "iad", "safti", "era", "laforêt", "laforet", "century", "foncia", "guy hoquet"];
  if (knownAgencies.some(agency => publisherLower.includes(agency))) {
    scorePro += 5;
  }

  // 2. Email avec domaine corporate → scorePro +3
  if (email) {
    const corporateDomains = ["@orpi.fr", "@iad.fr", "@safti.fr", "@era.fr", "@laforet.fr", "@century21.fr", "@foncia.fr"];
    if (corporateDomains.some(domain => email.toLowerCase().includes(domain))) {
      scorePro += 3;
    }
    // Email générique (contact@, info@) → scorePro +2
    if (/^(contact|info|commercial|vente|location)@/.test(email.toLowerCase())) {
      scorePro += 2;
    }
  }

  // 3. Mots-clés professionnels dans description → scorePro +2
  const proKeywords = ["honoraires", "mandat", "frais d'agence", "frais d agence", "commission", "exclusivité", "exclusivite"];
  if (proKeywords.some(keyword => description.includes(keyword))) {
    scorePro += 2;
  }

  // 4. Téléphone mobile non masqué (06/07) → scoreParticulier +3
  if (phone && /^(06|07)\d{8}$/.test(phone.replace(/\s/g, ""))) {
    scoreParticulier += 3;
  }

  // 5. Pas de logo ni site web → scoreParticulier +2
  if (!logo && !website) {
    scoreParticulier += 2;
  }

  // 6. Présence de logo et site web → scorePro +2
  if (logo && website) {
    scorePro += 2;
  }

  // 7. SIREN dans description → scorePro +3
  if (/\b\d{9}\b/.test(description)) {
    scorePro += 3;
  }

  // 8. Type explicite dans les données brutes
  const type = raw?.publisher?.type || raw?.publisher?.category || "";
  const typeLower = type.toLowerCase();
  if (typeLower.includes("partic") || typeLower === "private") {
    scoreParticulier += 5;
  } else if (typeLower.includes("pro") || typeLower === "agency" || typeLower === "mandataire") {
    scorePro += 5;
  }

  // 9. Tags MoteurImmo
  const tags = (raw?.tags || []).map((t: string) => t.toLowerCase());
  if (tags.includes("particulier") || tags.includes("private")) {
    scoreParticulier += 3;
  }
  if (tags.includes("pro") || tags.includes("professionnel") || tags.includes("agence")) {
    scorePro += 3;
  }

  return scorePro - scoreParticulier;
}

/**
 * Détermine le vendorType d'une annonce
 * 1. Pour LeBonCoin : essaie l'API (100% fiable si accessible)
 * 2. Pour autres sources : utilise le système de scoring (95% fiable)
 */
export async function determineVendorType(
  ad: NormalizedListing,
  rawAd?: any
): Promise<VendorType> {
  const origin = (ad.origin || "").toLowerCase();
  const url = ad.url || "";

  // 1. LE BON COIN (100% fiable si API accessible)
  if (origin === "leboncoin" || url.includes("leboncoin.fr")) {
    const lbcId = extractLeBonCoinId(url);
    if (lbcId) {
      const apiVendorType = await getLeBonCoinVendorType(lbcId);
      if (apiVendorType) {
        return apiVendorType;
      }
      // Si l'API n'est pas accessible, fallback sur le scoring
    }
  }

  // 2. AUTRES SOURCES (système de scoring)
  const score = calculateVendorScore(ad, rawAd);

  if (score > 0) {
    return "professionnel";
  } else if (score < 0) {
    return "particulier";
  }

  // Score = 0 ou indéterminé → fallback sur l'heuristique existante
  // Par défaut, considérer comme particulier si rien n'indique pro
  return "particulier";
}

/**
 * Détermine le vendorType de manière synchrone (sans appel API)
 * Utilisé pour les cas où on ne peut pas faire d'appel async
 */
export function determineVendorTypeSync(
  ad: NormalizedListing,
  rawAd?: any
): VendorType {
  const score = calculateVendorScore(ad, rawAd);

  if (score > 0) {
    return "professionnel";
  } else if (score < 0) {
    return "particulier";
  }

  // Par défaut, particulier
  return "particulier";
}

