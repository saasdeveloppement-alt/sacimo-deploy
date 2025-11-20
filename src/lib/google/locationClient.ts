/**
 * Client Google pour la localisation par images
 * - Google Cloud Vision API (OCR)
 * - Google Geocoding API
 * - Google Street View Static API
 * - Lecture EXIF
 */

import exifr from "exifr"
import type {
  VisionResult,
  AddressCandidate,
  GeocodedCandidate,
  ExifData,
  LLMLocationGuess,
  LLMLocationContext,
} from "@/types/location"

const GOOGLE_VISION_API_KEY = process.env.GOOGLE_CLOUD_VISION_API_KEY
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

/**
 * Appelle Google Cloud Vision API pour extraire le texte d'une image
 */
export async function callVisionForImage(
  imageBuffer: Buffer,
): Promise<VisionResult> {
  if (!GOOGLE_VISION_API_KEY) {
    throw new Error("GOOGLE_CLOUD_VISION_API_KEY non configurée")
  }

  // Encoder l'image en base64
  const base64Image = imageBuffer.toString("base64")

  const url = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: "TEXT_DETECTION",
              maxResults: 50,
            },
            {
              type: "LABEL_DETECTION",
              maxResults: 20,
            },
            {
              type: "LANDMARK_DETECTION",
              maxResults: 10,
            },
            {
              type: "LOGO_DETECTION",
              maxResults: 10,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = `Google Vision API error: ${response.status} - ${errorText}`
    
    // Détecter l'erreur de facturation et donner un message plus clair
    if (response.status === 403 && errorText.includes("BILLING_DISABLED")) {
      try {
        const errorData = JSON.parse(errorText)
        const projectId = errorData?.error?.details?.[0]?.metadata?.consumer?.replace("projects/", "") || "VOTRE_PROJECT_ID"
        errorMessage = `⚠️ Facturation Google Cloud requise\n\n` +
          `L'API Google Vision nécessite que la facturation soit activée sur votre projet Google Cloud.\n\n` +
          `🔧 Solution :\n` +
          `1. Activez la facturation : https://console.developers.google.com/billing/enable?project=${projectId}\n` +
          `2. Attendez 2-3 minutes\n` +
          `3. Réessayez\n\n` +
          `💡 Ne vous inquiétez pas : Google offre $300 de crédit gratuit et les quotas gratuits sont généreux.\n\n` +
          `📚 Guide complet : voir GUIDE_API_KEYS_LOCALISATION.md`
      } catch {
        // Si le parsing échoue, garder le message original
      }
    }
    
    throw new Error(errorMessage)
  }

  const data = await response.json()

  if (data.responses?.[0]?.error) {
    const error = data.responses[0].error
    let errorMessage = `Google Vision API error: ${error.message}`
    
    // Détecter l'erreur de facturation dans la réponse JSON
    if (error.status === "PERMISSION_DENIED" && error.details?.[0]?.reason === "BILLING_DISABLED") {
      const projectId = error.details?.[0]?.metadata?.consumer?.replace("projects/", "") || "VOTRE_PROJECT_ID"
      errorMessage = `⚠️ Facturation Google Cloud requise\n\n` +
        `L'API Google Vision nécessite que la facturation soit activée sur votre projet Google Cloud.\n\n` +
        `🔧 Solution :\n` +
        `1. Activez la facturation : https://console.developers.google.com/billing/enable?project=${projectId}\n` +
        `2. Attendez 2-3 minutes\n` +
        `3. Réessayez\n\n` +
        `💡 Ne vous inquiétez pas : Google offre $300 de crédit gratuit et les quotas gratuits sont généreux.\n\n` +
        `📚 Guide complet : voir GUIDE_API_KEYS_LOCALISATION.md`
    }
    
    throw new Error(errorMessage)
  }

  return data.responses[0] || {}
}

/**
 * Extrait les candidats d'adresse depuis le résultat Vision
 * Utilise à la fois le texte OCR, les landmarks, les labels visuels et le contexte
 */
export function extractAddressCandidatesFromVision(
  visionResult: VisionResult,
  context?: { city?: string; postalCode?: string; country?: string; department?: string },
): AddressCandidate[] {
  const candidates: AddressCandidate[] = []
  const fullText = visionResult.fullTextAnnotation?.text || ""
  const labels = visionResult.labelAnnotations || []
  const landmarks = visionResult.landmarkAnnotations || []

  // PRIORITÉ 1 : Landmarks détectés (très précis)
  if (landmarks.length > 0) {
    for (const landmark of landmarks) {
      if (landmark.locations && landmark.locations.length > 0) {
        const location = landmark.locations[0]
        if (location.latLng) {
          // Les landmarks ont des coordonnées GPS directes, très précis !
          candidates.push({
            rawText: `${landmark.description}, ${context?.city || "France"}`,
            score: 0.95, // Très haute confiance pour les landmarks
          })
        }
      }
    }
  }

  // PRIORITÉ 2 : Extraction de texte OCR (adresses dans l'image)
  if (fullText) {
    // Patterns améliorés pour détecter les adresses françaises
  const addressPatterns = [
    // Adresse complète avec numéro, rue, code postal, ville (priorité haute)
    /\d+\s+(?:rue|avenue|boulevard|place|chemin|impasse|allée|route|passage|voie|cours|quai|esplanade|promenade)\s+[^\n,]+(?:,\s*)?\d{5}\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s-]+/gi,
    // Place/Rue sans numéro mais avec nom (ex: "Place Tourny", "Place de la Bourse")
    /(?:place|Place|PLACE)\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s-]+(?:,\s*)?(?:Bordeaux|Paris|Lyon|Marseille|Toulouse|Nice|Nantes|Strasbourg|Montpellier|Lille|Rennes|Reims|Saint-Étienne|Le Havre|Toulon|Grenoble|Dijon|Angers|Nîmes|Villeurbanne|Saint-Denis|Le Mans|Aix-en-Provence|Clermont-Ferrand|Brest|Limoges|Tours|Amiens|Perpignan|Metz|Besançon|Boulogne-Billancourt|Orléans|Mulhouse|Rouen|Caen|Nancy|Argenteuil|Montreuil|Saint-Paul|Roubaix|Tourcoing|Nanterre|Avignon|Créteil|Dunkirk|Poitiers|Asnières-sur-Seine|Versailles|Courbevoie|Vitry-sur-Seine|Colombes|Aulnay-sous-Bois|La Rochelle|Champigny-sur-Marne|Rueil-Malmaison|Antibes|Saint-Maur-des-Fossés|Cannes|Bourges|Drancy|Mérignac|Saint-Nazaire|Colmar|Issy-les-Moulineaux|Noisy-le-Grand|Évry|Cergy|Pessac|Valence|Antony|La Seyne-sur-Mer|Clichy|Troyes|Neuilly-sur-Seine|Villeneuve-d'Ascq|Pantin|Niort|Le Blanc-Mesnil|Haguenau|Bobigny|Lorient|Beauvais|Hyères|Épinay-sur-Seine|Sartrouville|Maisons-Alfort|Meaux|Chelles|Villejuif|Cholet|Évry-Courcouronnes|Fontenay-sous-Bois|Fréjus|Vannes|Bondy|Laval|Arles|Sète|Clamart|Bayonne|Sarcelles|Corbeil-Essonnes|Mantes-la-Jolie|Saint-Ouen|Saint-Quentin|Gennevilliers|Ivry-sur-Seine|Charleville-Mézières|Blois|Châlons-en-Champagne|Chambéry|Albi|Brive-la-Gaillarde|Châteauroux|Montbéliard|Tarbes|Angoulême)/i,
    // Place/Rue sans numéro (ex: "Place Tourny", "Rue de la Paix")
    /(?:place|Place|PLACE|rue|Rue|RUE|avenue|Avenue|AVENUE|boulevard|Boulevard|BOULEVARD|chemin|Chemin|CHEMIN|impasse|Impasse|IMPASSE|allée|Allée|ALLÉE|route|Route|ROUTE|passage|Passage|PASSAGE|voie|Voie|VOIE|cours|Cours|COURS|quai|Quai|QUAI|esplanade|Esplanade|ESPLANADE|promenade|Promenade|PROMENADE)\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s-]+/gi,
    // Numéro + Rue + Ville (ex: "15 Rue de la Paix Paris")
    /\d+\s+(?:rue|avenue|boulevard|place|chemin|impasse|allée|route|passage|voie|cours|quai|esplanade|promenade)\s+[^\n,]+(?:,?\s*)?[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s-]+/gi,
    // Numéro + Rue (ex: "15 Rue de la Paix")
    /\d+\s+(?:rue|avenue|boulevard|place|chemin|impasse|allée|route|passage|voie|cours|quai|esplanade|promenade)\s+[^\n,]+/gi,
    // Code postal + Ville (ex: "75001 Paris", "33000 Bordeaux")
    /\d{5}\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s-]+/gi,
    // Ville seule si elle est connue (ex: "Paris", "Bordeaux")
    /\b(?:Paris|Lyon|Marseille|Toulouse|Nice|Nantes|Strasbourg|Montpellier|Bordeaux|Lille|Rennes|Reims|Saint-Étienne|Le Havre|Toulon|Grenoble|Dijon|Angers|Nîmes|Villeurbanne|Saint-Denis|Le Mans|Aix-en-Provence|Clermont-Ferrand|Brest|Limoges|Tours|Amiens|Perpignan|Metz|Besançon|Boulogne-Billancourt|Orléans|Mulhouse|Rouen|Caen|Nancy|Argenteuil|Montreuil|Saint-Paul|Roubaix|Tourcoing|Nanterre|Avignon|Créteil|Dunkirk|Poitiers|Asnières-sur-Seine|Versailles|Courbevoie|Vitry-sur-Seine|Colombes|Aulnay-sous-Bois|La Rochelle|Champigny-sur-Marne|Rueil-Malmaison|Antibes|Saint-Maur-des-Fossés|Cannes|Bourges|Drancy|Mérignac|Saint-Nazaire|Colmar|Issy-les-Moulineaux|Noisy-le-Grand|Évry|Cergy|Pessac|Valence|Antony|La Seyne-sur-Mer|Clichy|Troyes|Neuilly-sur-Seine|Villeneuve-d'Ascq|Pantin|Niort|Le Blanc-Mesnil|Haguenau|Bobigny|Lorient|Beauvais|Hyères|Épinay-sur-Seine|Sartrouville|Maisons-Alfort|Meaux|Chelles|Villejuif|Cholet|Évry-Courcouronnes|Fontenay-sous-Bois|Fréjus|Vannes|Bondy|Laval|Arles|Sète|Clamart|Bayonne|Sarcelles|Corbeil-Essonnes|Mantes-la-Jolie|Saint-Ouen|Saint-Quentin|Gennevilliers|Ivry-sur-Seine|Charleville-Mézières|Blois|Châlons-en-Champagne|Chambéry|Albi|Brive-la-Gaillarde|Châteauroux|Montbéliard|Tarbes|Angoulême|Lons-le-Saunier|Agen|Foix|Gap|Mende|Privas|Aurillac|Cahors|Rodez|Millau|Alès|Nîmes|Uzès|Béziers|Perpignan|Carcassonne|Foix|Pamiers|Auch|Tarbes|Lourdes|Pau|Bayonne|Dax|Mont-de-Marsan|Périgueux|Bergerac|Sarlat-la-Canéda|Brive-la-Gaillarde|Tulle|Ussel|Guéret|Aubusson|Limoges|Bellac|Rochechouart|Angoulême|Cognac|Confolens|La Rochelle|Rochefort|Saintes|Jonzac|Marennes|Royan|Saint-Jean-d'Angély|Niort|Parthenay|Bressuire|Thouars|Loudun|Châtellerault|Poitiers|Montmorillon|Civray|Confolens|Bellac|Limoges|Saint-Junien|Rochechouart|Ussel|Tulle|Brive-la-Gaillarde|Sarlat-la-Canéda|Bergerac|Périgueux|Mont-de-Marsan|Dax|Bayonne|Pau|Lourdes|Tarbes|Auch|Pamiers|Foix|Carcassonne|Perpignan|Béziers|Uzès|Nîmes|Alès|Millau|Rodez|Cahors|Aurillac|Privas|Mende|Gap|Foix|Agen|Lons-le-Saunier|Angoulême|Tarbes|Montbéliard|Châteauroux|Brive-la-Gaillarde|Albi|Chambéry|Châlons-en-Champagne|Blois|Charleville-Mézières|Ivry-sur-Seine|Gennevilliers|Saint-Quentin|Saint-Ouen|Mantes-la-Jolie|Corbeil-Essonnes|Sarcelles|Bayonne|Clamart|Sète|Arles|Laval|Bondy|Vannes|Fréjus|Fontenay-sous-Bois|Évry-Courcouronnes|Cholet|Villejuif|Chelles|Meaux|Maisons-Alfort|Sartrouville|Épinay-sur-Seine|Hyères|Beauvais|Lorient|Bobigny|Haguenau|Le Blanc-Mesnil|Niort|Pantin|Villeneuve-d'Ascq|Neuilly-sur-Seine|Troyes|Clichy|La Seyne-sur-Seine|Antony|Valence|Pessac|Cergy|Évry|Noisy-le-Grand|Issy-les-Moulineaux|Colmar|Saint-Nazaire|Mérignac|Drancy|Bourges|Cannes|Saint-Maur-des-Fossés|Antibes|Rueil-Malmaison|Champigny-sur-Marne|La Rochelle|Aulnay-sous-Bois|Colombes|Vitry-sur-Seine|Courbevoie|Versailles|Asnières-sur-Seine|Poitiers|Dunkirk|Créteil|Avignon|Nanterre|Tourcoing|Roubaix|Saint-Paul|Montreuil|Argenteuil|Nancy|Caen|Rouen|Mulhouse|Orléans|Boulogne-Billancourt|Besançon|Metz|Perpignan|Amiens|Tours|Limoges|Brest|Clermont-Ferrand|Aix-en-Provence|Le Mans|Saint-Denis|Villeurbanne|Nîmes|Angers|Dijon|Grenoble|Toulon|Le Havre|Saint-Étienne|Reims|Rennes|Lille|Bordeaux|Montpellier|Strasbourg|Nantes|Nice|Toulouse|Marseille)\b/gi,
  ]

  const foundAddresses = new Set<string>()

  for (const pattern of addressPatterns) {
    const matches = fullText.match(pattern)
    if (matches) {
      for (const match of matches) {
        const cleaned = match.trim()
        if (cleaned.length > 5 && !foundAddresses.has(cleaned)) {
          foundAddresses.add(cleaned)

          // Calculer un score de confiance
          let score = 0.5

          // Bonus si contient un code postal
          if (/\d{5}/.test(cleaned)) {
            score += 0.2
          }

          // Bonus si contient un numéro de rue
          if (/^\d+/.test(cleaned)) {
            score += 0.1
          }

          // Bonus si correspond au contexte (ville, code postal)
          if (context) {
            if (context.postalCode && cleaned.includes(context.postalCode)) {
              score += 0.25 // Bonus plus important pour correspondance code postal
            }
            if (context.city && cleaned.toLowerCase().includes(context.city.toLowerCase())) {
              score += 0.2 // Bonus pour correspondance ville
            }
          }

          // Bonus si contient des mots-clés d'adresse
          const addressKeywords = [
            "rue",
            "avenue",
            "boulevard",
            "place",
            "chemin",
            "impasse",
            "allée",
            "voie",
            "cours",
            "quai",
            "esplanade",
            "promenade",
          ]
          if (
            addressKeywords.some((keyword) =>
              cleaned.toLowerCase().includes(keyword),
            )
          ) {
            score += 0.15 // Bonus augmenté
            // Bonus supplémentaire pour les places (souvent des lieux emblématiques)
            if (cleaned.toLowerCase().includes("place")) {
              score += 0.1
            }
          }

          // Bonus si l'adresse est complète (numéro + rue + code postal + ville)
          const hasAllComponents =
            /^\d+/.test(cleaned) && // Numéro
            addressKeywords.some((k) => cleaned.toLowerCase().includes(k)) && // Type de rue
            /\d{5}/.test(cleaned) && // Code postal
            /[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ]/.test(cleaned) // Ville (majuscule)

          if (hasAllComponents) {
            score += 0.2 // Bonus important pour adresse complète
          }

          score = Math.min(1, score) // Cap à 1

          candidates.push({
            rawText: cleaned,
            score,
          })
        }
      }
    }
  }

  // Si aucun pattern trouvé, essayer d'extraire des textes qui ressemblent à des adresses
  if (candidates.length === 0) {
    // Chercher des lignes qui contiennent un code postal
    const lines = fullText.split("\n").filter((line) => line.trim().length > 0)
    for (const line of lines) {
      if (/\d{5}/.test(line)) {
        const cleaned = line.trim()
        if (cleaned.length > 5 && !foundAddresses.has(cleaned)) {
          foundAddresses.add(cleaned)
          candidates.push({
            rawText: cleaned,
            score: 0.4, // Score plus bas car moins sûr
          })
        }
      }
    }
    
    // Si toujours rien, chercher des villes seules dans le texte (détection générique)
    if (candidates.length === 0 && fullText) {
      const commonWords = new Set([
        'rue', 'avenue', 'boulevard', 'place', 'chemin', 'impasse', 'allée',
        'route', 'passage', 'voie', 'cours', 'quai', 'esplanade', 'promenade',
        'france', 'french', 'code', 'postal', 'numero', 'numéro', 'le', 'la', 'les',
        'de', 'du', 'des', 'et', 'ou', 'sur', 'sous', 'dans', 'pour', 'avec', 'sans',
        'mairie', 'ville', 'commune', 'département', 'région'
      ])
      
      // Pattern pour détecter des villes (mots avec majuscule, 3+ caractères)
      const cityPattern = /\b([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+(?:[-' ][A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+)*)\b/g
      const cityMatches = fullText.match(cityPattern) || []
      
      const cities = cityMatches
        .map(m => m.trim())
        .filter(m => m.length >= 3 && !commonWords.has(m.toLowerCase()))
        .filter((m, i, arr) => arr.indexOf(m) === i) // Dédupliquer
      
      // Prendre la première ville détectée et créer un candidat
      if (cities.length > 0) {
        const detectedCity = cities[0]
        // Essayer de trouver un code postal à proximité dans le texte
        const postalCodeMatch = fullText.match(/\b(\d{5})\b/)
        const postalCode = postalCodeMatch ? postalCodeMatch[1] : null
        
        const cityAddress = postalCode 
          ? `${postalCode} ${detectedCity}, France`
          : `${detectedCity}, France`
        
        if (!foundAddresses.has(cityAddress)) {
          foundAddresses.add(cityAddress)
          candidates.push({
            rawText: cityAddress,
            score: 0.35, // Score moyen car basé sur détection de ville seule
          })
        }
      }
    }
  }

  } // Fin du if (fullText)

  // Si toujours rien, essayer d'extraire des indices des labels visuels
  if (candidates.length === 0 && labels.length > 0) {
    // Chercher des labels qui pourraient indiquer un type de lieu spécifique
    const locationIndicators = labels
      .filter((label) => {
        const desc = label.description.toLowerCase()
        return (
          desc.includes("street") ||
          desc.includes("road") ||
          desc.includes("building") ||
          desc.includes("architecture") ||
          desc.includes("residential") ||
          desc.includes("commercial") ||
          desc.includes("facade") ||
          desc.includes("door") ||
          desc.includes("entrance") ||
          desc.includes("store") ||
          desc.includes("shop") ||
          desc.includes("restaurant") ||
          desc.includes("cafe") ||
          desc.includes("square") ||
          desc.includes("plaza") ||
          desc.includes("monument") ||
          desc.includes("statue") ||
          desc.includes("fountain")
        )
      })
      .sort((a, b) => b.score - a.score) // Trier par score de confiance Vision

    // Si on a des indicateurs de lieu forts, créer un candidat basé sur le contexte
    // MAIS seulement si on n'a pas détecté de ville différente dans le texte
    if (locationIndicators.length > 0 && context?.city) {
      const topLabel = locationIndicators[0]
      // Plus le label est confiant, plus on augmente le score
      const baseScore = 0.2 + Math.min(0.2, topLabel.score * 0.3)
      candidates.push({
        rawText: `${context.city}${context.postalCode ? ` ${context.postalCode}` : ""}, France`,
        score: baseScore,
      })
    }
  }

  // Dernier fallback : utiliser uniquement le contexte
  // ⚠️ ATTENTION : Ne pas utiliser ce fallback si on a détecté une ville dans le texte
  // qui est différente du contexte de l'annonce
  
  // Détection générique de villes françaises (pas seulement une liste fixe)
  // Pattern pour détecter n'importe quelle ville française :
  // - Mot commençant par majuscule, suivi de lettres minuscules
  // - Peut contenir des tirets, apostrophes, espaces
  // - Exclut les mots courts (< 3 caractères) et les mots communs
  const commonWords = new Set([
    'rue', 'avenue', 'boulevard', 'place', 'chemin', 'impasse', 'allée',
    'route', 'passage', 'voie', 'cours', 'quai', 'esplanade', 'promenade',
    'france', 'french', 'code', 'postal', 'numero', 'numéro', 'le', 'la', 'les',
    'de', 'du', 'des', 'et', 'ou', 'sur', 'sous', 'dans', 'pour', 'avec', 'sans'
  ])
  
  const detectedCityInText = fullText
    ? (() => {
        // Pattern pour détecter des noms de villes françaises
        // Format typique : mot avec majuscule + lettres minuscules, éventuellement avec tirets/apostrophes
        const cityPattern = /\b([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+(?:[-' ][A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+)*)\b/g
        
        const matches = fullText.match(cityPattern) || []
        // Filtrer les mots communs et les mots trop courts
        const cities = matches
          .map(m => m.trim())
          .filter(m => m.length >= 3 && !commonWords.has(m.toLowerCase()))
          .filter((m, i, arr) => arr.indexOf(m) === i) // Dédupliquer
        
        return cities
      })()
    : []

  const detectedCityName = detectedCityInText.length > 0 
    ? detectedCityInText[0].trim() 
    : null

  // Ne pas utiliser le fallback contextuel si on a détecté une ville différente
  const shouldUseContextFallback = 
    candidates.length === 0 && 
    context?.city && 
    (!detectedCityName || detectedCityName.toLowerCase() === context.city.toLowerCase())

  if (shouldUseContextFallback) {
    const contextAddress = `${context.city}${context.postalCode ? ` ${context.postalCode}` : ""}, France`
    candidates.push({
      rawText: contextAddress,
      score: 0.15, // Score très bas car basé uniquement sur le contexte
    })
  } else if (candidates.length === 0 && detectedCityName) {
    // Si on a détecté une ville mais pas d'adresse complète, créer un candidat avec cette ville
    candidates.push({
      rawText: `${detectedCityName}, France`,
      score: 0.25, // Score un peu plus élevé car basé sur une détection réelle
    })
  }

  // Trier par score décroissant
  return candidates.sort((a, b) => b.score - a.score)
}

/**
 * Géocode une liste de candidats d'adresse
 */
export async function geocodeAddressCandidates(
  candidates: AddressCandidate[],
  context?: { city?: string; postalCode?: string; country?: string; department?: string },
): Promise<GeocodedCandidate[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY non configurée")
  }

  const geocoded: GeocodedCandidate[] = []

  for (const candidate of candidates) {
    try {
      // Construire la requête de géocodage
      let addressQuery = candidate.rawText
      
      // HARD LOCK: Si un département est fourni dans le contexte, le forcer dans la requête
      if (context?.department) {
        // Ajouter le département à la requête pour forcer le géocodage dans cette zone
        // Format: "adresse, département, France"
        if (!addressQuery.toLowerCase().includes(context.department.toLowerCase())) {
          // Trouver le nom du département depuis le code (simplifié)
          addressQuery = `${addressQuery}, ${context.department}, France`
        } else if (!addressQuery.toLowerCase().includes("france")) {
          addressQuery = `${addressQuery}, France`
        }
      } else {
        // Logique originale si pas de département forcé
        // Ne PAS ajouter le contexte de l'annonce si l'adresse détectée contient déjà une ville ou un code postal
        // Cela évite de forcer une mauvaise ville (ex: forcer Paris alors que c'est Bordeaux)
        
        // Détecter si l'adresse contient déjà une ville française (mot commençant par majuscule suivi de lettres)
        // ou un code postal français (5 chiffres)
        const hasPostalCode = /\d{5}/.test(addressQuery)
        const hasCityPattern = /[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+(?:\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+)*/.test(addressQuery)
        
        // Si l'adresse contient déjà un code postal OU semble contenir une ville, ne pas ajouter le contexte
        if (context && (hasPostalCode || hasCityPattern)) {
          // Ajouter uniquement le pays si nécessaire
          if (context.country && !addressQuery.toLowerCase().includes("france")) {
            addressQuery = `${addressQuery}, ${context.country}`
          }
        } else if (context) {
          // Si pas de ville/code postal détecté, on peut utiliser le contexte mais avec précaution
          // Ne pas forcer la ville si l'adresse semble complète
          const addressLength = addressQuery.trim().length
          if (addressLength > 20) {
            // Adresse assez longue, probablement complète, ne pas ajouter le contexte
            if (context.country && !addressQuery.toLowerCase().includes("france")) {
              addressQuery = `${addressQuery}, ${context.country}`
            }
          } else {
            // Adresse courte, on peut ajouter le contexte mais seulement le pays
            if (context.country && !addressQuery.toLowerCase().includes("france")) {
              addressQuery = `${addressQuery}, ${context.country}`
            }
          }
        }
      }

      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        addressQuery,
      )}&key=${GOOGLE_MAPS_API_KEY}&region=fr&components=country:fr`

      const response = await fetch(url)

      if (!response.ok) {
        console.warn(
          `Erreur géocodage pour "${candidate.rawText}": ${response.status}`,
        )
        continue
      }

      const data = await response.json()

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const result = data.results[0]
        const location = result.geometry.location

        // Calculer un score de géocodage basé sur la précision de l'adresse
        const geocodedAddress = result.formatted_address
        const addressComponents = result.address_components || []
        
        // Vérifier la précision de l'adresse
        const hasStreetNumber = addressComponents.some(c => c.types.includes("street_number"))
        const hasRoute = addressComponents.some(c => c.types.includes("route"))
        const hasPostalCode = addressComponents.some(c => c.types.includes("postal_code"))
        const hasLocality = addressComponents.some(c => c.types.includes("locality"))
        
        // Score basé sur la précision de l'adresse (selon les règles demandées)
        let geocodingScore = 0.5 // Base (ville seulement)
        
        if (hasStreetNumber && hasRoute && hasPostalCode) {
          geocodingScore = 0.95 // Adresse complète avec numéro + rue + code postal
        } else if (hasRoute && hasPostalCode) {
          geocodingScore = 0.85 // Rue + code postal (pas de numéro)
        } else if (hasPostalCode && hasLocality) {
          geocodingScore = 0.70 // Code postal + ville (quartier/arrondissement)
        } else if (hasLocality) {
          geocodingScore = 0.50 // Ville seulement
        }
        
        // Ajuster selon le type de résultat Google
        const locationType = result.geometry.location_type
        if (locationType === "ROOFTOP") {
          // Si ROOFTOP, on peut augmenter le score si on a déjà une bonne adresse
          if (geocodingScore < 0.90) geocodingScore = Math.min(0.98, geocodingScore + 0.1)
        } else if (locationType === "RANGE_INTERPOLATED") {
          // Légèrement réduire si interpolation
          geocodingScore = Math.max(0.70, geocodingScore - 0.05)
        } else if (locationType === "GEOMETRIC_CENTER") {
          // Réduire si centre géométrique
          geocodingScore = Math.max(0.60, geocodingScore - 0.10)
        } else if (locationType === "APPROXIMATE") {
          // Réduire si approximatif
          geocodingScore = Math.max(0.50, geocodingScore - 0.15)
        }

        // Vérifier si l'adresse géocodée correspond au contexte
        if (context) {
          const geocodedAddressLower = geocodedAddress.toLowerCase()
          if (context.postalCode && geocodedAddressLower.includes(context.postalCode)) {
            geocodingScore += 0.03 // Bonus si code postal correspond
          }
          if (context.city && geocodedAddressLower.includes(context.city.toLowerCase())) {
            geocodingScore += 0.02 // Bonus si ville correspond
          }
          geocodingScore = Math.min(1, geocodingScore) // Cap à 1
        }

        // Score global = moyenne pondérée (favoriser le géocodage si précis)
        // Si le géocodage est très précis (ROOFTOP), lui donner plus de poids
        const geocodingWeight = geocodingScore > 0.9 ? 0.7 : 0.6
        const candidateWeight = 1 - geocodingWeight
        const globalScore = candidate.score * candidateWeight + geocodingScore * geocodingWeight

        const streetViewUrl = fetchStreetViewPreview(
          location.lat,
          location.lng,
        )

        geocoded.push({
          address: result.formatted_address,
          latitude: location.lat,
          longitude: location.lng,
          geocodingScore,
          streetViewUrl,
          sourceText: candidate.rawText,
          globalScore,
        })
      } else {
        console.warn(
          `Géocodage échoué pour "${candidate.rawText}": ${data.status}`,
        )
      }
    } catch (error) {
      console.error(
        `Erreur lors du géocodage de "${candidate.rawText}":`,
        error,
      )
    }
  }

  // Trier par score global décroissant
  return geocoded.sort((a, b) => b.globalScore - a.globalScore)
}

/**
 * Reverse geocoding : convertit des coordonnées GPS en adresse
 * Retourne l'adresse la plus précise possible (rue + numéro si disponible)
 * 
 * Exemple avec 48.878917, 2.364535 :
 * Attendu: "Place de la République, 75003 Paris, France"
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<{ address: string; formattedAddress: string } | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY non configurée")
  }

  try {
    // Appel direct à l'API Google Geocoding Reverse
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=fr&region=fr`

    console.log(`🔍 [reverseGeocode] Appel API pour ${lat}, ${lng}`)
    
    const response = await fetch(url)

    if (!response.ok) {
      console.warn(`❌ [reverseGeocode] Erreur HTTP: ${response.status}`)
      return null
    }

    const data = await response.json()
    
    console.log(`📊 [reverseGeocode] Statut API: ${data.status}`)
    console.log(`📊 [reverseGeocode] Nombre de résultats: ${data.results?.length || 0}`)

    if (data.status === "OK" && data.results && data.results.length > 0) {
      // Chercher le résultat le plus précis
      // Priorité: street_address > route > premise > subpremise > locality
      let bestResult = data.results[0]
      let bestPriority = 999
      
      for (const result of data.results) {
        const types = result.types || []
        let priority = 999
        
        if (types.includes("street_address")) {
          priority = 1 // Meilleure précision
        } else if (types.includes("route")) {
          priority = 2 // Bonne précision (ex: "Place de la République")
        } else if (types.includes("premise")) {
          priority = 3
        } else if (types.includes("subpremise")) {
          priority = 4
        } else if (types.includes("locality")) {
          priority = 5 // Moins précis
        }
        
        if (priority < bestPriority) {
          bestResult = result
          bestPriority = priority
        }
      }
      
      console.log(`✅ [reverseGeocode] Meilleur résultat:`, {
        formatted_address: bestResult.formatted_address,
        types: bestResult.types,
        priority: bestPriority
      })
      
      // Extraire les composants pour construire l'adresse complète
      const components = bestResult.address_components || []
      const streetNumber = components.find(c => c.types.includes("street_number"))?.long_name
      const route = components.find(c => c.types.includes("route"))?.long_name
      const postalCode = components.find(c => c.types.includes("postal_code"))?.long_name
      const locality = components.find(c => c.types.includes("locality"))?.long_name
      const sublocality = components.find(c => c.types.includes("sublocality") || c.types.includes("sublocality_level_1"))?.long_name
      const city = locality || sublocality || components.find(c => c.types.includes("administrative_area_level_2"))?.long_name
      
      console.log(`📋 [reverseGeocode] Composants extraits:`, {
        streetNumber,
        route,
        postalCode,
        city,
        locality,
        sublocality
      })
      
      // Construire l'adresse complète selon les composants disponibles
      let fullAddress = bestResult.formatted_address // Par défaut, utiliser l'adresse formatée de Google
      
      // Si on a une route (place, rue, avenue, etc.) avec code postal et ville, construire manuellement
      if (route && postalCode && city) {
        if (streetNumber) {
          // Adresse complète avec numéro : "45 Rue de la Paix, 75001 Paris, France"
          fullAddress = `${streetNumber} ${route}, ${postalCode} ${city}, France`
        } else {
          // Route sans numéro : "Place de la République, 75003 Paris, France"
          fullAddress = `${route}, ${postalCode} ${city}, France`
        }
        console.log(`✅ [reverseGeocode] Adresse construite: ${fullAddress}`)
      } else if (postalCode && city) {
        // Si on n'a que code postal et ville : "75003 Paris, France"
        fullAddress = `${postalCode} ${city}, France`
        console.log(`⚠️ [reverseGeocode] Adresse partielle (pas de rue): ${fullAddress}`)
      }
      
      // Si l'adresse formatée de Google est déjà complète et contient une rue, l'utiliser
      // (parfois Google formate mieux que notre construction manuelle)
      if (bestResult.formatted_address && 
          (bestResult.formatted_address.includes("rue") || 
           bestResult.formatted_address.includes("avenue") || 
           bestResult.formatted_address.includes("boulevard") ||
           bestResult.formatted_address.includes("place") ||
           bestResult.formatted_address.includes("Place"))) {
        // Vérifier que l'adresse formatée contient un code postal
        if (/\d{5}/.test(bestResult.formatted_address)) {
          fullAddress = bestResult.formatted_address
          console.log(`✅ [reverseGeocode] Utilisation de l'adresse formatée Google: ${fullAddress}`)
        }
      }
      
      return {
        address: fullAddress,
        formattedAddress: bestResult.formatted_address,
      }
    }

    console.warn(`⚠️ [reverseGeocode] Aucun résultat pour ${lat}, ${lng} (statut: ${data.status})`)
    return null
  } catch (error) {
    console.error("❌ [reverseGeocode] Erreur:", error)
    return null
  }
}

/**
 * Génère une URL d'image Street View Static
 */
export function fetchStreetViewPreview(
  lat: number,
  lng: number,
  size: string = "400x300",
  heading: number = 0,
  pitch: number = 0,
  fov: number = 90,
): string {
  if (!GOOGLE_MAPS_API_KEY) {
    return ""
  }

  return `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${lat},${lng}&heading=${heading}&pitch=${pitch}&fov=${fov}&key=${GOOGLE_MAPS_API_KEY}`
}

/**
 * Génère une URL Street View Embed (iframe interactive)
 */
export function fetchStreetViewEmbedUrl(
  lat: number,
  lng: number,
  heading: number = 0,
  pitch: number = 0,
  fov: number = 90,
): string {
  if (!GOOGLE_MAPS_API_KEY) {
    return ""
  }

  return `https://www.google.com/maps/embed/v1/streetview?location=${lat},${lng}&heading=${heading}&pitch=${pitch}&fov=${fov}&key=${GOOGLE_MAPS_API_KEY}`
}

/**
 * Lit les données EXIF d'une image pour extraire les coordonnées GPS
 */
export async function readExifFromImage(
  imageBuffer: Buffer,
): Promise<ExifData> {
  try {
    const exifData = await exifr.parse(imageBuffer, {
      gps: true,
      translateKeys: false,
    })

    if (exifData?.latitude && exifData?.longitude) {
      return {
        lat: exifData.latitude,
        lng: exifData.longitude,
      }
    }

    // Essayer avec les clés alternatives
    if (exifData?.GPSLatitude && exifData?.GPSLongitude) {
      return {
        lat: exifData.GPSLatitude,
        lng: exifData.GPSLongitude,
      }
    }

    return {}
  } catch (error) {
    console.warn("Erreur lors de la lecture EXIF:", error)
    return {}
  }
}

/**
 * Utilise GPT-4o-mini Vision pour deviner la localisation depuis une image
 * Dernier recours si toutes les autres méthodes échouent
 */
export async function guessLocationWithLLM(
  imageUrl: string,
  context?: LLMLocationContext,
): Promise<LLMLocationGuess | null> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY

  if (!OPENAI_API_KEY) {
    console.warn("⚠️ [guessLocationWithLLM] OPENAI_API_KEY non configurée")
    return null
  }

  try {
    const hasContext = context && context.departementCode && context.departementName
    const isStreetViewMode = context?.streetViewMode === true

    let prompt = isStreetViewMode
      ? `Tu es un expert en localisation Street View.

Tu dois retrouver l'emplacement EXACT de cette image Street View.

Analyse en détail :
- trottoirs (matériaux, largeur, style)
- mobilier urbain (lampadaires, bancs, panneaux)
- façades des bâtiments (architecture, matériaux, couleurs)
- types d'arbres et végétation
- matériaux des murs et sols
- style des voitures (modèles, plaques)
- pavés / marquage au sol
- enseignes et panneaux commerciaux
- profondeur de champ StreetView (caractéristique)
- architecture hyper locale
- style des fenêtres et portes
- éclairage public
- signalisation routière

Tu dois retrouver l'adresse précise même si l'UI Google Maps n'est pas visible.

${hasContext ? `\n⚠️ CONTRAINTE ABSOLUE : Le résultat DOIT être localisé dans le département ${context.departementCode} (${context.departementName}).` : ""}

Réponds STRICTEMENT en JSON :
{
  "city": string|null,
  "area": string|null, // rue ou quartier précis
  "latitude": number|null,
  "longitude": number|null,
  "confidence": number // entre 0 et 1
}
Ne fais AUCUN texte en dehors du JSON.`
      : `Tu es un modèle spécialisé en géolocalisation d'images en France.

Analyse l'image en détail :
- architecture locale (immeubles, maisons, toits, matériaux),
- densité urbaine,
- végétation (arbres, plantes, climat),
- type de route (marquages, panneaux, trottoirs),
- style des bâtiments,
- tout élément lisible (panneaux, noms, numéros),
- ambiance générale,
- pente du terrain,
- hauteur des bâtiments,
- style des fenêtres,
- indices régionaux,
et propose la localisation la plus probable en France.

Réponds STRICTEMENT en JSON :
{
  "city": string|null, // commune ou arrondissement le plus probable
  "area": string|null, // quartier / zone / rue la plus probable
  "latitude": number|null, // estimation de latitude
  "longitude": number|null, // estimation de longitude
  "confidence": number // entre 0 et 1
}
Ne fais AUCUN texte en dehors du JSON.`

    if (hasContext) {
      const additionalInfo: string[] = []
      if (context.city) additionalInfo.push(`- Ville : ${context.city}`)
      if (context.postalCode) additionalInfo.push(`- Code postal : ${context.postalCode}`)
      if (context.categories && context.categories.length > 0) {
        additionalInfo.push(`- Types d'endroit : ${context.categories.join(", ")}`)
      }
      if (context.notes) additionalInfo.push(`- Notes utilisateur : ${context.notes}`)

      const additionalInfoText = additionalInfo.length > 0
        ? `\n\nInformations supplémentaires (facultatives) pour affiner la recherche :\n${additionalInfo.join("\n")}`
        : ""

      prompt = `Tu es un modèle spécialisé en géolocalisation d'images en France.

🚨 CONTRAINTE ABSOLUE ET OBLIGATOIRE - DÉPARTEMENT VERROUILLÉ 🚨

Le bien se trouve OBLIGATOIREMENT et EXCLUSIVEMENT dans :
- Code département : ${context.departementCode}
- Nom département : ${context.departementName}${additionalInfoText}

⚠️ RÈGLES STRICTES À RESPECTER (AUCUNE EXCEPTION) :
1. Le lieu DOIT être dans CE département UNIQUEMENT. Aucune exception, jamais.
2. Même si l'image ressemble fortement à un endroit d'un autre pays (Barcelone, Londres, New York, etc.), d'une autre région ou d'un autre département, tu DOIS OBLIGATOIREMENT proposer le lieu le plus similaire VISUELLEMENT DANS ce département uniquement.
3. Ne propose JAMAIS un lieu situé hors de ces limites géographiques. Si tu proposes des coordonnées, elles DOIVENT être géographiquement dans ce département.
4. Si l'image est manifestement hors département, donne l'endroit du département qui ressemble le plus visuellement.
5. Si tu ne peux pas déterminer un lieu dans ce département, retourne confidence: 0.3 ou moins.
6. Tu n'as PAS LE DROIT de sortir du département sélectionné. C'est une contrainte HARD, non négociable.

${context.city ? `- Si la ville "${context.city}" est fournie, favorise les correspondances visuelles liées à cette commune DANS ce département.` : ""}
${context.postalCode ? `- Si le code postal "${context.postalCode}" est fourni, oriente ta localisation dans la zone correspondante DANS ce département.` : ""}
${context.categories && context.categories.length > 0 ? `- Utilise les catégories (${context.categories.join(", ")}) pour affiner ton analyse DANS ce département.` : ""}
${context.notes ? `- Prends en compte ces notes : "${context.notes}"` : ""}

Analyse l'image en détail :
- architecture locale (immeubles, maisons, toits, matériaux),
- densité urbaine,
- végétation (arbres, plantes, climat),
- type de route (marquages, panneaux, trottoirs),
- style des bâtiments,
- tout élément lisible (panneaux, noms, numéros),
- ambiance générale,
- pente du terrain,
- hauteur des bâtiments,
- style des fenêtres,
- indices régionaux,
et propose la localisation la plus probable AU SEIN de ce département UNIQUEMENT.

Réponds STRICTEMENT en JSON :
{
  "city": string|null, // commune ou arrondissement le plus probable DANS ce département
  "area": string|null, // quartier / zone / rue la plus probable DANS ce département
  "latitude": number|null, // estimation de latitude dans ce département (coordonnées valides pour ${context.departementCode})
  "longitude": number|null, // estimation de longitude dans ce département (coordonnées valides pour ${context.departementCode})
  "confidence": number // entre 0 et 1 (réduire si incertain dans ce département)
}
Ne fais AUCUN texte en dehors du JSON.`
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [guessLocationWithLLM] Erreur OpenAI: ${response.status} - ${errorText}`)
      return null
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      console.warn("⚠️ [guessLocationWithLLM] Réponse OpenAI vide")
      return null
    }

    // Parser le JSON de la réponse
    try {
      // Extraire le JSON de la réponse (peut contenir du markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? jsonMatch[0] : content
      const parsed = JSON.parse(jsonText)

      return {
        city: parsed.city || null,
        area: parsed.area || null,
        latitude: parsed.latitude || null,
        longitude: parsed.longitude || null,
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
      }
    } catch (parseError) {
      console.error("❌ [guessLocationWithLLM] Erreur parsing JSON:", parseError, "Contenu:", content)
      return null
    }
  } catch (error: any) {
    console.error("❌ [guessLocationWithLLM] Erreur:", error)
    return null
  }
}
