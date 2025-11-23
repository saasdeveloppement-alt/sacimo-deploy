/**
 * Normalisation des résultats MoteurImmo
 * Convertit les données brutes en format standardisé pour SACIMO
 */

import type { MoteurImmoAd } from "@/lib/providers/moteurimmoClient";

export interface NormalizedListing {
  id: string;
  title: string;
  price: number | null;
  surface: number | null;
  rooms: number | null;
  city: string;
  postalCode: string;
  publishedAt: Date | null;
  url: string;
  provider: "moteurimmo";
  description?: string;
  images?: string[];
  origin?: string; // Plateforme source (leboncoin, seloger, bienici, etc.)
  publisher?: string; // Nom du vendeur/agence
  isPro?: boolean; // true si vendeur professionnel, false si particulier
}

/**
 * Normalise une annonce MoteurImmo vers le format standard SACIMO
 */
export function normalizeMoteurImmo(ad: MoteurImmoAd): NormalizedListing {
  // Gérer la date de publication (creationDate ou lastChangeDate)
  let publishedAt: Date | null = null;
  const dateStr = ad.lastChangeDate || ad.creationDate;
  if (dateStr) {
    publishedAt = new Date(dateStr);
  }

  // Gérer les images (pictureUrl ou pictureUrls)
  const images: string[] = [];
  if (ad.pictureUrl) {
    images.push(ad.pictureUrl);
  }
  if (ad.pictureUrls && Array.isArray(ad.pictureUrls)) {
    images.push(...ad.pictureUrls);
  }

  // Déterminer si c'est un vendeur professionnel ou particulier
  // Les agences ont généralement un nom de publisher, les particuliers non
  const publisher = ad.publisher?.name || "";
  
  // Si pas de publisher, considérer comme particulier par défaut
  let isPro: boolean | undefined;
  if (publisher.length === 0) {
    isPro = false; // Pas de publisher = particulier par défaut
  } else {
    // Vérifier si c'est un professionnel (agence immobilière)
    const publisherLower = publisher.toLowerCase();
    isPro = (
      publisherLower.includes("immobilier") ||
      publisherLower.includes("agence") ||
      publisherLower.includes("century") ||
      publisherLower.includes("orpi") ||
      publisherLower.includes("foncia") ||
      publisherLower.includes("laforêt") ||
      publisherLower.includes("guy hoquet") ||
      publisherLower.includes("safti") ||
      publisherLower.includes("seloger") ||
      publisherLower.includes("bienici") ||
      publisherLower.includes("logic-immo") ||
      publisherLower.includes("figaro") ||
      publisherLower.includes("etreproprio") ||
      publisherLower.includes("leboncoin") === false // Leboncoin peut être pro ou particulier
    ) && !publisherLower.includes("pap"); // PAP = toujours particulier
  }

  return {
    id: ad.uniqueId,
    title: ad.title || "Bien immobilier",
    price: ad.price ?? null,
    surface: ad.surface ?? null,
    rooms: ad.rooms ?? null,
    city: ad.location?.city || "",
    postalCode: ad.location?.postalCode || "",
    publishedAt,
    url: ad.url,
    provider: "moteurimmo",
    description: ad.description,
    images: images.length > 0 ? images : undefined,
    origin: ad.origin ? ad.origin.toLowerCase().trim() : undefined,
    publisher: publisher || undefined,
    isPro, // Toujours défini maintenant (true ou false)
  };
}

/**
 * Normalise un tableau d'annonces MoteurImmo
 */
export function normalizeMoteurImmoListings(
  ads: MoteurImmoAd[]
): NormalizedListing[] {
  return ads.map(normalizeMoteurImmo);
}

