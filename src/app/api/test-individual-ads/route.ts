import { NextRequest, NextResponse } from 'next/server';
import { leboncoinZenRowsScraper } from '@/lib/scrapers/leboncoin-zenrows';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test de récupération d\'annonces individuelles...');
    
    // Paramètres de test pour Paris avec des critères simples
    const testParams = {
      ville: 'Paris',
      minPrix: 200000,
      maxPrix: 500000,
      minSurface: 20,
      maxSurface: 60,
      typeBien: 'appartement' as const,
      pages: 1 // Une seule page pour le test
    };

    console.log('📋 Paramètres de test:', testParams);

    // Récupération des annonces
    const annonces = await leboncoinZenRowsScraper.scrapeAnnonces(testParams);

    console.log(`✅ Test terminé: ${annonces.length} annonces récupérées`);

    // Formatage des résultats selon la nouvelle interface
    const results = {
      status: "success",
      count: annonces.length,
      annonces: annonces.map(annonce => ({
        title: annonce.title,
        price: annonce.price,
        surface: annonce.surface,
        postalCode: annonce.postalCode,
        image: annonce.images.length > 0 ? annonce.images[0] : null,
        url: annonce.url
      }))
    };

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ville, minPrix, maxPrix, minSurface, maxSurface, typeBien, pages } = body;

    console.log('🧪 Test personnalisé avec paramètres:', body);

    // Paramètres avec validation
    const testParams = {
      ville: ville || 'Paris',
      minPrix: minPrix ? Number(minPrix) : undefined,
      maxPrix: maxPrix ? Number(maxPrix) : undefined,
      minSurface: minSurface ? Number(minSurface) : undefined,
      maxSurface: maxSurface ? Number(maxSurface) : undefined,
      typeBien: typeBien || 'appartement',
      pages: pages ? Number(pages) : 1
    };

    const annonces = await leboncoinZenRowsScraper.scrapeAnnonces(testParams);

    console.log(`✅ Test personnalisé terminé: ${annonces.length} annonces récupérées`);

    const results = {
      status: "success",
      count: annonces.length,
      annonces: annonces.map(annonce => ({
        title: annonce.title,
        price: annonce.price,
        surface: annonce.surface,
        postalCode: annonce.postalCode,
        image: annonce.images.length > 0 ? annonce.images[0] : null,
        url: annonce.url
      }))
    };

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('❌ Erreur lors du test personnalisé:', error);
    
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
