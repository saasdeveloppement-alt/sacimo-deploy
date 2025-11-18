/**
 * Service DVF (Demandes de Valeurs Foncières) via Supabase
 * 
 * Ce service se connecte à Supabase pour récupérer les données DVF réelles
 * et les utiliser pour l'estimation immobilière.
 * 
 * Si Supabase n'est pas configuré, le service retourne un tableau vide
 * et le système utilisera le fallback (données agrégées statiques).
 */

interface DVFTransaction {
  id: number
  id_mutation: string | null
  date_mutation: string
  valeur_fonciere: number
  code_postal: string
  code_commune: string
  nom_commune: string
  latitude: number | null
  longitude: number | null
  surface_reelle_bati: number | null
  surface_terrain: number | null
  nombre_pieces_principales: number | null
  type_local: string | null
  prix_au_m2: number | null
}

interface DVFComparable {
  price: number
  surface: number
  pricePerSqm: number
  city: string
  postalCode: string
  rooms: number | null
  type: string | null
  date: string
  id: string
  url: string | null
}

/**
 * Vérifie si Supabase est configuré
 */
function isSupabaseConfigured(): boolean {
  return !!(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_URL.length > 0 &&
    process.env.SUPABASE_SERVICE_ROLE_KEY.length > 0
  )
}

/**
 * Récupère le client Supabase (lazy loading)
 */
async function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null
  }

  try {
    // Import dynamique pour éviter les erreurs si @supabase/supabase-js n'est pas installé
    const { createClient } = await import("@supabase/supabase-js")
    
    return createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  } catch (error) {
    console.error("❌ Erreur lors de l'import de Supabase:", error)
    return null
  }
}

/**
 * Récupère les transactions DVF pour une estimation
 * 
 * @param postalCode Code postal (5 chiffres)
 * @param type Type de bien (Appartement, Maison)
 * @param surfaceMin Surface minimale en m²
 * @param surfaceMax Surface maximale en m²
 * @param roomsMin Nombre de pièces minimum
 * @param roomsMax Nombre de pièces maximum
 * @param radiusKm Rayon de recherche en km (optionnel, nécessite lat/lon)
 * @param latitude Latitude pour recherche géographique (optionnel)
 * @param longitude Longitude pour recherche géographique (optionnel)
 * @param limit Nombre maximum de résultats (défaut: 100)
 */
export async function fetchDVFTransactions(
  postalCode: string,
  type: "Appartement" | "Maison",
  surfaceMin: number,
  surfaceMax: number,
  roomsMin?: number,
  roomsMax?: number,
  radiusKm?: number,
  latitude?: number,
  longitude?: number,
  limit: number = 100,
  monthsBack: number = 12 // Par défaut : 12 derniers mois
): Promise<DVFComparable[]> {
  // Vérifier la configuration Supabase
  console.log("🔍 [DVF Supabase] Vérification de la configuration...")
  if (!isSupabaseConfigured()) {
    console.log("❌ [DVF Supabase] Supabase non configuré (SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquants)")
    console.log("   → Fallback activé vers données agrégées statiques")
    return []
  }
  console.log("✅ [DVF Supabase] Configuration OK")

  try {
    console.log("🔌 [DVF Supabase] Connexion à Supabase...")
    const supabase = await getSupabaseClient()
    if (!supabase) {
      console.log("❌ [DVF Supabase] Échec de la connexion au client Supabase")
      return []
    }
    console.log("✅ [DVF Supabase] Connexion réussie")

    // Calculer la date limite (12 derniers mois par défaut)
    const dateLimit = new Date()
    dateLimit.setMonth(dateLimit.getMonth() - monthsBack)
    const dateLimitStr = dateLimit.toISOString().split("T")[0]

    console.log("📊 [DVF Supabase] Paramètres de recherche:", {
      postalCode,
      type,
      surfaceMin,
      surfaceMax,
      roomsMin,
      roomsMax,
      dateLimit: dateLimitStr,
      monthsBack,
      limit
    })

    // Construire la requête de base
    console.log("🔍 [DVF Supabase] Construction de la requête SQL...")
    let query = supabase
      .from("dvf_transactions")
      .select("*")
      .eq("code_postal", postalCode)
      .eq("type_local", type)
      .gte("surface_reelle_bati", surfaceMin)
      .lte("surface_reelle_bati", surfaceMax)
      .gt("valeur_fonciere", 0)
      .gt("surface_reelle_bati", 0)
      .not("prix_au_m2", "is", null)
      .gte("date_mutation", dateLimitStr) // 12 derniers mois
      .order("date_mutation", { ascending: false })
      .limit(limit)

    // Filtrer par nombre de pièces si spécifié
    if (roomsMin !== undefined) {
      query = query.gte("nombre_pieces_principales", roomsMin)
    }
    if (roomsMax !== undefined) {
      query = query.lte("nombre_pieces_principales", roomsMax)
    }

    // Recherche géographique par rayon (si lat/lon fournis)
    if (radiusKm && latitude && longitude) {
      // Utiliser PostGIS pour la recherche par rayon
      // Note: Cette requête nécessite PostGIS et peut être plus lente
      const { data: geoData, error: geoError } = await supabase.rpc(
        "find_dvf_within_radius",
        {
          center_lat: latitude,
          center_lon: longitude,
          radius_meters: radiusKm * 1000,
          surface_min: surfaceMin,
          surface_max: surfaceMax,
          type_local: type,
        }
      )

      if (!geoError && geoData && geoData.length > 0) {
        // Convertir les résultats géographiques
        return geoData.map((row: any) => ({
          price: row.valeur_fonciere,
          surface: row.surface_reelle_bati,
          pricePerSqm: row.prix_au_m2,
          city: row.nom_commune,
          postalCode: row.code_postal,
          rooms: row.nombre_pieces_principales,
          type: row.type_local,
          date: row.date_mutation,
          id: `dvf-${row.id}`,
          url: null, // Les données DVF n'ont pas d'URL d'annonce
        }))
      }
    }

    // Exécuter la requête standard
    console.log("🚀 [DVF Supabase] Exécution de la requête...")
    const { data, error } = await query

    if (error) {
      console.error("❌ [DVF Supabase] Erreur lors de la requête:", error)
      console.error("   Détails:", JSON.stringify(error, null, 2))
      return []
    }

    if (!data || data.length === 0) {
      console.log(`⚠️ [DVF Supabase] Aucune transaction trouvée pour ${postalCode} (${type})`)
      console.log("   → Critères: surface entre", surfaceMin, "et", surfaceMax, "m²,", monthsBack, "derniers mois")
      return []
    }

    console.log(`✅ [DVF Supabase] ${data.length} transaction(s) trouvée(s) pour ${postalCode} (${type})`)
    console.log("   → Première transaction:", {
      date: data[0].date_mutation,
      prix: data[0].valeur_fonciere,
      surface: data[0].surface_reelle_bati,
      prix_m2: data[0].prix_au_m2
    })

    // Convertir au format Comparable
    return data.map((row: DVFTransaction) => ({
      price: Number(row.valeur_fonciere),
      surface: Number(row.surface_reelle_bati || 0),
      pricePerSqm: Number(row.prix_au_m2 || 0),
      city: row.nom_commune,
      postalCode: row.code_postal,
      rooms: row.nombre_pieces_principales,
      type: row.type_local,
      date: row.date_mutation,
      id: `dvf-${row.id}`,
      url: null, // Les données DVF n'ont pas d'URL d'annonce
    }))
  } catch (error) {
    console.error("❌ Erreur lors de la récupération DVF:", error)
    return []
  }
}

/**
 * Récupère les statistiques DVF pour un département (fallback)
 * 
 * @param department Code département (2 chiffres)
 * @param type Type de bien
 */
export async function fetchDVFDepartmentStats(
  department: string,
  type: "Appartement" | "Maison"
): Promise<{
  medianPricePerSqm: number
  avgPricePerSqm: number
  sampleSize: number
} | null> {
  if (!isSupabaseConfigured()) {
    return null
  }

  try {
    const supabase = await getSupabaseClient()
    if (!supabase) {
      return null
    }

    // Utiliser la vue dvf_by_department
    const { data, error } = await supabase
      .from("dvf_by_department")
      .select("*")
      .eq("department", department)
      .single()

    if (error || !data) {
      console.log(`ℹ️ Pas de statistiques départementales pour ${department}`)
      return null
    }

    // Calculer selon le type
    const propertyType = type === "Appartement" ? "appartement" : "maison"
    // Note: La vue retourne des stats globales, on peut filtrer par type si nécessaire

    return {
      medianPricePerSqm: Number(data.median_price_per_sqm || 0),
      avgPricePerSqm: Number(data.avg_price_per_sqm || 0),
      sampleSize: Number(data.transaction_count || 0),
    }
  } catch (error) {
    console.error("❌ Erreur stats départementales DVF:", error)
    return null
  }
}

/**
 * Récupère le prix au m² réel du marché (estimation SACIMO)
 * PRIORITÉ 1 : Depuis MeilleursAgents.com (scraping)
 * PRIORITÉ 2 : Depuis Supabase DVF (transactions réelles)
 * 
 * @param postalCode Code postal (5 chiffres)
 * @param type Type de bien (Appartement ou Maison)
 * @param surface Surface du bien (pour filtrer les comparables similaires)
 * @param rooms Nombre de pièces (optionnel, pour affiner)
 * @returns Prix au m² médian, moyenne, et statistiques
 */
export async function getMarketPricePerSqm(
  postalCode: string,
  type: "Appartement" | "Maison",
  surface?: number,
  rooms?: number
): Promise<{
  medianPricePerSqm: number
  avgPricePerSqm: number // Prix m² moyen
  q1PricePerSqm: number
  q3PricePerSqm: number
  p10PricePerSqm: number // Percentile 10% (min)
  p90PricePerSqm: number // Percentile 90% (max)
  sampleSize: number
  transactions: DVFComparable[]
  source?: "meilleursagents" | "dvf" // Source des données
} | null> {
  // PRIORITÉ 1 : Essayer de récupérer depuis MeilleursAgents
  try {
    const { getPriceFromMeilleursAgents } = await import("./meilleursagents-scraper")
    console.log("🔍 [SACIMO] Tentative de récupération depuis MeilleursAgents...")
    
    const meilleursAgentsPrice = await getPriceFromMeilleursAgents(postalCode, type)
    
    if (meilleursAgentsPrice) {
      console.log(`✅ [SACIMO] Prix au m² récupéré depuis MeilleursAgents`)
      console.log(`   Prix m² moyen: ${meilleursAgentsPrice.avgPricePerSqm.toLocaleString("fr-FR")} €/m²`)
      console.log(`   Fourchette: ${meilleursAgentsPrice.minPricePerSqm.toLocaleString("fr-FR")} - ${meilleursAgentsPrice.maxPricePerSqm.toLocaleString("fr-FR")} €/m²`)
      
      // Convertir le format MeilleursAgents en format SACIMO
      return {
        medianPricePerSqm: meilleursAgentsPrice.avgPricePerSqm, // Utiliser la moyenne comme médiane
        avgPricePerSqm: meilleursAgentsPrice.avgPricePerSqm,
        q1PricePerSqm: meilleursAgentsPrice.minPricePerSqm, // Min comme Q1
        q3PricePerSqm: meilleursAgentsPrice.maxPricePerSqm, // Max comme Q3
        p10PricePerSqm: meilleursAgentsPrice.minPricePerSqm,
        p90PricePerSqm: meilleursAgentsPrice.maxPricePerSqm,
        sampleSize: meilleursAgentsPrice.sampleSize || 0, // MeilleursAgents ne donne pas toujours le nombre
        transactions: [], // Pas de transactions détaillées depuis MeilleursAgents
        source: "meilleursagents",
      }
    }
    
    console.log("⚠️ [SACIMO] MeilleursAgents non disponible, fallback sur Supabase DVF...")
  } catch (error: any) {
    console.log("⚠️ [SACIMO] Erreur lors de la récupération MeilleursAgents:", error.message)
    console.log("   → Fallback sur Supabase DVF...")
  }

  // PRIORITÉ 2 : Fallback sur Supabase DVF
  if (!isSupabaseConfigured()) {
    console.log("ℹ️ Supabase non configuré, impossible de récupérer le prix au m² réel du marché")
    return null
  }

  try {
    const supabase = await getSupabaseClient()
    if (!supabase) {
      return null
    }

    // Calculer les bornes de surface (±20% si surface fournie, sinon large)
    const surfaceMin = surface ? Math.max(15, Math.round(surface * 0.8)) : 15
    const surfaceMax = surface ? Math.round(surface * 1.2) : 200

    console.log("📊 [SACIMO] Récupération du prix au m² réel du marché...")
    console.log("   Code postal:", postalCode)
    console.log("   Type:", type)
    console.log("   Surface:", surface ? `${surfaceMin}-${surfaceMax}m²` : "toutes")

    // Récupérer les transactions DVF des 12 derniers mois
    const transactions = await fetchDVFTransactions(
      postalCode,
      type,
      surfaceMin,
      surfaceMax,
      rooms ? Math.max(1, rooms - 1) : undefined,
      rooms ? rooms + 1 : undefined,
      undefined, // radiusKm
      undefined, // latitude
      undefined, // longitude
      200, // limit
      12 // 12 derniers mois
    )

    if (transactions.length === 0) {
      console.log("⚠️ [SACIMO] Aucune transaction DVF trouvée, fallback départemental...")
      
      // Fallback : statistiques départementales
      const department = postalCode.substring(0, 2)
      const deptStats = await fetchDVFDepartmentStats(department, type)
      
      if (deptStats && deptStats.sampleSize > 0) {
        console.log(`✅ [SACIMO] Utilisation des stats départementales (${department})`)
        const deptAvg = deptStats.avgPricePerSqm
        return {
          medianPricePerSqm: deptStats.medianPricePerSqm,
          avgPricePerSqm: deptAvg,
          q1PricePerSqm: Math.round(deptAvg * 0.73), // Approximation Q1 (basé sur ratio typique)
          q3PricePerSqm: Math.round(deptAvg * 1.81), // Approximation Q3 (basé sur ratio typique)
          p10PricePerSqm: Math.round(deptAvg * 0.73), // Approximation P10
          p90PricePerSqm: Math.round(deptAvg * 1.81), // Approximation P90
          sampleSize: deptStats.sampleSize,
          transactions: [],
        }
      }
      
      return null
    }

    // Calculer les statistiques sur les prix au m² (méthode SACIMO)
    // SACIMO utilise la moyenne (pas la médiane) comme référence principale
    // et calcule une fourchette basée sur les percentiles 10% et 90%
    
    const pricesPerSqm = transactions
      .map(t => t.pricePerSqm)
      .filter(p => p > 0 && p < 50000) // Filtrer les valeurs aberrantes (> 50k€/m²)

    if (pricesPerSqm.length === 0) {
      return null
    }

    // Trier pour calculer les statistiques
    const sorted = [...pricesPerSqm].sort((a, b) => a - b)
    const n = sorted.length

    // Calculs selon la méthode SACIMO :
    // - Prix m² moyen = moyenne arithmétique (référence principale)
    // - Fourchette = percentiles 10% (min) et 90% (max) pour exclure les outliers
    const avg = sorted.reduce((sum, p) => sum + p, 0) / n
    const median = sorted[Math.floor(n / 2)]
    
    // Percentiles 10% et 90% (pour la fourchette)
    const p10 = sorted[Math.floor(n * 0.10)] // Minimum (exclut les 10% les plus bas)
    const p90 = sorted[Math.ceil(n * 0.90) - 1] // Maximum (exclut les 10% les plus hauts)
    
    // Q1 et Q3 pour les quartiles (utilisés pour la fourchette basse/haute)
    const q1 = sorted[Math.floor(n * 0.25)]
    const q3 = sorted[Math.floor(n * 0.75)]

    console.log(`✅ [SACIMO] Prix au m² réel du marché calculé:`)
    console.log(`   Prix m² moyen: ${Math.round(avg).toLocaleString("fr-FR")} €/m²`)
    console.log(`   Prix m² médian: ${Math.round(median).toLocaleString("fr-FR")} €/m²`)
    console.log(`   Fourchette (P10-P90): ${Math.round(p10).toLocaleString("fr-FR")} - ${Math.round(p90).toLocaleString("fr-FR")} €/m²`)
    console.log(`   Quartiles (Q1-Q3): ${Math.round(q1).toLocaleString("fr-FR")} - ${Math.round(q3).toLocaleString("fr-FR")} €/m²`)
    console.log(`   Échantillon: ${n} transactions DVF`)

    // Retourner avec la moyenne comme référence principale
    // mais aussi la médiane pour les calculs statistiques
    return {
      medianPricePerSqm: Math.round(median), // Médiane pour les calculs robustes
      avgPricePerSqm: Math.round(avg), // Moyenne (référence principale SACIMO)
      q1PricePerSqm: Math.round(q1), // Q1 pour fourchette basse
      q3PricePerSqm: Math.round(q3), // Q3 pour fourchette haute
      p10PricePerSqm: Math.round(p10), // Percentile 10% (min)
      p90PricePerSqm: Math.round(p90), // Percentile 90% (max)
      sampleSize: n,
      transactions: transactions.slice(0, 20), // Garder les 20 premières pour les comparables
      source: "dvf", // Source : Supabase DVF
    }
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du prix au m² réel:", error)
    return null
  }
}

/**
 * Fonction helper pour créer la fonction PostGIS dans Supabase
 * (À exécuter une fois dans le SQL Editor de Supabase)
 * 
 * Cette fonction permet la recherche par rayon géographique
 */
export const POSTGIS_FUNCTION_SQL = `
-- Fonction PostGIS pour recherche DVF par rayon
CREATE OR REPLACE FUNCTION find_dvf_within_radius(
  center_lat DECIMAL,
  center_lon DECIMAL,
  radius_meters INTEGER,
  surface_min DECIMAL,
  surface_max DECIMAL,
  type_local VARCHAR
)
RETURNS TABLE (
  id BIGINT,
  valeur_fonciere DECIMAL,
  surface_reelle_bati DECIMAL,
  prix_au_m2 DECIMAL,
  code_postal VARCHAR,
  nom_commune VARCHAR,
  nombre_pieces_principales INTEGER,
  type_local VARCHAR,
  date_mutation DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dt.id,
    dt.valeur_fonciere,
    dt.surface_reelle_bati,
    dt.prix_au_m2,
    dt.code_postal,
    dt.nom_commune,
    dt.nombre_pieces_principales,
    dt.type_local,
    dt.date_mutation
  FROM dvf_transactions dt
  WHERE 
    dt.latitude IS NOT NULL 
    AND dt.longitude IS NOT NULL
    AND dt.type_local = find_dvf_within_radius.type_local
    AND dt.surface_reelle_bati BETWEEN surface_min AND surface_max
    AND dt.valeur_fonciere > 0
    AND dt.surface_reelle_bati > 0
    AND dt.prix_au_m2 IS NOT NULL
    AND ST_Distance(
      ST_MakePoint(dt.longitude, dt.latitude)::geography,
      ST_MakePoint(center_lon, center_lat)::geography
    ) <= radius_meters
    AND dt.date_mutation >= CURRENT_DATE - INTERVAL '2 years'
  ORDER BY 
    ST_Distance(
      ST_MakePoint(dt.longitude, dt.latitude)::geography,
      ST_MakePoint(center_lon, center_lat)::geography
    ) ASC,
    dt.date_mutation DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql;
`

