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
    
    // Récupérer les annonces et le total
    const [annonces, total] = await Promise.all([
      prisma.annonceScrape.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.annonceScrape.count({ where }),
    ]);
    
    // Compter les annonces par ville (pour les statistiques)
    const stats = await prisma.annonceScrape.aggregateRaw({
      pipeline: [
        ...(Object.keys(where).length > 0 ? [{ $match: where }] : []),
        {
          $group: {
            _id: "$city",
            count: { $sum: 1 },
            avgPrice: { $avg: "$price" },
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ],
    });
    
    return NextResponse.json({
      status: "success",
      data: annonces,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: stats,
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

