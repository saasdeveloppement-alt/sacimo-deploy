/**
 * Script d'import des données DVF depuis Box.com (Cerema)
 * 
 * Usage: tsx scripts/import-dvf-box.ts
 * 
 * Ce script :
 * 1. Récupère les liens des fichiers DVF depuis Box.com
 * 2. Télécharge les fichiers CSV
 * 3. Parse et filtre les données
 * 4. Insère dans Supabase par batch de 500
 * 5. Affiche la progression et les statistiques
 */

import { config } from "dotenv"
import { resolve } from "path"
import { createReadStream, createWriteStream, existsSync, unlinkSync, copyFileSync, mkdirSync } from "fs"
import { pipeline } from "stream/promises"
import { createGunzip } from "zlib"
import { parse } from "csv-parse"
import { createClient } from "@supabase/supabase-js"

// Charger les variables d'environnement
config({ path: resolve(process.cwd(), ".env.local") })

// Configuration Box.com
const BOX_FOLDER_URL = "https://cerema.app.box.com/v/dvfplus-opendata/folder/347156829578"
const BOX_API_BASE = "https://api.box.com/2.0"

// URLs alternatives pour télécharger directement les fichiers DVF
// Ces URLs peuvent être obtenues en cliquant sur "Télécharger" dans Box et en copiant le lien direct
const DVF_BOX_URLS = [
  // Format possible pour les fichiers DVF depuis Box
  // Note: Ces URLs doivent être mises à jour avec les vrais liens de téléchargement direct
  "https://app.box.com/shared/static/.../dvf-75.csv.gz",
  "https://cerema.app.box.com/s/.../dvf-75.csv.gz",
]

// Configuration locale
const DOWNLOAD_DIR = "dvf-downloads"
const CSV_FILE = `${DOWNLOAD_DIR}/75.csv.gz`
const CSV_FILE_UNCOMPRESSED = `${DOWNLOAD_DIR}/75.csv`
const DECOMPRESSED_FILE = `${DOWNLOAD_DIR}/75-decompressed.csv`

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
 * Récupère les liens de fichiers depuis Box.com en utilisant le scraping
 * Note: Box nécessite souvent une authentification, cette fonction tente de récupérer les liens publics
 */
async function getBoxFileLinks(folderUrl: string): Promise<string[]> {
  console.log("🔍 Récupération des liens depuis Box.com...")
  console.log("   URL du dossier:", folderUrl)

  try {
    // Option 1: Essayer de récupérer via l'API Box (nécessite un token)
    // Pour l'instant, on va utiliser une approche plus simple avec des URLs directes

    // Option 2: Utiliser des URLs de téléchargement direct si disponibles
    // Ces URLs peuvent être obtenues manuellement depuis Box en cliquant sur "Télécharger"
    // et en copiant le lien direct

    console.log("⚠️  Note: Box nécessite généralement une authentification")
    console.log("   Pour obtenir les URLs directes:")
    console.log("   1. Allez sur:", folderUrl)
    console.log("   2. Cliquez sur un fichier (ex: dvf-75.csv.gz)")
    console.log("   3. Cliquez sur 'Télécharger'")
    console.log("   4. Copiez l'URL de téléchargement direct")
    console.log("   5. Ajoutez-la dans DVF_BOX_URLS dans le script\n")

    // Retourner les URLs configurées
    return DVF_BOX_URLS.filter(url => url && !url.includes("..."))
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération des liens Box:", error.message)
    return []
  }
}

/**
 * Télécharge un fichier depuis une URL
 */
async function downloadFile(url: string, outputPath: string): Promise<boolean> {
  console.log("📥 Téléchargement...")
  console.log("   URL:", url)

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`   ❌ 404 - Fichier non trouvé`)
        return false
      }
      if (response.status === 403) {
        console.log(`   ❌ 403 - Accès refusé (authentification requise)`)
        return false
      }
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`)
    }

    // Créer le dossier de téléchargement si nécessaire
    const dir = outputPath.substring(0, outputPath.lastIndexOf("/"))
    if (dir && !existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
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
 * Télécharge le fichier DVF depuis Box
 */
async function downloadDVFFromBox(): Promise<{ filePath: string; isCompressed: boolean }> {
  console.log("🔍 Recherche du fichier DVF depuis Box.com...\n")

  // Essayer de récupérer les liens
  const fileLinks = await getBoxFileLinks(BOX_FOLDER_URL)

  if (fileLinks.length === 0) {
    console.log("⚠️  Aucune URL configurée. Utilisation des URLs alternatives...")
    
    // Essayer les URLs alternatives (data.gouv.fr en fallback)
    const fallbackUrls = [
      "https://files.data.gouv.fr/geo-dvf/latest/csv/2024/departements/75.csv.gz",
      "https://files.data.gouv.fr/geo-dvf/latest/csv/2023/departements/75.csv.gz",
      "https://files.data.gouv.fr/geo-dvf/latest/csv/departements/75.csv.gz",
    ]

    for (let i = 0; i < fallbackUrls.length; i++) {
      const url = fallbackUrls[i]
      const outputPath = CSV_FILE
      console.log(`[${i + 1}/${fallbackUrls.length}] Essai fallback: ${url.substring(url.lastIndexOf("/") + 1)}`)
      
      const success = await downloadFile(url, outputPath)
      if (success) {
        return { filePath: outputPath, isCompressed: true }
      }
    }

    throw new Error("❌ Aucune source de données disponible. Veuillez configurer DVF_BOX_URLS avec des URLs de téléchargement direct depuis Box.")
  }

  // Essayer chaque lien
  for (let i = 0; i < fileLinks.length; i++) {
    const url = fileLinks[i]
    const isGz = url.endsWith(".gz")
    const outputPath = isGz ? CSV_FILE : CSV_FILE_UNCOMPRESSED

    console.log(`[${i + 1}/${fileLinks.length}] Essai: ${url.substring(url.lastIndexOf("/") + 1)}`)

    const success = await downloadFile(url, outputPath)
    if (success) {
      return { filePath: outputPath, isCompressed: isGz }
    }
  }

  throw new Error("❌ Aucun fichier DVF téléchargeable depuis Box. Vérifiez les URLs dans DVF_BOX_URLS.")
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
  const cleaned = value.replace(",", ".")
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

/**
 * Convertit une date au format français (DD/MM/YYYY) en ISO (YYYY-MM-DD)
 */
function parseFrenchDate(dateStr: string | null | undefined): string | null {
  if (!dateStr || dateStr.trim() === "") return null

  if (dateStr.includes("/")) {
    const [day, month, year] = dateStr.split("/")
    if (day && month && year) {
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    }
  }

  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr
  }

  return null
}

/**
 * Filtre une ligne DVF selon les critères
 */
function isValidRow(row: any): boolean {
  const typeLocal = (row.type_local || row["Type local"] || "").toString().trim()
  if (!typeLocal || (typeLocal !== "Appartement" && typeLocal !== "Maison")) {
    return false
  }

  const valeurFonciere = parseFrenchNumber(row.valeur_fonciere || row["Valeur foncière"])
  if (!valeurFonciere || valeurFonciere < 100000 || valeurFonciere > 3000000) {
    return false
  }

  const surface = parseFrenchNumber(row.surface_reelle_bati || row["Surface reelle bati"])
  if (!surface || surface < 15 || surface > 200) {
    return false
  }

  const dateMutation = parseFrenchDate(row.date_mutation || row["Date mutation"])
  if (!dateMutation) {
    return false
  }
  const year = parseInt(dateMutation.substring(0, 4), 10)
  if (year < 2022 || year > 2024) {
    return false
  }

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
      delimiter: ";",
      bom: true,
      relax_column_count: true,
    })

    createReadStream(csvPath)
      .pipe(parser)
      .on("data", async (row: any) => {
        totalRows++

        const parsedRow = parseRow(row)
        if (parsedRow) {
          validRows++
          batch.push(parsedRow)

          if (batch.length >= batchSize) {
            batchNumber++
            const result = await insertBatch(supabase, batch, batchNumber)
            insertedRows += result.inserted
            errorRows += result.errors
            batch = []

            process.stdout.write(
              `\r📊 Batch ${batchNumber} | Lignes: ${totalRows.toLocaleString("fr-FR")} | Valides: ${validRows.toLocaleString("fr-FR")} | Insérées: ${insertedRows.toLocaleString("fr-FR")}`
            )
          }
        }

        if (totalRows % 1000 === 0 && batch.length < batchSize) {
          process.stdout.write(
            `\r📊 Lignes traitées: ${totalRows.toLocaleString("fr-FR")} | Valides: ${validRows.toLocaleString("fr-FR")} | Insérées: ${insertedRows.toLocaleString("fr-FR")}`
          )
        }
      })
      .on("end", async () => {
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
 * Affiche les statistiques
 */
async function displayStats(supabase: any): Promise<void> {
  console.log("\n📊 Statistiques par code postal:")

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
  console.log("🚀 IMPORT DES DONNÉES DVF DEPUIS BOX.COM (CEREMA)")
  console.log("=".repeat(70))

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

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    // 1. Télécharger depuis Box
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
      downloadedFile = await downloadDVFFromBox()
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
      if (downloadedFile.filePath !== DECOMPRESSED_FILE) {
        copyFileSync(downloadedFile.filePath, DECOMPRESSED_FILE)
        console.log("✅ Fichier CSV copié au bon emplacement")
      }
    }

    // 3. Importer
    await importCSV(supabase, DECOMPRESSED_FILE)

    // 4. Afficher les statistiques
    await displayStats(supabase)

    // 5. Nettoyer
    console.log("\n🧹 Nettoyage des fichiers temporaires...")
    try {
      if (existsSync(CSV_FILE)) unlinkSync(CSV_FILE)
      if (existsSync(CSV_FILE_UNCOMPRESSED) && CSV_FILE_UNCOMPRESSED !== DECOMPRESSED_FILE) {
        unlinkSync(CSV_FILE_UNCOMPRESSED)
      }
      if (existsSync(DECOMPRESSED_FILE)) unlinkSync(DECOMPRESSED_FILE)
      console.log("   ✅ Fichiers temporaires supprimés")
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

main().catch((error) => {
  console.error("\n❌ Erreur fatale:", error)
  process.exit(1)
})

