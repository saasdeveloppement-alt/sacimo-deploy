import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Récupérer les paramètres de filtrage
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'publishedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Construire la clause WHERE pour Prisma
    const where: any = {};

    if (city && city !== 'all') {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice);
      if (maxPrice) where.price.lte = parseInt(maxPrice);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Construire la clause ORDER BY
    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'publishedAt') {
      orderBy.publishedAt = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    // Exécuter les requêtes en parallèle
    const [annonces, total, stats] = await Promise.all([
      prisma.annonceScrape.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.annonceScrape.count({ where }),
      prisma.annonceScrape.aggregate({
        where,
        _count: { id: true },
        _avg: { price: true },
        _min: { price: true },
        _max: { price: true },
      }),
    ]);

    // Statistiques par ville (PostgreSQL raw query pour meilleures performances)
    let sqlQuery = `
      SELECT
        city,
        COUNT(DISTINCT url) as count,
        AVG(price)::numeric as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM annonce_scrapes
    `;
    const sqlParams: any[] = [];
    const conditions: string[] = [];

    if (city && city !== 'all') {
      conditions.push(`LOWER(city) LIKE LOWER($${sqlParams.length + 1})`);
      sqlParams.push(`%${city}%`);
    }

    if (minPrice) {
      conditions.push(`price >= $${sqlParams.length + 1}`);
      sqlParams.push(minPrice);
    }

    if (maxPrice) {
      conditions.push(`price <= $${sqlParams.length + 1}`);
      sqlParams.push(maxPrice);
    }

    if (conditions.length > 0) {
      sqlQuery += ` WHERE ${conditions.join(' AND ')}`;
    }

    sqlQuery += ` GROUP BY city ORDER BY count DESC LIMIT 10`;

    const cityStats = await prisma.$queryRawUnsafe<Array<{
      city: string;
      count: bigint;
      avg_price: number;
      min_price: number;
      max_price: number;
    }>>(sqlQuery, ...sqlParams);

    // Statistiques particuliers/professionnels (utiliser isNew comme proxy)
    const sellerStats = await prisma.annonceScrape.groupBy({
      by: ['isNew'],
      where,
      _count: { id: true },
    });

    return NextResponse.json({
      status: 'success',
      data: annonces,
      pagination: {
        total: Number(total),
        page,
        limit,
        totalPages: Math.ceil(Number(total) / limit),
      },
      stats: {
        total: stats._count.id,
        avgPrice: stats._avg.price ? Math.round(stats._avg.price) : 0,
        minPrice: stats._min.price || 0,
        maxPrice: stats._max.price || 0,
        cities: cityStats.map(c => ({
          city: c.city,
          count: Number(c.count),
          avgPrice: Math.round(Number(c.avg_price)),
          minPrice: Number(c.min_price),
          maxPrice: Number(c.max_price),
        })),
        sellers: {
          private: sellerStats.find(s => s.isNew)?._count.id || 0,
          professional: sellerStats.find(s => !s.isNew)?._count.id || 0,
        },
      },
    });
  } catch (error: any) {
    console.error('❌ Erreur récupération annonces:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Erreur lors de la récupération des annonces',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
