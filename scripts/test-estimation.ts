/**
 * Script de test pour l'estimation immobilière avec Supabase DVF
 * 
 * Usage: tsx scripts/test-estimation.ts
 * 
 * Ce script teste :
 * - La connexion à Supabase
 * - La récupération de transactions DVF
 * - Le calcul d'estimation pour un bien spécifique
 */

import { config } from "dotenv"
import { resolve } from "path"

// Charger les variables d'environnement depuis .env.local
config({ path: resolve(process.cwd(), ".env.local") })

// Import des services
import { fetchDVFTransactions, fetchDVFDepartmentStats } from "../src/lib/services/dvf-supabase"
import { estimateFromPublicAPI } from "../src/lib/services/estimation-api"
import { EstimationInput } from "../src/lib/services/estimation"

async function testSupabaseConnection() {
  console.log("\n" + "=".repeat(70))
  console.log("🔍 TEST 1: Vérification de la connexion Supabase")
  console.log("=".repeat(70))

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ ERREUR: Variables d'environnement manquantes")
    console.error("   SUPABASE_URL:", supabaseUrl ? "✅ Défini" : "❌ Manquant")
    console.error("   SUPABASE_SERVICE_ROLE_KEY:", supabaseKey ? "✅ Défini" : "❌ Manquant")
    console.error("\n💡 Solution: Vérifiez votre fichier .env.local")
    return false
  }

  console.log("✅ Variables d'environnement trouvées")
  console.log("   SUPABASE_URL:", supabaseUrl.substring(0, 30) + "...")
  console.log("   SUPABASE_SERVICE_ROLE_KEY:", supabaseKey.substring(0, 20) + "...")

  // Tester la connexion en récupérant une transaction
  try {
    console.log("\n🔌 Test de connexion à Supabase...")
    const testData = await fetchDVFTransactions(
      "75008", // Paris 8e
      "Appartement",
      40, // surface min
      80, // surface max
      2, // rooms min
      4, // rooms max
      undefined, // radiusKm
      undefined, // latitude
      undefined, // longitude
      1, // limit: seulement 1 pour tester
      12 // 12 derniers mois
    )

    if (testData.length > 0) {
      console.log("✅ Connexion Supabase réussie!")
      console.log("   Transaction de test trouvée:", {
        prix: testData[0].price,
        surface: testData[0].surface,
        prix_m2: testData[0].pricePerSqm,
        date: testData[0].date
      })
      return true
    } else {
      console.log("⚠️ Connexion OK mais aucune transaction trouvée pour le test")
      console.log("   (Cela peut être normal si la base est vide ou les critères ne matchent pas)")
      return true // On considère que la connexion fonctionne même sans données
    }
  } catch (error: any) {
    console.error("❌ Erreur lors de la connexion:", error.message)
    return false
  }
}

async function testDVFTransactions() {
  console.log("\n" + "=".repeat(70))
  console.log("🔍 TEST 2: Récupération de transactions DVF")
  console.log("=".repeat(70))

  const postalCode = "75008"
  const type = "Appartement" as const
  const surface = 65
  const surfaceMin = Math.max(10, surface * 0.8) // ±20%
  const surfaceMax = surface * 1.2
  const rooms = 3
  const roomsMin = Math.max(1, rooms - 1)
  const roomsMax = rooms + 1

  console.log("📋 Critères de recherche:")
  console.log("   Code postal:", postalCode)
  console.log("   Type:", type)
  console.log("   Surface:", surface, "m² (recherche:", surfaceMin, "-", surfaceMax, "m²)")
  console.log("   Pièces:", rooms, "(recherche:", roomsMin, "-", roomsMax, ")")
  console.log("   Période: 12 derniers mois")

  try {
    const transactions = await fetchDVFTransactions(
      postalCode,
      type,
      surfaceMin,
      surfaceMax,
      roomsMin,
      roomsMax,
      undefined,
      undefined,
      undefined,
      100,
      12
    )

    console.log("\n📊 Résultats:")
    console.log("   Nombre de transactions trouvées:", transactions.length)

    if (transactions.length > 0) {
      console.log("\n📋 Aperçu des transactions (5 premières):")
      transactions.slice(0, 5).forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.price.toLocaleString("fr-FR")}€ - ${t.surface}m² - ${t.pricePerSqm.toLocaleString("fr-FR")}€/m² - ${t.rooms} pièces - ${t.date}`)
      })

      // Statistiques
      const pricesPerSqm = transactions.map(t => t.pricePerSqm)
      const sorted = [...pricesPerSqm].sort((a, b) => a - b)
      const median = sorted[Math.floor(sorted.length / 2)]
      const avg = pricesPerSqm.reduce((sum, p) => sum + p, 0) / pricesPerSqm.length
      const min = sorted[0]
      const max = sorted[sorted.length - 1]

      console.log("\n📈 Statistiques des prix au m²:")
      console.log("   Minimum:", min.toLocaleString("fr-FR"), "€/m²")
      console.log("   Maximum:", max.toLocaleString("fr-FR"), "€/m²")
      console.log("   Médiane:", Math.round(median).toLocaleString("fr-FR"), "€/m²")
      console.log("   Moyenne:", Math.round(avg).toLocaleString("fr-FR"), "€/m²")
    } else {
      console.log("⚠️ Aucune transaction trouvée avec ces critères")
    }

    return transactions.length
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération:", error.message)
    return 0
  }
}

async function testEstimation() {
  console.log("\n" + "=".repeat(70))
  console.log("🔍 TEST 3: Estimation complète")
  console.log("=".repeat(70))

  const input: EstimationInput = {
    city: "Paris",
    postalCode: "75008",
    surface: 65,
    rooms: 3,
    type: "Appartement"
  }

  console.log("📋 Paramètres d'estimation:")
  console.log("   Ville:", input.city)
  console.log("   Code postal:", input.postalCode)
  console.log("   Surface:", input.surface, "m²")
  console.log("   Pièces:", input.rooms)
  console.log("   Type:", input.type)

  try {
    console.log("\n🚀 Lancement de l'estimation...")
    const result = await estimateFromPublicAPI(input)

    console.log("\n" + "=".repeat(70))
    console.log("✅ RÉSULTAT DE L'ESTIMATION")
    console.log("=".repeat(70))
    console.log("\n💰 Prix estimé:")
    console.log("   Médian:", result.priceMedian.toLocaleString("fr-FR"), "€")
    console.log("   Fourchette:", result.priceLow.toLocaleString("fr-FR"), "€ -", result.priceHigh.toLocaleString("fr-FR"), "€")
    console.log("\n📊 Détails:")
    console.log("   Prix au m² médian:", result.pricePerSqmMedian.toLocaleString("fr-FR"), "€/m²")
    console.log("   Prix au m² moyen:", result.pricePerSqmAverage.toLocaleString("fr-FR"), "€/m²")
    console.log("   Nombre de références:", result.sampleSize)
    console.log("   Confiance:", (result.confidence * 100).toFixed(1), "%")
    console.log("   Stratégie:", result.strategy)
    
    if (result.adjustments && result.adjustments.length > 0) {
      console.log("\n🔧 Ajustements appliqués:")
      result.adjustments.forEach((adj, i) => {
        console.log(`   ${i + 1}. ${adj}`)
      })
    }

    if (result.comparables && result.comparables.length > 0) {
      console.log("\n📋 Comparables utilisés (5 premiers):")
      result.comparables.slice(0, 5).forEach((comp, i) => {
        console.log(`   ${i + 1}. ${comp.price.toLocaleString("fr-FR")}€ - ${comp.surface}m² - ${comp.pricePerSqm.toLocaleString("fr-FR")}€/m² - ${comp.rooms} pièces`)
      })
    }

    console.log("\n" + "=".repeat(70))
    return result
  } catch (error: any) {
    console.error("\n❌ Erreur lors de l'estimation:", error.message)
    console.error("   Stack:", error.stack)
    return null
  }
}

async function testDepartmentStats() {
  console.log("\n" + "=".repeat(70))
  console.log("🔍 TEST 4: Statistiques départementales")
  console.log("=".repeat(70))

  const department = "75" // Paris
  const type = "Appartement" as const

  console.log("📋 Paramètres:")
  console.log("   Département:", department)
  console.log("   Type:", type)

  try {
    const stats = await fetchDVFDepartmentStats(department, type)

    if (stats) {
      console.log("\n📊 Statistiques départementales:")
      console.log("   Prix médian au m²:", stats.medianPricePerSqm.toLocaleString("fr-FR"), "€/m²")
      console.log("   Prix moyen au m²:", stats.avgPricePerSqm.toLocaleString("fr-FR"), "€/m²")
      console.log("   Nombre de transactions:", stats.sampleSize)
    } else {
      console.log("⚠️ Aucune statistique départementale disponible")
    }

    return stats
  } catch (error: any) {
    console.error("❌ Erreur:", error.message)
    return null
  }
}

async function main() {
  console.log("\n" + "🚀".repeat(35))
  console.log("   TEST DE L'ESTIMATION IMMOBILIÈRE AVEC SUPABASE DVF")
  console.log("🚀".repeat(35))

  // Test 1: Connexion Supabase
  const connectionOk = await testSupabaseConnection()
  if (!connectionOk) {
    console.error("\n❌ Les tests suivants ne peuvent pas être exécutés sans connexion Supabase")
    process.exit(1)
  }

  // Test 2: Récupération de transactions
  const transactionCount = await testDVFTransactions()

  // Test 3: Estimation complète
  const estimationResult = await testEstimation()

  // Test 4: Statistiques départementales
  await testDepartmentStats()

  // Résumé final
  console.log("\n" + "=".repeat(70))
  console.log("📊 RÉSUMÉ DES TESTS")
  console.log("=".repeat(70))
  console.log("✅ Connexion Supabase:", connectionOk ? "OK" : "ÉCHEC")
  console.log("📊 Transactions trouvées:", transactionCount)
  console.log("💰 Estimation:", estimationResult ? "RÉUSSIE" : "ÉCHEC")
  
  if (estimationResult) {
    console.log("\n🎯 Estimation finale:")
    console.log("   Prix médian:", estimationResult.priceMedian.toLocaleString("fr-FR"), "€")
    console.log("   Fourchette:", estimationResult.priceLow.toLocaleString("fr-FR"), "€ -", estimationResult.priceHigh.toLocaleString("fr-FR"), "€")
    console.log("   Confiance:", (estimationResult.confidence * 100).toFixed(1), "%")
    console.log("   Références:", estimationResult.sampleSize)
  }

  console.log("\n" + "=".repeat(70))
  console.log("✅ Tests terminés")
  console.log("=".repeat(70) + "\n")
}

// Exécuter les tests
main().catch((error) => {
  console.error("\n❌ Erreur fatale:", error)
  process.exit(1)
})

