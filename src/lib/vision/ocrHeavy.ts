/**
 * OCR Heavy Mode - Extraction agressive de fragments textuels
 * Extrait enseignes, panneaux, fragments de noms de rues, etc.
 */

import { callVisionForImage } from "@/lib/google/locationClient"

export interface OCRHeavyResult {
  streetFragments: Array<{ text: string; confidence: number }>
  signs: Array<{ text: string; confidence: number }>
  trafficSigns: Array<{ text: string; confidence: number }>
  facadeText: Array<{ text: string; confidence: number }>
  allFragments: Array<{ text: string; confidence: number }>
}

/**
 * Extraction OCR agressive pour géolocalisation
 */
export async function extractOCRHeavy(
  imageBuffer: Buffer,
): Promise<OCRHeavyResult> {
  try {
    const visionResult = await callVisionForImage(imageBuffer)
    const fullText = visionResult.fullTextAnnotation?.text || ""
    
    const allFragments: Array<{ text: string; confidence: number }> = []
    const streetFragments: Array<{ text: string; confidence: number }> = []
    const signs: Array<{ text: string; confidence: number }> = []
    const trafficSigns: Array<{ text: string; confidence: number }> = []
    const facadeText: Array<{ text: string; confidence: number }> = []

    // Extraire tous les fragments avec leurs positions et confiances
    if (visionResult.fullTextAnnotation?.pages) {
      for (const page of visionResult.fullTextAnnotation.pages) {
        for (const block of page.blocks || []) {
          for (const paragraph of block.paragraphs || []) {
            for (const word of paragraph.words || []) {
              const wordText = word.symbols?.map(s => s.text || "").join("") || ""
              const confidence = word.confidence || 0.5
              
              if (wordText.trim().length > 0) {
                allFragments.push({
                  text: wordText.trim(),
                  confidence,
                })
              }
            }
          }
        }
      }
    }

    // Patterns pour fragments de rues
    const streetPatterns = [
      /(?:av|avenue|bd|boulevard|rue|place|impasse|allée|chemin|route|passage|voie|cours|quai|esplanade|promenade)[\s\.]+(?:des|de|du|de la|de l'|d')?[\s\.]*([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s]{2,})/gi,
      /([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]{2,})[\s\.]+(?:av|avenue|bd|boulevard|rue|place)/gi,
    ]
    
    for (const pattern of streetPatterns) {
      const matches = Array.from(fullText.matchAll(pattern))
      for (const match of matches) {
        const fragment = match[1]?.trim()
        if (fragment && fragment.length > 2) {
          streetFragments.push({
            text: fragment,
            confidence: 0.8,
          })
        }
      }
    }

    // Enseignes connues
    const knownSigns = [
      "FNAC", "SEPHORA", "ZARA", "H&M", "MONOPRIX", "CARREFOUR", "LIDL",
      "MACDO", "MCDONALD", "STARBUCKS", "KFC", "BURGER KING",
      "ORANGE", "SFR", "BOUYGUES", "FREE",
      "BNP", "CREDIT AGRICOLE", "SOCIETE GENERALE", "LCL",
      "DECATHLON", "GO SPORT", "INTERSPORT",
      "LA POSTE", "CHRONOPOST", "CHAMPS", "ELYSEES", "CHAMPS-ELYSEES",
    ]
    
    const textUpper = fullText.toUpperCase()
    for (const sign of knownSigns) {
      if (textUpper.includes(sign)) {
        const matchingFragment = allFragments.find(f => 
          f.text.toUpperCase().includes(sign)
        )
        signs.push({
          text: sign,
          confidence: matchingFragment?.confidence || 0.7,
        })
      }
    }

    // Panneaux de circulation
    const trafficPatterns = [
      /(?:STOP|ARRET|SENS UNIQUE|PRIORITE|CEDER|PASSAGE PIETON)/gi,
      /(?:ZONE|INTERDIT|INTERDICTION|AUTORISE)/gi,
    ]
    
    for (const pattern of trafficPatterns) {
      const matches = Array.from(fullText.matchAll(pattern))
      for (const match of matches) {
        trafficSigns.push({
          text: match[0],
          confidence: 0.6,
        })
      }
    }

    // Texte sur façades (mots en majuscules ou avec numéros)
    const facadePattern = /([A-Z0-9][A-Z0-9\s]{2,})/g
    const facadeMatches = Array.from(fullText.matchAll(facadePattern))
    for (const match of facadeMatches) {
      const text = match[1].trim()
      if (text.length > 2 && !text.match(/^\d+$/)) {
        facadeText.push({
          text,
          confidence: 0.5,
        })
      }
    }

    return {
      streetFragments: [...new Map(streetFragments.map(f => [f.text, f])).values()],
      signs: [...new Map(signs.map(s => [s.text, s])).values()],
      trafficSigns: [...new Map(trafficSigns.map(t => [t.text, t])).values()],
      facadeText: facadeText.slice(0, 10),
      allFragments: allFragments.slice(0, 50),
    }
  } catch (error: any) {
    console.error("❌ [extractOCRHeavy] Erreur:", error)
    return {
      streetFragments: [],
      signs: [],
      trafficSigns: [],
      facadeText: [],
      allFragments: [],
    }
  }
}


