import { NextRequest, NextResponse } from 'next/server';
import { leboncoinZenRowsScraper } from '@/lib/scrapers/leboncoin-zenrows';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ville = searchParams.get('ville') || 'Paris';
    const minPrix = searchParams.get('minPrix') ? parseInt(searchParams.get('minPrix')!) : undefined;
    const maxPrix = searchParams.get('maxPrix') ? parseInt(searchParams.get('maxPrix')!) : undefined;

    console.log('🔍 Debug HTML pour:', { ville, minPrix, maxPrix });

    // Construire l'URL de recherche
    const searchUrl = `https://www.leboncoin.fr/recherche?category=9&real_estate_type=2&locations=${ville}&price=${minPrix || 0}-${maxPrix || 1000000}&page=1`;
    
    console.log('🔗 URL de recherche:', searchUrl);

    // Récupérer le HTML brut via ZenRows
    const zenrowsApiKey = process.env.ZENROWS_API_KEY;
    if (!zenrowsApiKey) {
      return NextResponse.json({ error: 'ZENROWS_API_KEY not configured' }, { status: 500 });
    }

    const zenrowsUrl = `https://api.zenrows.com/v1/?apikey=${zenrowsApiKey}&url=${encodeURIComponent(searchUrl)}&js_render=true&premium_proxy=true&proxy_country=fr`;
    
    console.log('🔒 ZenRows URL:', zenrowsUrl);

    const response = await fetch(zenrowsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`ZenRows API error: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    console.log('📄 HTML reçu, longueur:', html.length);

    return NextResponse.json({
      success: true,
      data: {
        searchUrl,
        htmlLength: html.length,
        htmlPreview: html.substring(0, 1000), // Premiers 1000 caractères
        htmlEnd: html.substring(html.length - 500), // Derniers 500 caractères
        containsAditem: html.includes('aditem'),
        containsAdCard: html.includes('AdCard'),
        containsDataQa: html.includes('data-qa-id'),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Erreur debug HTML:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
