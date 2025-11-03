import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Récupérer les filtres depuis les query params
    const city = searchParams.get("city");
    const minPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined;
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "publishedAt"; // publishedAt, price
    const sortOrder = searchParams.get("sortOrder") || "desc"; // asc, desc
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;
    
    // Construire les filtres Prisma
    const where: any = {};
    
    if (city) {
      where.city = city;
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = minPrice;
      }
      if (maxPrice) {
        where.price.lte = maxPrice;
      }
    }
    
    // Filtre par recherche textuelle
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    
    // Construire le tri
    const orderBy: any = {};
    if (sortBy === "price") {
      orderBy.price = sortOrder;
    } else if (sortBy === "publishedAt") {
      orderBy.publishedAt = sortOrder;
    }
    
    // Récupérer les annonces (url est déjà unique dans le schéma, donc pas de doublons)
    const [annonces, total, stats] = await Promise.all([
      prisma.annonceScrape.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.annonceScrape.count({ where }),
      // Statistiques globales
      prisma.annonceScrape.aggregate({
        where,
        _count: {
          id: true,
        },
        _avg: {
          price: true,
        },
        _min: {
          price: true,
        },
        _max: {
          price: true,
        },
      }),
    ]);
    
    // Statistiques par ville - construire la requête SQL conditionnellement
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
    
    if (city) {
      conditions.push(`city = $${sqlParams.length + 1}`);
      sqlParams.push(city);
    }
    if (minPrice) {
      conditions.push(`price >= $${sqlParams.length + 1}`);
      sqlParams.push(minPrice);
    }
    if (maxPrice) {
      conditions.push(`price <= $${sqlParams.length + 1}`);
      sqlParams.push(maxPrice);
    }
    if (search) {
      conditions.push(`(title ILIKE $${sqlParams.length + 1} OR description ILIKE $${sqlParams.length + 1})`);
      sqlParams.push(`%${search}%`);
      sqlParams.push(`%${search}%`);
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
    
    // Statistiques particuliers/professionnels (toujours true pour LeBonCoin, mais préparé pour le futur)
    const sellerStats = await prisma.annonceScrape.groupBy({
      by: ['isNew'], // Utiliser isNew comme proxy (nouvelles = true)
      where,
      _count: {
        id: true,
      },
    });
    
    return NextResponse.json({
      status: "success",
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
  } catch (err: any) {
    console.error("❌ Erreur récupération annonces:", err);
    return NextResponse.json(
      {
        status: "error",
        message: String(err),
      },
      { status: 500 }
    );
  }
}

