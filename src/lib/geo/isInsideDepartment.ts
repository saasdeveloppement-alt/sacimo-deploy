/**
 * Vérifie si un point GPS est à l'intérieur d'un département français
 * Utilise des polygones GeoJSON simplifiés pour la vérification
 */

import booleanPointInPolygon from "@turf/boolean-point-in-polygon"
import { point } from "@turf/helpers"
import { departmentPolygons } from "./departmentsGeojson"

/**
 * Vérifie si un point GPS est dans un département donné
 * @param lat Latitude du point
 * @param lng Longitude du point
 * @param departmentCode Code du département (ex: "75", "13", "2A")
 * @returns true si le point est dans le département, false sinon
 */
export function isInsideDepartment(
  lat: number,
  lng: number,
  departmentCode: string,
): boolean {
  // Normaliser le code département (enlever les zéros de tête si nécessaire)
  const normalizedCode = departmentCode.padStart(2, "0")

  const polygon = departmentPolygons[normalizedCode]
  if (!polygon) {
    console.warn(
      `⚠️ [isInsideDepartment] Département ${departmentCode} non trouvé dans les polygones`,
    )
    return false
  }

  try {
    const pointFeature = point([lng, lat])
    const isInside = booleanPointInPolygon(pointFeature, polygon)
    return isInside
  } catch (error) {
    console.error(
      `❌ [isInsideDepartment] Erreur lors de la vérification pour ${departmentCode}:`,
      error,
    )
    return false
  }
}

/**
 * Filtre une liste de résultats pour ne garder que ceux dans le département
 */
export function filterByDepartment<T extends { latitude: number; longitude: number }>(
  results: T[],
  departmentCode: string,
): T[] {
  return results.filter((result) =>
    isInsideDepartment(result.latitude, result.longitude, departmentCode),
  )
}

