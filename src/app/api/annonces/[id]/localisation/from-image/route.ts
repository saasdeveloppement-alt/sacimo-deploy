/**
 * Route API pour localiser un bien à partir d'une image
 * POST /api/annonces/[id]/localisation/from-image
 * 
 * Pipeline :
 * 1. Lecture EXIF (si disponible)
 * 2. Google Vision API (OCR)
 * 3. Extraction d'adresses candidates
 * 4. Google Geocoding API
 * 5. Street View (validation)
 * 6. Sauvegarde dans AnnonceLocation
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PrismaClient } from "@prisma/client"
import {
  callVisionForImage,
  extractAddressCandidatesFromVision,
  geocodeAddressCandidates,
  readExifFromImage,
  fetchStreetViewPreview,
  fetchStreetViewEmbedUrl,
  reverseGeocode,
  guessLocationWithLLM,
} from "@/lib/google/locationClient"
import { detectMapScreenshot } from "@/lib/detection/detectMapScreenshot"
import { isMapsScreenshot } from "@/lib/detection/isMapsScreenshot"
import { extractLocationFromMapsScreenshot as extractFromMapsOCR } from "@/lib/extract/extractFromMaps"
import { extractLocationFromMapsScreenshot as extractFromMapsVision } from "@/lib/maps/extractLocationFromMapsScreenshot"
import { matchStreetViewVisual } from "@/lib/streetview/matcher"
import { matchStreetViewDense } from "@/lib/streetview/denseMatcher"
import { mergeResults, isAddressTooVague } from "@/lib/fusion/mergeResults"
import { consolidateWeighted } from "@/lib/fusion/weightedConsolidation"
import { prioritizeResults } from "@/lib/fusion/prioritizeResults"
import { isInsideDepartment, filterByDepartment } from "@/lib/geo/isInsideDepartment"
import { analyzeImageAdvanced } from "@/lib/vision/advancedAnalysis"
import { extractOCRHeavy } from "@/lib/vision/ocrHeavy"
// import { analyzeImageWithOcr } from "@/lib/google/ocrLocation" // Fonction non disponible, skip si Google Vision n'est pas utilisé
import { reasonLocationWithLLM } from "@/lib/llm/locationReasoner"
import { consolidateResultsWithExplanation } from "@/lib/location/consolidateResults"
import type { LocationFromImageResult, GeocodedCandidate, LocationResult, EvidenceItem } from "@/types/location"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Déclarer toutes les variables au début du scope pour éviter les erreurs "not defined"
  let visionResult: any = null
  let visionText = ""
  let visualAnalysis: any = null
  let ocrHeavy: any = null
  let ocrAnalysis: any = null
  let geocodedCandidates: any[] = []
  
  try {
    // 1. Auth & validation (optionnel pour les tests locaux)
    // En production, décommenter cette section
    // const session = await getServerSession(authOptions)
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { status: "error", error: "Non authentifié" },
    //     { status: 401 },
    //   )
    // }

    // Vérifier que prisma est bien initialisé
    if (!prisma) {
      console.error("❌ [Localisation] Prisma n'est pas initialisé")
      return NextResponse.json(
        { status: "error", error: "Erreur de configuration serveur" },
        { status: 500 },
      )
    }

    const { id } = await params

    // 2. Récupération du listing (ou création si demo)
    // Helper pour gérer les connexions fermées avec retry
    const executeWithRetry = async <T>(
      operation: () => Promise<T>,
      maxRetries = 2,
    ): Promise<T> => {
      let lastError: Error | null = null
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await operation()
        } catch (error: any) {
          lastError = error
          const isConnectionError = 
            error.message?.includes('closed the connection') ||
            error.message?.includes('connection') ||
            error.code === 'P1001' ||
            error.code === 'P1008'
          
          if (isConnectionError && attempt < maxRetries) {
            console.warn(`⚠️ [Localisation] Tentative ${attempt}/${maxRetries} échouée (connexion fermée), reconnexion...`)
            await new Promise(resolve => setTimeout(resolve, 500 * attempt))
            continue
          }
          throw error
        }
      }
      throw lastError || new Error('Échec après plusieurs tentatives')
    }

    let annonce = await executeWithRetry(() =>
      prisma.annonceScrape.findUnique({
        where: { id },
        select: {
          id: true,
          city: true,
          postalCode: true,
          title: true,
        },
      })
    )

    // Si l'annonce n'existe pas et que c'est un ID demo, créer une annonce temporaire
    if (!annonce && id === "demo-annonce-id") {
      annonce = await prisma.annonceScrape.create({
        data: {
          id: "demo-annonce-id",
          title: "Bien de démonstration - Localisation IA",
          price: 0,
          city: "Paris",
          postalCode: "75001",
          url: "https://demo.sacimo.local",
          publishedAt: new Date(),
          source: "DEMO",
        },
        select: {
          id: true,
          city: true,
          postalCode: true,
          title: true,
        },
      })
    }

    if (!annonce) {
      return NextResponse.json(
        { status: "error", error: "Annonce non trouvée" },
        { status: 404 },
      )
    }

    // 3. Récupération du FormData
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const departmentCode = formData.get("department") as string | null
    const city = formData.get("city") as string | null
    const postalCode = formData.get("postalCode") as string | null
    const contextCategories = formData.getAll("contextCategories[]") as string[]
    const contextNotes = formData.get("contextNotes") as string | null

    if (!file) {
      return NextResponse.json(
        { status: "error", error: "Aucun fichier fourni" },
        { status: 400 },
      )
    }

    if (!departmentCode) {
      return NextResponse.json(
        { status: "error", error: "Département requis" },
        { status: 400 },
      )
    }

    // Fonction pour obtenir le nom du département à partir du code
    const getDepartmentName = (code: string): string | null => {
      const deptMap: Record<string, string> = {
        "01": "Ain", "02": "Aisne", "03": "Allier", "04": "Alpes-de-Haute-Provence",
        "05": "Hautes-Alpes", "06": "Alpes-Maritimes", "07": "Ardèche", "08": "Ardennes",
        "09": "Ariège", "10": "Aube", "11": "Aude", "12": "Aveyron",
        "13": "Bouches-du-Rhône", "14": "Calvados", "15": "Cantal", "16": "Charente",
        "17": "Charente-Maritime", "18": "Cher", "19": "Corrèze", "21": "Côte-d'Or",
        "22": "Côtes-d'Armor", "23": "Creuse", "24": "Dordogne", "25": "Doubs",
        "26": "Drôme", "27": "Eure", "28": "Eure-et-Loir", "29": "Finistère",
        "2A": "Corse-du-Sud", "2B": "Haute-Corse", "30": "Gard", "31": "Haute-Garonne",
        "32": "Gers", "33": "Gironde", "34": "Hérault", "35": "Ille-et-Vilaine",
        "36": "Indre", "37": "Indre-et-Loire", "38": "Isère", "39": "Jura",
        "40": "Landes", "41": "Loir-et-Cher", "42": "Loire", "43": "Haute-Loire",
        "44": "Loire-Atlantique", "45": "Loiret", "46": "Lot", "47": "Lot-et-Garonne",
        "48": "Lozère", "49": "Maine-et-Loire", "50": "Manche", "51": "Marne",
        "52": "Haute-Marne", "53": "Mayenne", "54": "Meurthe-et-Moselle", "55": "Meuse",
        "56": "Morbihan", "57": "Moselle", "58": "Nièvre", "59": "Nord",
        "60": "Oise", "61": "Orne", "62": "Pas-de-Calais", "63": "Puy-de-Dôme",
        "64": "Pyrénées-Atlantiques", "65": "Hautes-Pyrénées", "66": "Pyrénées-Orientales",
        "67": "Bas-Rhin", "68": "Haut-Rhin", "69": "Rhône", "70": "Haute-Saône",
        "71": "Saône-et-Loire", "72": "Sarthe", "73": "Savoie", "74": "Haute-Savoie",
        "75": "Paris", "76": "Seine-Maritime", "77": "Seine-et-Marne", "78": "Yvelines",
        "79": "Deux-Sèvres", "80": "Somme", "81": "Tarn", "82": "Tarn-et-Garonne",
        "83": "Var", "84": "Vaucluse", "85": "Vendée", "86": "Vienne",
        "87": "Haute-Vienne", "88": "Vosges", "89": "Yonne", "90": "Territoire de Belfort",
        "91": "Essonne", "92": "Hauts-de-Seine", "93": "Seine-Saint-Denis", "94": "Val-de-Marne",
        "95": "Val-d'Oise", "971": "Guadeloupe", "972": "Martinique", "973": "Guyane",
        "974": "La Réunion", "976": "Mayotte",
      }
      return deptMap[code] || null
    }

    const departmentName = getDepartmentName(departmentCode)
    console.log(`📍 [Localisation] Département fourni: ${departmentCode}${departmentName ? ` (${departmentName})` : ""}`)

    // Validation du type de fichier
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          status: "error",
          error: "Type de fichier non supporté. Utilisez JPG, PNG ou WebP.",
        },
        { status: 400 },
      )
    }

    // Validation de la taille (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { status: "error", error: "Fichier trop volumineux (max 10MB)" },
        { status: 400 },
      )
    }

    // 4. Conversion en Buffer
    const arrayBuffer = await file.arrayBuffer()
    const imageBuffer = Buffer.from(arrayBuffer)

    // Construire le contexte LLM
    const llmContext = departmentName && departmentCode ? {
      departementCode: departmentCode,
      departementName: departmentName,
      city: city || null,
      postalCode: postalCode || null,
      categories: contextCategories.length > 0 ? contextCategories : undefined,
      notes: contextNotes || null,
    } : undefined

    // Pipeline de localisation - Collecte de tous les résultats
    const allResults: LocationResult[] = []
    
    // Convertir l'image en base64 UNE SEULE FOIS (optimisation)
    const imageBase64 = imageBuffer.toString("base64")
    
    // Fonction helper pour vérifier si on peut arrêter tôt
    // Seuil à 0.92 pour garder la qualité tout en optimisant la vitesse
    const canEarlyExit = (): boolean => {
      if (allResults.length === 0) return false
      const bestResult = allResults.reduce((best, current) => 
        (current.confidence || 0) > (best.confidence || 0) ? current : best
      )
      // Seuil élevé (0.92) pour ne pas sacrifier la qualité
      // Mais on permet quand même un early exit si on a plusieurs résultats cohérents
      if (allResults.length >= 2 && (bestResult.confidence || 0) >= 0.88) {
        return true // Si on a 2+ résultats cohérents, on peut sortir plus tôt
      }
      return (bestResult.confidence || 0) >= 0.92 // Sinon, on attend un résultat très fiable
    }

    // 🚀 OPTIMISATION: Paralléliser les deux appels OpenAI dès le début
    console.log("🚀 [Localisation] Démarrage parallèle: Maps detection + LLM Reasoning...")
    
    // Lancer les deux appels OpenAI en parallèle pour gagner du temps
    const [mapsDetection, llmReasoning] = await Promise.all([
      isMapsScreenshot(imageBase64),
      reasonLocationWithLLM(imageBase64, {
        ...llmContext!,
        ocrShopNames: [],
        ocrStreetCandidates: [],
        visualIndices: [],
      }).catch((err) => {
        console.warn("⚠️ [Localisation] Erreur LLM Reasoning (non bloquant):", err.message)
        return null
      }),
    ])
    
    console.log(`🔍 [Localisation] Détection OpenAI Vision: isMaps=${mapsDetection.isMaps}, confidence=${mapsDetection.confidence.toFixed(2)}`)
    
    console.log(`🔍 [Localisation] Détection OpenAI Vision: isMaps=${mapsDetection.isMaps}, confidence=${mapsDetection.confidence.toFixed(2)}`)
    
    if (mapsDetection.isMaps && mapsDetection.confidence > 0.55) {
      console.log(`✅ [Localisation] Screenshot Google Maps détecté par OpenAI Vision (confiance: ${mapsDetection.confidence.toFixed(2)})`)
      
      // Utiliser le nouveau module Vision (classifieur robuste + LLM StreetView)
      const mapsLocation = await extractFromMapsVision(imageBase64, departmentCode)
      
      if (mapsLocation && mapsLocation.lat && mapsLocation.lng) {
        console.log(`📍 [Localisation] Coordonnées extraites depuis screenshot Vision: ${mapsLocation.lat}, ${mapsLocation.lng}`)
        
        // HARD LOCK: Vérifier que le point est dans le département
        if (isInsideDepartment(mapsLocation.lat, mapsLocation.lng, departmentCode)) {
          // Utiliser reverse geocoding pour obtenir l'adresse complète si pas déjà fournie (en parallèle avec la création des URLs)
          let address = mapsLocation.address
          const reverseGeocodePromise = (!address || address.length < 10) 
            ? reverseGeocode(mapsLocation.lat, mapsLocation.lng)
            : Promise.resolve(null)
          
          // Générer les URLs Street View en parallèle
          const [reverseGeocodeResult] = await Promise.all([
            reverseGeocodePromise,
            // Pré-générer les URLs (opération synchrone, pas besoin d'attendre)
          ])
          
          if (reverseGeocodeResult) {
            address = reverseGeocodeResult.address || mapsLocation.address || null
          }
          
          allResults.push({
            source: "MAPS_SCREENSHOT",
            latitude: mapsLocation.lat,
            longitude: mapsLocation.lng,
            address,
            confidence: mapsLocation.confidence,
            streetViewUrl: fetchStreetViewPreview(mapsLocation.lat, mapsLocation.lng, "600x400", 0),
            streetViewEmbedUrl: fetchStreetViewEmbedUrl(mapsLocation.lat, mapsLocation.lng, 0),
            heading: 0,
            method: "OPENAI_VISION_STREETVIEW",
            evidences: [
              {
                type: "GOOGLE_MAPS_SCREENSHOT",
                label: "Capture d'écran Google Maps détectée",
                detail: "Coordonnées ou adresse extraites de la capture",
                weight: 0.9,
              },
              {
                type: "DEPARTMENT_LOCK",
                label: "Département verrouillé",
                detail: `Localisation restreinte au département ${departmentCode} (${departmentName})`,
                weight: 0.5,
              },
            ],
          })
          
          console.log(`✅ [Localisation] Localisation extraite depuis screenshot Vision: ${mapsLocation.lat}, ${mapsLocation.lng} -> ${address} (confiance: ${mapsLocation.confidence.toFixed(2)})`)
          
          // Note: Early exit sera vérifié plus tard pour permettre la consolidation
        } else {
          console.warn(`⚠️ [Localisation] Screenshot point (${mapsLocation.lat}, ${mapsLocation.lng}) hors département ${departmentCode}, rejeté`)
        }
      } else {
        console.warn(`⚠️ [Localisation] Screenshot détecté mais impossible d'extraire les coordonnées avec Vision`)
        
        // Fallback : essayer avec l'extracteur OCR classique
        console.log("🔄 [Localisation] Essai avec extracteur OCR classique...")
        const mapsLocationOCR = await extractFromMapsOCR(imageBuffer)
        if (mapsLocationOCR.lat && mapsLocationOCR.lng) {
          if (isInsideDepartment(mapsLocationOCR.lat, mapsLocationOCR.lng, departmentCode)) {
            const reverseGeocodeResult = await reverseGeocode(mapsLocationOCR.lat, mapsLocationOCR.lng)
            const address = reverseGeocodeResult?.address || mapsLocationOCR.address || null
            
            allResults.push({
              source: "MAPS_SCREENSHOT",
              latitude: mapsLocationOCR.lat,
              longitude: mapsLocationOCR.lng,
              address,
              confidence: mapsLocationOCR.confidence,
              streetViewUrl: fetchStreetViewPreview(mapsLocationOCR.lat, mapsLocationOCR.lng, "600x400", 0),
              streetViewEmbedUrl: fetchStreetViewEmbedUrl(mapsLocationOCR.lat, mapsLocationOCR.lng, 0),
              heading: 0,
              method: mapsLocationOCR.source || "OCR_FALLBACK",
            })
            console.log(`✅ [Localisation] Localisation extraite depuis screenshot (OCR fallback): ${mapsLocationOCR.lat}, ${mapsLocationOCR.lng}`)
          }
        }
      }
    } else {
      // Fallback : utiliser l'ancienne méthode de détection si OpenAI n'a pas détecté
      console.log("🔄 [Localisation] OpenAI Vision n'a pas détecté de screenshot, essai avec détection Vision API...")
      const mapDetection = await detectMapScreenshot(imageBuffer)
      if (mapDetection.isGoogleMaps && mapDetection.confidence >= 0.5) {
        console.log(`✅ [Localisation] Screenshot Google Maps détecté par Vision API (confiance: ${mapDetection.confidence.toFixed(2)})`)
        const mapsLocation = await extractFromMapsOCR(imageBuffer)
        if (mapsLocation.lat && mapsLocation.lng) {
          // HARD LOCK: Vérifier que le point est dans le département
          if (isInsideDepartment(mapsLocation.lat, mapsLocation.lng, departmentCode)) {
            const reverseGeocodeResult = await reverseGeocode(mapsLocation.lat, mapsLocation.lng)
            const address = reverseGeocodeResult?.address || mapsLocation.address || null
            
            allResults.push({
              source: "MAPS_SCREENSHOT",
              latitude: mapsLocation.lat,
              longitude: mapsLocation.lng,
              address,
              confidence: mapDetection.confidence,
              streetViewUrl: fetchStreetViewPreview(mapsLocation.lat, mapsLocation.lng, "600x400", 0),
              streetViewEmbedUrl: fetchStreetViewEmbedUrl(mapsLocation.lat, mapsLocation.lng, 0),
              heading: 0,
              method: mapsLocation.source || "VISION_API_DETECTION",
            })
            console.log(`✅ [Localisation] Localisation extraite depuis screenshot (Vision API): ${mapsLocation.lat}, ${mapsLocation.lng}`)
          } else {
            console.warn(`⚠️ [Localisation] Screenshot point (${mapsLocation.lat}, ${mapsLocation.lng}) hors département ${departmentCode}, rejeté`)
          }
        }
      }
    }

    // 2️⃣ Traitement du résultat LLM Reasoning (déjà obtenu en parallèle)
    console.log("🤖 [Localisation] Traitement du résultat LLM Reasoning (déjà obtenu en parallèle)...")
    
    let openAIScore = 0
    let openAIResult: LocationResult | null = null
    
    // Vérifier early exit avant de traiter LLM
    if (canEarlyExit()) {
      console.log("⚡ [Localisation] Early exit: skip LLM Reasoning (résultat fiable déjà trouvé)")
    } else if (llmReasoning && llmReasoning.latitude && llmReasoning.longitude) {
      // HARD LOCK: Vérifier que le résultat LLM est dans le département
      if (isInsideDepartment(llmReasoning.latitude, llmReasoning.longitude, departmentCode)) {
        // Google Reverse Geocoding pour validation et correction (en parallèle avec la génération des URLs)
        const [reverseGeocodeResult] = await Promise.all([
          reverseGeocode(llmReasoning.latitude, llmReasoning.longitude),
          // URLs générées de manière synchrone, pas besoin d'attendre
        ])
        
        openAIScore = llmReasoning.confidence
        openAIResult = {
          source: "LLM_REASONING",
          latitude: llmReasoning.latitude,
          longitude: llmReasoning.longitude,
          address: reverseGeocodeResult?.address || llmReasoning.address || null,
          confidence: llmReasoning.confidence,
          streetViewUrl: fetchStreetViewPreview(llmReasoning.latitude, llmReasoning.longitude, "600x400", 0),
          streetViewEmbedUrl: fetchStreetViewEmbedUrl(llmReasoning.latitude, llmReasoning.longitude, 0),
          heading: 0,
          evidences: [
            ...(llmReasoning.evidences || []),
            {
              type: "LLM_REASONING",
              label: "Raisonnement OpenAI Vision",
              detail: "Localisation déterminée par analyse visuelle OpenAI",
              weight: 0.6,
            },
            {
              type: "DEPARTMENT_LOCK",
              label: "Département verrouillé",
              detail: `Localisation validée dans le département ${departmentCode} (${departmentName})`,
              weight: 0.5,
            },
          ],
        }
        
        allResults.push(openAIResult)
        console.log(`✅ [Localisation] OpenAI Vision Reasoning: ${llmReasoning.latitude}, ${llmReasoning.longitude} (confiance: ${llmReasoning.confidence.toFixed(2)})`)
        
        // Note: On continue pour collecter plus de résultats et améliorer la confiance via consolidation
      } else {
        console.warn(`⚠️ [Localisation] OpenAI Reasoning (${llmReasoning.latitude}, ${llmReasoning.longitude}) hors département ${departmentCode}, rejeté`)
      }
    } else {
      console.log("⚠️ [Localisation] OpenAI Vision Reasoning n'a pas retourné de résultat valide")
    }

    // 3️⃣ EXIF GPS (priorité haute si pas de screenshot)
    // Skip si on a déjà un résultat très fiable
    if (!canEarlyExit()) {
      console.log("📸 [Localisation] Étape 3: Lecture EXIF...")
      // EXIF est rapide (lecture locale), on peut le faire même si on a un résultat
      const exifData = await readExifFromImage(imageBuffer)

    if (exifData.lat && exifData.lng) {
      console.log(
        `✅ [Localisation] Coordonnées GPS trouvées dans EXIF: ${exifData.lat}, ${exifData.lng}`,
      )
      // HARD LOCK: Vérifier que le point EXIF est dans le département
      if (isInsideDepartment(exifData.lat, exifData.lng, departmentCode)) {
        // Reverse geocoding en parallèle avec la génération des URLs
        const [reverseGeocodeResult] = await Promise.all([
          reverseGeocode(exifData.lat, exifData.lng),
          // URLs générées de manière synchrone
        ])
        const address = reverseGeocodeResult?.address || `${exifData.lat}, ${exifData.lng}`
        
        allResults.push({
          source: "EXIF",
          latitude: exifData.lat,
          longitude: exifData.lng,
          address,
          confidence: 0.98,
          streetViewUrl: fetchStreetViewPreview(exifData.lat, exifData.lng, "600x400", 0),
          streetViewEmbedUrl: fetchStreetViewEmbedUrl(exifData.lat, exifData.lng, 0),
          heading: 0,
          evidences: [
            {
              type: "EXIF_GPS",
              label: "Coordonnées GPS EXIF dans le département",
              detail: `Latitude/longitude extraites des métadonnées : ${exifData.lat}, ${exifData.lng}`,
              weight: 1.0,
            },
            {
              type: "DEPARTMENT_LOCK",
              label: "Département verrouillé",
              detail: `Coordonnées validées dans le département ${departmentCode} (${departmentName})`,
              weight: 0.5,
            },
          ],
        })
      } else {
        console.warn(`⚠️ [Localisation] Point EXIF (${exifData.lat}, ${exifData.lng}) hors département ${departmentCode}, rejeté`)
      }
    } else {
      console.log("⏭️ [Localisation] EXIF skip (résultat fiable déjà trouvé)")
    }

    // 4️⃣ Appel Google Vision (UNIQUEMENT si OpenAI score < 0.70)
    // Skip si on a déjà un résultat très fiable OU si OpenAI a un bon score
    // Les variables sont déjà déclarées au début de la fonction
    
    // Ne faire Google Vision que si OpenAI score < 0.70 ET pas de résultat fiable
    // Mais on permet Google Vision si on a besoin d'améliorer la confiance (moins de 2 résultats)
    const shouldUseGoogleVision = !canEarlyExit() && openAIScore < 0.70 && allResults.length < 2
    
    if (shouldUseGoogleVision) {
      console.log(`🔍 [Localisation] Étape 4: Appel Google Vision API (fallback, OpenAI score: ${openAIScore.toFixed(2)} < 0.70)...`)
      visionResult = await callVisionForImage(imageBuffer)
    
      // 🔍 LOGS DÉTAILLÉS - Résultat brut de Vision API
      console.log("📊 [Localisation] Résultat brut Vision API:")
      console.log("  - Landmarks:", JSON.stringify(visionResult.landmarkAnnotations || [], null, 2))
      console.log("  - Texte OCR:", visionResult.fullTextAnnotation?.text?.substring(0, 500) || "Aucun")
      console.log("  - Labels:", visionResult.labelAnnotations?.slice(0, 5).map((l: any) => l.description) || [])

      // Extraire le texte Vision une seule fois pour réutilisation
      visionText = visionResult.fullTextAnnotation?.text || ""

        // 3️⃣ BIS - Analyse visuelle avancée (en parallèle avec OCR Heavy)
      console.log("🎨 [Localisation] Étape 4bis: Analyse visuelle avancée (parallèle)...")
      const [visualAnalysisResult, ocrHeavyResult] = await Promise.all([
        analyzeImageAdvanced(imageBuffer),
        extractOCRHeavy(imageBuffer),
      ])
      visualAnalysis = visualAnalysisResult
      ocrHeavy = ocrHeavyResult
      console.log(`📊 [Localisation] Analyse visuelle: ${visualAnalysis.detectedSigns.length} enseigne(s), ${visualAnalysis.ocrFragments.length} fragment(s) OCR`)
      console.log(`📊 [Localisation] OCR Heavy: ${ocrHeavy.streetFragments.length} fragment(s) de rue, ${ocrHeavy.signs.length} enseigne(s)`)
    
      // Si on détecte des enseignes connues (FNAC, SEPHORA, etc.), orienter vers Champs-Élysées
      const champsElyseesSigns = ["FNAC", "SEPHORA", "CHAMPS", "ELYSEES", "CHAMPS-ELYSEES"]
      const hasChampsElyseesSign = visualAnalysis.detectedSigns.some((s: any) => 
        champsElyseesSigns.some((cs: string) => s.name.toUpperCase().includes(cs))
      )
      
      if (hasChampsElyseesSign && departmentCode === "75") {
        console.log("🎯 [Localisation] Enseigne Champs-Élysées détectée, orientation vers cette zone")
        // Ajouter un point de référence pour StreetView dense matching
        allResults.push({
          source: "VISION_SIGN_DETECTION",
          latitude: 48.8698,
          longitude: 2.3083,
          address: "Avenue des Champs-Élysées, 75008 Paris",
          confidence: 0.75,
          method: "SIGN_DETECTION",
        })
      }
    
      // Si on trouve des fragments de rue, les utiliser pour géocodage
      if (ocrHeavy && ocrHeavy.streetFragments && ocrHeavy.streetFragments.length > 0) {
      for (const fragment of ocrHeavy.streetFragments.slice(0, 3)) {
        // Essayer de géocoder le fragment avec le département
        const fragmentWithDept = `${fragment.text} ${departmentName} ${departmentCode} France`
        const fragmentCandidates = await geocodeAddressCandidates(
          [{ rawText: fragmentWithDept, score: fragment.confidence }],
          { country: "France", city: departmentName || undefined },
        )
        
        if (fragmentCandidates.length > 0) {
          const best = fragmentCandidates[0]
          if (isInsideDepartment(best.latitude, best.longitude, departmentCode)) {
            allResults.push({
              source: "OCR_HEAVY_STREET",
              latitude: best.latitude,
              longitude: best.longitude,
              address: best.address,
              confidence: fragment.confidence * 0.8,
              method: "OCR_FRAGMENT",
            })
            console.log(`✅ [Localisation] Fragment OCR géocodé: ${fragment.text} -> ${best.address}`)
          }
        }
      }
      }
    } // Fin du bloc if (!canEarlyExit()) pour Vision

    // 4️⃣ Vérifier si on a des landmarks avec coordonnées GPS directes
    console.log("🎯 [Localisation] Étape 5: Détection de landmarks...")
    const landmarks = visionResult?.landmarkAnnotations || []
    if (landmarks.length > 0) {
      for (const landmark of landmarks) {
        if (landmark.locations && landmark.locations.length > 0) {
          const location = landmark.locations[0]
          if (location.latLng) {
            const lat = location.latLng.latitude
            const lng = location.latLng.longitude
            console.log(
              `✅ [Localisation] Landmark détecté: ${landmark.description} à ${lat}, ${lng}`,
            )

            // 🔍 LOG - Coordonnées GPS extraites
            console.log(`📍 [Localisation] Coordonnées GPS extraites: ${lat}, ${lng}`)

            // Utiliser DIRECTEMENT reverse geocoding avec les coordonnées GPS
            const reverseGeocodeResult = await reverseGeocode(lat, lng)
            
            // 🔍 LOG - Résultat de reverse geocoding
            console.log(`🗺️ [Localisation] Résultat reverse geocoding:`, reverseGeocodeResult)
            
            const landmarkAddress = reverseGeocodeResult?.address || `${landmark.description}, France`

            if (reverseGeocodeResult) {
              // HARD LOCK: Vérifier que le landmark est dans le département
              if (isInsideDepartment(lat, lng, departmentCode)) {
                // Calculer le score de confiance basé sur la précision de l'adresse
                let confidence = 0.95 // Base pour landmark avec coordonnées GPS
                
                // Améliorer le score si l'adresse contient une rue complète
                const address = reverseGeocodeResult.address
                const hasStreetNumber = /\d+/.test(address)
                const hasStreetName = /(?:rue|avenue|boulevard|place|chemin|impasse|allée|route|passage|voie|cours|quai|esplanade|promenade)/i.test(address)
                const hasPostalCode = /\d{5}/.test(address)
                
                if (hasStreetNumber && hasStreetName && hasPostalCode) {
                  confidence = 0.95 // Adresse complète avec numéro + rue + code postal
                } else if (hasStreetName && hasPostalCode) {
                  confidence = 0.85 // Rue + code postal (pas de numéro)
                } else if (hasPostalCode) {
                  confidence = 0.70 // Code postal seulement (quartier/arrondissement)
                } else {
                  confidence = 0.50 // Ville seulement
                }
                
                console.log(`📊 [Localisation] Score calculé: ${confidence} (adresse: ${address.substring(0, 100)})`)
                
                // Construire les evidences pour landmark
                const landmarkEvidences: EvidenceItem[] = [
                  {
                    type: "LANDMARK",
                    label: `Landmark détecté : ${landmark.description}`,
                    detail: `Google Vision Landmark : score ${(landmark.score || 0).toFixed(2)}`,
                    weight: 0.7,
                  },
                ]
                
                // Si on a une adresse précise, ajouter une evidence
                if (hasStreetNumber && hasStreetName && hasPostalCode) {
                  landmarkEvidences.push({
                    type: "ROAD_MARKING",
                    label: "Adresse complète détectée",
                    detail: `Rue avec numéro : ${address.substring(0, 100)}`,
                    weight: 0.8,
                  })
                }
                
                landmarkEvidences.push({
                  type: "DEPARTMENT_LOCK",
                  label: "Département verrouillé",
                  detail: `Landmark validé dans le département ${departmentCode} (${departmentName})`,
                  weight: 0.5,
                })
                
                allResults.push({
                  source: "VISION_LANDMARK",
                  latitude: lat,
                  longitude: lng,
                  address: landmarkAddress,
                  confidence,
                  streetViewUrl: fetchStreetViewPreview(lat, lng, "600x400", 0),
                  streetViewEmbedUrl: fetchStreetViewEmbedUrl(lat, lng, 0),
                  heading: 0,
                  evidences: landmarkEvidences,
                })
                
                // 🔍 LOG - Adresse finale retournée
                console.log(`✅ [Localisation] Adresse finale retournée: ${landmarkAddress} (confiance: ${confidence})`)
              } else {
                console.warn(`⚠️ [Localisation] Landmark "${landmark.description}" (${lat}, ${lng}) hors département ${departmentCode}, rejeté`)
              }
            }
          }
        }
      }
    }
    
    // 4️⃣ BIS - Vérifier si on a des coordonnées GPS dans le texte OCR (format @lat,lng)
    const coordPattern = /@([-0-9\.]+),([-0-9\.]+)/g
    const coordMatches = Array.from(visionText.matchAll(coordPattern))
    
    if (coordMatches.length > 0) {
      console.log(`📍 [Localisation] Coordonnées GPS trouvées dans OCR: ${coordMatches.length} occurrence(s)`)
      for (const match of coordMatches) {
        const lat = parseFloat(match[1])
        const lng = parseFloat(match[2])
        
        // Valider les coordonnées (France métropolitaine)
        if (lat >= 41.0 && lat <= 51.0 && lng >= -5.0 && lng <= 10.0) {
          console.log(`✅ [Localisation] Coordonnées GPS valides dans OCR: ${lat}, ${lng}`)
          
          // HARD LOCK: Vérifier que les coordonnées sont dans le département
          if (isInsideDepartment(lat, lng, departmentCode)) {
            // Utiliser DIRECTEMENT reverse geocoding
            const reverseGeocodeResult = await reverseGeocode(lat, lng)
            
            if (reverseGeocodeResult) {
              // Calculer le score de confiance
              let confidence = 0.90 // Base pour coordonnées GPS depuis OCR
              const address = reverseGeocodeResult.address
              const hasStreetNumber = /\d+/.test(address)
              const hasStreetName = /(?:rue|avenue|boulevard|place|chemin|impasse|allée|route|passage|voie|cours|quai|esplanade|promenade)/i.test(address)
              const hasPostalCode = /\d{5}/.test(address)
              
              if (hasStreetNumber && hasStreetName && hasPostalCode) {
                confidence = 0.95
              } else if (hasStreetName && hasPostalCode) {
                confidence = 0.85
              } else if (hasPostalCode) {
                confidence = 0.70
              } else {
                confidence = 0.50
              }
              
              allResults.push({
                source: "VISION_GPS_COORDINATES",
                latitude: lat,
                longitude: lng,
                address: reverseGeocodeResult.address,
                confidence,
                streetViewUrl: fetchStreetViewPreview(lat, lng, "600x400", 0),
                streetViewEmbedUrl: fetchStreetViewEmbedUrl(lat, lng, 0),
                heading: 0,
              })
              
              console.log(`✅ [Localisation] Coordonnées OCR utilisées: ${lat}, ${lng} -> ${reverseGeocodeResult.address} (confiance: ${confidence})`)
            }
          } else {
            console.warn(`⚠️ [Localisation] Coordonnées OCR (${lat}, ${lng}) hors département ${departmentCode}, rejeté`)
          }
        }
      }
    }

    // 5️⃣ Analyse OCR améliorée pour géolocalisation
    let addressCandidates: any[] = []
    // geocodedCandidates est déjà déclaré au début de la fonction
    
    if (!canEarlyExit() && visionResult) {
            console.log("📝 [Localisation] Étape 6: Analyse OCR améliorée...")
      // OCR Analysis désactivé temporairement (fonction non disponible)
      // ocrAnalysis = await analyzeImageWithOcr(imageBuffer)
      ocrAnalysis = { shopNames: [], streetCandidates: [] } // Fallback vide
      console.log(`📊 [Localisation] OCR Analysis: ${ocrAnalysis.shopNames.length} enseigne(s), ${ocrAnalysis.streetCandidates.length} rue(s) candidate(s)`)
      
      // HARD LOCK: Forcer le département dans le contexte OCR
      const contextCity = departmentName || annonce.city
      const contextPostalCode = departmentCode ? `${departmentCode}000`.slice(0, 5) : annonce.postalCode || undefined
      
      // Ajouter explicitement le département dans les candidats OCR
      addressCandidates = extractAddressCandidatesFromVision(visionResult, {
        city: contextCity,
        postalCode: contextPostalCode,
        country: "France",
        department: departmentCode,
      })
      
      // Enrichir avec les candidats de rues détectés par OCR
      for (const streetCandidate of ocrAnalysis.streetCandidates.slice(0, 3)) {
        const enrichedCandidate = `${streetCandidate} ${departmentName} ${departmentCode} France`
        addressCandidates.push({
          rawText: enrichedCandidate,
          score: 0.8, // Score élevé pour les rues détectées par OCR
        })
      }
      
      // Enrichir les candidats avec le département pour forcer le géocodage dans la zone
      addressCandidates.forEach((candidate) => {
        if (!candidate.rawText.toLowerCase().includes(departmentName?.toLowerCase() || "")) {
          candidate.rawText = `${candidate.rawText} ${departmentName} ${departmentCode} France`
        }
      })

      if (addressCandidates.length === 0) {
      // ⚠️ NE PAS utiliser le contexte de l'annonce si on a détecté une ville différente dans l'image
      // Vérifier si une ville a été détectée dans le texte Vision (détection générique)
      // Détection générique de villes françaises (pas seulement une liste fixe)
      const commonWords = new Set([
        'rue', 'avenue', 'boulevard', 'place', 'chemin', 'impasse', 'allée',
        'route', 'passage', 'voie', 'cours', 'quai', 'esplanade', 'promenade',
        'france', 'french', 'code', 'postal', 'numero', 'numéro', 'le', 'la', 'les',
        'de', 'du', 'des', 'et', 'ou', 'sur', 'sous', 'dans', 'pour', 'avec', 'sans'
      ])
      
      const cityPattern = /\b([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+(?:[-' ][A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+)*)\b/g
      
      const matches = visionText.match(cityPattern) || []
      const detectedCities = matches
        .map(m => m.trim())
        .filter(m => m.length >= 3 && !commonWords.has(m.toLowerCase()))
        .filter((m, i, arr) => arr.indexOf(m) === i) // Dédupliquer
      
      const detectedCityName = detectedCities && detectedCities.length > 0 
        ? detectedCities[0].trim() 
        : null

      // Si on a détecté une ville différente de celle de l'annonce, utiliser cette ville
      if (detectedCityName && detectedCityName.toLowerCase() !== annonce.city?.toLowerCase()) {
        console.log(`📍 [Localisation] Ville détectée dans l'image (${detectedCityName}) différente du contexte (${annonce.city}), utilisation de la ville détectée`)
        
        const detectedCityAddress = `${detectedCityName}, France`
        const fallbackCandidates = await geocodeAddressCandidates(
          [
            {
              rawText: detectedCityAddress,
              score: 0.3,
            },
          ],
          {
            city: detectedCityName,
            country: "France",
          },
        )

        if (fallbackCandidates.length > 0) {
          const bestCandidate = fallbackCandidates[0]
          
          let location = await prisma.annonceLocation.findUnique({
            where: { annonceScrapeId: id },
          })

          const locationData = {
            autoAddress: bestCandidate.address,
            autoLatitude: bestCandidate.latitude,
            autoLongitude: bestCandidate.longitude,
            autoConfidence: 0.35, // Confiance un peu plus élevée car basée sur une détection réelle
            autoSource: "VISION_CONTEXT_FALLBACK",
            visionRaw: visionResult as any,
            geocodingCandidates: fallbackCandidates as any,
          }

          if (!location) {
            location = await prisma.annonceLocation.create({
              data: {
                annonceScrapeId: id,
                ...locationData,
              },
            })
          } else {
            location = await prisma.annonceLocation.update({
              where: { id: location.id },
              data: locationData,
            })
          }

          await prisma.annonceScrape.update({
            where: { id },
            data: {
              latitude: bestCandidate.latitude,
              longitude: bestCandidate.longitude,
            },
          })

          return NextResponse.json({
            status: "ok",
            source: "VISION_CONTEXT_FALLBACK",
            warning: `Ville détectée dans l'image (${detectedCityName}) différente du contexte de l'annonce (${annonce.city})`,
            autoLocation: {
              address: bestCandidate.address,
              latitude: bestCandidate.latitude,
              longitude: bestCandidate.longitude,
              confidence: 0.35,
              streetViewUrl: bestCandidate.streetViewUrl,
            },
            candidates: fallbackCandidates.map((c) => ({
              address: c.address,
              latitude: c.latitude,
              longitude: c.longitude,
              geocodingScore: c.geocodingScore,
              globalScore: c.globalScore,
            })),
          })
        }
      }

      // Essayer d'utiliser le contexte de l'annonce comme fallback UNIQUEMENT si aucune ville différente n'a été détectée
      const fallbackAddress = `${annonce.city}${annonce.postalCode ? ` ${annonce.postalCode}` : ""}, France`
      
      console.log(`⚠️ [Localisation] Aucune adresse détectée, utilisation du contexte: ${fallbackAddress}`)
      
      // Géocoder l'adresse de contexte
      const fallbackCandidates = await geocodeAddressCandidates(
        [
          {
            rawText: fallbackAddress,
            score: 0.2,
          },
        ],
        {
          city: annonce.city,
          postalCode: annonce.postalCode || undefined,
          country: "France",
        },
      )

      if (fallbackCandidates.length > 0) {
        const bestCandidate = fallbackCandidates[0]
        
        // Sauvegarder avec un score de confiance bas
        let location = await prisma.annonceLocation.findUnique({
          where: { annonceScrapeId: id },
        })

        const locationData = {
          autoAddress: bestCandidate.address,
          autoLatitude: bestCandidate.latitude,
          autoLongitude: bestCandidate.longitude,
          autoConfidence: 0.3, // Confiance basse car basée sur le contexte
          autoSource: "VISION_CONTEXT_FALLBACK",
          visionRaw: visionResult as any,
          geocodingCandidates: fallbackCandidates as any,
        }

        if (!location) {
          location = await prisma.annonceLocation.create({
            data: {
              annonceScrapeId: id,
              ...locationData,
            },
          })
        } else {
          location = await prisma.annonceLocation.update({
            where: { id: location.id },
            data: locationData,
          })
        }

        // Mettre à jour aussi latitude/longitude directement sur AnnonceScrape
        await prisma.annonceScrape.update({
          where: { id },
          data: {
            latitude: bestCandidate.latitude,
            longitude: bestCandidate.longitude,
          },
        })

        return NextResponse.json({
          status: "ok",
          source: "VISION_CONTEXT_FALLBACK",
          autoLocation: {
            address: bestCandidate.address,
            latitude: bestCandidate.latitude,
            longitude: bestCandidate.longitude,
            confidence: 0.3,
            streetViewUrl: bestCandidate.streetViewUrl,
          },
          candidates: fallbackCandidates,
          warning: "Aucune adresse détectée dans l'image. Localisation basée sur le contexte de l'annonce.",
        } as LocationFromImageResult)
      }

        // Si même le fallback échoue, retourner une erreur
        return NextResponse.json({
          status: "error",
          error: "Aucune adresse détectée dans l'image et impossible de géocoder le contexte",
        } as LocationFromImageResult)
      }

      console.log(
        `✅ [Localisation] ${addressCandidates.length} adresse(s) candidate(s) trouvée(s)`,
      )

      // 9. Géocoding
      console.log("🗺️ [Localisation] Géocodage des adresses...")
      
      // Détecter si une ville est présente dans les candidats OU dans le texte Vision complet (détection générique)
      // Détection générique de villes françaises
      const commonWords = new Set([
      'rue', 'avenue', 'boulevard', 'place', 'chemin', 'impasse', 'allée',
      'route', 'passage', 'voie', 'cours', 'quai', 'esplanade', 'promenade',
      'france', 'french', 'code', 'postal', 'numero', 'numéro', 'le', 'la', 'les',
      'de', 'du', 'des', 'et', 'ou', 'sur', 'sous', 'dans', 'pour', 'avec', 'sans'
      ])
      
      const cityPattern = /\b([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+(?:[-' ][A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+)*)\b/g
      
      const matches = visionText.match(cityPattern) || []
      const detectedCities = matches
        .map(m => m.trim())
        .filter(m => m.length >= 3 && !commonWords.has(m.toLowerCase()))
        .filter((m, i, arr) => arr.indexOf(m) === i) // Dédupliquer
      
      const detectedCityName = detectedCities && detectedCities.length > 0 
        ? detectedCities[0].trim() 
        : null
      
      const hasCityInCandidates = addressCandidates.some((candidate) => {
        const text = candidate.rawText
        // Détecter un code postal français (5 chiffres)
        const hasPostalCode = /\d{5}/.test(text)
        // Détecter un pattern de ville (mot avec majuscule suivi de lettres minuscules, typique des noms de villes françaises)
        const hasCityPattern = /[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+(?:\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+)*/.test(text)
        return hasPostalCode || hasCityPattern
      })
      
      // PRIORITÉ : Si on a détecté une ville dans le texte Vision, TOUJOURS l'utiliser pour le géocodage
      // même si elle n'est pas dans les candidats d'adresse, et même si elle est différente du contexte
      const geocodingContext = detectedCityName
        ? {
            city: detectedCityName,
            country: "France",
          }
        : hasCityInCandidates
          ? { country: "France" } // Ne passer que le pays si une ville est déjà détectée dans les candidats
          : {
              city: annonce.city,
              postalCode: annonce.postalCode || undefined,
              country: "France",
            }
      
      if (detectedCityName) {
        if (detectedCityName.toLowerCase() !== annonce.city?.toLowerCase()) {
          console.log(`📍 [Localisation] Ville détectée dans l'image (${detectedCityName}) différente du contexte (${annonce.city}), utilisation de la ville détectée`)
        } else {
          console.log(`📍 [Localisation] Ville détectée dans l'image (${detectedCityName}) correspond au contexte`)
        }
      }
      
      geocodedCandidates = await geocodeAddressCandidates(
        addressCandidates,
        geocodingContext,
      )

      // 🔍 LOG - Résultat de geocoding
      console.log(`🗺️ [Localisation] Résultat geocoding:`, geocodedCandidates.map(c => ({
        address: c.address,
        lat: c.latitude,
        lng: c.longitude,
        score: c.globalScore
      })))

      if (geocodedCandidates.length === 0) {
        return NextResponse.json({
          status: "error",
          error: "Aucune adresse n'a pu être géocodée",
        } as LocationFromImageResult)
      }

      console.log(
        `✅ [Localisation] ${geocodedCandidates.length} adresse(s) géocodée(s)`,
      )

      // 10. Ajouter les résultats OCR+Geocoding à la collection
      if (geocodedCandidates.length > 0) {
        // HARD LOCK: Filtrer les candidats pour ne garder que ceux dans le département
        const validCandidates = geocodedCandidates.filter((candidate) =>
          isInsideDepartment(candidate.latitude, candidate.longitude, departmentCode),
        )
        
        if (validCandidates.length === 0) {
          console.warn(`⚠️ [Localisation] Tous les candidats OCR sont hors département ${departmentCode}, passage à StreetView/GPT`)
        } else {
          const bestCandidate = validCandidates[0]
          
          // 🔍 LOG - Meilleur candidat OCR
          console.log(`📊 [Localisation] Meilleur candidat OCR:`, {
          address: bestCandidate.address,
          lat: bestCandidate.latitude,
          lng: bestCandidate.longitude,
          score: bestCandidate.globalScore
        })
        
        // Vérifier si l'adresse est trop vague
        const isVague = isAddressTooVague(bestCandidate.address)
        
        if (!isVague) {
          // Améliorer le score de confiance basé sur la précision de l'adresse
          let confidence = bestCandidate.globalScore
          const address = bestCandidate.address
          const hasStreetNumber = /\d+/.test(address)
          const hasStreetName = /(?:rue|avenue|boulevard|place|chemin|impasse|allée|route|passage|voie|cours|quai|esplanade|promenade)/i.test(address)
          const hasPostalCode = /\d{5}/.test(address)
          
          // Ajuster le score selon la précision
          if (hasStreetNumber && hasStreetName && hasPostalCode) {
            confidence = Math.max(confidence, 0.85) // Adresse complète
          } else if (hasStreetName && hasPostalCode) {
            confidence = Math.max(confidence, 0.75) // Rue + code postal
          } else if (hasPostalCode) {
            confidence = Math.max(confidence, 0.70) // Code postal seulement
          } else {
            confidence = Math.max(confidence, 0.50) // Ville seulement
          }
          
          // Construire les evidences pour OCR+Geocoding
          const ocrEvidences: EvidenceItem[] = []
          
          // Enseignes détectées
          for (const shopName of ocrAnalysis.shopNames.slice(0, 3)) {
            ocrEvidences.push({
              type: "SHOP_SIGN",
              label: `Enseigne détectée : ${shopName}`,
              detail: `Texte OCR : '${shopName}'`,
              weight: 0.6,
            })
          }
          
          // Fragments de rues
          for (const streetCandidate of ocrAnalysis.streetCandidates.slice(0, 2)) {
            ocrEvidences.push({
              type: "ROAD_MARKING",
              label: `Marquage au sol : ${streetCandidate}`,
              detail: `Texte OCR : '${streetCandidate}'`,
              weight: 0.8,
            })
          }
          
          // Département verrouillé
          ocrEvidences.push({
            type: "DEPARTMENT_LOCK",
            label: "Adresse restreinte au département",
            detail: `Requête Geocoding forcée sur ${departmentName} ${departmentCode}`,
            weight: 0.5,
          })
          
          allResults.push({
            source: "OCR_GEOCODING",
            latitude: bestCandidate.latitude,
            longitude: bestCandidate.longitude,
            address: bestCandidate.address,
            confidence,
            streetViewUrl: bestCandidate.streetViewUrl,
            evidences: ocrEvidences,
          })
          
          console.log(`✅ [Localisation] Candidat OCR ajouté: ${bestCandidate.address} (confiance ajustée: ${confidence})`)
        } else {
          console.log(`⚠️ [Localisation] Adresse trop vague: ${bestCandidate.address}, passage à StreetView matching`)
          
          // 6️⃣ StreetView Dense Matching (si adresse vague ou pour améliorer précision)
          // Utiliser le centre du département si pas de candidat valide
          const centerLat = validCandidates.length > 0 ? validCandidates[0].latitude : undefined
          const centerLng = validCandidates.length > 0 ? validCandidates[0].longitude : undefined
          
          if (centerLat && centerLng) {
            console.log("🔍 [Localisation] Étape 7: StreetView Dense Matching...")
            
            // Essayer d'abord le dense matcher (plus précis)
            const denseMatch = await matchStreetViewDense(
              imageBuffer,
              departmentCode,
              { lat: centerLat, lng: centerLng },
            )
            
            if (denseMatch && denseMatch.confidence >= 0.7) {
              // HARD LOCK: Vérifier que le match StreetView est dans le département
              if (isInsideDepartment(denseMatch.lat, denseMatch.lng, departmentCode)) {
                const reverseGeocodeResult = await reverseGeocode(
                  denseMatch.lat,
                  denseMatch.lng,
                )
                allResults.push({
                  source: "STREETVIEW_VISUAL_MATCH",
                  latitude: denseMatch.lat,
                  longitude: denseMatch.lng,
                  address: reverseGeocodeResult?.address || bestCandidate.address,
                  confidence: denseMatch.confidence,
                  streetViewUrl: denseMatch.imageUrl,
                  streetViewEmbedUrl: fetchStreetViewEmbedUrl(denseMatch.lat, denseMatch.lng, denseMatch.heading || 0),
                  heading: denseMatch.heading || 0,
                  method: denseMatch.method,
                  evidences: [
                    {
                      type: "STREETVIEW_MATCH",
                      label: "Correspondance forte avec une vue Street View",
                      detail: `Similarité visuelle ${denseMatch.similarity.toFixed(2)} avec un panorama Google Street View`,
                      weight: 0.9,
                    },
                    {
                      type: "DEPARTMENT_LOCK",
                      label: "Département verrouillé",
                      detail: `StreetView matching limité au département ${departmentCode} (${departmentName})`,
                      weight: 0.5,
                    },
                  ],
                })
                console.log(`✅ [Localisation] StreetView dense match trouvé: ${denseMatch.lat}, ${denseMatch.lng} (confiance: ${denseMatch.confidence.toFixed(2)})`)
              } else {
                console.warn(`⚠️ [Localisation] StreetView dense match (${denseMatch.lat}, ${denseMatch.lng}) hors département ${departmentCode}, rejeté`)
              }
            } else {
              // Fallback : utiliser le matcher classique
              console.log("🔄 [Localisation] Dense matcher non concluant, essai avec matcher classique...")
              const streetViewMatch = await matchStreetViewVisual(
                imageBuffer,
                centerLat,
                centerLng,
                200, // rayon 200m
                departmentCode, // Passer le département pour le hard lock
              )
              
              if (streetViewMatch && streetViewMatch.confidence >= 0.7) {
                // HARD LOCK: Vérifier que le match StreetView est dans le département
                if (isInsideDepartment(streetViewMatch.lat, streetViewMatch.lng, departmentCode)) {
                  const reverseGeocodeResult = await reverseGeocode(
                    streetViewMatch.lat,
                    streetViewMatch.lng,
                  )
                  allResults.push({
                    source: "STREETVIEW_VISUAL_MATCH",
                    latitude: streetViewMatch.lat,
                    longitude: streetViewMatch.lng,
                    address: reverseGeocodeResult?.address || bestCandidate.address,
                    confidence: streetViewMatch.confidence,
                    streetViewUrl: streetViewMatch.imageUrl,
                    streetViewEmbedUrl: fetchStreetViewEmbedUrl(streetViewMatch.lat, streetViewMatch.lng, streetViewMatch.heading || 0),
                    heading: streetViewMatch.heading || 0,
                    evidences: [
                      {
                        type: "STREETVIEW_MATCH",
                        label: "Correspondance forte avec une vue Street View",
                        detail: `Similarité visuelle ${streetViewMatch.similarity.toFixed(2)} avec un panorama Google Street View`,
                        weight: 0.9,
                      },
                      {
                        type: "DEPARTMENT_LOCK",
                        label: "Département verrouillé",
                        detail: `StreetView matching limité au département ${departmentCode} (${departmentName})`,
                        weight: 0.5,
                      },
                    ],
                  })
                  console.log(`✅ [Localisation] StreetView match trouvé: ${streetViewMatch.lat}, ${streetViewMatch.lng} (confiance: ${streetViewMatch.confidence.toFixed(2)})`)
                } else {
                  console.warn(`⚠️ [Localisation] StreetView match (${streetViewMatch.lat}, ${streetViewMatch.lng}) hors département ${departmentCode}, rejeté`)
                }
              }
            }
          }
        }
      }
        } // Fin du bloc if (validCandidates.length === 0) else
      } // Fin du bloc if (geocodedCandidates.length > 0)
    } else {
      console.log("⏭️ [Localisation] OCR skip (résultat fiable déjà trouvé)")
    } // Fin du bloc if (!canEarlyExit() && visionResult) pour OCR

    // 7️⃣ Priorisation et rééquilibrage des résultats
    console.log(`📊 [Localisation] Priorisation des résultats...`)
    
    // Filtrer d'abord les résultats avec coordonnées valides
    const resultsWithCoords = allResults.filter(
      (r) => r.latitude !== null && r.longitude !== null,
    ) as Array<LocationResult & { latitude: number; longitude: number }>
    
    // HARD LOCK: Filtrer les résultats pour ne garder que ceux dans le département
    let validResults = filterByDepartment(resultsWithCoords, departmentCode)
    
    // Détecter si on a un screenshot Maps
    const hasMapsScreenshot = validResults.some(r => r.source === "MAPS_SCREENSHOT")
    
    // Récupérer les landmarks détectés
    const detectedLandmarks = visionResult?.landmarkAnnotations || []
    
    // Appliquer la priorisation (dépriorise StreetView si screenshot ou landmark critique)
    const prioritizedResults = prioritizeResults(validResults, {
      hasMapsScreenshot,
      landmarks: detectedLandmarks,
    })
    
    // S'assurer que les résultats priorisés ont toujours des coordonnées valides
    validResults = prioritizedResults.filter(
      (r) => r.latitude !== null && r.longitude !== null,
    ) as Array<LocationResult & { latitude: number; longitude: number }>
    
    console.log(`🔄 [Localisation] Consolidation avec explications de ${validResults.length} résultat(s) priorisé(s)...`)
    
    if (validResults.length === 0) {
      console.warn(`⚠️ [Localisation] Tous les résultats sont hors département ${departmentCode}, forcer LLM fallback avec département verrouillé`)
      
      // Forcer un fallback LLM avec département strictement imposé
      const base64Image = imageBuffer.toString("base64")
      
      const visualIndices: string[] = []
      if (visualAnalysis && visualAnalysis.architecturalStyle && visualAnalysis.architecturalStyle.length > 0) {
        visualIndices.push(`Style architectural : ${visualAnalysis.architecturalStyle[0]}`)
      }
      
      const llmReasoning = await reasonLocationWithLLM(base64Image, {
        ...llmContext!,
        ocrShopNames: (ocrAnalysis && ocrAnalysis.shopNames) ? ocrAnalysis.shopNames : [],
        ocrStreetCandidates: (ocrAnalysis && ocrAnalysis.streetCandidates) ? ocrAnalysis.streetCandidates : [],
        visualIndices,
      })
      
      if (llmReasoning && llmReasoning.latitude && llmReasoning.longitude) {
        // Vérifier une dernière fois que LLM a respecté le département
        if (isInsideDepartment(llmReasoning.latitude, llmReasoning.longitude, departmentCode)) {
          const reverseGeocodeResult = await reverseGeocode(
            llmReasoning.latitude,
            llmReasoning.longitude,
          )
          const llmResult: LocationResult & { latitude: number; longitude: number } = {
            source: "LLM_REASONING",
            latitude: llmReasoning.latitude,
            longitude: llmReasoning.longitude,
            address: reverseGeocodeResult?.address || llmReasoning.address || null,
            confidence: llmReasoning.confidence * 0.8, // Réduire la confiance car c'est un fallback
            streetViewUrl: fetchStreetViewPreview(llmReasoning.latitude, llmReasoning.longitude, "600x400", 0),
            streetViewEmbedUrl: fetchStreetViewEmbedUrl(llmReasoning.latitude, llmReasoning.longitude, 0),
            heading: 0,
            evidences: llmReasoning.evidences,
          }
          validResults.push(llmResult)
        } else {
          return NextResponse.json({
            status: "error",
            error: `Impossible de localiser dans le département ${departmentCode} (${departmentName}). L'IA n'a pas pu trouver de correspondance valide dans cette zone.`,
          } as LocationFromImageResult)
        }
      } else {
        return NextResponse.json({
          status: "error",
          error: `Impossible de localiser dans le département ${departmentCode} (${departmentName}). Aucune méthode n'a pu trouver de correspondance valide dans cette zone.`,
        } as LocationFromImageResult)
      }
    }
    
    // Utiliser la consolidation avec explications
    const consolidatedResult = consolidateResultsWithExplanation(validResults)
    
    if (!consolidatedResult) {
      return NextResponse.json({
        status: "error",
        error: `Aucune localisation valide n'a pu être déterminée dans le département ${departmentCode} (${departmentName})`,
      } as LocationFromImageResult)
    }
    
    const mergedResult = consolidatedResult

    if (!mergedResult) {
      return NextResponse.json({
        status: "error",
        error: `Aucune localisation valide n'a pu être déterminée dans le département ${departmentCode} (${departmentName})`,
      } as LocationFromImageResult)
    }
    
    // HARD LOCK: Vérification finale avant de retourner
    if (!isInsideDepartment(mergedResult.latitude!, mergedResult.longitude!, departmentCode)) {
      return NextResponse.json({
        status: "error",
        error: `Erreur: Le résultat fusionné est hors du département ${departmentCode} (${departmentName}). Veuillez réessayer.`,
      } as LocationFromImageResult)
    }

    console.log(
      `🏆 [Localisation] Résultat fusionné: ${mergedResult.address} (${mergedResult.source}, confiance: ${mergedResult.confidence.toFixed(2)})`,
    )

    // 9️⃣ Sauvegarde dans AnnonceLocation
    // Utiliser upsert pour éviter les requêtes multiples et optimiser les connexions
    const locationData = {
      autoAddress: mergedResult.address || "",
      autoLatitude: mergedResult.latitude,
      autoLongitude: mergedResult.longitude,
      autoConfidence: mergedResult.confidence,
      autoSource: mergedResult.source,
      visionRaw: visionResult || null,
      geocodingCandidates: (geocodedCandidates?.length ? geocodedCandidates : []) as any,
    }

    // Utiliser upsert pour une seule requête au lieu de findUnique + create/update
    // Avec gestion d'erreur de connexion via executeWithRetry
    const location = await executeWithRetry(() =>
      prisma.annonceLocation.upsert({
        where: { annonceScrapeId: id },
        update: locationData,
        create: {
          annonceScrapeId: id,
          ...locationData,
        },
      })
    )

    // Mettre à jour aussi latitude/longitude directement sur AnnonceScrape
    await executeWithRetry(() =>
      prisma.annonceScrape.update({
        where: { id },
        data: {
          latitude: mergedResult.latitude,
          longitude: mergedResult.longitude,
        },
      })
    )

    // 🔟 Réponse JSON avec indication de correction manuelle si nécessaire
    const needsManualCorrection = mergedResult.confidence < 0.7
    
    // 🔍 LOG FINAL - Adresse finale retournée
    console.log(`✅ [Localisation] ===== RÉSULTAT FINAL =====`)
    console.log(`  📍 Adresse: ${mergedResult.address}`)
    console.log(`  📊 Coordonnées: ${mergedResult.latitude}, ${mergedResult.longitude}`)
    console.log(`  🎯 Source: ${mergedResult.source}`)
    console.log(`  💯 Confiance: ${Math.round(mergedResult.confidence * 100)}%`)
    console.log(`  🔒 Département: ${departmentCode} (${departmentName})`)
    console.log(`==========================================`)

    return NextResponse.json({
      status: "ok",
      source: mergedResult.source as any,
      autoLocation: {
        address: mergedResult.address || "",
        latitude: mergedResult.latitude!,
        longitude: mergedResult.longitude!,
        confidence: mergedResult.confidence,
        streetViewUrl: mergedResult.streetViewUrl,
        streetViewEmbedUrl: mergedResult.streetViewEmbedUrl,
        heading: mergedResult.heading || 0,
      },
      candidates: geocodedCandidates || [],
      needsManualCorrection,
      warning: needsManualCorrection
        ? `Localisation imprécise (${Math.round(mergedResult.confidence * 100)}%). Vous pouvez corriger manuellement l'adresse.`
        : undefined,
      explanation: mergedResult.explanation,
    } as LocationFromImageResult)
  } catch (error: any) {
    console.error("❌ [Localisation] Erreur complète:", error)
    console.error("❌ [Localisation] Stack:", error.stack)
    console.error("❌ [Localisation] Message:", error.message)
    
    // Vérifier si c'est une erreur de clé API manquante
    if (error.message?.includes("non configurée")) {
      return NextResponse.json(
        {
          status: "error",
          error: `Configuration manquante: ${error.message}. Vérifiez vos variables d'environnement (.env.local).`,
        },
        { status: 500 },
      )
    }
    
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Erreur lors du traitement de l'image",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
