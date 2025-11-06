import { NextRequest, NextResponse } from 'next/server';
import { leboncoinScraper, LeBonCoinSearchParams } from '@/lib/scrapers/leboncoin';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchId, params } = body;

    if (!searchId) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID de recherche requis' 
      }, { status: 400 });
    }

    // Récupérer la recherche depuis la base de données
    const search = await prisma.search.findUnique({
      where: { id: searchId },
      include: { user: true }
    });

    if (!search) {
      return NextResponse.json({ 
        success: false, 
        message: 'Recherche non trouvée' 
      }, { status: 404 });
    }

    // Paramètres de recherche
    const searchParams: LeBonCoinSearchParams = {
      location: search.location,
      minPrice: search.minPrice || undefined,
      maxPrice: search.maxPrice || undefined,
      minSurface: search.minSurface || undefined,
      maxSurface: search.maxSurface || undefined,
      propertyType: search.propertyType as any,
      rooms: search.rooms || undefined,
    };

    // Scraper les annonces
    const listings = await leboncoinScraper.searchListings(searchParams);

    // Sauvegarder les annonces dans la base de données
    const savedListings = [];
    for (const listing of listings) {
      try {
        const savedListing = await prisma.listing.upsert({
          where: { 
            sourceId: listing.id 
          },
          update: {
            title: listing.title,
            price: listing.price,
            surface: listing.surface,
            rooms: listing.rooms,
            location: listing.location,
            description: listing.description,
            images: listing.images,
            url: listing.url,
            publishedAt: listing.publishedAt,
            isNew: listing.isNew,
            lastScrapedAt: new Date(),
          },
          create: {
            sourceId: listing.id,
            title: listing.title,
            price: listing.price,
            surface: listing.surface,
            rooms: listing.rooms,
            location: listing.location,
            description: listing.description,
            images: listing.images,
            url: listing.url,
            publishedAt: listing.publishedAt,
            source: 'LEBONCOIN',
            propertyType: listing.propertyType as any,
            isNew: listing.isNew,
            searchId: search.id,
            agencyId: search.user.agencyId,
            lastScrapedAt: new Date(),
          },
        });
        savedListings.push(savedListing);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'annonce:', error);
      }
    }

    // Mettre à jour la recherche
    await prisma.search.update({
      where: { id: searchId },
      data: {
        lastScrapedAt: new Date(),
        resultCount: savedListings.length,
      }
    });

    return NextResponse.json({
      success: true,
      message: `${savedListings.length} annonces LeBonCoin trouvées et sauvegardées`,
      listings: savedListings,
      searchId: search.id,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Erreur lors du scraping LeBonCoin:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur lors du scraping LeBonCoin',
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchId = searchParams.get('searchId');

    if (!searchId) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID de recherche requis' 
      }, { status: 400 });
    }

    // Récupérer les annonces de la recherche
    const listings = await prisma.listing.findMany({
      where: { 
        searchId: searchId,
        source: 'LEBONCOIN'
      },
      orderBy: { publishedAt: 'desc' },
      take: 50
    });

    return NextResponse.json({
      success: true,
      message: `${listings.length} annonces LeBonCoin trouvées`,
      listings,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Erreur lors de la récupération des annonces:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur lors de la récupération des annonces',
      error: error.message 
    }, { status: 500 });
  }
}










