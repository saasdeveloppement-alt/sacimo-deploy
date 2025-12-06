/**
 * 🛰️ SATELLITE VIEW
 * 
 * Affiche une image satellite IGN (ou fallback MapTiler) centrée sur la position
 */

"use client"

import { useEffect, useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { getIgnOrthophotoTile } from "@/lib/services/ign"

interface SatelliteViewProps {
  latitude: number
  longitude: number
  height?: string
  address?: string
  onImageLoaded?: (imageUrl: string | null) => void
}

export function SatelliteView({
  latitude,
  longitude,
  height = "400px",
  address,
  onImageLoaded,
}: SatelliteViewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadImage = async () => {
      setIsLoading(true)
      setError(null)

      try {
        console.log(`🛰️ [SatelliteView] Chargement image pour ${latitude}, ${longitude}`)
        
        const imageData = await getIgnOrthophotoTile(latitude, longitude, {
          zoom: 19,
        })

        if (cancelled) return

        if (imageData) {
          setImageUrl(imageData)
          onImageLoaded?.(imageData)
          console.log(`✅ [SatelliteView] Image chargée`)
        } else {
          setError("Impossible de charger l'image satellite")
          onImageLoaded?.(null)
          console.warn(`⚠️ [SatelliteView] Aucune image disponible`)
        }
      } catch (err: any) {
        if (cancelled) return
        console.error(`❌ [SatelliteView] Erreur:`, err)
        setError(err.message || "Erreur lors du chargement")
        onImageLoaded?.(null)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadImage()

    return () => {
      cancelled = true
    }
  }, [latitude, longitude, onImageLoaded])

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50"
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
          <p className="mt-2 text-sm text-gray-600">Chargement image satellite...</p>
        </div>
      </div>
    )
  }

  if (error || !imageUrl) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-orange-200 bg-orange-50"
        style={{ height }}
      >
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-orange-600" />
          <p className="mt-2 text-sm font-medium text-orange-700">
            Image satellite non disponible
          </p>
          <p className="mt-1 text-xs text-orange-600">{error || "Aucune image trouvée"}</p>
          {address && (
            <p className="mt-2 text-xs text-orange-500">{address}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <img
        src={imageUrl}
        alt={`Vue satellite de ${address || `${latitude}, ${longitude}`}`}
        className="w-full h-auto object-cover"
        style={{ height, objectFit: "cover" }}
        onError={() => {
          console.error("❌ [SatelliteView] Erreur affichage image")
          setError("Erreur lors de l'affichage de l'image")
        }}
      />
      {address && (
        <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-white/95 px-3 py-2 shadow-md backdrop-blur-sm">
          <p className="text-xs font-medium text-gray-900">{address}</p>
          <p className="text-xs text-gray-600">
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  )
}

