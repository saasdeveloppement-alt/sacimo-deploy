/**
 * Service de gestion des exclusions de candidats
 * Évite de reproposer les mêmes candidats lors des relances
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CandidateFingerprint {
  coords: { lat: number; lng: number };
  bbox?: { north: number; south: number; east: number; west: number };
  score?: number;
  piscineHash?: string;
  roofHash?: string;
  parcelId?: string;
}

export interface ExcludedCandidate {
  coords: { lat: number; lng: number };
  bbox?: { north: number; south: number; east: number; west: number };
  piscineHash?: string;
  roofHash?: string;
  parcelId?: string;
}

/**
 * Charge tous les candidats déjà proposés pour un requestId
 */
export async function loadExcludedCandidates(requestId: string): Promise<ExcludedCandidate[]> {
  try {
    const runs = await prisma.localisationRun.findMany({
      where: { requestId },
      orderBy: { createdAt: 'asc' },
    });

    const excluded: ExcludedCandidate[] = [];

    for (const run of runs) {
      const candidates = run.candidates as CandidateFingerprint[];
      for (const candidate of candidates) {
        excluded.push({
          coords: candidate.coords,
          bbox: candidate.bbox,
          piscineHash: candidate.piscineHash,
          roofHash: candidate.roofHash,
          parcelId: candidate.parcelId,
        });
      }
    }

    console.log(`[ExclusionService] Loaded ${excluded.length} excluded candidates for requestId: ${requestId}`);
    return excluded;
  } catch (error) {
    console.error('[ExclusionService] Error loading excluded candidates:', error);
    return [];
  }
}

/**
 * Vérifie si un candidat doit être exclu
 */
export function shouldExcludeCandidate(
  candidate: CandidateFingerprint,
  excluded: ExcludedCandidate[]
): { exclude: boolean; reason?: string } {
  for (const excludedCandidate of excluded) {
    // 1. Exclusion par coordonnées identiques (±0.0001° ≈ ±11m)
    const latDiff = Math.abs(candidate.coords.lat - excludedCandidate.coords.lat);
    const lngDiff = Math.abs(candidate.coords.lng - excludedCandidate.coords.lng);
    if (latDiff < 0.0001 && lngDiff < 0.0001) {
      return { exclude: true, reason: 'coords_identical' };
    }

    // 2. Exclusion par parcelle cadastrale identique
    if (candidate.parcelId && excludedCandidate.parcelId && candidate.parcelId === excludedCandidate.parcelId) {
      return { exclude: true, reason: 'parcel_identical' };
    }

    // 3. Exclusion par hash de piscine identique
    if (candidate.piscineHash && excludedCandidate.piscineHash && candidate.piscineHash === excludedCandidate.piscineHash) {
      return { exclude: true, reason: 'piscine_hash_identical' };
    }

    // 4. Exclusion par hash de toiture identique
    if (candidate.roofHash && excludedCandidate.roofHash && candidate.roofHash === excludedCandidate.roofHash) {
      return { exclude: true, reason: 'roof_hash_identical' };
    }

    // 5. Exclusion par bbox similaire (±50m)
    if (candidate.bbox && excludedCandidate.bbox) {
      const bboxDiff = {
        north: Math.abs(candidate.bbox.north - excludedCandidate.bbox.north),
        south: Math.abs(candidate.bbox.south - excludedCandidate.bbox.south),
        east: Math.abs(candidate.bbox.east - excludedCandidate.bbox.east),
        west: Math.abs(candidate.bbox.west - excludedCandidate.bbox.west),
      };
      
      // ~50m = 0.00045° à l'équateur
      const threshold = 0.00045;
      if (
        bboxDiff.north < threshold &&
        bboxDiff.south < threshold &&
        bboxDiff.east < threshold &&
        bboxDiff.west < threshold
      ) {
        return { exclude: true, reason: 'bbox_similar' };
      }
    }
  }

  return { exclude: false };
}

/**
 * Filtre une liste de candidats en excluant ceux déjà proposés
 */
export function filterExcludedCandidates(
  candidates: CandidateFingerprint[],
  excluded: ExcludedCandidate[]
): { filtered: CandidateFingerprint[]; excludedCount: number; exclusionLog: Array<{ candidate: CandidateFingerprint; reason: string }> } {
  const filtered: CandidateFingerprint[] = [];
  const exclusionLog: Array<{ candidate: CandidateFingerprint; reason: string }> = [];

  for (const candidate of candidates) {
    const { exclude, reason } = shouldExcludeCandidate(candidate, excluded);
    if (exclude && reason) {
      exclusionLog.push({ candidate, reason });
      console.log(`[ExclusionService] Excluding candidate at ${candidate.coords.lat}, ${candidate.coords.lng} - Reason: ${reason}`);
    } else {
      filtered.push(candidate);
    }
  }

  return {
    filtered,
    excludedCount: exclusionLog.length,
    exclusionLog,
  };
}

/**
 * Calcule un hash simple pour une piscine (basé sur forme, dimensions, position)
 */
export function computePiscineHash(piscineData?: {
  forme?: string;
  dimensions?: string;
  position?: string;
  couleur?: string;
}): string | undefined {
  if (!piscineData) return undefined;
  
  const parts = [
    piscineData.forme || '',
    piscineData.dimensions || '',
    piscineData.position || '',
    piscineData.couleur || '',
  ].filter(Boolean);
  
  if (parts.length === 0) return undefined;
  
  // Hash simple (pourrait être amélioré avec crypto)
  return parts.join('|').toLowerCase().replace(/\s+/g, '');
}

/**
 * Calcule un hash simple pour une toiture (basé sur couleur, matériau, forme)
 */
export function computeRoofHash(roofData?: {
  couleur?: string;
  materiau?: string;
  forme?: string;
}): string | undefined {
  if (!roofData) return undefined;
  
  const parts = [
    roofData.couleur || '',
    roofData.materiau || '',
    roofData.forme || '',
  ].filter(Boolean);
  
  if (parts.length === 0) return undefined;
  
  return parts.join('|').toLowerCase().replace(/\s+/g, '');
}

