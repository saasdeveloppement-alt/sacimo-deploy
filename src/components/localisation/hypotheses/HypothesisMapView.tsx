/**
 * 🎯 HYPOTHESIS MAP VIEW
 * 
 * Composant principal qui combine MapViewSwitcher + UnifiedMapView + ImageComparison
 */

"use client"

import { useState } from "react"
import { MapViewSwitcher, type MapViewType } from "./MapViewSwitcher"
import { UnifiedMapView } from "./UnifiedMapView"
import { ImageComparison } from "./ImageComparison"

interface HypothesisMapViewProps {
  latitude: number
  longitude: number
  address?: string
  postalCode?: string
  parcelId?: string
  annonceImageUrl?: string
  satelliteImageUrl?: string
  height?: string
  zoom?: number
}

export function HypothesisMapView({
  latitude,
  longitude,
  address,
  postalCode,
  parcelId,
  annonceImageUrl,
  satelliteImageUrl,
  height = "400px",
  zoom = 18,
}: HypothesisMapViewProps) {
  const [activeView, setActiveView] = useState<MapViewType>("plan")

  return (
    <div className="space-y-4">
      {/* Switcher */}
      <MapViewSwitcher activeView={activeView} onViewChange={setActiveView} />

      {/* Carte unifiée */}
      <UnifiedMapView
        latitude={latitude}
        longitude={longitude}
        address={address}
        viewType={activeView}
        height={height}
        zoom={zoom}
        parcelId={parcelId}
        postalCode={postalCode}
      />

      {/* Comparaison d'images */}
      {(annonceImageUrl || satelliteImageUrl || (latitude && longitude)) && (
        <ImageComparison
          annonceImageUrl={annonceImageUrl}
          satelliteImageUrl={satelliteImageUrl}
          latitude={latitude}
          longitude={longitude}
          address={address}
        />
      )}
    </div>
  )
}

