/**
 * 📊 INTÉGRATION DVF (Données de Valeurs Foncières)
 * 
 * Récupération des données de ventes immobilières pour enrichir la localisation
 */

export interface DVFData {
  nombreVentes: number
  prixMoyen?: number
  prixMin?: number
  prixMax?: number
  derniereVente?: {
    date: string
    prix: number
    surface?: number
  }
  densite: number // Nombre de ventes par km² dans un rayon
}

/**
 * Récupère les données DVF pour une zone géographique
 * 
 * @param lat Latitude
 * @param lng Longitude
 * @param rayonMeters Rayon de recherche en mètres (défaut: 500m)
 * @returns Données DVF ou null
 */
export async function getDVFData(
  lat: number,
  lng: number,
  rayonMeters: number = 500
): Promise<DVFData | null> {
  try {
    // DVF est disponible via data.gouv.fr
    // Documentation: https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/
    
    // Pour l'instant, on retourne un stub
    // TODO: Implémenter l'appel réel à l'API DVF ou charger le dataset
    
    console.log(`📊 [DVF] Recherche données pour ${lat}, ${lng} (rayon: ${rayonMeters}m)`)
    
    // Stub - à remplacer par l'appel réel
    return null
    
    /* Exemple d'implémentation future :
    // Option 1: API si disponible
    const response = await fetch(
      `https://api.data.gouv.fr/dvf?lat=${lat}&lon=${lng}&rayon=${rayonMeters}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )
    
    // Option 2: Charger le dataset CSV et filtrer
    // Les données DVF sont disponibles en CSV sur data.gouv.fr
    // Il faudrait les charger et indexer par coordonnées
    */
  } catch (error) {
    console.warn("⚠️ [DVF] Erreur:", error)
    return null
  }
}

/**
 * Calcule un score de densité DVF pour une zone
 * Plus il y a de ventes dans la zone, plus le score est élevé (cohérence)
 * 
 * @param dvfData Données DVF
 * @returns Score entre 0 et 1
 */
export function calculateDVFDensityScore(dvfData: DVFData | null): number {
  if (!dvfData) return 0
  
  // Score basé sur la densité de ventes
  // Plus il y a de ventes, plus c'est cohérent (zone active)
  const score = Math.min(1, dvfData.densite / 10) // Normaliser sur 10 ventes/km²
  
  return score
}


