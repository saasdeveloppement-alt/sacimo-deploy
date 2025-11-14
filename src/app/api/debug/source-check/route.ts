import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const total = await prisma.annonceScrape.count()
  const melo = await prisma.annonceScrape.count({ where: { source: "MELO" } })
  const lbc = await prisma.annonceScrape.count({ where: { source: "LEBONCOIN" } })

  return NextResponse.json({
    total,
    melo,
    leboncoin: lbc,
  })
}


