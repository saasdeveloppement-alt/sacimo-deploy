/**
 * Analyse visuelle avancée pour géolocalisation
 * Analyse style architectural, enseignes, textures, mobilier urbain, etc.
 */

import { callVisionForImage } from "@/lib/google/locationClient"

export interface VisualAnalysisResult {
  architecturalStyle: string[]
  detectedSigns: Array<{ name: string; confidence: number }>
  roadTexture: string | null
  treeTypes: string[]
  urbanFurniture: string[]
  ocrFragments: Array<{ text: string; confidence: number }>
  detectedLandmarks: string[]
  colorScheme: string[]
  perspective: {
    hasVanishingPoint: boolean
    direction?: "north" | "south" | "east" | "west"
  }
}

/**
 * Analyse visuelle avancée d'une image pour géolocalisation
 */
export async function analyzeImageAdvanced(
  imageBuffer: Buffer,
): Promise<VisualAnalysisResult> {
  try {
    const visionResult = await callVisionForImage(imageBuffer)
    
    // Extraire tous les textes OCR
    const fullText = visionResult.fullTextAnnotation?.text || ""
    const ocrFragments: Array<{ text: string; confidence: number }> = []
    
    // Parser les blocs de texte OCR avec leurs positions
    if (visionResult.fullTextAnnotation?.pages) {
      for (const page of visionResult.fullTextAnnotation.pages) {
        for (const block of page.blocks || []) {
          for (const paragraph of block.paragraphs || []) {
            for (const word of paragraph.words || []) {
              const wordText = word.symbols?.map(s => s.text || "").join("") || ""
              if (wordText.trim().length > 0) {
                ocrFragments.push({
                  text: wordText.trim(),
                  confidence: word.confidence || 0.5,
                })
              }
            }
          }
        }
      }
    }

    // Détecter les enseignes connues
    const knownSigns = [
      "FNAC", "SEPHORA", "ZARA", "H&M", "MONOPRIX", "CARREFOUR", "LIDL",
      "MACDO", "MCDONALD", "STARBUCKS", "KFC", "BURGER KING",
      "ORANGE", "SFR", "BOUYGUES", "FREE",
      "BNP", "CREDIT AGRICOLE", "SOCIETE GENERALE", "LCL",
      "DECATHLON", "GO SPORT", "INTERSPORT",
      "LA POSTE", "CHRONOPOST",
    ]
    
    const detectedSigns: Array<{ name: string; confidence: number }> = []
    const textUpper = fullText.toUpperCase()
    
    for (const sign of knownSigns) {
      if (textUpper.includes(sign)) {
        // Chercher la confiance dans les fragments OCR
        const matchingFragment = ocrFragments.find(f => 
          f.text.toUpperCase().includes(sign)
        )
        detectedSigns.push({
          name: sign,
          confidence: matchingFragment?.confidence || 0.7,
        })
      }
    }

    // Analyser les labels Vision pour style architectural
    const labels = visionResult.labelAnnotations || []
    const architecturalStyle: string[] = []
    const treeTypes: string[] = []
    const urbanFurniture: string[] = []
    const colorScheme: string[] = []
    
    const architecturalKeywords = [
      "haussmannian", "haussmann", "parisian architecture", "building",
      "facade", "balcony", "window", "roof", "stone building",
      "modern building", "historic building", "apartment building",
    ]
    
    const treeKeywords = ["tree", "palm tree", "oak", "chestnut", "plane tree", "linden"]
    const furnitureKeywords = ["street lamp", "bench", "fountain", "statue", "kiosk", "metro"]
    
    for (const label of labels) {
      const desc = label.description?.toLowerCase() || ""
      const score = label.score || 0
      
      if (score > 0.5) {
        if (architecturalKeywords.some(kw => desc.includes(kw))) {
          architecturalStyle.push(label.description || "")
        }
        if (treeKeywords.some(kw => desc.includes(kw))) {
          treeTypes.push(label.description || "")
        }
        if (furnitureKeywords.some(kw => desc.includes(kw))) {
          urbanFurniture.push(label.description || "")
        }
        // Couleurs dominantes
        if (desc.includes("color") || desc.includes("red") || desc.includes("blue") || desc.includes("green")) {
          colorScheme.push(label.description || "")
        }
      }
    }

    // Détecter les landmarks
    const landmarks = visionResult.landmarkAnnotations || []
    const detectedLandmarks = landmarks.map(l => l.description || "").filter(Boolean)

    // Analyser la texture de la route (pavage, asphalte, etc.)
    let roadTexture: string | null = null
    const roadLabels = labels.filter(l => 
      (l.description?.toLowerCase().includes("road") || 
       l.description?.toLowerCase().includes("street") ||
       l.description?.toLowerCase().includes("pavement")) &&
      (l.score || 0) > 0.6
    )
    if (roadLabels.length > 0) {
      roadTexture = roadLabels[0].description || null
    }

    // Détecter les fragments de noms de rues dans OCR
    const streetPatterns = [
      /(?:av|avenue|bd|boulevard|rue|place|impasse|allée|chemin|route|passage|voie|cours|quai|esplanade|promenade)[\s\.]+(?:des|de|du|de la|de l'|d')?[\s\.]*([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s]+)/i,
      /([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+)[\s\.]+(?:av|avenue|bd|boulevard|rue|place)/i,
    ]
    
    for (const pattern of streetPatterns) {
      const matches = fullText.match(pattern)
      if (matches && matches[1]) {
        const streetFragment = matches[1].trim()
        if (streetFragment.length > 3) {
          ocrFragments.push({
            text: streetFragment,
            confidence: 0.8,
          })
        }
      }
    }

    // Analyser la perspective (simplifié)
    const perspective = {
      hasVanishingPoint: labels.some(l => 
        l.description?.toLowerCase().includes("perspective") ||
        l.description?.toLowerCase().includes("vanishing point")
      ),
    }

    return {
      architecturalStyle: [...new Set(architecturalStyle)],
      detectedSigns,
      roadTexture,
      treeTypes: [...new Set(treeTypes)],
      urbanFurniture: [...new Set(urbanFurniture)],
      ocrFragments: ocrFragments.slice(0, 20), // Limiter à 20 fragments
      detectedLandmarks,
      colorScheme: [...new Set(colorScheme)],
      perspective,
    }
  } catch (error: any) {
    console.error("❌ [analyzeImageAdvanced] Erreur:", error)
    return {
      architecturalStyle: [],
      detectedSigns: [],
      roadTexture: null,
      treeTypes: [],
      urbanFurniture: [],
      ocrFragments: [],
      detectedLandmarks: [],
      colorScheme: [],
      perspective: { hasVanishingPoint: false },
    }
  }
}


