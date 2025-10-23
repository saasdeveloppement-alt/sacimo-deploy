import { NextRequest, NextResponse } from 'next/server';
import { scrapeLeBonCoinComplete, searchLeBonCoin, getAnnonceDetails } from '@/lib/scrapers/leboncoin-google';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ville = searchParams.get('ville') || 'Paris';
    const mode = searchParams.get('mode') || 'complete'; // complete, search, details

    console.log(`🚀 Test scraper Google → LeBonCoin pour ${ville} (mode: ${mode})`);

    let result;

    switch (mode) {
      case 'search':
        // Test seulement la recherche Google
        result = await searchLeBonCoin(ville);
        break;
        
      case 'details':
        // Test seulement le scraping des détails (avec URLs de test)
        const testUrls = [
          'https://www.leboncoin.fr/ventes_immobilieres/1234567890.htm',
          'https://www.leboncoin.fr/ventes_immobilieres/1234567891.htm'
        ];
        result = await getAnnonceDetails(testUrls);
        break;
        
      default:
        // Test complet
        result = await scrapeLeBonCoinComplete(ville);
        break;
    }

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: `Erreur lors du scraping (mode: ${mode})`,
        error: result.error,
        mode,
        ville
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Scraping Google → LeBonCoin terminé ! ${result.totalFound || 0} annonces trouvées`,
      data: {
        totalFound: result.totalFound,
        annonces: result.annonces?.slice(0, 5), // Limiter à 5 pour la réponse
        mode,
        ville,
        type: 'google-leboncoin'
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Erreur lors du test scraper Google → LeBonCoin:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur lors du test scraper Google → LeBonCoin',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}


