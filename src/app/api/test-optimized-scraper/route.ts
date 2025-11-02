import { NextRequest, NextResponse } from 'next/server';
import { scrapeLeBonCoin } from '@/lib/scrapers/leboncoin-optimized';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ville = searchParams.get('ville') || 'Paris';

    console.log('🚀 Test scraper optimisé pour:', ville);

    const result = await scrapeLeBonCoin(ville);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'Erreur lors du scraping',
        error: result.error,
        details: result.details
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Scraping optimisé terminé ! ${result.totalFound} annonces trouvées`,
      data: {
        totalFound: result.totalFound,
        annonces: result.annonces?.slice(0, 10), // Limite à 10 pour la réponse
        sampleAnnonce: result.annonces?.[0] || null,
      },
      ville,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Erreur lors du test scraper optimisé:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur lors du test scraper optimisé',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}








