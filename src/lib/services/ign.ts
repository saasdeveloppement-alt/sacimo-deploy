/**
 * 🛰️ SERVICE IGN
 * 
 * Récupération d'images satellites IGN (orthophotos) via WMTS
 */

interface TileCoordinates {
  x: number
  y: number
  z: number
}

interface ImageCropOptions {
  width?: number
  height?: number
  zoom?: number
}

/**
 * Convertit des coordonnées lat/lng en coordonnées de tuile WMTS
 */
function latLngToTile(lat: number, lng: number, zoom: number): TileCoordinates {
  const n = Math.pow(2, zoom)
  const x = Math.floor(((lng + 180) / 360) * n)
  const latRad = (lat * Math.PI) / 180
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  )
  return { x, y, z: zoom }
}

/**
 * Récupère une tuile IGN orthophoto
 */
async function fetchIgnTile(x: number, y: number, z: number): Promise<Blob | null> {
  try {
    const url = `https://wxs.ign.fr/choisirgeoportail/geoportail/wmts?LAYER=ORTHOIMAGERY.ORTHOPHOTOS&EXCEPTIONS=text/xml&FORMAT=image/jpeg&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX=${z}&TILEROW=${y}&TILECOL=${x}`
    
    console.log(`🛰️ [IGN] Récupération tuile: z=${z}, x=${x}, y=${y}`)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.geoportail.gouv.fr/',
      },
    })

    if (!response.ok) {
      console.warn(`⚠️ [IGN] Erreur HTTP ${response.status} pour tuile ${z}/${x}/${y}`)
      return null
    }

    const blob = await response.blob()
    console.log(`✅ [IGN] Tuile récupérée: ${blob.size} bytes`)
    return blob
  } catch (error) {
    console.error(`❌ [IGN] Erreur récupération tuile ${z}/${x}/${y}:`, error)
    return null
  }
}

/**
 * Récupère une tuile MapTiler Satellite (fallback)
 */
async function fetchMapTilerTile(
  x: number,
  y: number,
  z: number
): Promise<Blob | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || ""
    
    if (!apiKey) {
      console.warn("⚠️ [MapTiler] API key non configurée")
      return null
    }

    const url = `https://api.maptiler.com/tiles/satellite/${z}/${x}/${y}.jpg?key=${apiKey}`
    
    console.log(`🛰️ [MapTiler] Récupération tuile: z=${z}, x=${x}, y=${y}`)
    
    const response = await fetch(url)

    if (!response.ok) {
      console.warn(`⚠️ [MapTiler] Erreur HTTP ${response.status} pour tuile ${z}/${x}/${y}`)
      return null
    }

    const blob = await response.blob()
    console.log(`✅ [MapTiler] Tuile récupérée: ${blob.size} bytes`)
    return blob
  } catch (error) {
    console.error(`❌ [MapTiler] Erreur récupération tuile ${z}/${x}/${y}:`, error)
    return null
  }
}

// Fonction createCompositeImage retirée car non utilisée pour l'instant
// Peut être réintroduite si besoin de composer plusieurs tuiles

/**
 * Récupère une image satellite IGN centrée sur lat/lng
 * 
 * @param lat Latitude
 * @param lng Longitude
 * @param options Options de crop
 * @returns URL base64 de l'image ou null
 */
export async function getIgnOrthophotoTile(
  lat: number,
  lng: number,
  options: ImageCropOptions = {}
): Promise<string | null> {
  // Vérifier que nous sommes côté client
  if (typeof window === "undefined" || typeof FileReader === "undefined") {
    console.warn("⚠️ [IGN] Fonction disponible uniquement côté client")
    return null
  }

  const { zoom = 19 } = options

  try {
    console.log(`🛰️ [IGN] Récupération orthophoto pour ${lat}, ${lng} (zoom ${zoom})`)

    // Convertir en coordonnées de tuile
    const tile = latLngToTile(lat, lng, zoom)

    // Récupérer la tuile IGN
    const ignBlob = await fetchIgnTile(tile.x, tile.y, tile.z)

    if (ignBlob) {
      // Convertir en base64
      const reader = new FileReader()
      return new Promise<string | null>((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string
          console.log(`✅ [IGN] Image générée: ${base64.length} caractères`)
          resolve(base64)
        }
        reader.onerror = () => {
          console.error("❌ [IGN] Erreur conversion base64")
          resolve(null)
        }
        reader.readAsDataURL(ignBlob)
      })
    }

    // Fallback MapTiler
    console.log(`⚠️ [IGN] IGN indisponible, fallback MapTiler...`)
    const mapTilerBlob = await fetchMapTilerTile(tile.x, tile.y, tile.z)

    if (mapTilerBlob) {
      const reader = new FileReader()
      return new Promise<string | null>((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string
          console.log(`✅ [MapTiler] Image générée: ${base64.length} caractères`)
          resolve(base64)
        }
        reader.onerror = () => {
          console.error("❌ [MapTiler] Erreur conversion base64")
          resolve(null)
        }
        reader.readAsDataURL(mapTilerBlob)
      })
    }

    console.warn(`⚠️ [IGN] Aucune image disponible (IGN et MapTiler échoués)`)
    return null
  } catch (error) {
    console.error("❌ [IGN] Erreur getIgnOrthophotoTile:", error)
    return null
  }
}

/**
 * Vérifie si Street View est disponible pour une position
 */
export async function checkStreetViewAvailability(
  lat: number,
  lng: number
): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      console.warn("⚠️ [StreetView] Window non disponible")
      resolve(false)
      return
    }

    // Vérifier que Google Maps est chargé
    const google = (window as any).google
    if (!google?.maps?.StreetViewService) {
      console.warn("⚠️ [StreetView] Google Maps API non chargée")
      resolve(false)
      return
    }

    const service = new google.maps.StreetViewService()
    service.getPanorama(
      { location: { lat, lng }, radius: 50 },
      (data: any, status: string) => {
        if (status === google.maps.StreetViewStatus.OK) {
          console.log(`✅ [StreetView] Disponible pour ${lat}, ${lng}`)
          resolve(true)
        } else {
          console.log(`⚠️ [StreetView] Non disponible pour ${lat}, ${lng} (status: ${status})`)
          resolve(false)
        }
      }
    )
  })
}

