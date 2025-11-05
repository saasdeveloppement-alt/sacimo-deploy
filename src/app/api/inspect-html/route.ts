import { NextRequest, NextResponse } from 'next/server';
import { leboncoinZenRowsScraper } from '@/lib/scrapers/leboncoin-zenrows';

export async function GET(request: NextRequest) {
  try {
    const { searchParams: urlSearchParams } = new URL(request.url);
    const ville = urlSearchParams.get('ville') || 'Paris';
    const minPrix = urlSearchParams.get('minPrix') ? parseInt(urlSearchParams.get('minPrix')!) : undefined;
    const maxPrix = urlSearchParams.get('maxPrix') ? parseInt(urlSearchParams.get('maxPrix')!) : undefined;

    console.log('🔍 Inspection HTML pour:', { ville, minPrix, maxPrix });

    // Construire l'URL de recherche
    const searchParams = new URLSearchParams();
    searchParams.set('category', '9'); // Immobilier
    searchParams.set('real_estate_type', '2'); // Vente
    searchParams.set('locations', ville);
    
    if (minPrix && maxPrix) {
      searchParams.set('price', `${minPrix}-${maxPrix}`);
    } else if (minPrix) {
      searchParams.set('price', `${minPrix}-`);
    } else if (maxPrix) {
      searchParams.set('price', `-${maxPrix}`);
    }
    
    const searchUrl = `https://www.leboncoin.fr/recherche?${searchParams.toString()}`;
    
    console.log('🔗 URL de recherche:', searchUrl);

    // Récupérer le HTML via ZenRows
    const zenrowsApiKey = process.env.ZENROWS_API_KEY;
    if (!zenrowsApiKey) {
      return NextResponse.json({ error: 'ZENROWS_API_KEY not configured' }, { status: 500 });
    }

    const zenrowsUrl = `https://api.zenrows.com/v1/?apikey=${zenrowsApiKey}&url=${encodeURIComponent(searchUrl)}&js_render=true&premium_proxy=true&proxy_country=fr`;
    
    const response = await fetch(zenrowsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ 
        success: false, 
        error: `ZenRows API error: ${response.status} ${response.statusText}`,
        details: errorText
      }, { status: 500 });
    }

    const html = await response.text();
    
    // Analyser le HTML pour trouver les sélecteurs
    const analysis = {
      htmlLength: html.length,
      containsAditem: html.includes('aditem'),
      containsAdCard: html.includes('AdCard'),
      containsDataQa: html.includes('data-qa-id'),
      containsArticle: html.includes('<article'),
      containsDiv: html.includes('<div'),
      containsA: html.includes('<a href'),
      containsH2: html.includes('<h2'),
      containsH3: html.includes('<h3'),
      containsPrice: html.includes('€'),
      containsM2: html.includes('m²'),
      containsPiece: html.includes('pièce'),
      // Chercher des patterns spécifiques
      aditemPatterns: (html.match(/aditem[^>]*>/g) || []).slice(0, 5),
      dataQaPatterns: (html.match(/data-qa-id="[^"]*"/g) || []).slice(0, 10),
      classPatterns: (html.match(/class="[^"]*ad[^"]*"/g) || []).slice(0, 10),
    };

    return NextResponse.json({
      success: true,
      data: {
        searchUrl,
        analysis,
        htmlPreview: html.substring(0, 2000), // Premiers 2000 caractères
        htmlMiddle: html.substring(html.length/2 - 1000, html.length/2 + 1000), // Milieu
        htmlEnd: html.substring(html.length - 1000), // Derniers 1000 caractères
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Erreur inspection HTML:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}










