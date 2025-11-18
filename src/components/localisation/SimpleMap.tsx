"use client"

import { useState, useEffect } from "react"
import { Loader2, MapPin, ExternalLink } from "lucide-react"

interface SimpleMapProps {
  latitude: number
  longitude: number
  address?: string
  height?: string
  zoom?: number
}

export function SimpleMap({
  latitude,
  longitude,
  address,
  height = "400px",
  zoom = 17,
}: SimpleMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50"
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-600" />
          <p className="mt-2 text-sm text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    )
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  
  if (!apiKey) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50"
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-sm font-medium text-red-700">Clé API manquante</p>
          <p className="mt-1 text-xs text-red-600">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY n'est pas configurée
          </p>
        </div>
      </div>
    )
  }

  // URL pour l'iframe Google Maps Embed
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${latitude},${longitude}&zoom=${zoom}`

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <iframe
        width="100%"
        height={height}
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={mapUrl}
        title="Carte interactive"
      />
      {address && (
        <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-white/95 px-3 py-2 shadow-md backdrop-blur-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900">{address}</p>
              <p className="text-xs text-gray-600">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            </div>
            <a
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded bg-purple-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-purple-700"
            >
              <ExternalLink className="h-3 w-3" />
              Ouvrir
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

