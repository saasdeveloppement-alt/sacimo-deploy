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
    throw new Error(
      `Google Vision API error: ${response.status} - ${errorText}`,
    )
  }

  const data = await response.json()

  if (data.responses?.[0]?.error) {
    throw new Error(
      `Google Vision API error: ${data.responses[0].error.message}`,
    )
  }

  return data.responses[0] || {}
}

/**
 * Extrait les candidats d'adresse depuis le résultat Vision
 * Utilise à la fois le texte OCR, les landmarks, les labels visuels et le contexte
 */
export function extractAddressCandidatesFromVision(
  visionResult: VisionResult,
  context?: { city?: string; postalCode?: string; country?: string },
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
  context?: { city?: string; postalCode?: string; country?: string },
): Promise<GeocodedCandidate[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY non configurée")
  }

  const geocoded: GeocodedCandidate[] = []

  for (const candidate of candidates) {
    try {
      // Construire la requête de géocodage
      let addressQuery = candidate.rawText
      
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

        // Calculer un score de géocodage basé sur la précision
        let geocodingScore = 0.7 // Base

        // Bonus selon le type de résultat
        const locationType = result.geometry.location_type
        if (locationType === "ROOFTOP") {
          geocodingScore = 0.98 // Très précis
        } else if (locationType === "RANGE_INTERPOLATED") {
          geocodingScore = 0.88
        } else if (locationType === "GEOMETRIC_CENTER") {
          geocodingScore = 0.78
        } else if (locationType === "APPROXIMATE") {
          geocodingScore = 0.68
        }

        // Vérifier si l'adresse géocodée correspond au contexte
        if (context) {
          const geocodedAddress = result.formatted_address.toLowerCase()
          if (context.postalCode && geocodedAddress.includes(context.postalCode)) {
            geocodingScore += 0.05 // Bonus si code postal correspond
          }
          if (context.city && geocodedAddress.includes(context.city.toLowerCase())) {
            geocodingScore += 0.05 // Bonus si ville correspond
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
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<{ address: string; formattedAddress: string } | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY non configurée")
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=fr&region=fr`

    const response = await fetch(url)

    if (!response.ok) {
      console.warn(`Erreur reverse geocoding: ${response.status}`)
      return null
    }

    const data = await response.json()

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const result = data.results[0]
      return {
        address: result.formatted_address,
        formattedAddress: result.formatted_address,
      }
    }

    return null
  } catch (error) {
    console.error("Erreur lors du reverse geocoding:", error)
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
): string {
  if (!GOOGLE_MAPS_API_KEY) {
    return ""
  }

  return `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&heading=0&pitch=0&fov=90`
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
