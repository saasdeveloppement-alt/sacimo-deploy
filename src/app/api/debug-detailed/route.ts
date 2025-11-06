import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  try {
    const { searchParams: urlSearchParams } = new URL(request.url);
    const ville = urlSearchParams.get('ville') || 'Paris';
    const minPrix = urlSearchParams.get('minPrix') ? parseInt(urlSearchParams.get('minPrix')!) : undefined;
    const maxPrix = urlSearchParams.get('maxPrix') ? parseInt(urlSearchParams.get('maxPrix')!) : undefined;

    console.log('🔍 Debug détaillé pour:', { ville, minPrix, maxPrix });

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
    const $ = cheerio.load(html);
    
    // Test de tous les sélecteurs possibles
    const selectors = [
      '[data-qa-id="aditem_container"]',
      '.aditem_container',
      'a[href*="/ventes_immobilieres/"]',
      '[data-qa-id="aditem"]',
      '.aditem',
      '.ad-listitem',
      '[data-test-id="aditem_container"]',
      'article[data-qa-id="aditem"]',
      '.aditem[data-qa-id="aditem"]',
      '[data-testid="aditem"]',
      '.aditem[data-testid="aditem"]',
      'a[href*="/ventes_immobilieres/"]',
      '[class*="aditem"]',
      '[class*="adcard"]',
      '[class*="AdCard"]',
      'div[class*="ad"]',
      'article',
      'div[data-qa-id]',
      'a[href*="/ventes"]'
    ];

    const selectorResults = {};
    for (const selector of selectors) {
      const elements = $(selector);
      selectorResults[selector] = {
        count: elements.length,
        firstElement: elements.length > 0 ? $(elements[0]).html()?.substring(0, 200) : null
      };
    }

    // Chercher des patterns spécifiques dans le HTML
    const patterns = {
      aditemInHtml: (html.match(/aditem/g) || []).length,
      adcardInHtml: (html.match(/adcard/g) || []).length,
      dataQaInHtml: (html.match(/data-qa-id/g) || []).length,
      ventesImmobilieres: (html.match(/ventes_immobilieres/g) || []).length,
      priceInHtml: (html.match(/€/g) || []).length,
      m2InHtml: (html.match(/m²/g) || []).length,
      pieceInHtml: (html.match(/pièce/g) || []).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        searchUrl,
        htmlLength: html.length,
        selectorResults,
        patterns,
        htmlPreview: html.substring(0, 1000),
        htmlMiddle: html.substring(html.length/2 - 1000, html.length/2 + 1000),
        htmlEnd: html.substring(html.length - 1000),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Erreur debug détaillé:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}










