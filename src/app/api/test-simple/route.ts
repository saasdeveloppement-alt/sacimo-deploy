import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const zenrowsApiKey = process.env.ZENROWS_API_KEY;
    if (!zenrowsApiKey) {
      return NextResponse.json({ error: 'ZENROWS_API_KEY not configured' }, { status: 500 });
    }

    // Test avec une URL LeBonCoin simple (page d'accueil)
    const testUrl = 'https://www.leboncoin.fr/';
    
    console.log('🧪 Test simple avec URL:', testUrl);

    const zenrowsUrl = `https://api.zenrows.com/v1/?apikey=${zenrowsApiKey}&url=${encodeURIComponent(testUrl)}&js_render=true&premium_proxy=true&proxy_country=fr`;
    
    console.log('🔒 ZenRows URL:', zenrowsUrl);

    const response = await fetch(zenrowsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erreur ZenRows ${response.status}:`, errorText);
      return NextResponse.json({ 
        success: false, 
        error: `ZenRows API error: ${response.status} ${response.statusText}`,
        details: errorText,
        zenrowsUrl: zenrowsUrl.substring(0, 100) + '...'
      }, { status: 500 });
    }

    const html = await response.text();
    
    return NextResponse.json({
      success: true,
      data: {
        testUrl,
        htmlLength: html.length,
        htmlPreview: html.substring(0, 500),
        containsLeBonCoin: html.includes('leboncoin'),
        containsTitle: html.includes('<title>'),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Erreur test simple:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}