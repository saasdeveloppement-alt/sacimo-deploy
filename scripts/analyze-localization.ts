/**
 * Script d'analyse des localisations récentes
 * Génère un rapport détaillé sur le fonctionnement du système de localisation
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface LocalizationReport {
  total: number
  bySource: Record<string, number>
  byConfidence: {
    high: number // > 0.8
    medium: number // 0.6-0.8
    low: number // < 0.6
  }
  recent: Array<{
    id: string
    address: string
    source: string
    confidence: number
    timestamp: Date
    annonceTitle: string
  }>
}

async function analyzeLocalizations(): Promise<LocalizationReport> {
  console.log("🔍 Analyse des localisations...\n")

  // Récupérer toutes les localisations avec leurs annonces
  const locations = await prisma.annonceLocation.findMany({
    where: {
      autoSource: { not: null },
      autoLatitude: { not: null },
      autoLongitude: { not: null },
    },
    include: {
      annonceScrape: {
        select: {
          title: true,
          city: true,
          postalCode: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 50, // Dernières 50 localisations
  })

  const report: LocalizationReport = {
    total: locations.length,
    bySource: {},
    byConfidence: {
      high: 0,
      medium: 0,
      low: 0,
    },
    recent: [],
  }

  // Analyser chaque localisation
  for (const loc of locations) {
    const source = loc.autoSource || "UNKNOWN"
    const confidence = loc.autoConfidence || 0

    // Compter par source
    report.bySource[source] = (report.bySource[source] || 0) + 1

    // Compter par confiance
    if (confidence > 0.8) {
      report.byConfidence.high++
    } else if (confidence >= 0.6) {
      report.byConfidence.medium++
    } else {
      report.byConfidence.low++
    }

    // Ajouter aux récentes
    report.recent.push({
      id: loc.id,
      address: loc.autoAddress || "N/A",
      source,
      confidence,
      timestamp: loc.updatedAt,
      annonceTitle: loc.annonceScrape.title,
    })
  }

  return report
}

function printReport(report: LocalizationReport) {
  console.log("=".repeat(80))
  console.log("📊 RAPPORT D'ANALYSE DU SYSTÈME DE LOCALISATION")
  console.log("=".repeat(80))
  console.log()

  console.log(`📈 Statistiques globales:`)
  console.log(`   Total de localisations analysées: ${report.total}`)
  console.log()

  console.log(`🎯 Répartition par source:`)
  const sortedSources = Object.entries(report.bySource).sort((a, b) => b[1] - a[1])
  for (const [source, count] of sortedSources) {
    const percentage = ((count / report.total) * 100).toFixed(1)
    const bar = "█".repeat(Math.round((count / report.total) * 20))
    console.log(`   ${source.padEnd(30)} ${count.toString().padStart(3)} (${percentage.padStart(5)}%) ${bar}`)
  }
  console.log()

  console.log(`💯 Répartition par confiance:`)
  console.log(`   Haute confiance (>80%):    ${report.byConfidence.high.toString().padStart(3)} (${((report.byConfidence.high / report.total) * 100).toFixed(1)}%)`)
  console.log(`   Confiance moyenne (60-80%): ${report.byConfidence.medium.toString().padStart(3)} (${((report.byConfidence.medium / report.total) * 100).toFixed(1)}%)`)
  console.log(`   Faible confiance (<60%):    ${report.byConfidence.low.toString().padStart(3)} (${((report.byConfidence.low / report.total) * 100).toFixed(1)}%)`)
  console.log()

  if (report.recent.length > 0) {
    console.log(`📋 Dernières localisations (${Math.min(10, report.recent.length)}):`)
    console.log()
    for (let i = 0; i < Math.min(10, report.recent.length); i++) {
      const loc = report.recent[i]
      const date = new Date(loc.timestamp).toLocaleString("fr-FR")
      const confPercent = Math.round(loc.confidence * 100)
      const confColor = loc.confidence > 0.8 ? "🟢" : loc.confidence > 0.6 ? "🟡" : "🔴"
      
      console.log(`   ${i + 1}. ${confColor} ${loc.source.padEnd(25)} ${confPercent}%`)
      console.log(`      📍 ${loc.address}`)
      console.log(`      📝 ${loc.annonceTitle.substring(0, 60)}${loc.annonceTitle.length > 60 ? "..." : ""}`)
      console.log(`      🕐 ${date}`)
      console.log()
    }
  }

  console.log("=".repeat(80))
}

async function main() {
  try {
    const report = await analyzeLocalizations()
    printReport(report)
  } catch (error) {
    console.error("❌ Erreur lors de l'analyse:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()



