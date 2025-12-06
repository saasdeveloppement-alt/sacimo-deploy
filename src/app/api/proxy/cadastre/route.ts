/**
 * Proxy pour les images cadastrales IGN
 * Évite les problèmes CORS en servant l'image depuis le serveur
 * Layer CORRIGÉ : CADASTRALPARCELS.PARCELS
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wmsUrl = searchParams.get('url');

    if (!wmsUrl) {
      return NextResponse.json(
        { error: 'URL parameter required' },
        { status: 400 }
      );
    }

    // Décoder l'URL
    const decodedUrl = decodeURIComponent(wmsUrl);
    console.log(`[CadastreProxy] 🔵 Fetching: ${decodedUrl.substring(0, 150)}...`);

    // Récupérer l'image depuis IGN
    const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'SACIMO/1.0',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[CadastreProxy] ❌ IGN API returned ${response.status}:`, errorText.substring(0, 200));
      return NextResponse.json(
        { error: `IGN API error: ${response.status}`, details: errorText.substring(0, 200) },
        { status: response.status }
      );
    }

    // Vérifier que c'est bien une image
    const contentType = response.headers.get('content-type') || 'image/png';
    if (!contentType.includes('image')) {
      const errorText = await response.text();
      console.error(`[CadastreProxy] ❌ Not an image, got:`, errorText.substring(0, 200));
      return NextResponse.json(
        { error: 'IGN returned non-image response', details: errorText.substring(0, 200) },
        { status: 500 }
      );
    }

    // Récupérer l'image
    const imageBuffer = await response.arrayBuffer();
    console.log(`[CadastreProxy] ✅ Image fetched, size: ${imageBuffer.byteLength} bytes`);

    // Retourner l'image avec les bons headers CORS
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error: any) {
    console.error('[CadastreProxy] 💥 Error:', error);
    return NextResponse.json(
      { error: error.message || 'Proxy error' },
      { status: 500 }
    );
  }
}

