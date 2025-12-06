/**
 * 🗺️ INTÉGRATION CADASTRE / IGN
 * 
 * Récupération des parcelles cadastrales via les APIs publiques Etalab
 */

export interface ParcelleInfo {
  section: string
  numero: string
  parcelleId: string // Format: "section-numero"
  surface?: number // en m²
  commune?: string
  codeCommune?: string
}

/**
 * Trouve la parcelle cadastrale la plus proche d'un point GPS
 * 
 * @param lat Latitude
 * @param lng Longitude
 * @returns Informations de la parcelle ou null
 */
export async function findParcelleByCoordinates(
  lat: number,
  lng: number
): Promise<ParcelleInfo | null> {
  try {
    // API Cadastre data.gouv.fr
    // Documentation: https://geo.api.gouv.fr/cadastre
    
    // Pour l'instant, on retourne un stub
    // TODO: Implémenter l'appel réel à l'API cadastre
    // Exemple d'URL: https://geo.api.gouv.fr/cadastre/parcelles?lat={lat}&lon={lng}
    
    console.log(`🗺️ [Cadastre] Recherche parcelle pour ${lat}, ${lng}`)
    
    // Stub - à remplacer par l'appel réel
    return null
    
    /* Exemple d'implémentation future :
    const response = await fetch(
      `https://geo.api.gouv.fr/cadastre/parcelles?lat=${lat}&lon=${lng}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )
    
    if (!response.ok) {
      console.warn(`⚠️ [Cadastre] Erreur API: ${response.status}`)
      return null
    }
    
    const data = await response.json()
    // Parser la réponse et retourner ParcelleInfo
    */
  } catch (error) {
    console.warn("⚠️ [Cadastre] Erreur:", error)
    return null
  }
}

/**
 * Récupère les informations détaillées d'une parcelle
 */
export async function getParcelleDetails(parcelleId: string): Promise<ParcelleInfo | null> {
  try {
    // TODO: Implémenter l'appel à l'API cadastre pour les détails
    console.log(`🗺️ [Cadastre] Détails parcelle ${parcelleId}`)
    return null
  } catch (error) {
    console.warn("⚠️ [Cadastre] Erreur détails:", error)
    return null
  }
}


