import { NextRequest, NextResponse } from 'next/server';
import { leboncoinZenRowsScraper, LeBonCoinSearchParams } from '@/lib/scrapers/leboncoin-zenrows';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ville = searchParams.get('ville') || 'Paris';
    const minPrix = searchParams.get('minPrix') ? parseInt(searchParams.get('minPrix')!) : undefined;
    const maxPrix = searchParams.get('maxPrix') ? parseInt(searchParams.get('maxPrix')!) : undefined;
    const pages = searchParams.get('pages') ? parseInt(searchParams.get('pages')!) : 1;

    const params: LeBonCoinSearchParams = {
      ville,
      minPrix,
      maxPrix,
      pages,
    };

    console.log('🚀 Test optimisé avec paramètres:', params);

    const annonces = await leboncoinZenRowsScraper.scrapeAnnonces(params);
    console.log(`✅ Test optimisé réussi: ${annonces.length} annonces`);

    return NextResponse.json({
      success: true,
      message: `Test optimisé terminé ! ${annonces.length} annonces trouvées`,
      data: {
        totalFound: annonces.length,
        annonces: annonces.slice(0, 10), // Limite à 10 pour la réponse
        sampleAnnonce: annonces[0] || null,
        params,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Erreur lors du test optimisé:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur lors du test optimisé',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}


