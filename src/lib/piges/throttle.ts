/**
 * Système de throttling pour limiter les scans par utilisateur
 * Protection contre la surcharge de l'API MoteurImmo
 */

import { prisma } from "@/lib/prisma";

const MAX_SCANS_PER_HOUR = 20;

/**
 * Vérifie et limite le nombre de scans par utilisateur par heure
 * @param userId ID de l'utilisateur
 * @param maxScans Nombre maximum de scans autorisés (défaut: 20)
 * @throws Error si la limite est dépassée
 */
export async function throttleUser(
  userId: string,
  maxScans: number = MAX_SCANS_PER_HOUR
): Promise<void> {
  const now = new Date();
  const hourStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    0,
    0,
    0
  );

  // Récupérer ou créer l'enregistrement pour cette heure
  // Vérifier que prisma.userScan existe
  if (!prisma.userScan) {
    throw new Error("Prisma client not properly initialized: userScan model not available");
  }

  // Essayer d'abord de trouver l'enregistrement existant
  const existing = await prisma.userScan.findUnique({
    where: {
      userId_hour: {
        userId,
        hour: hourStart,
      },
    },
  });

  const userScan = existing
    ? await prisma.userScan.update({
        where: {
          userId_hour: {
            userId,
            hour: hourStart,
          },
        },
        data: {
          count: {
            increment: 1,
          },
        },
      })
    : await prisma.userScan.create({
        data: {
          userId,
          hour: hourStart,
          count: 1,
        },
      });

  // Vérifier la limite
  if (userScan.count > maxScans) {
    throw new Error(
      `Limite de scans atteinte: ${maxScans} scans maximum par heure. Réessayez dans ${60 - now.getMinutes()} minutes.`
    );
  }

  // Nettoyer les anciens enregistrements (plus de 24h)
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  try {
    await prisma.userScan.deleteMany({
      where: {
        hour: {
          lt: oneDayAgo,
        },
      },
    });
  } catch (error) {
    // Ignorer les erreurs de nettoyage (non critique)
    console.warn("⚠️ [Throttle] Erreur lors du nettoyage des anciens scans:", error);
  }
}

/**
 * Récupère le nombre de scans effectués par l'utilisateur dans l'heure actuelle
 */
export async function getUserScanCount(userId: string): Promise<number> {
  const now = new Date();
  const hourStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    0,
    0,
    0
  );

  if (!prisma.userScan) {
    console.warn("⚠️ [Throttle] Prisma client not properly initialized");
    return 0;
  }

  const userScan = await prisma.userScan.findUnique({
    where: {
      userId_hour: {
        userId,
        hour: hourStart,
      },
    },
  });

  return userScan?.count || 0;
}

