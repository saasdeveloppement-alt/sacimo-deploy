/**
 * 🗺️ UNIFIED MAP VIEW
 * 
 * Composant unifié qui affiche différents types de cartes selon la vue sélectionnée
 */

"use client"

import { useMemo, useEffect, useRef, useState } from "react"
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api"
import { Loader2 } from "lucide-react"
import type { MapViewType } from "./MapViewSwitcher"
import { IGNOrthophotoView } from "./IGNOrthophotoView"
import { CadastreParcelleView } from "./CadastreParcelleView"
import { StreetViewReal } from "./StreetViewReal"
import { SatelliteView } from "./SatelliteView"

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"]

interface UnifiedMapViewProps {
  latitude: number
  longitude: number
  address?: string
  viewType: MapViewType
  height?: string
  zoom?: number
  parcelId?: string
  postalCode?: string
}

export function UnifiedMapView({
  latitude,
  longitude,
  address,
  viewType,
  height = "400px",
  zoom = 18,
  parcelId,
  postalCode,
}: UnifiedMapViewProps) {
  const [mounted, setMounted] = useState(false)
  const [parcelleData, setParcelleData] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const apiKey =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
      : ""

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
    [latitude, longitude]
  )

  // Charger les données de parcelle si nécessaire
  useEffect(() => {
    if (viewType === "parcelle" && postalCode && mounted) {
      fetchParcelleData(latitude, longitude, postalCode)
    }
  }, [viewType, latitude, longitude, postalCode, mounted])

  const fetchParcelleData = async (lat: number, lng: number, codePostal: string) => {
    try {
      // Récupérer le code INSEE depuis le code postal
      const communeResponse = await fetch(
        `https://geo.api.gouv.fr/communes?codePostal=${codePostal}&fields=code`
      )
      const communes = await communeResponse.json()

      if (communes.length > 0) {
        const codeInsee = communes[0].code

        // Récupérer les parcelles
        const parcelleResponse = await fetch(
          `https://apicarto.ign.fr/api/cadastre/parcelle?geom=true&code_insee=${codeInsee}&format=json`
        )

        if (parcelleResponse.ok) {
          const data = await parcelleResponse.json()
          setParcelleData(data)
        }
      }
    } catch (error) {
      console.warn("⚠️ [UnifiedMapView] Erreur récupération parcelle:", error)
    }
  }

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

  // Vue IGN Orthophotos (utilise MapLibre)
  if (viewType === "ign") {
    return (
      <IGNOrthophotoView
        latitude={latitude}
        longitude={longitude}
        height={height}
        zoom={zoom}
        address={address}
      />
    )
  }

  // Vue Parcelle Cadastre
  if (viewType === "parcelle") {
    return (
      <CadastreParcelleView
        latitude={latitude}
        longitude={longitude}
        height={height}
        zoom={zoom}
        address={address}
        parcelleData={parcelleData}
      />
    )
  }

  // Vues Google Maps (nécessitent l'API key)
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

  // Vue Street View (composant réel)
  if (viewType === "streetview") {
    return (
      <StreetViewReal
        latitude={latitude}
        longitude={longitude}
        height={height}
        address={address}
      />
    )
  }

  // Vue Satellite (IGN crop)
  if (viewType === "satellite") {
    return (
      <SatelliteView
        latitude={latitude}
        longitude={longitude}
        height={height}
        address={address}
      />
    )
  }

  // Vue Plan
  const mapTypeId = "roadmap"

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
          mapTypeId,
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

