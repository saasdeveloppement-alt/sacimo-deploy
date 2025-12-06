/**
 * 🏘️ CADASTRE PARCELLE VIEW
 * 
 * Affiche les parcelles cadastrales sur une carte Google Maps
 */

"use client"

import { useMemo, useEffect, useState } from "react"
import { GoogleMap, Marker, Polygon, useLoadScript } from "@react-google-maps/api"
import { Loader2 } from "lucide-react"

interface CadastreParcelleViewProps {
  latitude: number
  longitude: number
  height?: string
  zoom?: number
  address?: string
  parcelleData?: any
}

export function CadastreParcelleView({
  latitude,
  longitude,
  height = "400px",
  zoom = 18,
  address,
  parcelleData,
}: CadastreParcelleViewProps) {
  const [parcelles, setParcelles] = useState<Array<{ paths: Array<{ lat: number; lng: number }> }>>(
    []
  )

  const apiKey =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
      : ""

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: [],
    id: "google-map-script",
  })

  const center = useMemo(
    () => ({
      lat: latitude,
      lng: longitude,
    }),
    [latitude, longitude]
  )

  // Convertir les données GeoJSON en paths pour Google Maps
  useEffect(() => {
    if (parcelleData && parcelleData.features) {
      const convertedParcelles = parcelleData.features.map((feature: any) => {
        if (feature.geometry.type === "Polygon") {
          // Convertir les coordonnées GeoJSON [lng, lat] en {lat, lng}
          const coordinates = feature.geometry.coordinates[0].map((coord: [number, number]) => ({
            lat: coord[1],
            lng: coord[0],
          }))
          return { paths: coordinates }
        }
        return null
      }).filter(Boolean)

      setParcelles(convertedParcelles)
    }
  }, [parcelleData])

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

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50"
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
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
        options={{
          mapTypeId: "satellite", // Utiliser satellite pour mieux voir les parcelles
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
        }}
      >
        <Marker
          position={center}
          title={address || `Localisation: ${latitude}, ${longitude}`}
        />
        {parcelles.map((parcelle, index) => (
          <Polygon
            key={index}
            paths={parcelle.paths}
            options={{
              fillColor: "#9333ea",
              fillOpacity: 0.3,
              strokeColor: "#9333ea",
              strokeOpacity: 0.8,
              strokeWeight: 2,
            }}
          />
        ))}
      </GoogleMap>
      {address && (
        <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-white/95 px-3 py-2 shadow-md backdrop-blur-sm">
          <p className="text-xs font-medium text-gray-900">{address}</p>
          <p className="text-xs text-gray-600">
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
          {parcelles.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {parcelles.length} parcelle{parcelles.length > 1 ? "s" : ""} affichée{parcelles.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

