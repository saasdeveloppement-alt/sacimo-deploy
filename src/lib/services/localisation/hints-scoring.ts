/**
 * 🎯 SCORING AVEC HINTS UTILISATEUR
 * 
 * Fonctions de scoring basées sur les hints fournis par l'utilisateur
 */

import { geocodeAddressCandidates } from "@/lib/google/locationClient"
import { getDVFData } from "./dvf"
import type { LocalizationUserHints } from "@/types/localisation"
import type { LocationCandidateRaw } from "./engine"

/**
 * Réduit la zone géographique selon les hints
 */
export async function reduceZoneWithHints(
  candidates: LocationCandidateRaw[],
  hints: LocalizationUserHints
): Promise<LocationCandidateRaw[]> {
  let filtered = [...candidates]

  // Si quartierType = "campagne_isolee", exclure les centres denses
  if (hints.quartierType === "campagne_isolee") {
    // Filtrer les candidats dans les zones urbaines denses
    // Pour l'instant, on garde tous les candidats mais on pourrait utiliser
    // des données de densité de population ou d'urbanisation
    // TODO: Implémenter avec données IGN ou OpenStreetMap
  }

  // Si quartierType = "lotissement_recent" + constructionPeriod = "apres2015"
  if (hints.quartierType === "lotissement_recent" && hints.constructionPeriod === "apres2015") {
    // Privilégier les zones de lotissements récents
    // Pour l'instant, on garde tous les candidats
    // TODO: Utiliser des données cadastrales ou orthophotos pour identifier les lotissements récents
  }

  return filtered
}

/**
 * Score de typologie (match type de bien, mitoyenneté, etc.)
 */
export function scoreTypologie(
  candidate: LocationCandidateRaw,
  hints: LocalizationUserHints
): number {
  let score = 0

  // Pour l'instant, on retourne un score basique
  // TODO: Enrichir avec des données cadastrales ou d'annonces pour vérifier la typologie
  // Exemple : si hints.propertyType = "maison" et hints.housingTypeDetails.maisonMitoyennete = 0
  // alors pénaliser les candidats dans des zones de maisons mitoyennes

  if (hints.propertyType) {
    // Score de base si le type correspond
    score += 0.3
  }

  if (hints.housingTypeDetails?.maisonMitoyennete !== undefined) {
    // Score supplémentaire si mitoyenneté spécifiée
    score += 0.2
  }

  if (hints.constructionPeriod && hints.constructionPeriod !== "inconnu") {
    // Score si période de construction spécifiée
    score += 0.1
  }

  return Math.min(1, score)
}

/**
 * Score prix/surface DVF (cohérence avec les données de ventes)
 */
export async function scorePrixSurfaceDVF(
  candidate: LocationCandidateRaw,
  hints: LocalizationUserHints
): Promise<number> {
  if (!hints.priceRange && !hints.surfaceHabitableRange) {
    return 0.5 // Score neutre si pas de hints
  }

  try {
    const dvfData = await getDVFData(candidate.lat, candidate.lng, 500)

    if (!dvfData) {
      return 0.5 // Score neutre si pas de données DVF
    }

    let score = 0.5 // Base

    // Vérifier la cohérence prix
    if (hints.priceRange && dvfData.prixMoyen) {
      const prixMoyen = dvfData.prixMoyen
      const { min, max } = hints.priceRange

      if (min && max) {
        // Si le prix moyen DVF est dans la fourchette, augmenter le score
        if (prixMoyen >= min * 0.8 && prixMoyen <= max * 1.2) {
          score += 0.3
        } else {
          // Pénaliser si très éloigné
          const ecart = Math.min(
            Math.abs(prixMoyen - min) / min,
            Math.abs(prixMoyen - max) / max
          )
          score -= Math.min(0.3, ecart * 0.5)
        }
      }
    }

    // Vérifier la cohérence surface
    if (hints.surfaceHabitableRange && dvfData.derniereVente?.surface) {
      const surface = dvfData.derniereVente.surface
      const { min, max } = hints.surfaceHabitableRange

      if (min && max) {
        if (surface >= min * 0.9 && surface <= max * 1.1) {
          score += 0.2
        } else {
          const ecart = Math.min(
            Math.abs(surface - min) / min,
            Math.abs(surface - max) / max
          )
          score -= Math.min(0.2, ecart * 0.3)
        }
      }
    }

    return Math.max(0, Math.min(1, score))
  } catch (error) {
    console.warn("⚠️ [Hints Scoring] Erreur scorePrixSurfaceDVF:", error)
    return 0.5
  }
}

/**
 * Score quartier (match type de quartier)
 */
export function scoreQuartier(
  candidate: LocationCandidateRaw,
  hints: LocalizationUserHints
): number {
  if (!hints.quartierType || hints.quartierType === "inconnu") {
    return 0.5
  }

  // Pour l'instant, on retourne un score basique
  // TODO: Utiliser des données géographiques pour identifier le type de quartier
  // (densité de population, type d'urbanisation, etc.)

  return 0.6 // Score légèrement positif si quartierType spécifié
}

/**
 * Score piscine
 */
export function scorePiscine(
  candidate: LocationCandidateRaw,
  hints: LocalizationUserHints
): number {
  if (!hints.piscine || hints.piscine === "inconnu") {
    return 0.5
  }

  // Pour l'instant, on retourne un score basique
  // TODO: Utiliser des données d'annonces ou Street View pour détecter les piscines

  if (hints.piscine === "aucune") {
    // Ne pas pénaliser si aucune piscine (on ne peut pas vérifier facilement)
    return 0.5
  }

  // Si piscine indiquée, score légèrement positif
  return 0.6
}

/**
 * Score repère proche (distance à un POI)
 */
export async function scoreRepere(
  candidate: LocationCandidateRaw,
  hints: LocalizationUserHints
): Promise<number> {
  if (!hints.repereProche?.type || !hints.repereProche?.nom) {
    return 0.5
  }

  try {
    // Géocoder le repère
    const geocoded = await geocodeAddressCandidates(
      [
        {
          rawText: `${hints.repereProche.nom} ${hints.repereProche.type} ${candidate.city || ""} France`,
          score: 1.0,
        },
      ],
      {
        city: candidate.city,
        postalCode: candidate.postalCode,
        country: "France",
      }
    )

    if (geocoded.length === 0) {
      return 0.5
    }

    const repereLocation = geocoded[0]

    // Calculer la distance (formule de Haversine simplifiée)
    const distance = calculateDistance(
      candidate.lat,
      candidate.lng,
      repereLocation.latitude,
      repereLocation.longitude
    )

    // Convertir en minutes à pied (approximation : 5 km/h = 83 m/min)
    const distanceMinutes = distance / 83

    const targetMinutes = hints.repereProche.distanceMinutes || 5

    // Score basé sur la proximité de la distance cible
    const ecart = Math.abs(distanceMinutes - targetMinutes)
    if (ecart <= 2) {
      return 1.0 // Distance très proche de la cible
    } else if (ecart <= 5) {
      return 0.7 // Distance acceptable
    } else if (ecart <= 10) {
      return 0.4 // Distance éloignée
    } else {
      return 0.1 // Distance très éloignée
    }
  } catch (error) {
    console.warn("⚠️ [Hints Scoring] Erreur scoreRepere:", error)
    return 0.5
  }
}

/**
 * Calcule la distance entre deux points GPS (en mètres)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000 // Rayon de la Terre en mètres
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}


