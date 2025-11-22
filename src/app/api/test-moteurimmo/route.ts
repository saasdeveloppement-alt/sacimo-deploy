import { NextRequest, NextResponse } from "next/server";

/**
 * Route de test pour diagnostiquer l'API MoteurImmo
 * GET /api/test-moteurimmo
 */
export async function GET(req: NextRequest) {
  const apiKey = process.env.MOTEURIMMO_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({
      error: "MOTEURIMMO_API_KEY non configurée",
      hasKey: false,
    }, { status: 500 });
  }

  const baseUrls = [
    "https://moteurimmo.fr/api/v1",
    "https://moteurimmo.fr/api",
    "https://moteurimmo.fr",
  ];

  const endpoints = [
    "", // Essayer juste /api sans endpoint
    "/search",
    "/listings",
    "/properties",
    "/annonces",
    "/v1/search",
    "/v1/listings",
  ];
  const results: any[] = [];

  for (const baseUrl of baseUrls) {
    for (const endpoint of endpoints) {
      // Tester plusieurs formats d'authentification
      const authFormats = [
        // Format 1: apiKey dans query params
        { url: `${baseUrl}${endpoint}?apiKey=${apiKey}&city=Paris&page=1&pageSize=1`, headers: { "Content-Type": "application/json" } },
        // Format 2: X-API-Key dans headers
        { url: `${baseUrl}${endpoint}?city=Paris&page=1&pageSize=1`, headers: { "Content-Type": "application/json", "X-API-Key": apiKey } },
        // Format 3: Authorization Bearer
        { url: `${baseUrl}${endpoint}?city=Paris&page=1&pageSize=1`, headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` } },
        // Format 4: api-key dans headers
        { url: `${baseUrl}${endpoint}?city=Paris&page=1&pageSize=1`, headers: { "Content-Type": "application/json", "api-key": apiKey } },
      ];
      
      for (const authFormat of authFormats) {
        try {
          const response = await fetch(authFormat.url, {
            method: "GET",
            headers: authFormat.headers,
          });

          results.push({
            url: authFormat.url,
            authFormat: authFormat.headers,
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries()),
          });

          if (response.ok) {
            const data = await response.json();
            return NextResponse.json({
              success: true,
              workingUrl: authFormat.url,
              workingAuthFormat: authFormat.headers,
              data: data,
              allResults: results,
            });
          } else if (response.status !== 404) {
            // Si ce n'est pas 404, peut-être que c'est le bon endpoint mais mauvaise auth
            const errorText = await response.text();
            results.push({
              url: authFormat.url,
              authFormat: authFormat.headers,
              status: response.status,
              errorResponse: errorText,
            });
          }
        } catch (error: any) {
          results.push({
            url: authFormat.url,
            authFormat: authFormat.headers,
            error: error.message,
            errorName: error.name,
          });
        }
      }
    }
  }

  return NextResponse.json({
    success: false,
    message: "Aucun endpoint fonctionnel trouvé",
    apiKeyPrefix: apiKey.substring(0, 10) + "...",
    testedUrls: results,
  }, { status: 404 });
}

