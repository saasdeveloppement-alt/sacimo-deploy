import { NextResponse } from 'next/server';
import { leboncoinScraper } from '@/lib/scrapers/leboncoin';

export async function GET() {
  try {
    console.log('🧪 Test du scraping LeBonCoin...');
    
    // Test avec des paramètres de recherche
    const testParams = {
      location: 'Paris',
      minPrice: 300000,
      maxPrice: 500000,
      minSurface: 30,
      maxSurface: 80,
      propertyType: 'APARTMENT' as const,
      rooms: 3,
    };

    const listings = await leboncoinScraper.searchListings(testParams);

    return NextResponse.json({
      success: true,
      message: `Test de scraping réussi ! ${listings.length} annonces trouvées`,
      testParams,
      listings,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Erreur lors du test de scraping:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur lors du test de scraping',
      error: error.message 
    }, { status: 500 });
  }
}
