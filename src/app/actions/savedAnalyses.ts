"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface SavedAnalysisData {
  postalCodes: string[];
  topAgencies: Array<{
    rank: number;
    name: string;
    annonces: number;
    prixMoyen: number;
    partMarche: number;
  }>;
  statistics: {
    totalListings: number;
    avgMarketPrice: number;
    activeCompetitors: number;
    totalMarketShare: number;
  };
  competitors: Array<{
    id: string;
    name: string;
    location: string;
    listingsCount: number;
    avgPrice: number;
    marketShare: number;
    rank?: number;
    isGrowing?: boolean;
    trend?: number;
  }>;
}

export interface SavedAnalysis {
  id: string;
  label: string;
  postalCodes: string[];
  data: SavedAnalysisData;
  createdAt: Date;
  updatedAt: Date;
}

export async function saveAnalysis(
  label: string,
  postalCodes: string[],
  data: SavedAnalysisData
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Non authentifié" };
    }

    const saved = await prisma.savedAnalysis.create({
      data: {
        userId: session.user.id,
        label,
        postalCodes,
        data: data as any,
      },
    });

    return { success: true, id: saved.id };
  } catch (error) {
    console.error("Error saving analysis:", error);
    return {
      success: false,
      error: `Erreur lors de la sauvegarde: ${(error as Error).message}`,
    };
  }
}

export async function getSavedAnalyses(): Promise<SavedAnalysis[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return [];
    }

    const analyses = await prisma.savedAnalysis.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return analyses.map((a) => ({
      id: a.id,
      label: a.label,
      postalCodes: a.postalCodes,
      data: a.data as SavedAnalysisData,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));
  } catch (error) {
    console.error("Error getting saved analyses:", error);
    return [];
  }
}

export async function loadSavedAnalysis(
  id: string
): Promise<SavedAnalysis | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return null;
    }

    const analysis = await prisma.savedAnalysis.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!analysis) {
      return null;
    }

    return {
      id: analysis.id,
      label: analysis.label,
      postalCodes: analysis.postalCodes,
      data: analysis.data as SavedAnalysisData,
      createdAt: analysis.createdAt,
      updatedAt: analysis.updatedAt,
    };
  } catch (error) {
    console.error("Error loading saved analysis:", error);
    return null;
  }
}

export async function deleteSavedAnalysis(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Non authentifié" };
    }

    await prisma.savedAnalysis.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting saved analysis:", error);
    return {
      success: false,
      error: `Erreur lors de la suppression: ${(error as Error).message}`,
    };
  }
}



