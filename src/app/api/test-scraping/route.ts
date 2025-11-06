import { NextRequest, NextResponse } from 'next/server';
import { LeBonCoinSearchParams } from '@/lib/scrapers/leboncoin-zenrows';
import { leboncoinZenRowsScraper } from '@/lib/scrapers/leboncoin-zenrows';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ville = searchParams.get('ville') || 'Paris';
    const minPrix = searchParams.get('minPrix') ? parseInt(searchParams.get('minPrix')!) : undefined;
    const maxPrix = searchParams.get('maxPrix') ? parseInt(searchParams.get('maxPrix')!) : undefined;

    const params: LeBonCoinSearchParams = {
      ville,
      minPrix,
      maxPrix,
      pages: 1, // Test avec 1 page seulement
    };

    console.log('🧪 Test scraping avec paramètres:', params);

    // Test du scraping avec ZenRows
    const annonces = await leboncoinZenRowsScraper.scrapeAnnonces(params);
    console.log(`✅ Test scraping réussi: ${annonces.length} annonces`);

    return NextResponse.json({
      success: true,
      message: `Test scraping terminé ! ${annonces.length} annonces trouvées`,
      data: {
        totalFound: annonces.length,
        annonces: annonces.slice(0, 5), // Limite à 5 pour le test
      },
      params,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Erreur lors du test scraping:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur lors du test scraping',
      error: error.message 
    }, { status: 500 });
  }
}