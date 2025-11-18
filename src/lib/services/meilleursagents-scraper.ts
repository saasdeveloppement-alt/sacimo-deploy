/**
 * Service pour récupérer les prix au m² depuis MeilleursAgents.com
 * 
 * MeilleursAgents affiche les prix au m² moyens par code postal et type de bien
 * sur des pages comme : https://www.meilleursagents.com/prix-immobilier/paris-75008/
 */

import * as cheerio from "cheerio"

interface MeilleursAgentsPrice {
  avgPricePerSqm: number
  minPricePerSqm: number
  maxPricePerSqm: number
  confidence: "high" | "medium" | "low"
  sampleSize?: number
  lastUpdate?: string
}

/**
 * Construit l'URL MeilleursAgents pour un code postal
 */
function buildMeilleursAgentsURL(postalCode: string): string {
  // MeilleursAgents utilise des URLs comme :
  // https://www.meilleursagents.com/prix-immobilier/paris-75008/
  // ou pour les arrondissements : https://www.meilleursagents.com/prix-immobilier/paris-8eme-75008/
  
  // Pour Paris, utiliser le format avec arrondissement si possible
  if (postalCode.startsWith("75")) {
    const arrondissement = postalCode.substring(2) // "008" pour 75008
    const arrNum = parseInt(arrondissement, 10)
    if (!isNaN(arrNum) && arrNum >= 1 && arrNum <= 20) {
      // Format: paris-8eme-75008 ou paris-1er-75001
      const suffix = arrNum === 1 ? "er" : arrNum === 2 ? "nd" : arrNum === 3 ? "rd" : "eme"
      return `https://www.meilleursagents.com/prix-immobilier/paris-${arrNum}${suffix}-${postalCode}/`
    }
  }
  
  // Format générique avec code postal
  return `https://www.meilleursagents.com/prix-immobilier/${postalCode}/`
}

/**
 * Récupère le prix au m² depuis MeilleursAgents via scraping
 */
export async function getPriceFromMeilleursAgents(
  postalCode: string,
  type: "Appartement" | "Maison"
): Promise<MeilleursAgentsPrice | null> {
  try {
    const url = buildMeilleursAgentsURL(postalCode)
    console.log("🔍 [MeilleursAgents] Récupération du prix au m²...")
    console.log("   URL:", url)
    console.log("   Type:", type)

    // Utiliser ZenRows si disponible pour éviter les blocages
    const zenrowsKey = process.env.ZENROWS_API_KEY
    let html: string

    if (zenrowsKey) {
      // Utiliser ZenRows pour le scraping
      const zenrowsUrl = `https://api.zenrows.com/v1/?apikey=${zenrowsKey}&url=${encodeURIComponent(url)}&js_render=true&premium_proxy=true&proxy_country=fr`
      
      const response = await fetch(zenrowsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })

      if (!response.ok) {
        console.log(`⚠️ [MeilleursAgents] Erreur HTTP ${response.status}`)
        return null
      }

      html = await response.text()
    } else {
      // Tentative directe (peut être bloquée)
      console.log("⚠️ [MeilleursAgents] ZENROWS_API_KEY non configurée, tentative directe...")
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })

      if (!response.ok) {
        console.log(`⚠️ [MeilleursAgents] Erreur HTTP ${response.status}`)
        return null
      }

      html = await response.text()
    }

    // Parser le HTML avec Cheerio
    const $ = cheerio.load(html)

    // MeilleursAgents affiche les prix dans des sections spécifiques
    // Structure typique :
    // - Section "APPARTEMENT" avec "Prix m2 moyen" : 11 836 €
    // - Fourchette : "de 8 652 € à 21 449 €"
    
    // Sauvegarder le HTML pour debug
    console.log("📄 [MeilleursAgents] HTML reçu:", html.length, "caractères")
    
    // Chercher d'abord dans tout le document pour trouver "Prix m2 moyen" ou "Prix m² moyen"
    const fullText = $('body').text()
    console.log("📄 [MeilleursAgents] Texte complet (extrait):", fullText.substring(0, 2000))
    
    // Chercher le prix moyen avec plusieurs patterns
    // Pattern 1: "Prix m2 moyen" ou "Prix m² moyen" suivi d'un nombre
    const pricePattern1 = /Prix\s+m[²2]\s+moyen[:\s]*(\d{1,3}(?:\s|,)?\d{3}(?:\s|,)?\d{3}|\d{4,6})\s*€/i
    // Pattern 2: Juste un nombre suivi de € après "Appartement" ou "Maison"
    const pricePattern2 = new RegExp(`${type}[^€]*?(\\d{1,3}(?:\\s|,)?\\d{3}(?:\\s|,)?\\d{3}|\\d{4,6})\\s*€`, 'i')
    
    let avgPrice: number | null = null
    let priceMatch: RegExpMatchArray | null = null
    
    // Essayer le pattern 1 d'abord
    priceMatch = fullText.match(pricePattern1)
    if (priceMatch) {
      const priceStr = priceMatch[1].replace(/\s|,/g, '')
      avgPrice = parseInt(priceStr, 10)
      console.log(`✅ [MeilleursAgents] Prix trouvé avec pattern 1: ${avgPrice}`)
    } else {
      // Essayer le pattern 2
      priceMatch = fullText.match(pricePattern2)
      if (priceMatch) {
        const priceStr = priceMatch[1].replace(/\s|,/g, '')
        avgPrice = parseInt(priceStr, 10)
        console.log(`✅ [MeilleursAgents] Prix trouvé avec pattern 2: ${avgPrice}`)
      }
    }
    
    // Si toujours pas trouvé, chercher dans des sélecteurs CSS spécifiques
    if (!avgPrice || isNaN(avgPrice) || avgPrice <= 0) {
      // Chercher dans des classes/IDs communs de MeilleursAgents
      const possibleSelectors = [
        '[class*="price"]',
        '[class*="prix"]',
        '[class*="average"]',
        '[class*="moyen"]',
        '[data-testid*="price"]',
        'h2, h3, .price, .prix, [class*="estimation"]'
      ]
      
      for (const selector of possibleSelectors) {
        const elements = $(selector)
        for (let i = 0; i < elements.length; i++) {
          const text = $(elements[i]).text()
          const match = text.match(/(\d{1,3}(?:\s|,)?\d{3}(?:\s|,)?\d{3}|\d{4,6})\s*€/)
          if (match) {
            const priceStr = match[1].replace(/\s|,/g, '')
            const parsed = parseInt(priceStr, 10)
            // Vérifier que c'est un prix raisonnable (entre 1000 et 50000 €/m²)
            if (!isNaN(parsed) && parsed >= 1000 && parsed <= 50000) {
              avgPrice = parsed
              console.log(`✅ [MeilleursAgents] Prix trouvé dans sélecteur "${selector}": ${avgPrice}`)
              break
            }
          }
        }
        if (avgPrice) break
      }
    }
    
    if (!avgPrice || isNaN(avgPrice) || avgPrice <= 0) {
      console.log("⚠️ [MeilleursAgents] Prix moyen non trouvé dans le HTML")
      console.log("📄 [MeilleursAgents] Extrait HTML (premiers 5000 caractères):", html.substring(0, 5000))
      return null
    }

    // Extraire la fourchette (min - max)
    // Format typique : "de 8 652 € à 21 449 €" ou "8 652 € - 21 449 €"
    const rangePattern1 = /de\s+(\d{1,3}(?:\s|,)?\d{3}(?:\s|,)?\d{3}|\d{4,6})\s*€\s+à\s+(\d{1,3}(?:\s|,)?\d{3}(?:\s|,)?\d{3}|\d{4,6})\s*€/i
    const rangePattern2 = /(\d{1,3}(?:\s|,)?\d{3}(?:\s|,)?\d{3}|\d{4,6})\s*€\s*[-–]\s*(\d{1,3}(?:\s|,)?\d{3}(?:\s|,)?\d{3}|\d{4,6})\s*€/i
    
    let minPrice = Math.round(avgPrice * 0.73) // Approximation si pas trouvé
    let maxPrice = Math.round(avgPrice * 1.81) // Approximation si pas trouvé

    const rangeMatch1 = fullText.match(rangePattern1)
    const rangeMatch2 = fullText.match(rangePattern2)
    const rangeMatch = rangeMatch1 || rangeMatch2

    if (rangeMatch) {
      const minStr = rangeMatch[1].replace(/\s|,/g, '')
      const maxStr = rangeMatch[2].replace(/\s|,/g, '')
      const parsedMin = parseInt(minStr, 10)
      const parsedMax = parseInt(maxStr, 10)
      
      if (!isNaN(parsedMin) && parsedMin > 0 && parsedMin < avgPrice) minPrice = parsedMin
      if (!isNaN(parsedMax) && parsedMax > 0 && parsedMax > avgPrice) maxPrice = parsedMax
      console.log(`✅ [MeilleursAgents] Fourchette trouvée: ${minPrice} - ${maxPrice}`)
    } else {
      console.log(`⚠️ [MeilleursAgents] Fourchette non trouvée, utilisation d'approximations`)
    }

    // Déterminer la confiance selon les indicateurs visuels (points verts)
    // MeilleursAgents affiche 5 points : tous verts = high, 3 verts = medium, etc.
    // Pour l'instant, on considère toujours "high" car MeilleursAgents est une source fiable
    let confidence: "high" | "medium" | "low" = "high"
    
    // Chercher les points de confiance dans le HTML si possible
    const confidenceDots = $('[class*="dot"], [class*="point"], .confidence, [class*="confidence"]').length
    if (confidenceDots >= 4) {
      confidence = "high"
    } else if (confidenceDots >= 2) {
      confidence = "medium"
    } else {
      confidence = "high" // Par défaut, MeilleursAgents est fiable
    }

    console.log(`✅ [MeilleursAgents] Prix au m² récupéré:`)
    console.log(`   Prix m² moyen: ${avgPrice.toLocaleString("fr-FR")} €/m²`)
    console.log(`   Fourchette: ${minPrice.toLocaleString("fr-FR")} - ${maxPrice.toLocaleString("fr-FR")} €/m²`)
    console.log(`   Confiance: ${confidence}`)

    return {
      avgPricePerSqm: avgPrice,
      minPricePerSqm: minPrice,
      maxPricePerSqm: maxPrice,
      confidence,
    }
  } catch (error: any) {
    console.error("❌ [MeilleursAgents] Erreur lors du scraping:", error.message)
    return null
  }
}

/**
 * Récupère le prix au m² depuis MeilleursAgents (version alternative avec API si disponible)
 */
export async function getPriceFromMeilleursAgentsAPI(
  postalCode: string,
  type: "Appartement" | "Maison"
): Promise<MeilleursAgentsPrice | null> {
  // Note: MeilleursAgents n'a pas d'API publique officielle
  // Cette fonction est un placeholder pour une future intégration API si elle devient disponible
  
  console.log("ℹ️ [MeilleursAgents] API non disponible, utilisation du scraping")
  return getPriceFromMeilleursAgents(postalCode, type)
}

