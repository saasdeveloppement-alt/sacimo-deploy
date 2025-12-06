import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json({ error: 'Coords required' }, { status: 400 });
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    console.log('📍 Cadastre request:', latNum, lngNum);

    // Calculer la bbox (400m x 400m)
    const deltaLat = 0.0018;
    const deltaLng = 0.0027;
    
    const bbox = [
      lngNum - deltaLng,
      latNum - deltaLat,
      lngNum + deltaLng,
      latNum + deltaLat
    ].join(',');

    // ESSAI 1: Service cadastre.data.gouv.fr (officiel Etalab)
    try {
      const wmsUrl1 = new URL('https://cadastre.data.gouv.fr/bundler/cadastre-etalab/wms');
      wmsUrl1.searchParams.set('SERVICE', 'WMS');
      wmsUrl1.searchParams.set('VERSION', '1.3.0');
      wmsUrl1.searchParams.set('REQUEST', 'GetMap');
      wmsUrl1.searchParams.set('LAYERS', 'parcelles');
      wmsUrl1.searchParams.set('STYLES', '');
      wmsUrl1.searchParams.set('FORMAT', 'image/png');
      wmsUrl1.searchParams.set('TRANSPARENT', 'TRUE');
      wmsUrl1.searchParams.set('CRS', 'EPSG:4326');
      wmsUrl1.searchParams.set('WIDTH', '1200');
      wmsUrl1.searchParams.set('HEIGHT', '1200');
      wmsUrl1.searchParams.set('BBOX', bbox);

      console.log('🌐 [Cadastre] Trying cadastre.data.gouv.fr...');

      const imageResponse1 = await fetch(wmsUrl1.toString(), {
        headers: {
          'User-Agent': 'SACIMO/1.0',
        },
      });

      if (imageResponse1.ok) {
        const contentType = imageResponse1.headers.get('content-type');
        if (contentType?.includes('image')) {
          const imageBuffer = await imageResponse1.arrayBuffer();
          if (imageBuffer.byteLength > 1000) {
            console.log('✅ [Cadastre] Success with cadastre.data.gouv.fr:', imageBuffer.byteLength, 'bytes');
            return new NextResponse(imageBuffer, {
              status: 200,
              headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=86400',
              },
            });
          }
        }
      }
      console.log('⚠️ [Cadastre] cadastre.data.gouv.fr failed, trying IGN...');
    } catch (error) {
      console.log('⚠️ [Cadastre] cadastre.data.gouv.fr error:', error);
    }

    // ESSAI 2: Service IGN (fallback fiable)
    try {
      const wmsUrl2 = new URL('https://data.geopf.fr/wms-v/ows');
      wmsUrl2.searchParams.set('SERVICE', 'WMS');
      wmsUrl2.searchParams.set('VERSION', '1.3.0');
      wmsUrl2.searchParams.set('REQUEST', 'GetMap');
      wmsUrl2.searchParams.set('LAYERS', 'CADASTRALPARCELS.PARCELS');
      wmsUrl2.searchParams.set('STYLES', '');
      wmsUrl2.searchParams.set('FORMAT', 'image/png');
      wmsUrl2.searchParams.set('TRANSPARENT', 'TRUE');
      wmsUrl2.searchParams.set('CRS', 'EPSG:4326');
      wmsUrl2.searchParams.set('WIDTH', '1200');
      wmsUrl2.searchParams.set('HEIGHT', '1200');
      wmsUrl2.searchParams.set('BBOX', bbox);

      console.log('🌐 [Cadastre] Trying IGN WMS...');

      const imageResponse2 = await fetch(wmsUrl2.toString(), {
        headers: {
          'User-Agent': 'SACIMO/1.0',
        },
      });

      if (imageResponse2.ok) {
        const contentType = imageResponse2.headers.get('content-type');
        if (contentType?.includes('image')) {
          const imageBuffer = await imageResponse2.arrayBuffer();
          if (imageBuffer.byteLength > 1000) {
            console.log('✅ [Cadastre] Success with IGN WMS:', imageBuffer.byteLength, 'bytes');
            return new NextResponse(imageBuffer, {
              status: 200,
              headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=86400',
              },
            });
          }
        }
      }
      console.log('⚠️ [Cadastre] IGN WMS failed, trying alternative IGN endpoint...');
    } catch (error) {
      console.log('⚠️ [Cadastre] IGN WMS error:', error);
    }

    // ESSAI 3: Alternative IGN endpoint
    try {
      const wmsUrl3 = new URL('https://data.geopf.fr/wms-r/wms');
      wmsUrl3.searchParams.set('SERVICE', 'WMS');
      wmsUrl3.searchParams.set('VERSION', '1.3.0');
      wmsUrl3.searchParams.set('REQUEST', 'GetMap');
      wmsUrl3.searchParams.set('LAYERS', 'CADASTRALPARCELS.PARCELS');
      wmsUrl3.searchParams.set('STYLES', 'normal');
      wmsUrl3.searchParams.set('FORMAT', 'image/png');
      wmsUrl3.searchParams.set('TRANSPARENT', 'TRUE');
      wmsUrl3.searchParams.set('CRS', 'EPSG:4326');
      wmsUrl3.searchParams.set('WIDTH', '1200');
      wmsUrl3.searchParams.set('HEIGHT', '1200');
      wmsUrl3.searchParams.set('BBOX', bbox);

      console.log('🌐 [Cadastre] Trying IGN WMS-R...');

      const imageResponse3 = await fetch(wmsUrl3.toString(), {
        headers: {
          'User-Agent': 'SACIMO/1.0',
        },
      });

      if (imageResponse3.ok) {
        const contentType = imageResponse3.headers.get('content-type');
        if (contentType?.includes('image')) {
          const imageBuffer = await imageResponse3.arrayBuffer();
          if (imageBuffer.byteLength > 1000) {
            console.log('✅ [Cadastre] Success with IGN WMS-R:', imageBuffer.byteLength, 'bytes');
            return new NextResponse(imageBuffer, {
              status: 200,
              headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=86400',
              },
            });
          }
        }
      }
    } catch (error) {
      console.log('⚠️ [Cadastre] IGN WMS-R error:', error);
    }

    // FALLBACK: SVG avec message d'erreur
    console.error('❌ [Cadastre] All WMS services failed');
    const svg = `
      <svg width="1200" height="1200" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="1200" fill="#f5f5f5"/>
        <text x="600" y="580" font-family="Arial" font-size="24" fill="#666" text-anchor="middle">
          Plan cadastral
        </text>
        <text x="600" y="620" font-family="Arial" font-size="16" fill="#999" text-anchor="middle">
          Service temporairement indisponible
        </text>
        <text x="600" y="650" font-family="Arial" font-size="12" fill="#aaa" text-anchor="middle">
          Coordonnées: ${latNum.toFixed(4)}, ${lngNum.toFixed(4)}
        </text>
      </svg>
    `;
    
    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error: any) {
    console.error('💥 Cadastre error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Erreur cadastre' },
      { status: 500 }
    );
  }
}
