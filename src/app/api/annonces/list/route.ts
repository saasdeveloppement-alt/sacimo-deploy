import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Paramètres de recherche texte (legacy)
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city'); // Legacy, pour compatibilité
    
    // Nouveaux paramètres de filtres avancés
    const cities = searchParams.getAll('cities'); // Array de villes
    const types = searchParams.getAll('types'); // Array de types
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minSurface = searchParams.get('minSurface');
    const maxSurface = searchParams.get('maxSurface');
    const rooms = searchParams.get('rooms');
    const sellerType = searchParams.get('sellerType'); // 'private' | 'professional'
    const dateFrom = searchParams.get('dateFrom'); // ISO date string
    
    // Paramètres de tri et pagination
    const sortBy = searchParams.get('sortBy') || 'publishedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    
    // Recherche texte (legacy)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Filtres par villes (array)
    if (cities.length > 0) {
      where.city = { in: cities };
    } else if (city && city !== 'all') {
      // Legacy: compatibilité avec l'ancien paramètre city
      where.city = { contains: city, mode: 'insensitive' };
    }
    
    // Filtres par prix
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice);
      if (maxPrice) where.price.lte = parseInt(maxPrice);
    }
    
    // Filtres par surface
    if (minSurface || maxSurface) {
      where.surface = {};
      if (minSurface) where.surface.gte = parseInt(minSurface);
      if (maxSurface) where.surface.lte = parseInt(maxSurface);
    }
    
    // Filtre par nombre de pièces
    if (rooms) {
      where.rooms = parseInt(rooms);
    }
    
    // Filtre par type de vendeur (utiliser isNew comme proxy)
    if (sellerType === 'private') {
      where.isNew = true; // Nouvelle annonce = particulier
    } else if (sellerType === 'professional') {
      where.isNew = false; // Ancienne annonce = professionnel
    }
    
    // Filtre par date de publication
    if (dateFrom) {
      where.publishedAt = {
        gte: new Date(dateFrom)
      };
    }
    
    // Filtres par types (il faudra extraire le type depuis le titre/URL côté client ou ajouter un champ type dans Prisma)
    // Pour l'instant, on ne peut pas filtrer par type car ce n'est pas stocké dans la base
    // TODO: Ajouter un champ type dans le modèle AnnonceScrape

    const [data, total] = await Promise.all([
      prisma.annonceScrape.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.annonceScrape.count({ where })
    ]);

    const allAnnonces = await prisma.annonceScrape.findMany({ where });
    
    // Convertir les dates en strings pour éviter les erreurs de sérialisation
    const serializedData = data.map(annonce => ({
      ...annonce,
      publishedAt: annonce.publishedAt.toISOString(),
      createdAt: annonce.createdAt.toISOString(),
      updatedAt: annonce.updatedAt.toISOString(),
      lastScrapedAt: annonce.lastScrapedAt.toISOString()
    }));
    
    const stats = {
      total: total,
      avgPrice: allAnnonces.length > 0 ? Math.round(
        allAnnonces.reduce((sum, a) => sum + a.price, 0) / allAnnonces.length
      ) : 0,
      minPrice: allAnnonces.length > 0 ? Math.min(...allAnnonces.map(a => a.price)) : 0,
      maxPrice: allAnnonces.length > 0 ? Math.max(...allAnnonces.map(a => a.price)) : 0,
      cities: Object.entries(
        allAnnonces.reduce((acc, a) => {
          const cityName = a.city || 'Inconnu';
          acc[cityName] = acc[cityName] || { count: 0, prices: [] };
          acc[cityName].count++;
          acc[cityName].prices.push(a.price);
          return acc;
        }, {} as Record<string, { count: number; prices: number[] }>)
      ).map(([city, data]) => ({
        city,
        count: data.count,
        avgPrice: Math.round(data.prices.reduce((a, b) => a + b, 0) / data.count),
        minPrice: Math.min(...data.prices),
        maxPrice: Math.max(...data.prices)
      })).sort((a, b) => b.count - a.count),
      sellers: {
        private: allAnnonces.length,
        professional: 0
      }
    };

    return NextResponse.json({
      status: 'success',
      data: serializedData,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      stats
    });

  } catch (error: any) {
    console.error('❌ Erreur API /api/annonces/list:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 });
  }
}