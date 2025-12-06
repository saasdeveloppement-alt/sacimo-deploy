/**
 * 🏙️ STREET VIEW REAL
 * 
 * Composant Street View fonctionnel avec gestion des erreurs
 */

"use client"

import { useEffect, useRef, useState } from "react"
import { useLoadScript, StreetViewPanorama } from "@react-google-maps/api"
import { Loader2, AlertCircle } from "lucide-react"
import { checkStreetViewAvailability } from "@/lib/services/ign"

interface StreetViewRealProps {
  latitude: number
  longitude: number
  height?: string
  address?: string
}

export function StreetViewReal({
  latitude,
  longitude,
  height = "400px",
  address,
}: StreetViewRealProps) {
  const [mounted, setMounted] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  const apiKey =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
      : ""

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: [],
    id: "google-map-script",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Vérifier la disponibilité de Street View
  useEffect(() => {
    if (!mounted || !isLoaded || !apiKey) return

    const checkAvailability = async () => {
      setIsChecking(true)
      const available = await checkStreetViewAvailability(latitude, longitude)
      setIsAvailable(available)
      setIsChecking(false)
    }

    checkAvailability()
  }, [mounted, isLoaded, apiKey, latitude, longitude])

  if (!mounted) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50"
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
          <p className="mt-2 text-sm text-gray-600">Initialisation...</p>
        </div>
      </div>
    )
  }

  if (!apiKey || loadError) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50"
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-sm font-medium text-red-700">Erreur de chargement</p>
          <p className="mt-1 text-xs text-red-600">
            {!apiKey
              ? "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY non configurée"
              : "Erreur lors du chargement de Google Maps"}
          </p>
        </div>
      </div>
    )
  }

  if (!isLoaded || isChecking) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50"
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
          <p className="mt-2 text-sm text-gray-600">
            {isChecking ? "Vérification Street View..." : "Chargement..."}
          </p>
        </div>
      </div>
    )
  }

  // Street View non disponible
  if (isAvailable === false) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-orange-200 bg-orange-50"
        style={{ height }}
      >
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-orange-600" />
          <p className="mt-2 text-sm font-medium text-orange-700">Street View non disponible</p>
          <p className="mt-1 text-xs text-orange-600">
            Aucune vue Street View disponible pour cette position
          </p>
          {address && (
            <p className="mt-2 text-xs text-orange-500">{address}</p>
          )}
        </div>
      </div>
    )
  }

  // Street View disponible
  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <StreetViewPanorama
        position={{ lat: latitude, lng: longitude }}
        visible={true}
        options={{
          position: { lat: latitude, lng: longitude },
          pov: { heading: 0, pitch: 0 },
          zoom: 1,
          addressControl: false,
          linksControl: true,
          panControl: true,
          enableCloseButton: false,
          showRoadLabels: true,
        }}
      />
      {address && (
        <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-white/95 px-3 py-2 shadow-md backdrop-blur-sm">
          <p className="text-xs font-medium text-gray-900">{address}</p>
        </div>
      )}
    </div>
  )
}

