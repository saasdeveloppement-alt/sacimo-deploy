/**
 * Route API pour exécuter une recherche de Piges
 * POST /api/piges/fetch
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runPigeSearch } from "@/services/piges/pigesService";
import type { PigeSearchFilters } from "@/services/piges/pigesService";

export async function POST(req: NextRequest) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json(
        { status: "error", message: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { filters } = body;

    if (!filters) {
      return NextResponse.json(
        { status: "error", message: "Filtres de recherche requis" },
        { status: 400 }
      );
    }

    // Validation des filtres (code postal obligatoire pour MoteurImmo)
    if (!filters.postalCode || filters.postalCode.trim() === "") {
      return NextResponse.json(
        {
          status: "error",
          message: "Le code postal est obligatoire pour utiliser MoteurImmo.",
        },
        { status: 400 }
      );
    }

    // Exécuter la recherche
    const result = await runPigeSearch(filters, userId);

    return NextResponse.json({
      status: "ok",
      data: result.listings,
      meta: {
        total: result.total,
        pages: result.pages,
        hasMore: result.hasMore,
      },
    });
  } catch (error: any) {
    console.error("❌ [Piges] Erreur lors de la recherche:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Erreur lors de la recherche de Piges",
      },
      { status: 400 }
    );
  }
}

