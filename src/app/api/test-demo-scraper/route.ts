import { NextRequest, NextResponse } from 'next/server';
import { scrapeLeBonCoinDemo } from '@/lib/scrapers/leboncoin-demo';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ville = searchParams.get('ville') || 'Paris';

    console.log('🎭 Test scraper démo pour:', ville);

    const result = await scrapeLeBonCoinDemo(ville);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'Erreur lors du scraping démo',
        error: result.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Scraping démo terminé ! ${result.totalFound} annonces trouvées`,
      data: {
        totalFound: result.totalFound,
        annonces: result.annonces,
        ville,
        type: 'demo'
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Erreur lors du test scraper démo:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur lors du test scraper démo',
      error: error.message
    }, { status: 500 });
  }
}


