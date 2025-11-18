/**
 * Script de test pour l'estimation basée sur le prix au m² réel du marché (MeilleursAgents)
 * 
 * Usage: tsx scripts/test-estimation-meilleursagents.ts
 */

import { config } from "dotenv"
import { resolve } from "path"

// Charger les variables d'environnement
config({ path: resolve(process.cwd(), ".env.local") })

// Import des services
import { getMarketPricePerSqm } from "../src/lib/services/dvf-supabase"
import { estimateFromComparables } from "../src/lib/services/estimation"
import { EstimationInput } from "../src/lib/services/estimation"

async function testMarketPricePerSqm() {
  console.log("\n" + "=".repeat(70))
  console.log("🔍 TEST 1: Prix au m² réel du marché (DVF)")
  console.log("=".repeat(70))

  const postalCode = "75008"
  const type = "Appartement" as const
  const surface = 65
  const rooms = 3

  console.log("📋 Paramètres:")
  console.log("   Code postal:", postalCode)
  console.log("   Type:", type)
  console.log("   Surface:", surface, "m²")
  console.log("   Pièces:", rooms)

  try {
    const marketPrice = await getMarketPricePerSqm(postalCode, type, surface, rooms)

    if (marketPrice) {
      console.log("\n✅ Prix au m² réel du marché trouvé:")
      console.log("   Médiane:", marketPrice.medianPricePerSqm.toLocaleString("fr-FR"), "€/m²")
      console.log("   Moyenne:", marketPrice.avgPricePerSqm.toLocaleString("fr-FR"), "€/m²")
      console.log("   Q1:", marketPrice.q1PricePerSqm.toLocaleString("fr-FR"), "€/m²")
      console.log("   Q3:", marketPrice.q3PricePerSqm.toLocaleString("fr-FR"), "€/m²")
      console.log("   Échantillon:", marketPrice.sampleSize, "transactions DVF")
      console.log("   Comparables:", marketPrice.transactions.length)

      // Calculer le prix de base
      const basePrice = marketPrice.medianPricePerSqm * surface
      console.log("\n💰 Prix de base (sans ajustements):")
      console.log("   Médian:", Math.round(basePrice).toLocaleString("fr-FR"), "€")
      console.log("   Fourchette:", 
        Math.round(marketPrice.q1PricePerSqm * surface).toLocaleString("fr-FR"), "€ -",
        Math.round(marketPrice.q3PricePerSqm * surface).toLocaleString("fr-FR"), "€"
      )

      return marketPrice
    } else {
      console.log("❌ Aucun prix au m² trouvé (Supabase non configuré ou pas de données)")
      return null
    }
  } catch (error: any) {
    console.error("❌ Erreur:", error.message)
    return null
  }
}

async function testEstimationWithAdjustments() {
  console.log("\n" + "=".repeat(70))
  console.log("🔍 TEST 2: Estimation complète avec ajustements")
  console.log("=".repeat(70))

  const input: EstimationInput = {
    city: "Paris",
    postalCode: "75008",
    surface: 65,
    rooms: 3,
    type: "Appartement",
    // Ajustements à tester
    condition: "neuf",
    hasParking: true,
    hasBalcon: true,
    hasElevator: true,
    floor: 3,
  }

  console.log("📋 Paramètres d'estimation:")
  console.log("   Ville:", input.city)
  console.log("   Code postal:", input.postalCode)
  console.log("   Surface:", input.surface, "m²")
  console.log("   Pièces:", input.rooms)
  console.log("   Type:", input.type)
  console.log("\n🔧 Ajustements:")
  console.log("   État:", input.condition)
  console.log("   Parking:", input.hasParking ? "Oui" : "Non")
  console.log("   Balcon:", input.hasBalcon ? "Oui" : "Non")
  console.log("   Ascenseur:", input.hasElevator ? "Oui" : "Non")
  console.log("   Étage:", input.floor)

  try {
    console.log("\n🚀 Lancement de l'estimation...")
    const result = await estimateFromComparables(input)

    console.log("\n" + "=".repeat(70))
    console.log("✅ RÉSULTAT DE L'ESTIMATION")
    console.log("=".repeat(70))
    
    console.log("\n💰 Prix estimé:")
    console.log("   Médian:", result.priceMedian.toLocaleString("fr-FR"), "€")
    console.log("   Fourchette:", 
      result.priceLow.toLocaleString("fr-FR"), "€ -",
      result.priceHigh.toLocaleString("fr-FR"), "€"
    )

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
    } else {
      console.log("\n⚠️ Aucun ajustement appliqué")
    }

    if (result.comparables && result.comparables.length > 0) {
      console.log("\n📋 Comparables utilisés (5 premiers):")
      result.comparables.slice(0, 5).forEach((comp, i) => {
        console.log(`   ${i + 1}. ${comp.price.toLocaleString("fr-FR")}€ - ${comp.surface}m² - ${comp.pricePerSqm.toLocaleString("fr-FR")}€/m² - ${comp.rooms} pièces`)
      })
    }

    // Calculer la différence avec/sans ajustements
    if (result.strategy === "dvf_market_price" && result.comparables.length > 0) {
      const avgPricePerSqm = result.comparables.reduce((sum, c) => sum + c.pricePerSqm, 0) / result.comparables.length
      const priceWithoutAdjustments = Math.round(avgPricePerSqm * input.surface)
      const difference = result.priceMedian - priceWithoutAdjustments
      const differencePercent = ((difference / priceWithoutAdjustments) * 100).toFixed(1)

      console.log("\n📈 Impact des ajustements:")
      console.log("   Prix sans ajustements (moyenne DVF):", priceWithoutAdjustments.toLocaleString("fr-FR"), "€")
      console.log("   Prix avec ajustements:", result.priceMedian.toLocaleString("fr-FR"), "€")
      console.log("   Différence:", 
        (difference > 0 ? "+" : "") + difference.toLocaleString("fr-FR"), "€",
        `(${differencePercent > 0 ? "+" : ""}${differencePercent}%)`
      )
    }

    console.log("\n" + "=".repeat(70))
    return result
  } catch (error: any) {
    console.error("\n❌ Erreur lors de l'estimation:", error.message)
    console.error("   Stack:", error.stack)
    return null
  }
}

async function testDifferentScenarios() {
  console.log("\n" + "=".repeat(70))
  console.log("🔍 TEST 3: Différents scénarios")
  console.log("=".repeat(70))

  const scenarios = [
    {
      name: "Appartement neuf avec équipements",
      input: {
        city: "Paris",
        postalCode: "75008",
        surface: 65,
        rooms: 3,
        type: "Appartement" as const,
        condition: "neuf" as const,
        hasParking: true,
        hasBalcon: true,
        hasElevator: true,
        floor: 3,
      }
    },
    {
      name: "Appartement à rénover sans équipements",
      input: {
        city: "Paris",
        postalCode: "75008",
        surface: 65,
        rooms: 3,
        type: "Appartement" as const,
        condition: "à_rénover" as const,
        hasParking: false,
        hasBalcon: false,
        hasElevator: false,
        floor: 0,
      }
    },
    {
      name: "Maison avec jardin et piscine",
      input: {
        city: "Paris",
        postalCode: "75015",
        surface: 120,
        rooms: 5,
        type: "Maison" as const,
        condition: "bon_état" as const,
        hasGarden: true,
        hasPool: true,
        hasParking: true,
      }
    },
  ]

  for (const scenario of scenarios) {
    console.log(`\n📋 Scénario: ${scenario.name}`)
    try {
      const result = await estimateFromComparables(scenario.input)
      console.log(`   ✅ Prix estimé: ${result.priceMedian.toLocaleString("fr-FR")} €`)
      console.log(`   📊 Confiance: ${(result.confidence * 100).toFixed(1)}%`)
      console.log(`   🔧 Ajustements: ${result.adjustments?.length || 0}`)
    } catch (error: any) {
      console.log(`   ❌ Erreur: ${error.message}`)
    }
  }
}

async function main() {
  console.log("\n" + "🚀".repeat(35))
  console.log("   TEST DE L'ESTIMATION BASÉE SUR MEILLEURSAGENTS")
  console.log("🚀".repeat(35))

  // Test 1: Prix au m² réel du marché
  const marketPrice = await testMarketPricePerSqm()

  // Test 2: Estimation complète avec ajustements
  const estimationResult = await testEstimationWithAdjustments()

  // Test 3: Différents scénarios
  await testDifferentScenarios()

  // Résumé final
  console.log("\n" + "=".repeat(70))
  console.log("📊 RÉSUMÉ DES TESTS")
  console.log("=".repeat(70))
  console.log("✅ Prix au m² réel:", marketPrice ? "TROUVÉ" : "NON DISPONIBLE")
  console.log("💰 Estimation:", estimationResult ? "RÉUSSIE" : "ÉCHEC")
  
  if (estimationResult) {
    console.log("\n🎯 Estimation finale:")
    console.log("   Prix médian:", estimationResult.priceMedian.toLocaleString("fr-FR"), "€")
    console.log("   Fourchette:", 
      estimationResult.priceLow.toLocaleString("fr-FR"), "€ -",
      estimationResult.priceHigh.toLocaleString("fr-FR"), "€"
    )
    console.log("   Confiance:", (estimationResult.confidence * 100).toFixed(1), "%")
    console.log("   Stratégie:", estimationResult.strategy)
    console.log("   Références:", estimationResult.sampleSize)
    console.log("   Ajustements:", estimationResult.adjustments?.length || 0)
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

