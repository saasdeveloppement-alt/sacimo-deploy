/**
 * Route API pour récupérer l'historique des Piges
 * GET /api/piges/history
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
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

    // Récupérer l'historique des scans de l'utilisateur
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const history = await prisma.userScan.findMany({
      where: {
        userId: userId,
        hour: {
          gte: oneDayAgo,
        },
      },
      orderBy: {
        hour: "desc",
      },
      take: 50, // Dernières 50 heures
    });

    return NextResponse.json({
      status: "ok",
      history: history.map((scan) => ({
        hour: scan.hour,
        count: scan.count,
        createdAt: scan.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("❌ [Piges] Erreur lors de la récupération de l'historique:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Erreur lors de la récupération de l'historique",
      },
      { status: 500 }
    );
  }
}

