/**
 * Script d'import des données DVF réelles pour Paris depuis data.gouv.fr
 * 
 * Usage: tsx scripts/import-dvf-paris.ts
 * 
 * Ce script :
 * 1. Télécharge le fichier CSV gzippé de Paris (75.csv.gz)
 * 2. Parse et filtre les données
 * 3. Insère dans Supabase par batch de 500
 * 4. Affiche la progression et les statistiques
 */

import { config } from "dotenv"
import { resolve } from "path"
import { createReadStream, createWriteStream, existsSync, unlinkSync, copyFileSync } from "fs"
import { pipeline } from "stream/promises"
import { createGunzip } from "zlib"
import { parse } from "csv-parse"
import { createClient } from "@supabase/supabase-js"

// Charger les variables d'environnement
config({ path: resolve(process.cwd(), ".env.local") })

// Configuration - URLs de fallback pour le fichier DVF
const DVF_URLS = [
  // Format avec année dans le chemin
  "https://files.data.gouv.fr/geo-dvf/latest/csv/2024/departements/75.csv.gz",
  "https://files.data.gouv.fr/geo-dvf/latest/csv/2023/departements/75.csv.gz",
  "https://files.data.gouv.fr/geo-dvf/latest/csv/2022/departements/75.csv.gz",
  // Format sans année
  "https://files.data.gouv.fr/geo-dvf/latest/csv/departements/75.csv.gz",
  // CSV non compressé (fallback)
  "https://static.data.gouv.fr/resources/demandes-de-valeurs-foncieres-geolocalisees/20241014-103147/dvf-communes-75.csv",
]

const CSV_FILE = "75.csv.gz"
const CSV_FILE_UNCOMPRESSED = "75.csv"
const DECOMPRESSED_FILE = "75.csv"

interface DVFRow {
  id_mutation: string
  date_mutation: string
  valeur_fonciere: number
  code_postal: string
  code_commune: string
  nom_commune: string
  surface_reelle_bati: number | null
  surface_terrain: number | null
  nombre_pieces_principales: number | null
  type_local: string | null
  latitude: number | null
  longitude: number | null
}

/**
 * Télécharge le fichier CSV (gzippé ou non)
 */
async function downloadFile(url: string, outputPath: string): Promise<boolean> {
  console.log("📥 Tentative de téléchargement...")
  console.log("   URL:", url)

  try {
    const response = await fetch(url)
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`   ❌ 404 - Fichier non trouvé à cette URL`)
        return false
      }
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`)
    }

    const fileStream = createWriteStream(outputPath)
    const reader = response.body?.getReader()
    const contentLength = parseInt(response.headers.get("content-length") || "0", 10)
    let downloaded = 0

    if (!reader) {
      throw new Error("Impossible de lire le flux de réponse")
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      fileStream.write(value)
      downloaded += value.length

      if (contentLength > 0) {
        const percent = ((downloaded / contentLength) * 100).toFixed(1)
        process.stdout.write(`\r   Progression: ${percent}% (${(downloaded / 1024 / 1024).toFixed(2)} MB)`)
      }
    }

    fileStream.end()
    console.log("\n✅ Téléchargement terminé")
    return true
  } catch (error: any) {
    console.log(`   ❌ Erreur: ${error.message}`)
    return false
  }
}

/**
 * Télécharge le fichier DVF en essayant plusieurs URLs
 */
async function downloadDVFFile(): Promise<{ filePath: string; isCompressed: boolean }> {
  console.log("🔍 Recherche du fichier DVF disponible...")
  console.log(`   ${DVF_URLS.length} URL(s) à essayer\n`)

  // Essayer d'abord les fichiers .gz
  for (let i = 0; i < DVF_URLS.length - 1; i++) {
    const url = DVF_URLS[i]
    const isGz = url.endsWith(".gz")
    const outputPath = isGz ? CSV_FILE : CSV_FILE_UNCOMPRESSED

    console.log(`[${i + 1}/${DVF_URLS.length}] Essai: ${url.substring(url.lastIndexOf("/") + 1)}`)

    const success = await downloadFile(url, outputPath)
    if (success) {
      return { filePath: outputPath, isCompressed: isGz }
    }
  }

  // Dernier essai avec le CSV non compressé
  const lastUrl = DVF_URLS[DVF_URLS.length - 1]
  console.log(`[${DVF_URLS.length}/${DVF_URLS.length}] Essai: CSV non compressé`)
  const success = await downloadFile(lastUrl, CSV_FILE_UNCOMPRESSED)

  if (success) {
    return { filePath: CSV_FILE_UNCOMPRESSED, isCompressed: false }
  }

  throw new Error("❌ Aucune URL DVF disponible. Toutes les tentatives ont échoué.")
}

/**
 * Décompresse le fichier .gz
 */
async function decompressFile(inputPath: string, outputPath: string): Promise<void> {
  console.log("📦 Décompression du fichier...")

  const gunzip = createGunzip()
  const source = createReadStream(inputPath)
  const destination = createWriteStream(outputPath)

  await pipeline(source, gunzip, destination)
  console.log("✅ Décompression terminée")
}

/**
 * Parse un nombre français (virgule comme séparateur décimal)
 */
function parseFrenchNumber(value: string | null | undefined): number | null {
  if (!value || value.trim() === "" || value === "null") return null
  // Remplacer la virgule par un point et parser
  const cleaned = value.replace(",", ".")
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

/**
 * Convertit une date au format français (DD/MM/YYYY) en ISO (YYYY-MM-DD)
 */
function parseFrenchDate(dateStr: string | null | undefined): string | null {
  if (!dateStr || dateStr.trim() === "") return null

  // Format attendu: DD/MM/YYYY ou YYYY-MM-DD
  if (dateStr.includes("/")) {
    const [day, month, year] = dateStr.split("/")
    if (day && month && year) {
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    }
  }

  // Si déjà au format ISO, retourner tel quel
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr
  }

  return null
}

/**
 * Filtre une ligne DVF selon les critères
 */
function isValidRow(row: any): boolean {
  // Type local doit être Appartement ou Maison
  const typeLocal = (row.type_local || row["Type local"] || "").toString().trim()
  if (!typeLocal || (typeLocal !== "Appartement" && typeLocal !== "Maison")) {
    return false
  }

  // Valeur foncière entre 100k et 3M
  const valeurFonciere = parseFrenchNumber(row.valeur_fonciere || row["Valeur foncière"])
  if (!valeurFonciere || valeurFonciere < 100000 || valeurFonciere > 3000000) {
    return false
  }

  // Surface entre 15 et 200m²
  const surface = parseFrenchNumber(row.surface_reelle_bati || row["Surface reelle bati"])
  if (!surface || surface < 15 || surface > 200) {
    return false
  }

  // Date entre 2022 et 2024
  const dateMutation = parseFrenchDate(row.date_mutation || row["Date mutation"])
  if (!dateMutation) {
    return false
  }
  const year = parseInt(dateMutation.substring(0, 4), 10)
  if (year < 2022 || year > 2024) {
    return false
  }

  // Code postal doit être valide (5 chiffres)
  const codePostal = (row.code_postal || row["Code postal"] || "").toString().trim()
  if (!codePostal || !codePostal.match(/^\d{5}$/)) {
    return false
  }

  return true
}

/**
 * Convertit une ligne CSV en objet DVFRow
 */
function parseRow(row: any): DVFRow | null {
  if (!isValidRow(row)) {
    return null
  }

  // Gérer les différents noms de colonnes possibles
  const getValue = (key1: string, key2?: string) => {
    return row[key1] || (key2 ? row[key2] : null) || ""
  }

  const valeurFonciere = parseFrenchNumber(getValue("valeur_fonciere", "Valeur foncière"))!
  const surfaceReelleBati = parseFrenchNumber(getValue("surface_reelle_bati", "Surface reelle bati"))!
  const codePostal = getValue("code_postal", "Code postal").toString().trim()

  return {
    id_mutation: getValue("id_mutation", "ID mutation").toString().trim() || null,
    date_mutation: parseFrenchDate(getValue("date_mutation", "Date mutation"))!,
    valeur_fonciere: valeurFonciere,
    code_postal: codePostal,
    code_commune: getValue("code_commune", "Code commune").toString().trim() || codePostal.substring(0, 3),
    nom_commune: getValue("nom_commune", "Nom commune").toString().trim() || "Paris",
    surface_reelle_bati: surfaceReelleBati,
    surface_terrain: parseFrenchNumber(getValue("surface_terrain", "Surface terrain")),
    nombre_pieces_principales: parseFrenchNumber(getValue("nombre_pieces_principales", "Nombre pieces principales")),
    type_local: getValue("type_local", "Type local").toString().trim(),
    latitude: parseFrenchNumber(getValue("latitude", "Latitude")),
    longitude: parseFrenchNumber(getValue("longitude", "Longitude")),
  }
}

/**
 * Insère les données dans Supabase par batch
 */
async function insertBatch(
  supabase: any,
  batch: DVFRow[],
  batchNumber: number
): Promise<{ inserted: number; errors: number }> {
  try {
    // Préparer les données pour l'insertion
    const dataToInsert = batch.map((row) => ({
      id_mutation: row.id_mutation,
      date_mutation: row.date_mutation,
      valeur_fonciere: row.valeur_fonciere,
      code_postal: row.code_postal,
      code_commune: row.code_commune,
      nom_commune: row.nom_commune,
      surface_reelle_bati: row.surface_reelle_bati,
      surface_terrain: row.surface_terrain,
      nombre_pieces_principales: row.nombre_pieces_principales,
      type_local: row.type_local,
      latitude: row.latitude,
      longitude: row.longitude,
    }))

    // Utiliser upsert avec onConflict pour éviter les doublons
    const { error } = await supabase.from("dvf_transactions").upsert(dataToInsert, {
      onConflict: "id_mutation,date_mutation,code_postal,valeur_fonciere",
      ignoreDuplicates: false,
    })

    if (error) {
      console.error(`\n❌ Erreur batch ${batchNumber}:`, error.message)
      return { inserted: 0, errors: batch.length }
    }

    return { inserted: batch.length, errors: 0 }
  } catch (error: any) {
    console.error(`\n❌ Erreur batch ${batchNumber}:`, error.message)
    return { inserted: 0, errors: batch.length }
  }
}

/**
 * Parse le CSV et importe dans Supabase
 */
async function importCSV(supabase: any, csvPath: string): Promise<void> {
  console.log("\n📖 Lecture et parsing du CSV...")

  const batchSize = 500
  let batch: DVFRow[] = []
  let totalRows = 0
  let validRows = 0
  let insertedRows = 0
  let errorRows = 0
  let batchNumber = 0

  return new Promise((resolve, reject) => {
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: ";", // Les CSV DVF utilisent le point-virgule
      bom: true, // Gérer le BOM UTF-8 si présent
      relax_column_count: true, // Tolérer les colonnes manquantes
    })

    createReadStream(csvPath)
      .pipe(parser)
      .on("data", async (row: any) => {
        totalRows++

        const parsedRow = parseRow(row)
        if (parsedRow) {
          validRows++
          batch.push(parsedRow)

          // Insérer par batch
          if (batch.length >= batchSize) {
            batchNumber++
            const result = await insertBatch(supabase, batch, batchNumber)
            insertedRows += result.inserted
            errorRows += result.errors
            batch = []
            
            // Afficher la progression
            process.stdout.write(
              `\r📊 Batch ${batchNumber} | Lignes: ${totalRows.toLocaleString("fr-FR")} | Valides: ${validRows.toLocaleString("fr-FR")} | Insérées: ${insertedRows.toLocaleString("fr-FR")}`
            )
          }
        }

        // Afficher la progression tous les 1000 lignes si pas de batch récent
        if (totalRows % 1000 === 0 && batch.length < batchSize) {
          process.stdout.write(
            `\r📊 Lignes traitées: ${totalRows.toLocaleString("fr-FR")} | Valides: ${validRows.toLocaleString("fr-FR")} | Insérées: ${insertedRows.toLocaleString("fr-FR")}`
          )
        }
      })
      .on("end", async () => {
        // Insérer le dernier batch
        if (batch.length > 0) {
          batchNumber++
          console.log(`\n📦 Insertion du dernier batch (${batch.length} lignes)...`)
          const result = await insertBatch(supabase, batch, batchNumber)
          insertedRows += result.inserted
          errorRows += result.errors
        }

        console.log("\n" + "=".repeat(70))
        console.log("✅ IMPORT TERMINÉ")
        console.log("=".repeat(70))
        console.log("\n📊 Statistiques finales:")
        console.log("   Lignes totales lues:", totalRows.toLocaleString("fr-FR"))
        console.log("   Lignes valides (filtres):", validRows.toLocaleString("fr-FR"))
        console.log("   Lignes insérées en base:", insertedRows.toLocaleString("fr-FR"))
        console.log("   Erreurs:", errorRows.toLocaleString("fr-FR"))
        console.log("   Taux de réussite:", ((insertedRows / validRows) * 100).toFixed(1) + "%")

        resolve()
      })
      .on("error", (error) => {
        reject(error)
      })
  })
}

/**
 * Affiche les statistiques par code postal
 */
async function displayStats(supabase: any): Promise<void> {
  console.log("\n📊 Statistiques par code postal:")

  // Stats globales pour Paris
  const { data: allData, error: allError } = await supabase
    .from("dvf_transactions")
    .select("code_postal, valeur_fonciere, surface_reelle_bati, type_local")
    .like("code_postal", "75%")
    .limit(10000)

  if (allError) {
    console.error("❌ Erreur lors de la récupération des stats:", allError.message)
    return
  }

  if (allData && allData.length > 0) {
    console.log(`\n📊 Total transactions Paris: ${allData.length.toLocaleString("fr-FR")}`)

    // Stats par code postal (top 10)
    const statsByPostal: Record<string, { count: number; prices: number[] }> = {}

    allData.forEach((d) => {
      if (d.surface_reelle_bati > 0) {
        const cp = d.code_postal
        if (!statsByPostal[cp]) {
          statsByPostal[cp] = { count: 0, prices: [] }
        }
        statsByPostal[cp].count++
        statsByPostal[cp].prices.push(d.valeur_fonciere / d.surface_reelle_bati)
      }
    })

    const topPostals = Object.entries(statsByPostal)
      .map(([cp, stats]) => ({
        code_postal: cp,
        count: stats.count,
        avgPricePerSqm: stats.prices.reduce((sum, p) => sum + p, 0) / stats.prices.length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    console.log("\n📊 Top 10 codes postaux par nombre de transactions:")
    topPostals.forEach((stat, i) => {
      console.log(
        `   ${i + 1}. ${stat.code_postal}: ${stat.count} transactions, ${Math.round(stat.avgPricePerSqm).toLocaleString("fr-FR")} €/m² moyen`
      )
    })

    // Stats par type
    const appartCount = allData.filter((d) => d.type_local === "Appartement").length
    const maisonCount = allData.filter((d) => d.type_local === "Maison").length

    console.log("\n📊 Répartition par type:")
    console.log(`   Appartements: ${appartCount.toLocaleString("fr-FR")}`)
    console.log(`   Maisons: ${maisonCount.toLocaleString("fr-FR")}`)
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log("\n" + "=".repeat(70))
  console.log("🚀 IMPORT DES DONNÉES DVF POUR PARIS")
  console.log("=".repeat(70))

  // Vérifier les variables d'environnement
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("\n❌ ERREUR: Variables d'environnement manquantes")
    console.error("   SUPABASE_URL:", supabaseUrl ? "✅" : "❌")
    console.error("   SUPABASE_SERVICE_ROLE_KEY:", supabaseKey ? "✅" : "❌")
    console.error("\n💡 Vérifiez votre fichier .env.local")
    process.exit(1)
  }

  console.log("\n✅ Variables d'environnement OK")
  console.log("   SUPABASE_URL:", supabaseUrl.substring(0, 30) + "...")

  // Créer le client Supabase
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    // 1. Télécharger le fichier (avec fallback sur plusieurs URLs)
    let downloadedFile: { filePath: string; isCompressed: boolean }
    let needsDecompression = false

    if (existsSync(CSV_FILE)) {
      console.log("✅ Fichier .gz déjà téléchargé, utilisation du cache")
      downloadedFile = { filePath: CSV_FILE, isCompressed: true }
      needsDecompression = true
    } else if (existsSync(CSV_FILE_UNCOMPRESSED)) {
      console.log("✅ Fichier CSV déjà téléchargé, utilisation du cache")
      downloadedFile = { filePath: CSV_FILE_UNCOMPRESSED, isCompressed: false }
      needsDecompression = false
    } else {
      downloadedFile = await downloadDVFFile()
      needsDecompression = downloadedFile.isCompressed
    }

    // 2. Décompresser si nécessaire
    if (needsDecompression) {
      if (!existsSync(DECOMPRESSED_FILE)) {
        await decompressFile(downloadedFile.filePath, DECOMPRESSED_FILE)
      } else {
        console.log("✅ Fichier déjà décompressé, utilisation du cache")
      }
    } else {
      // Le fichier est déjà décompressé, on peut l'utiliser directement
      if (downloadedFile.filePath !== DECOMPRESSED_FILE) {
        // Copier le fichier au bon nom si nécessaire
        copyFileSync(downloadedFile.filePath, DECOMPRESSED_FILE)
        console.log("✅ Fichier CSV copié au bon emplacement")
      }
    }

    // 3. Importer
    await importCSV(supabase, DECOMPRESSED_FILE)

    // 4. Afficher les statistiques
    await displayStats(supabase)

    // 5. Nettoyer les fichiers temporaires (optionnel)
    console.log("\n🧹 Nettoyage des fichiers temporaires...")
    try {
      if (existsSync(CSV_FILE)) {
        unlinkSync(CSV_FILE)
        console.log("   ✅ Fichier .gz supprimé")
      }
      if (existsSync(CSV_FILE_UNCOMPRESSED) && CSV_FILE_UNCOMPRESSED !== DECOMPRESSED_FILE) {
        unlinkSync(CSV_FILE_UNCOMPRESSED)
        console.log("   ✅ Fichier CSV temporaire supprimé")
      }
      if (existsSync(DECOMPRESSED_FILE)) {
        unlinkSync(DECOMPRESSED_FILE)
        console.log("   ✅ Fichier CSV décompressé supprimé")
      }
    } catch (error: any) {
      console.log("   ⚠️ Erreur lors du nettoyage (non bloquant):", error.message)
    }

    console.log("\n" + "=".repeat(70))
    console.log("✅ IMPORT TERMINÉ AVEC SUCCÈS")
    console.log("=".repeat(70) + "\n")
  } catch (error: any) {
    console.error("\n❌ ERREUR:", error.message)
    console.error("   Stack:", error.stack)
    process.exit(1)
  }
}

// Exécuter
main().catch((error) => {
  console.error("\n❌ Erreur fatale:", error)
  process.exit(1)
})

