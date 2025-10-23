import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  try {
    const zenrowsApiKey = process.env.ZENROWS_API_KEY;
    if (!zenrowsApiKey) {
      return NextResponse.json({ error: 'ZENROWS_API_KEY not configured' }, { status: 500 });
    }

    // URL de recherche LeBonCoin (simplifiée)
    const searchUrl = 'https://www.leboncoin.fr/recherche?category=9&real_estate_type=2&locations=Paris';
    
    console.log('🔍 Debug structure HTML pour:', searchUrl);

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
    
    // Analyse détaillée de la structure HTML
    const analysis = {
      htmlLength: html.length,
      
      // Vérification des sélecteurs d'annonces courants
      selectors: {
        // Sélecteurs data-qa-id
        'data-qa-id="aditem_container"': $('[data-qa-id="aditem_container"]').length,
        'data-qa-id="aditem"': $('[data-qa-id="aditem"]').length,
        'data-qa-id="aditem_title"': $('[data-qa-id="aditem_title"]').length,
        'data-qa-id="aditem_price"': $('[data-qa-id="aditem_price"]').length,
        'data-qa-id="aditem_criteria"': $('[data-qa-id="aditem_criteria"]').length,
        'data-qa-id="aditem_location"': $('[data-qa-id="aditem_location"]').length,
        
        // Sélecteurs de classes
        '.aditem_container': $('.aditem_container').length,
        '.aditem': $('.aditem').length,
        '.aditem_title': $('.aditem_title').length,
        '.aditem_price': $('.aditem_price').length,
        '.aditem_criteria': $('.aditem_criteria').length,
        '.aditem_location': $('.aditem_location').length,
        
        // Sélecteurs génériques
        'a[href*="/ventes_immobilieres/"]': $('a[href*="/ventes_immobilieres/"]').length,
        'article': $('article').length,
        '[class*="ad"]': $('[class*="ad"]').length,
        '[class*="card"]': $('[class*="card"]').length,
        '[class*="item"]': $('[class*="item"]').length,
        
        // Sélecteurs de contenu
        'h2': $('h2').length,
        'h3': $('h3').length,
        '[class*="title"]': $('[class*="title"]').length,
        '[class*="price"]': $('[class*="price"]').length,
        '[class*="location"]': $('[class*="location"]').length,
        '[class*="criteria"]': $('[class*="criteria"]').length,
      },
      
      // Analyse des patterns dans le HTML
      patterns: {
        containsAditem: html.includes('aditem'),
        containsAdCard: html.includes('AdCardWith'),
        containsDataQa: html.includes('data-qa-id'),
        containsArticle: html.includes('<article'),
        containsDiv: html.includes('<div'),
        containsA: html.includes('<a'),
        containsH2: html.includes('<h2'),
        containsH3: html.includes('<h3'),
        containsPrice: html.includes('price'),
        containsM2: html.includes('m²'),
        containsPiece: html.includes('pièce'),
        containsEuro: html.includes('€'),
        containsVentes: html.includes('ventes'),
        containsImmobilier: html.includes('immobilier'),
      },
      
      // Aperçu des premiers éléments trouvés
      firstElements: {
        firstAditemContainer: $('[data-qa-id="aditem_container"]').first().html()?.substring(0, 300),
        firstAditem: $('[data-qa-id="aditem"]').first().html()?.substring(0, 300),
        firstArticle: $('article').first().html()?.substring(0, 300),
        firstLink: $('a[href*="/ventes_immobilieres/"]').first().html()?.substring(0, 300),
      },
      
      // Aperçu du HTML
      htmlPreview: html.substring(0, 1000),
      htmlMiddle: html.substring(html.length / 2 - 500, html.length / 2 + 500),
      htmlEnd: html.substring(html.length - 500),
    };

    return NextResponse.json({
      success: true,
      data: {
        searchUrl,
        analysis,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Erreur debug structure HTML:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}


