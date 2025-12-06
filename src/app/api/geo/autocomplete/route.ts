import { NextRequest, NextResponse } from "next/server";

interface GeoApiCommune {
  nom: string;
  codesPostaux: string[];
  population?: number;
}

interface AutocompleteResult {
  city: string;
  postalCode: string;
}

/**
 * Endpoint d'autocomplétion pour les villes françaises
 * Utilise l'API géographique officielle : https://geo.api.gouv.fr
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    // Appel à l'API géographique française
    const apiUrl = `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,codesPostaux&boost=population&limit=10`;
    
    const response = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`[GEO API] Erreur ${response.status}: ${response.statusText}`);
      return NextResponse.json([], { status: 200 }); // Retourner un tableau vide en cas d'erreur
    }

    const data: GeoApiCommune[] = await response.json();

    // Transformer les résultats pour avoir une entrée par code postal
    const results: AutocompleteResult[] = [];
    const seen = new Set<string>(); // Pour éviter les doublons

    for (const commune of data) {
      const cityName = commune.nom;
      const postalCodes = commune.codesPostaux || [];

      for (const postalCode of postalCodes) {
        const key = `${cityName}-${postalCode}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({
            city: cityName,
            postalCode: postalCode,
          });
        }
      }
    }

    // Limiter à 20 résultats maximum
    return NextResponse.json(results.slice(0, 20));
  } catch (error) {
    console.error("[GEO API] Erreur lors de l'appel à l'API géographique:", error);
    return NextResponse.json([], { status: 200 }); // Retourner un tableau vide en cas d'erreur
  }
}




