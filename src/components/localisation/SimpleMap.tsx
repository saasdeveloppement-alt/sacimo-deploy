"use client"

import { useEffect, useState } from "react"

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
  height = "300px",
  zoom = 17,
}: SimpleMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const apiKey =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
      : ""

  if (!mounted || !apiKey) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50"
        style={{ height }}
      >
        <p className="text-sm text-gray-500">Chargement de la carte...</p>
      </div>
    )
  }

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
        title="Google Map"
      ></iframe>
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

