/**
 * Analyse OCR améliorée pour géolocalisation
 * Extrait enseignes, noms de rues, marquages au sol depuis Google Vision OCR
 */

import { callVisionForImage } from "./locationClient"

export interface OCRLocationAnalysis {
  rawText: string
  shopNames: string[]
  streetCandidates: string[]
  trafficSigns: string[]
  facadeText: string[]
}

/**
 * Analyse une image avec OCR pour extraire des indices de localisation
 */
export async function analyzeImageWithOcr(
  imageBuffer: Buffer,
): Promise<OCRLocationAnalysis> {
  try {
    const visionResult = await callVisionForImage(imageBuffer)
    const fullText = visionResult.fullTextAnnotation?.text || ""

    const shopNames: string[] = []
    const streetCandidates: string[] = []
    const trafficSigns: string[] = []
    const facadeText: string[] = []

    // Enseignes connues
    const knownShops = [
      "FNAC", "SEPHORA", "ZARA", "H&M", "MONOPRIX", "CARREFOUR", "LIDL",
      "MACDO", "MCDONALD", "STARBUCKS", "KFC", "BURGER KING",
      "ORANGE", "SFR", "BOUYGUES", "FREE",
      "BNP", "CREDIT AGRICOLE", "SOCIETE GENERALE", "LCL",
      "DECATHLON", "GO SPORT", "INTERSPORT",
      "LA POSTE", "CHRONOPOST",
    ]

    const textUpper = fullText.toUpperCase()
    for (const shop of knownShops) {
      if (textUpper.includes(shop)) {
        shopNames.push(shop)
      }
    }

    // Patterns pour noms de rues
    const streetPatterns = [
      // Format: "Av. des Champs-Élysées" ou "Avenue des Champs-Élysées"
      /(?:av|avenue|bd|boulevard|rue|place|impasse|allée|chemin|route|passage|voie|cours|quai|esplanade|promenade)[\s\.]+(?:des|de|du|de la|de l'|d')?[\s\.]*([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s-]{2,})/gi,
      // Format: "Champs-Élysées" suivi de "Avenue"
      /([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s-]{2,})[\s\.]+(?:av|avenue|bd|boulevard|rue|place)/gi,
      // Format: "Av. des C..." (fragment)
      /(?:av|avenue|bd|boulevard)[\s\.]+(?:des|de|du|de la|de l'|d')?[\s\.]*([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s]{1,})/gi,
    ]

    for (const pattern of streetPatterns) {
      const matches = Array.from(fullText.matchAll(pattern))
      for (const match of matches) {
        const streetName = match[1]?.trim()
        if (streetName && streetName.length > 2) {
          // Nettoyer et normaliser
          const cleaned = streetName
            .replace(/[^\w\s-àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/gi, "")
            .trim()
          if (cleaned.length > 2 && !streetCandidates.includes(cleaned)) {
            streetCandidates.push(cleaned)
          }
        }
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
        const sign = match[0].trim()
        if (sign && !trafficSigns.includes(sign)) {
          trafficSigns.push(sign)
        }
      }
    }

    // Texte sur façades (mots en majuscules ou avec numéros)
    const facadePattern = /([A-Z0-9][A-Z0-9\s]{2,})/g
    const facadeMatches = Array.from(fullText.matchAll(facadePattern))
    for (const match of facadeMatches) {
      const text = match[1].trim()
      if (text.length > 2 && !text.match(/^\d+$/) && !facadeText.includes(text)) {
        facadeText.push(text)
      }
    }

    return {
      rawText: fullText,
      shopNames: [...new Set(shopNames)],
      streetCandidates: [...new Set(streetCandidates)],
      trafficSigns: [...new Set(trafficSigns)],
      facadeText: facadeText.slice(0, 10),
    }
  } catch (error: any) {
    console.error("❌ [analyzeImageWithOcr] Erreur:", error)
    return {
      rawText: "",
      shopNames: [],
      streetCandidates: [],
      trafficSigns: [],
      facadeText: [],
    }
  }
}


