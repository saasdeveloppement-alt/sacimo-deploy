import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log(">>> ROUTE DASHBOARD SANS BDD / MOCK");

  return NextResponse.json({
    status: 'success',
    data: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 0,
      pages: 0
    },
    stats: {
      total: 0,
      avgPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      cities: [],
      sellers: {
        private: 0,
        professional: 0
      }
    },
    message: 'TODO: Brancher Melo.io pour alimenter cette route (aucune donnée mock retournée)'
  });
}