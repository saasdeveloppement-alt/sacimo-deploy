/**
 * Polygones GeoJSON simplifiés pour les départements français
 * Utilisés pour vérifier si un point GPS est dans un département
 * 
 * Note: Ces polygones sont simplifiés. Pour une précision maximale,
 * utilisez des données GeoJSON officielles (IGN, OpenStreetMap).
 */

import type { Feature, Polygon } from "@turf/helpers"

/**
 * Coordonnées approximatives des départements français
 * Format: [minLng, minLat, maxLng, maxLat]
 * Converti en polygones rectangulaires pour simplification
 */
const departmentBounds: Record<string, [number, number, number, number]> = {
  "01": [4.5, 45.5, 6.0, 46.5], // Ain
  "02": [3.0, 49.0, 4.5, 50.0], // Aisne
  "03": [2.5, 46.0, 4.0, 47.0], // Allier
  "04": [5.5, 43.8, 7.0, 44.8], // Alpes-de-Haute-Provence
  "05": [5.5, 44.2, 7.2, 45.2], // Hautes-Alpes
  "06": [6.5, 43.3, 7.8, 44.0], // Alpes-Maritimes
  "07": [4.0, 44.3, 5.0, 45.5], // Ardèche
  "08": [4.5, 49.2, 5.5, 50.2], // Ardennes
  "09": [1.0, 42.5, 2.0, 43.2], // Ariège
  "10": [3.5, 48.0, 5.0, 49.0], // Aube
  "11": [1.8, 42.8, 3.0, 43.5], // Aude
  "12": [2.0, 44.0, 3.5, 45.0], // Aveyron
  "13": [4.5, 43.0, 5.8, 43.8], // Bouches-du-Rhône
  "14": [-1.0, 48.8, 0.5, 49.5], // Calvados
  "15": [2.5, 44.8, 3.5, 45.5], // Cantal
  "16": [-0.5, 45.2, 1.0, 46.0], // Charente
  "17": [-1.5, 45.2, -0.2, 46.2], // Charente-Maritime
  "18": [2.0, 46.8, 3.0, 47.8], // Cher
  "19": [1.2, 45.0, 2.5, 45.8], // Corrèze
  "21": [4.0, 47.0, 5.5, 48.0], // Côte-d'Or
  "22": [-5.0, 48.0, -2.5, 49.0], // Côtes-d'Armor
  "23": [1.5, 45.8, 2.5, 46.5], // Creuse
  "24": [0.0, 44.5, 1.5, 45.5], // Dordogne
  "25": [5.8, 46.8, 7.0, 47.8], // Doubs
  "26": [4.5, 44.2, 5.5, 45.2], // Drôme
  "27": [0.8, 48.8, 2.0, 49.5], // Eure
  "28": [1.0, 48.0, 2.0, 48.8], // Eure-et-Loir
  "29": [-5.0, 47.8, -3.5, 48.8], // Finistère
  "2A": [8.5, 41.8, 9.5, 42.5], // Corse-du-Sud
  "2B": [8.5, 42.2, 9.5, 43.0], // Haute-Corse
  "30": [3.8, 43.8, 5.0, 44.5], // Gard
  "31": [0.8, 43.0, 2.2, 44.0], // Haute-Garonne
  "32": [-0.5, 43.2, 1.0, 44.2], // Gers
  "33": [-1.2, 44.5, 0.0, 45.5], // Gironde
  "34": [2.8, 43.2, 4.2, 44.2], // Hérault
  "35": [-2.2, 47.8, -1.0, 48.8], // Ille-et-Vilaine
  "36": [1.2, 46.2, 2.2, 47.2], // Indre
  "37": [0.0, 47.0, 1.2, 48.0], // Indre-et-Loire
  "38": [5.0, 44.8, 6.5, 45.8], // Isère
  "39": [5.2, 46.2, 6.5, 47.2], // Jura
  "40": [-1.5, 43.5, -0.2, 44.5], // Landes
  "41": [0.8, 47.2, 2.0, 48.2], // Loir-et-Cher
  "42": [3.8, 45.2, 5.0, 46.2], // Loire
  "43": [3.2, 44.8, 4.5, 45.8], // Haute-Loire
  "44": [-2.5, 47.0, -1.0, 47.8], // Loire-Atlantique
  "45": [1.8, 47.5, 3.0, 48.5], // Loiret
  "46": [1.2, 44.2, 2.2, 45.2], // Lot
  "47": [0.0, 44.0, 1.2, 45.0], // Lot-et-Garonne
  "48": [3.0, 44.2, 4.0, 45.2], // Lozère
  "49": [-1.2, 47.0, 0.2, 48.0], // Maine-et-Loire
  "50": [-1.8, 48.5, -0.8, 49.5], // Manche
  "51": [3.5, 48.5, 5.0, 49.5], // Marne
  "52": [4.8, 47.8, 6.0, 48.8], // Haute-Marne
  "53": [-1.2, 47.8, 0.0, 48.8], // Mayenne
  "54": [5.5, 48.2, 7.0, 49.2], // Meurthe-et-Moselle
  "55": [5.0, 48.5, 6.0, 49.5], // Meuse
  "56": [-3.5, 47.2, -2.5, 48.2], // Morbihan
  "57": [5.8, 48.5, 7.5, 49.5], // Moselle
  "58": [3.0, 46.8, 4.2, 47.8], // Nièvre
  "59": [2.5, 50.0, 4.5, 51.0], // Nord
  "60": [2.0, 49.0, 3.5, 50.0], // Oise
  "61": [0.0, 48.2, 1.0, 49.2], // Orne
  "62": [1.5, 50.0, 3.5, 51.0], // Pas-de-Calais
  "63": [2.5, 45.2, 4.0, 46.2], // Puy-de-Dôme
  "64": [-1.8, 43.0, 0.0, 44.0], // Pyrénées-Atlantiques
  "65": [-0.5, 42.8, 0.5, 43.8], // Hautes-Pyrénées
  "66": [2.0, 42.2, 3.2, 43.2], // Pyrénées-Orientales
  "67": [7.0, 48.2, 8.0, 49.2], // Bas-Rhin
  "68": [6.8, 47.2, 8.0, 48.2], // Haut-Rhin
  "69": [4.5, 45.5, 5.5, 46.5], // Rhône
  "70": [5.5, 47.2, 7.0, 48.2], // Haute-Saône
  "71": [3.8, 46.0, 5.2, 47.0], // Saône-et-Loire
  "72": [-0.5, 47.5, 1.0, 48.5], // Sarthe
  "73": [5.8, 45.2, 7.2, 46.2], // Savoie
  "74": [6.0, 45.8, 7.5, 46.8], // Haute-Savoie
  "75": [2.2, 48.8, 2.5, 48.9], // Paris (zone très précise)
  "76": [0.0, 49.2, 2.0, 50.2], // Seine-Maritime
  "77": [2.5, 48.2, 4.0, 49.2], // Seine-et-Marne
  "78": [1.5, 48.5, 2.5, 49.0], // Yvelines
  "79": [-0.8, 46.0, 0.2, 47.0], // Deux-Sèvres
  "80": [1.5, 49.5, 3.0, 50.5], // Somme
  "81": [1.5, 43.5, 2.5, 44.5], // Tarn
  "82": [0.8, 43.8, 2.0, 44.8], // Tarn-et-Garonne
  "83": [5.5, 43.0, 7.0, 43.8], // Var
  "84": [4.8, 43.8, 5.8, 44.5], // Vaucluse
  "85": [-2.2, 46.2, -0.8, 47.2], // Vendée
  "86": [0.0, 46.2, 1.2, 47.2], // Vienne
  "87": [1.0, 45.5, 2.0, 46.5], // Haute-Vienne
  "88": [6.0, 47.8, 7.5, 48.8], // Vosges
  "89": [3.0, 47.5, 4.5, 48.5], // Yonne
  "90": [6.8, 47.5, 7.5, 48.0], // Territoire de Belfort
  "91": [2.0, 48.3, 2.8, 48.8], // Essonne
  "92": [2.0, 48.7, 2.5, 48.9], // Hauts-de-Seine
  "93": [2.3, 48.8, 2.6, 49.0], // Seine-Saint-Denis
  "94": [2.3, 48.6, 2.7, 48.9], // Val-de-Marne
  "95": [1.8, 48.8, 2.5, 49.2], // Val-d'Oise
  "971": [-61.8, 15.8, -61.0, 16.5], // Guadeloupe
  "972": [-61.2, 14.3, -60.8, 14.9], // Martinique
  "973": [-54.0, 2.0, -51.0, 6.0], // Guyane
  "974": [55.2, -21.4, 55.8, -20.8], // La Réunion
  "976": [45.0, -13.0, 45.3, -12.6], // Mayotte
}

/**
 * Convertit les bounds en polygones GeoJSON
 */
function boundsToPolygon(bounds: [number, number, number, number]): Polygon {
  const [minLng, minLat, maxLng, maxLat] = bounds
  return {
    type: "Polygon",
    coordinates: [[
      [minLng, minLat],
      [maxLng, minLat],
      [maxLng, maxLat],
      [minLng, maxLat],
      [minLng, minLat], // Fermer le polygone
    ]],
  }
}

/**
 * Polygones GeoJSON pour chaque département
 */
export const departmentPolygons: Record<string, Feature<Polygon>> = Object.entries(
  departmentBounds,
).reduce((acc, [code, bounds]) => {
  acc[code] = {
    type: "Feature",
    properties: { code },
    geometry: boundsToPolygon(bounds),
  } as Feature<Polygon>
  return acc
}, {} as Record<string, Feature<Polygon>>)

