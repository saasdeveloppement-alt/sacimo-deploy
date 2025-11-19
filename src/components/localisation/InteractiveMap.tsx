"use client"

import { useMemo, useState, useEffect } from "react"
import { GoogleMap, Marker, Circle, useLoadScript } from "@react-google-maps/api"
import { Loader2 } from "lucide-react"

interface InteractiveMapProps {
  latitude: number
  longitude: number
  address?: string
  height?: string
  zoom?: number
  showUncertaintyCircle?: boolean
  uncertaintyRadiusMeters?: number // Rayon du cercle d'incertitude en mètres (300-800m par défaut)
}

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"]

export function InteractiveMap({
  latitude,
  longitude,
  address,
  height = "400px",
  zoom = 17,
  showUncertaintyCircle = false,
  uncertaintyRadiusMeters = 500, // Rayon par défaut de 500m
}: InteractiveMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const apiKey = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "" : ""
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
    id: "google-map-script",
  })

  const center = useMemo(
    () => ({
      lat: latitude,
      lng: longitude,
    }),
    [latitude, longitude],
  )

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      clickableIcons: true,
      scrollwheel: true,
      zoomControl: true,
      streetViewControl: true,
      mapTypeControl: true,
      fullscreenControl: true,
    }),
    [],
  )

  if (!mounted) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50"
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-600" />
          <p className="mt-2 text-sm text-gray-600">Initialisation...</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50"
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-sm font-medium text-red-700">Erreur de chargement de la carte</p>
          <p className="mt-1 text-xs text-red-600">
            Vérifiez que NEXT_PUBLIC_GOOGLE_MAPS_API_KEY est configurée
          </p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
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

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <GoogleMap
        mapContainerStyle={{
          width: "100%",
          height,
        }}
        center={center}
        zoom={zoom}
        options={mapOptions}
      >
        <Marker
          position={center}
          title={address || `Localisation: ${latitude}, ${longitude}`}
        />
        {showUncertaintyCircle && (
          <Circle
            center={center}
            radius={uncertaintyRadiusMeters}
            options={{
              fillColor: "#9333ea",
              fillOpacity: 0.15,
              strokeColor: "#9333ea",
              strokeOpacity: 0.5,
              strokeWeight: 2,
            }}
          />
        )}
      </GoogleMap>
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
