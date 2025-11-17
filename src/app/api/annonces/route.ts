import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { z } from "zod"

const querySchema = z.object({
  ville: z.string().trim().min(1).optional(),
  postalCode: z.string().trim().min(1).optional(),
  type: z.string().trim().min(1).optional(),
  roomsMin: z.coerce.number().int().min(0).optional(),
  roomsMax: z.coerce.number().int().min(0).optional(),
  prixMin: z.coerce.number().int().min(0).optional(),
  prixMax: z.coerce.number().int().min(0).optional(),
  surfaceMin: z.coerce.number().int().min(0).optional(),
  surfaceMax: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(20),
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  try {
    const parsed = querySchema.parse({
      ville: searchParams.get("ville") || undefined,
      postalCode: searchParams.get("postalCode") || undefined,
      type: searchParams.get("type") || undefined,
      roomsMin: searchParams.get("roomsMin") || undefined,
      roomsMax: searchParams.get("roomsMax") || undefined,
      prixMin: searchParams.get("prixMin") || undefined,
      prixMax: searchParams.get("prixMax") || undefined,
      surfaceMin: searchParams.get("surfaceMin") || undefined,
      surfaceMax: searchParams.get("surfaceMax") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    })

    const { page, limit, ...filters } = parsed
    const skip = (page - 1) * limit

    const where: Prisma.AnnonceScrapeWhereInput = {}

    if (filters.ville) {
      where.city = { contains: filters.ville, mode: "insensitive" }
    }

    if (filters.postalCode) {
      where.postalCode = { startsWith: filters.postalCode }
    }

    if (filters.type) {
      where.title = { contains: filters.type, mode: "insensitive" }
    }

    if (filters.prixMin !== undefined || filters.prixMax !== undefined) {
      where.price = {}
      if (filters.prixMin !== undefined) where.price.gte = filters.prixMin
      if (filters.prixMax !== undefined) where.price.lte = filters.prixMax
    }

    if (filters.surfaceMin !== undefined || filters.surfaceMax !== undefined) {
      where.surface = {}
      if (filters.surfaceMin !== undefined) where.surface.gte = filters.surfaceMin
      if (filters.surfaceMax !== undefined) where.surface.lte = filters.surfaceMax
    }

    if (filters.roomsMin !== undefined || filters.roomsMax !== undefined) {
      where.rooms = {}
      if (filters.roomsMin !== undefined) where.rooms.gte = filters.roomsMin
      if (filters.roomsMax !== undefined) where.rooms.lte = filters.roomsMax
    }

    const [total, annonces] = await prisma.$transaction([
      prisma.annonceScrape.count({ where }),
      prisma.annonceScrape.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          price: true,
          surface: true,
          rooms: true,
          postalCode: true,
          city: true,
          url: true,
          images: true,
          picturesRemote: true,
          pictures: true,
          description: true,
          publishedAt: true,
        },
      }),
    ])

    const pages = Math.max(1, Math.ceil(total / limit))

    return NextResponse.json({
      data: annonces,
      total,
      page,
      pages,
    })
  } catch (error) {
    console.error("❌ Erreur API /annonces:", error)
    return NextResponse.json(
      { error: "UNABLE_TO_FETCH_ANNONCES" },
      { status: 500 },
    )
  }
}