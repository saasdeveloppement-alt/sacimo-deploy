import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ville = searchParams.get('ville') || 'Paris';
    
    // Construire l'URL de recherche simple
    const searchUrl = `https://www.leboncoin.fr/recherche?category=9&real_estate_type=2&locations=${ville}`;
    
    console.log(`🔍 Test URL LeBonCoin: ${searchUrl}`);
    
    // Faire une requête simple pour voir la réponse
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: `Erreur HTTP: ${response.status} ${response.statusText}`,
        url: searchUrl,
        headers: Object.fromEntries(response.headers.entries()),
      });
    }

    const html = await response.text();
    
    // Analyser le HTML pour trouver des patterns
    const patterns = {
      hasAditemContainer: html.includes('aditem_container'),
      hasAditem: html.includes('aditem'),
      hasAdListitem: html.includes('ad-listitem'),
      hasVentesImmobilieres: html.includes('/ventes_immobilieres/'),
      hasLocations: html.includes('/locations/'),
      hasPrice: html.includes('€'),
      hasM2: html.includes('m²'),
      htmlLength: html.length,
      first500Chars: html.substring(0, 500),
    };

    return NextResponse.json({
      success: true,
      message: 'Debug LeBonCoin terminé',
      url: searchUrl,
      status: response.status,
      patterns,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Erreur lors du debug LeBonCoin:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur lors du debug LeBonCoin',
      error: error.message 
    }, { status: 500 });
  }
}
