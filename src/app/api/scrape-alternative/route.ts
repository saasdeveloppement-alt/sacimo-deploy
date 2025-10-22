import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  try {
    const zenrowsApiKey = process.env.ZENROWS_API_KEY;
    if (!zenrowsApiKey) {
      return NextResponse.json({ error: 'ZENROWS_API_KEY not configured' }, { status: 500 });
    }

    // Utiliser la page d'accueil LeBonCoin qui fonctionne
    const testUrl = 'https://www.leboncoin.fr/';
    
    console.log('🏠 Scraping page d\'accueil LeBonCoin:', testUrl);

    const zenrowsUrl = `https://api.zenrows.com/v1/?apikey=${zenrowsApiKey}&url=${encodeURIComponent(testUrl)}&js_render=true&premium_proxy=true&proxy_country=fr`;
    
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
    
    // Chercher des annonces sur la page d'accueil
    const annonces = [];
    
    // Sélecteurs pour les annonces sur la page d'accueil
    const selectors = [
      'a[href*="/ventes_immobilieres/"]',
      'a[href*="/ventes/"]',
      '[data-qa-id*="ad"]',
      '[class*="ad"]',
      '[class*="card"]',
      'article',
      '.aditem',
      '.adcard'
    ];

    for (const selector of selectors) {
      const elements = $(selector);
      console.log(`🔍 Sélecteur "${selector}": ${elements.length} éléments`);
      
      elements.each((index, element) => {
        try {
          const $el = $(element);
          const href = $el.attr('href');
          const text = $el.text().trim();
          
          if (href && text && text.length > 10) {
            // Extraire le prix du texte
            const priceMatch = text.match(/(\d+[\s,]*€)/);
            const price = priceMatch ? parseInt(priceMatch[1].replace(/[^\d]/g, '')) : 0;
            
            // Extraire la surface
            const surfaceMatch = text.match(/(\d+)\s*m²/);
            const surface = surfaceMatch ? parseInt(surfaceMatch[1]) : undefined;
            
            // Extraire les pièces
            const roomsMatch = text.match(/(\d+)\s*pièce/);
            const rooms = roomsMatch ? parseInt(roomsMatch[1]) : undefined;
            
            // Extraire la localisation
            const locationMatch = text.match(/(\d{5}\s+[A-Za-z\s]+)/);
            const location = locationMatch ? locationMatch[1] : '';
            
            if (price > 0) {
              annonces.push({
                title: text.substring(0, 100),
                price: price,
                surface: surface,
                rooms: rooms,
                city: location.split(' ').slice(1).join(' ') || location.split(' ')[0] || '',
                postalCode: location.match(/(\d{5})/)?.[1],
                url: href.startsWith('http') ? href : `https://www.leboncoin.fr${href}`,
                selector: selector,
                elementHtml: $el.html()?.substring(0, 200)
              });
            }
          }
        } catch (error) {
          console.error('Erreur parsing élément:', error);
        }
      });
    }

    // Analyser le HTML pour comprendre la structure
    const analysis = {
      htmlLength: html.length,
      containsVentes: html.includes('ventes'),
      containsImmobilier: html.includes('immobilier'),
      containsAppartement: html.includes('appartement'),
      containsMaison: html.includes('maison'),
      containsPrix: html.includes('€'),
      containsM2: html.includes('m²'),
      aditemCount: (html.match(/aditem/g) || []).length,
      adcardCount: (html.match(/adcard/g) || []).length,
      dataQaCount: (html.match(/data-qa-id/g) || []).length,
      ventesImmobilieresCount: (html.match(/ventes_immobilieres/g) || []).length,
    };

    return NextResponse.json({
      success: true,
      message: `Scraping page d'accueil terminé ! ${annonces.length} éléments trouvés`,
      data: {
        totalFound: annonces.length,
        annonces: annonces.slice(0, 10), // Limite à 10
        analysis,
        htmlPreview: html.substring(0, 1000),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Erreur scraping page d\'accueil:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
