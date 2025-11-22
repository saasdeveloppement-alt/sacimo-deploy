/**
 * Client API MoteurImmo
 * Provider unique pour les Piges immobilières
 * Documentation: https://moteurimmo.fr/api/docs
 */

const MOTEURIMMO_BASE_URL = "https://moteurimmo.fr";

export interface MoteurImmoLocation {
  city?: string;
  postalCode?: string;
  inseeCode?: string;
  departmentCode?: number;
  regionCode?: number;
}

export interface MoteurImmoSearchParams {
  page?: number;
  maxLength?: number;
  types?: string[]; // ["sale", "rental"]
  categories?: string[];
  priceMin?: number | null;
  priceMax?: number | null;
  surfaceMin?: number | null;
  surfaceMax?: number | null;
  roomsMin?: number | null;
  roomsMax?: number | null;
  bedroomsMin?: number | null;
  bedroomsMax?: number | null;
  locations?: MoteurImmoLocation[];
  radius?: number;
  keywords?: string[];
  keywordsOperator?: "and" | "or";
  options?: string[];
  withCount?: boolean;
}

export interface MoteurImmoAd {
  uniqueId: string;
  title: string;
  price: number;
  surface: number | null;
  rooms: number | null;
  bedrooms: number | null;
  location: {
    city: string;
    postalCode: string;
    departmentCode?: number;
    regionCode?: number;
  };
  url: string;
  pictureUrl?: string;
  pictureUrls?: string[];
  publisher?: {
    name: string;
  };
  type: "sale" | "rental";
  category: string;
  creationDate: string;
  lastChangeDate?: string;
  description?: string;
  origin?: string; // Plateforme source (leboncoin, seloger, bienici, etc.)
}

export interface MoteurImmoSearchResponse {
  ads: MoteurImmoAd[];
  count?: number;
  page?: number;
  maxLength?: number;
}

/**
 * Recherche d'annonces via MoteurImmo API
 * POST https://moteurimmo.fr/api/ads
 */
export async function moteurImmoSearch(
  params: MoteurImmoSearchParams
): Promise<MoteurImmoSearchResponse> {
  const apiKey = process.env.MOTEURIMMO_API_KEY;

  if (!apiKey) {
    throw new Error("MOTEURIMMO_API_KEY manquante dans les variables d'environnement");
  }

  // Validation des paramètres
  const page = Math.max(1, Math.min(100, params.page ?? 1));
  const maxLength = Math.max(1, Math.min(1000, params.maxLength ?? 50));

  // Construction du body JSON selon la documentation MoteurImmo
  const body: any = {
    apiKey,
    page,
    maxLength,
    types: params.types ?? ["sale", "rental"],
    withCount: params.withCount ?? false,
  };

  // Ajouter les filtres optionnels seulement s'ils sont définis
  if (params.categories && params.categories.length > 0) {
    body.categories = params.categories;
  }
  if (params.priceMin !== null && params.priceMin !== undefined) {
    body.priceMin = params.priceMin;
  }
  if (params.priceMax !== null && params.priceMax !== undefined) {
    body.priceMax = params.priceMax;
  }
  if (params.surfaceMin !== null && params.surfaceMin !== undefined) {
    body.surfaceMin = params.surfaceMin;
  }
  if (params.surfaceMax !== null && params.surfaceMax !== undefined) {
    body.surfaceMax = params.surfaceMax;
  }
  if (params.roomsMin !== null && params.roomsMin !== undefined) {
    body.roomsMin = params.roomsMin;
  }
  if (params.roomsMax !== null && params.roomsMax !== undefined) {
    body.roomsMax = params.roomsMax;
  }
  if (params.bedroomsMin !== null && params.bedroomsMin !== undefined) {
    body.bedroomsMin = params.bedroomsMin;
  }
  if (params.bedroomsMax !== null && params.bedroomsMax !== undefined) {
    body.bedroomsMax = params.bedroomsMax;
  }
  if (params.locations && params.locations.length > 0) {
    body.locations = params.locations;
  }
  if (params.radius !== undefined) {
    body.radius = Math.max(1, Math.min(100, params.radius));
  }
  if (params.keywords && params.keywords.length > 0) {
    body.keywords = params.keywords;
    body.keywordsOperator = params.keywordsOperator ?? "and";
  }
  if (params.options && params.options.length > 0) {
    body.options = params.options;
  }

  console.log("🔍 [MoteurImmo] POST /api/ads", {
    page,
    maxLength,
    types: body.types,
    locationsCount: body.locations?.length ?? 0,
    hasPriceFilter: !!(body.priceMin || body.priceMax),
    hasSurfaceFilter: !!(body.surfaceMin || body.surfaceMax),
  });

  try {
    const response = await fetch(`${MOTEURIMMO_BASE_URL}/api/ads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Erreur MoteurImmo API (${response.status})`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage += `: ${errorJson.error || errorJson.message || errorText}`;
      } catch {
        errorMessage += `: ${errorText}`;
      }

      // Gestion spécifique des erreurs
      if (response.status === 400) {
        throw new Error(`Requête invalide: ${errorMessage}`);
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Clé API invalide ou expirée: ${errorMessage}`);
      }
      if (response.status === 429) {
        throw new Error(`Quota dépassé (300 req/min max): ${errorMessage}`);
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    console.log(`✅ [MoteurImmo] Réponse: ${data.ads?.length ?? 0} annonces`);

    return {
      ads: data.ads || [],
      count: data.count,
      page: data.page ?? page,
      maxLength: data.maxLength ?? maxLength,
    };
  } catch (error: any) {
    console.error("❌ [MoteurImmo] Erreur lors de la recherche:", error);
    
    // Si c'est déjà une erreur formatée, la propager
    if (error.message?.includes("Erreur MoteurImmo API")) {
      throw error;
    }
    
    // Sinon, wrapper l'erreur
    throw new Error(`Erreur lors de l'appel à MoteurImmo: ${error.message}`);
  }
}

/**
 * Récupère les statistiques d'utilisation de l'API MoteurImmo
 * GET https://moteurimmo.fr/api/statistics
 */
export async function getMoteurImmoStatistics() {
  const apiKey = process.env.MOTEURIMMO_API_KEY;
  
  if (!apiKey) {
    throw new Error("MOTEURIMMO_API_KEY manquante");
  }

  const url = `${MOTEURIMMO_BASE_URL}/api/statistics?apiKey=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erreur MoteurImmo statistics (${response.status}): ${text}`);
  }

  return response.json();
}

/**
 * Vérifie la santé de l'API MoteurImmo
 */
export async function checkMoteurImmoHealth(): Promise<boolean> {
  try {
    const apiKey = process.env.MOTEURIMMO_API_KEY;
    if (!apiKey) {
      return false;
    }
    
    // Test simple avec une recherche minimale
    await moteurImmoSearch({
      page: 1,
      maxLength: 1,
      locations: [{ postalCode: "75000" }],
    });
    
    return true;
  } catch (error) {
    console.error("❌ [MoteurImmo] Health check échoué:", error);
    return false;
  }
}
