import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  const ZENROWS_KEY = process.env.ZENROWS_API_KEY;
  const { searchParams } = new URL(request.url);
  const ville = searchParams.get('ville') || 'Paris';

  if (!ZENROWS_KEY) {
    return NextResponse.json({ success: false, error: "ZENROWS_API_KEY non configurée" }, { status: 500 });
  }

  try {
    console.log(`🔍 Debug Google Search pour LeBonCoin ${ville}...`);
    
    // Construire la requête Google pour LeBonCoin
    const googleQuery = `site:leboncoin.fr ventes immobilieres ${ville} appartement maison`;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(googleQuery)}&num=20`;
    
    console.log(`📡 URL Google: ${googleUrl}`);

    const { data: html } = await axios.get("https://api.zenrows.com/v1/", {
      params: {
        apikey: ZENROWS_KEY,
        url: googleUrl,
        js_render: "true",
        premium_proxy: "true",
        wait: "5000",
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    console.log(`✅ HTML Google reçu: ${html.length} caractères`);

    const $ = cheerio.load(html);
    
    // Analyser la structure HTML de Google
    const analysis = {
      htmlLength: html.length,
      title: $('title').text(),
      containsGoogle: html.includes('google'),
      containsLeBonCoin: html.includes('leboncoin'),
      containsSearchResults: html.includes('search'),
      containsCaptcha: html.includes('captcha') || html.includes('CAPTCHA'),
      containsBlocked: html.includes('blocked') || html.includes('Blocked'),
      containsRateLimit: html.includes('rate') || html.includes('limit'),
      
      // Compter les liens
      allLinks: $('a').length,
      leboncoinLinks: $('a[href*="leboncoin.fr"]').length,
      searchResultLinks: $('a[href*="/url?q="]').length,
      
      // Analyser les sélecteurs Google
      searchResults: $('.g').length,
      searchResultTitles: $('.g h3').length,
      searchResultUrls: $('.g a[href*="/url?q="]').length,
    };

    // Extraire les URLs LeBonCoin
    const urls: string[] = [];
    $('a[href*="leboncoin.fr/ventes_immobilieres/"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('/ventes_immobilieres/')) {
        const cleanUrl = href.replace(/^\/url\?q=/, '').split('&')[0];
        if (cleanUrl.startsWith('https://www.leboncoin.fr/')) {
          urls.push(cleanUrl);
        }
      }
    });

    // Aperçu du HTML
    const htmlPreview = html.substring(0, 2000);
    const htmlMiddle = html.substring(html.length / 2 - 1000, html.length / 2 + 1000);
    const htmlEnd = html.substring(html.length - 1000);

    return NextResponse.json({
      success: true,
      message: `Debug Google Search terminé`,
      data: {
        analysis,
        urls: urls.slice(0, 10), // Limiter à 10 URLs
        totalUrls: urls.length,
        googleUrl,
        ville,
        htmlPreview,
        htmlMiddle,
        htmlEnd,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("❌ Erreur debug Google :", error.response?.status, error.message);
    return NextResponse.json({
      success: false,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data || null,
      googleUrl: `https://www.google.com/search?q=site:leboncoin.fr+ventes+immobilieres+${ville}`,
      ville,
    }, { status: 500 });
  }
}










