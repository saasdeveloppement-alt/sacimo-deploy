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

