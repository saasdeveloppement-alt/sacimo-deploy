"use server";

import { moteurImmoSearch } from "@/lib/providers/moteurimmoClient";
import type { MoteurImmoAd } from "@/lib/providers/moteurimmoClient";

export interface AgencyListing {
  id: string;
  title: string;
  price: number;
  surface: number | null;
  rooms: number | null;
  city: string;
  postalCode: string;
  url: string;
  pictureUrl?: string;
  description?: string;
  publishedAt: string;
}

export async function getAgencyListings(
  agencyName: string,
  postalCodes: string[]
): Promise<AgencyListing[]> {
  if (!postalCodes || postalCodes.length === 0) {
    return [];
  }

  try {
    // Construire les locations pour MoteurImmo
    const locations = postalCodes.map((code) => {
      const trimmed = code.trim();
      if (/^\d{5}$/.test(trimmed) && trimmed.endsWith("000")) {
        const dep = Number(trimmed.substring(0, 2));
        if (!isNaN(dep) && dep >= 1 && dep <= 95) {
          return { departmentCode: dep };
        }
      }
      if (/^\d{5}$/.test(trimmed)) {
        return { postalCode: trimmed };
      }
      return null;
    }).filter(Boolean) as Array<{ postalCode?: string; departmentCode?: number }>;

    if (locations.length === 0) {
      return [];
    }

    // Récupérer toutes les annonces (plusieurs pages si nécessaire)
    const allAds: MoteurImmoAd[] = [];
    let page = 1;
    let hasMore = true;
    const maxPages = 20; // Limite augmentée pour récupérer plus d'annonces

    while (hasMore && page <= maxPages) {
      const response = await moteurImmoSearch({
        locations,
        page,
        maxLength: 100,
        types: ["sale", "rental"],
        withCount: false,
      });

      if (response.ads && response.ads.length > 0) {
        allAds.push(...response.ads);
        hasMore = response.ads.length >= 100;
        page++;
      } else {
        hasMore = false;
      }
    }

    // Filtrer par nom d'agence
    const filteredAds = allAds.filter((ad) => {
      const publisherName = ad.publisher?.name || "";
      return publisherName.toLowerCase().includes(agencyName.toLowerCase());
    });

    // Transformer en format AgencyListing
    const listings: AgencyListing[] = filteredAds.map((ad) => ({
      id: ad.uniqueId,
      title: ad.title,
      price: ad.price,
      surface: ad.surface,
      rooms: ad.rooms,
      city: ad.location.city,
      postalCode: ad.location.postalCode,
      url: ad.url,
      pictureUrl: ad.pictureUrl || ad.pictureUrls?.[0],
      description: ad.description,
      publishedAt: ad.creationDate || ad.lastChangeDate || "",
    }));

    // ============================================
    // TRI AUTOMATIQUE : DU PLUS RÉCENT AU PLUS ANCIEN
    // ============================================
    // Force tri du plus récent au plus ancien AVANT l'affichage
    listings.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA; // Décroissant : plus récent en premier
    });

    console.info("[SACIMO] ➜ Tri appliqué sur annonces d'agence → du plus récent au plus ancien");

    return listings.slice(0, 200); // Limiter à 200 annonces
  } catch (error) {
    console.error("Error in getAgencyListings:", error);
    throw new Error(`Failed to get agency listings: ${(error as Error).message}`);
  }
}




