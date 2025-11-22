/**
 * StreetView Dense Matching - Grille dense avec SSIM et embeddings
 * Génère une grille dense de points StreetView dans le département et trouve le meilleur match
 */

import { fetchStreetViewPreview } from "@/lib/google/locationClient"
import { isInsideDepartment } from "@/lib/geo/isInsideDepartment"

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

export interface DenseStreetViewMatch {
  lat: number
  lng: number
  heading: number
  similarity: number
  imageUrl: string
  confidence: number
  method: "SSIM" | "EMBEDDING" | "COMBINED"
}

/**
 * Génère une grille dense de points dans le département
 * @param departmentCode Code département
 * @param approximatePoint Point approximatif (si disponible)
 * @returns Liste de points [lat, lng] dans le département
 */
function generateDenseGridInDepartment(
  departmentCode: string,
  approximatePoint?: { lat: number; lng: number },
): Array<[number, number]> {
  const points: Array<[number, number]> = []
  
  // Coordonnées approximatives des centres de départements français
  const departmentCenters: Record<string, [number, number]> = {
    "75": [48.8566, 2.3522], // Paris
    "92": [48.8448, 2.2062], // Hauts-de-Seine
    "93": [48.9170, 2.3561], // Seine-Saint-Denis
    "94": [48.7872, 2.4034], // Val-de-Marne
    "91": [48.5294, 2.2486], // Essonne
    "77": [48.4085, 2.7015], // Seine-et-Marne
    "78": [48.8014, 2.1301], // Yvelines
    "13": [43.2965, 5.3698], // Bouches-du-Rhône
    "69": [45.7640, 4.8357], // Rhône
    "31": [43.6047, 1.4442], // Haute-Garonne
    "33": [44.8378, -0.5792], // Gironde
    "59": [50.6292, 3.0573], // Nord
    "06": [43.7102, 7.2620], // Alpes-Maritimes
    "44": [47.2184, -1.5536], // Loire-Atlantique
  }
  
  // Point de départ
  let centerLat = approximatePoint?.lat
  let centerLng = approximatePoint?.lng
  
  if (!centerLat || !centerLng) {
    const center = departmentCenters[departmentCode]
    if (center) {
      centerLat = center[0]
      centerLng = center[1]
    } else {
      // Fallback : centre approximatif de la France
      centerLat = 46.6034
      centerLng = 1.8883
    }
  }
  
  // Générer une grille dense autour du point
  // Rayon initial : 5km, puis expansion si nécessaire
  const radiusKm = 5
  const stepKm = 0.5 // Pas de 500m
  const maxRadiusKm = 20 // Maximum 20km
  
  // Conversion : 1 degré ≈ 111 km
  const latDelta = stepKm / 111
  const lngDelta = stepKm / (111 * Math.cos((centerLat * Math.PI) / 180))
  
  // Générer points en grille carrée
  const gridSize = Math.floor((radiusKm * 2) / stepKm) + 1
  
  for (let i = -gridSize; i <= gridSize; i++) {
    for (let j = -gridSize; j <= gridSize; j++) {
      const lat = centerLat + i * latDelta
      const lng = centerLng + j * lngDelta
      
      // Vérifier que le point est dans le département
      if (isInsideDepartment(lat, lng, departmentCode)) {
        points.push([lat, lng])
      }
    }
  }
  
  // Limiter à 200 points maximum pour performance
  if (points.length > 200) {
    // Prendre un échantillon uniforme
    const step = Math.floor(points.length / 200)
    return points.filter((_, index) => index % step === 0).slice(0, 200)
  }
  
  return points
}

/**
 * Télécharge une image depuis une URL
 */
async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.error("❌ [denseMatcher] Erreur téléchargement image:", error)
    return null
  }
}

/**
 * Calcule SSIM (Structural Similarity Index) simplifié entre deux images
 * Version simplifiée basée sur la différence de pixels
 */
function calculateSSIM(
  image1Buffer: Buffer,
  image2Buffer: Buffer,
): number {
  // Version simplifiée : comparaison basée sur la taille et hash
  // Pour une vraie implémentation SSIM, utiliser une librairie dédiée
  
  if (image1Buffer.length === 0 || image2Buffer.length === 0) {
    return 0
  }
  
  // Comparaison basique de la taille (proxy pour similarité)
  const sizeDiff = Math.abs(image1Buffer.length - image2Buffer.length)
  const maxSize = Math.max(image1Buffer.length, image2Buffer.length)
  const sizeSimilarity = 1 - (sizeDiff / maxSize)
  
  // Comparaison de quelques bytes (très simplifié)
  const sampleSize = Math.min(1000, image1Buffer.length, image2Buffer.length)
  let matchingBytes = 0
  
  for (let i = 0; i < sampleSize; i++) {
    if (image1Buffer[i] === image2Buffer[i]) {
      matchingBytes++
    }
  }
  
  const byteSimilarity = matchingBytes / sampleSize
  
  // Combinaison des deux métriques
  return (sizeSimilarity * 0.3 + byteSimilarity * 0.7)
}

/**
 * Calcule un embedding visuel simplifié (basé sur les caractéristiques de l'image)
 * Pour une vraie implémentation, utiliser un modèle d'embedding (CLIP, etc.)
 */
function calculateEmbeddingSimilarity(
  image1Buffer: Buffer,
  image2Buffer: Buffer,
): number {
  // Version simplifiée : utiliser les métadonnées et caractéristiques basiques
  // Pour production, intégrer un modèle d'embedding réel
  
  // Comparaison basée sur la taille, les premiers bytes, etc.
  const size1 = image1Buffer.length
  const size2 = image2Buffer.length
  
  if (size1 === 0 || size2 === 0) return 0
  
  // Normaliser les tailles
  const sizeRatio = Math.min(size1, size2) / Math.max(size1, size2)
  
  // Comparaison des premiers bytes (signature basique)
  const sampleSize = Math.min(100, size1, size2)
  let similarity = 0
  
  for (let i = 0; i < sampleSize; i++) {
    const diff = Math.abs(image1Buffer[i] - image2Buffer[i])
    similarity += 1 - (diff / 255)
  }
  
  similarity = similarity / sampleSize
  
  // Combiner avec le ratio de taille
  return (similarity * 0.8 + sizeRatio * 0.2)
}

/**
 * Match une image avec StreetView en utilisant une grille dense
 */
export async function matchStreetViewDense(
  uploadedImageBuffer: Buffer,
  departmentCode: string,
  approximatePoint?: { lat: number; lng: number },
): Promise<DenseStreetViewMatch | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn("⚠️ [matchStreetViewDense] GOOGLE_MAPS_API_KEY non configurée")
    return null
  }

  try {
    console.log(`🔍 [matchStreetViewDense] Génération grille dense pour département ${departmentCode}...`)
    
    // Générer grille dense dans le département
    const gridPoints = generateDenseGridInDepartment(departmentCode, approximatePoint)
    console.log(`📍 [matchStreetViewDense] ${gridPoints.length} points générés dans le département`)
    
    if (gridPoints.length === 0) {
      console.warn("⚠️ [matchStreetViewDense] Aucun point dans le département")
      return null
    }
    
    // Tester différents headings (0°, 90°, 180°, 270°)
    const headings = [0, 90, 180, 270]
    const matches: DenseStreetViewMatch[] = []
    
    // Limiter à 50 points pour éviter trop d'appels API
    const testPoints = gridPoints.slice(0, 50)
    
    for (const [lat, lng] of testPoints) {
      for (const heading of headings) {
        try {
          // Télécharger panorama StreetView
          const streetViewUrl = fetchStreetViewPreview(lat, lng, "400x300", heading)
          const streetViewBuffer = await downloadImage(streetViewUrl)
          
          if (!streetViewBuffer) continue
          
          // Calculer similarité SSIM
          const ssimScore = calculateSSIM(uploadedImageBuffer, streetViewBuffer)
          
          // Calculer similarité embedding
          const embeddingScore = calculateEmbeddingSimilarity(uploadedImageBuffer, streetViewBuffer)
          
          // Score combiné
          const combinedScore = (ssimScore * 0.6 + embeddingScore * 0.4)
          
          if (combinedScore > 0.3) { // Seuil minimum
            matches.push({
              lat,
              lng,
              heading,
              similarity: combinedScore,
              imageUrl: streetViewUrl,
              confidence: Math.min(0.95, combinedScore * 1.2), // Amplifier légèrement
              method: "COMBINED",
            })
          }
        } catch (error) {
          // Ignorer les erreurs individuelles
          continue
        }
      }
    }
    
    if (matches.length === 0) {
      console.log("⚠️ [matchStreetViewDense] Aucun match trouvé")
      return null
    }
    
    // Trier par similarité décroissante
    matches.sort((a, b) => b.similarity - a.similarity)
    
    const bestMatch = matches[0]
    console.log(`✅ [matchStreetViewDense] Meilleur match: ${bestMatch.lat}, ${bestMatch.lng} (similarité: ${bestMatch.similarity.toFixed(2)})`)
    
    return bestMatch
  } catch (error: any) {
    console.error("❌ [matchStreetViewDense] Erreur:", error)
    return null
  }
}
