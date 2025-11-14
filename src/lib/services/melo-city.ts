import NodeCache from "node-cache";

const cityCache = new NodeCache({
  stdTTL: 86400, // 24h
});

export interface MeloCity {
  id: number;
  name: string;
  zipcode?: string;
  slug?: string;
}

export class MeloCityService {
  baseUrl: string;
  apiKey: string;

  constructor() {
    this.baseUrl = process.env.MELO_BASE_URL!;
    this.apiKey = process.env.MELO_API_KEY!;
  }

  async searchCity(query: string): Promise<MeloCity | null> {
    const normalizedQuery = query.trim().toLowerCase();
    const cacheKey = `city_${normalizedQuery}`;
    const cached = cityCache.get<MeloCity>(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/cities?search=${encodeURIComponent(query)}`;

    try {
      const res = await fetch(url, {
        headers: { "X-API-KEY": this.apiKey },
      });

      if (!res.ok) {
        console.error("❌ Erreur HTTP Melo /cities:", res.status, await res.text());
        return null;
      }

      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        console.warn(`⚠️ Aucune ville trouvée pour "${query}" dans Melo /cities`);
        return null;
      }

      const exact = data.find((c: any) => {
        const name = (c.name || "").toLowerCase();
        const slug = (c.slug || "").toLowerCase();
        return name === normalizedQuery || slug === normalizedQuery;
      });

      const city: MeloCity = exact || data[0];

      cityCache.set(cacheKey, city);
      return city;
    } catch (e) {
      console.error("❌ Erreur recherche ville Melo /cities:", e);
      return null;
    }
  }
}

export const meloCityService = new MeloCityService();

