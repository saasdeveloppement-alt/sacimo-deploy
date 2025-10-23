import { NextRequest, NextResponse } from 'next/server';
import { leboncoinZenRowsScraper, LeBonCoinSearchParams } from '@/lib/scrapers/leboncoin-zenrows';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ville = searchParams.get('ville') || 'Paris';
    const pages = searchParams.get('pages') ? parseInt(searchParams.get('pages')!) : 1; // Limité à 1 page pour le test

    const params: LeBonCoinSearchParams = {
      ville,
      pages,
    };

    console.log('🚀 Test parsing avec paramètres:', params);

    const annonces = await leboncoinZenRowsScraper.scrapeAnnonces(params);
    console.log(`✅ Test parsing réussi: ${annonces.length} annonces`);

    return NextResponse.json({
      success: true,
      message: `Test parsing terminé ! ${annonces.length} annonces trouvées`,
      data: {
        totalFound: annonces.length,
        annonces: annonces.slice(0, 5), // Retourne un résumé des 5 premières annonces
        sampleAnnonce: annonces[0] || null, // Première annonce complète pour debug
      },
      params,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Erreur lors du test parsing:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur lors du test parsing',
      error: error.message 
    }, { status: 500 });
  }
}


