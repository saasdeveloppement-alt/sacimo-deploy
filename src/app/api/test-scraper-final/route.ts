import { NextRequest, NextResponse } from 'next/server';
import { leboncoinZenRowsScraper, LeBonCoinSearchParams } from '@/lib/scrapers/leboncoin-zenrows';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log(">>> ROUTE LEBONCOIN DISABLED (annonceScrape write blocked)");
    return NextResponse.json({
      success: false,
      message: "Route test-scraper-final désactivée pour garder annonceScrape 100% Melo.io"
    }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const ville = searchParams.get('ville') || 'Paris';
    const minPrix = searchParams.get('minPrix') ? parseInt(searchParams.get('minPrix')!) : undefined;
    const maxPrix = searchParams.get('maxPrix') ? parseInt(searchParams.get('maxPrix')!) : undefined;
    const minSurface = searchParams.get('minSurface') ? parseInt(searchParams.get('minSurface')!) : undefined;
    const maxSurface = searchParams.get('maxSurface') ? parseInt(searchParams.get('maxSurface')!) : undefined;
    const typeBien = searchParams.get('typeBien') as any;
    const pieces = searchParams.get('pieces') ? parseInt(searchParams.get('pieces')!) : undefined;
    const pages = searchParams.get('pages') ? parseInt(searchParams.get('pages')!) : 2;

    const params: LeBonCoinSearchParams = {
      ville,
      minPrix,
      maxPrix,
      minSurface,
      maxSurface,
      typeBien,
      pieces,
      pages,
    };

    console.log('🚀 Début du scraping LeBonCoin final avec paramètres:', params);

    // Scraping des annonces avec ZenRows
    const annonces = await leboncoinZenRowsScraper.scrapeAnnonces(params);
    console.log(`✅ Scraping ZenRows réussi: ${annonces.length} annonces`);

    // Sauvegarde en base de données
    const savedAnnonces = [];
    for (const annonce of annonces) {
      try {
        const savedAnnonce = await prisma.annonceScrape.upsert({
          where: { url: annonce.url },
          update: {
            title: annonce.title,
            price: annonce.price,
            surface: annonce.surface,
            rooms: annonce.rooms,
            postalCode: annonce.postalCode,
            city: annonce.city,
            publishedAt: annonce.publishedAt,
            images: annonce.images,
            description: annonce.description,
            lastScrapedAt: new Date(),
            isNew: false,
          },
          create: {
            title: annonce.title,
            price: annonce.price,
            surface: annonce.surface,
            rooms: annonce.rooms,
            postalCode: annonce.postalCode,
            city: annonce.city,
            url: annonce.url,
            publishedAt: annonce.publishedAt,
            images: annonce.images,
            description: annonce.description,
            source: 'LEBONCOIN',
            isNew: true,
            lastScrapedAt: new Date(),
          },
        });
        savedAnnonces.push(savedAnnonce);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'annonce:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Scraping LeBonCoin final terminé ! ${savedAnnonces.length} annonces traitées`,
      data: {
        totalFound: annonces.length,
        totalSaved: savedAnnonces.length,
        newAnnonces: savedAnnonces.filter(a => a.isNew).length,
        updatedAnnonces: savedAnnonces.filter(a => !a.isNew).length,
        annonces: savedAnnonces.slice(0, 10),
      },
      params,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Erreur lors du scraping LeBonCoin final:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur lors du scraping LeBonCoin final',
      error: error.message 
    }, { status: 500 });
  }
}










