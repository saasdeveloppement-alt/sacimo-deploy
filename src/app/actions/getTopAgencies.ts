"use server";

import { moteurImmoSearch } from "@/lib/providers/moteurimmoClient";
import type { MoteurImmoAd } from "@/lib/providers/moteurimmoClient";

export interface TopAgency {
  name: string;
  count: number;
  avgPrice: number;
  marketShare: string;
  rank: number;
}

export async function getTopAgencies(postalCodes: string[]): Promise<TopAgency[]> {
  if (!postalCodes || postalCodes.length === 0) {
    return [];
  }

  try {
    // Construire les locations pour MoteurImmo
    const locations = postalCodes.map((code) => {
      const trimmed = code.trim();
      // CP générique (75000, 33000, etc.) → departmentCode
      if (/^\d{5}$/.test(trimmed) && trimmed.endsWith("000")) {
        const dep = Number(trimmed.substring(0, 2));
        if (!isNaN(dep) && dep >= 1 && dep <= 95) {
          return { departmentCode: dep };
        }
      }
      // CP réel (75001, etc.) → postalCode
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
    const maxPages = 10; // Limite de sécurité

    while (hasMore && page <= maxPages) {
      const response = await moteurImmoSearch({
        locations,
        page,
        maxLength: 100, // Maximum par page
        types: ["sale", "rental"], // Vente et location
        withCount: false,
      });

      if (response.ads && response.ads.length > 0) {
        allAds.push(...response.ads);
        // Si on a moins de résultats que maxLength, c'est la dernière page
        hasMore = response.ads.length >= 100;
        page++;
      } else {
        hasMore = false;
      }
    }

    // Regrouper par agence
    const agenciesMap: Record<string, { count: number; prices: number[] }> = {};
    let adsWithoutPublisher = 0;
    let adsWithEmptyPublisher = 0;
    const publisherNamesSample: string[] = []; // Pour debug

    for (const ad of allAds) {
      // Utiliser UNIQUEMENT publisher.name (champ officiel de l'API MoteurImmo)
      let agencyName: string | null = null;

      if (ad.publisher?.name) {
        const rawName = ad.publisher.name.trim();
        if (rawName.length > 0) {
          agencyName = rawName;
          // Échantillonner les noms pour debug (max 20)
          if (publisherNamesSample.length < 20 && !publisherNamesSample.includes(rawName)) {
            publisherNamesSample.push(rawName);
          }
        } else {
          adsWithEmptyPublisher++;
        }
      } else {
        adsWithoutPublisher++;
      }

      // Si pas de publisher.name valide, ignorer cette annonce
      // (c'est une annonce sans agence identifiée par l'API)
      if (!agencyName) {
        continue;
      }

      // Normaliser le nom : garder la casse originale mais nettoyer les espaces
      agencyName = agencyName.trim().replace(/\s+/g, ' ');

      if (!agenciesMap[agencyName]) {
        agenciesMap[agencyName] = {
          count: 0,
          prices: [],
        };
      }

      agenciesMap[agencyName].count++;
      if (ad.price && ad.price > 0) {
        agenciesMap[agencyName].prices.push(ad.price);
      }
    }

    // Log pour debug
    console.log(`[getTopAgencies] Statistiques extraction agences:`, {
      totalAds: allAds.length,
      adsWithPublisher: allAds.length - adsWithoutPublisher - adsWithEmptyPublisher,
      adsWithoutPublisher,
      adsWithEmptyPublisher,
      uniqueAgencies: Object.keys(agenciesMap).length,
      samplePublisherNames: publisherNamesSample.slice(0, 10),
    });

    // Calculer les statistiques
    const agencies = Object.entries(agenciesMap).map(([name, data]) => ({
      name,
      count: data.count,
      avgPrice:
        data.prices.length > 0
          ? Math.round(data.prices.reduce((a, b) => a + b, 0) / data.prices.length)
          : 0,
    }));

    // Calculer la part de marché
    const total = agencies.reduce((acc, cur) => acc + cur.count, 0);

    // Trier par nombre d'annonces décroissant, puis par nom pour stabilité
    const sorted = agencies
      .map((a) => ({
        ...a,
        marketShare: total > 0 ? ((a.count / total) * 100).toFixed(1) : "0.0",
      }))
      .sort((a, b) => {
        // D'abord par nombre d'annonces décroissant
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        // En cas d'égalité, trier par nom pour stabilité
        return a.name.localeCompare(b.name);
      });

    // Prendre les 10 premières et assigner les rangs (1 à 10)
    const ranked = sorted
      .slice(0, 10)
      .map((a, index) => ({
        ...a,
        rank: index + 1, // Rang commence toujours à 1
      }));

    // Garantir qu'il y a au moins un résultat avec rang 1
    if (ranked.length === 0 && agencies.length > 0) {
      // Si aucune agence n'a été classée mais qu'il y a des agences, prendre la première
      const firstAgency = sorted[0];
      return [{
        ...firstAgency,
        rank: 1,
      }];
    }

    return ranked;
  } catch (error) {
    console.error("Error in getTopAgencies:", error);
    throw new Error(`Failed to get top agencies: ${(error as Error).message}`);
  }
}



