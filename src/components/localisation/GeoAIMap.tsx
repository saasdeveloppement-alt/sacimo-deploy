"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface MapLocation {
  id: string
  address: string
  latitude: number
  longitude: number
  confidence: number
}

interface GeoAIMapProps {
  locations?: MapLocation[]
}

export function GeoAIMap({ locations = [] }: GeoAIMapProps) {
  // Mock locations si pas de données
  const mapLocations: MapLocation[] =
    locations.length > 0
      ? locations
      : [
          {
            id: "1",
            address: "15 Rue de la Paix, 75001 Paris",
            latitude: 48.8686,
            longitude: 2.3314,
            confidence: 0.92,
          },
          {
            id: "2",
            address: "42 Avenue des Champs-Élysées, 75008 Paris",
            latitude: 48.8698,
            longitude: 2.3086,
            confidence: 0.98,
          },
        ]

  return (
    <Card className="border-purple-200/50 bg-gradient-to-br from-white to-purple-50/30">
      <CardContent className="p-6">
        <h3 className="mb-6 text-xl font-bold text-gray-900">Carte IA interactive</h3>

        <div className="relative h-96 w-full overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-slate-100 to-slate-200">
          {/* Placeholder pour la carte - À remplacer par Mapbox ou Leaflet */}
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <MapPin className="mx-auto mb-4 h-16 w-16 text-purple-600" />
              <p className="text-lg font-medium text-gray-700">Carte interactive</p>
              <p className="text-sm text-gray-500">
                {mapLocations.length} localisation{mapLocations.length > 1 ? "s" : ""} détectée
                {mapLocations.length > 1 ? "s" : ""}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Intégration Mapbox/Leaflet à venir
              </p>
            </div>
          </div>

          {/* Pins overlay (simulation) */}
          {mapLocations.map((location, index) => (
            <div
              key={location.id}
              className="absolute"
              style={{
                left: `${20 + index * 30}%`,
                top: `${30 + index * 20}%`,
              }}
            >
              <div
                className={`relative cursor-pointer transition-transform hover:scale-125 ${
                  location.confidence > 0.8
                    ? "text-green-600"
                    : location.confidence > 0.6
                      ? "text-yellow-600"
                      : "text-orange-600"
                }`}
                title={location.address}
              >
                <MapPin className="h-8 w-8 drop-shadow-lg" fill="currentColor" />
                <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-600" />
            <span>Très fiable (&gt;80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-600" />
            <span>Fiable (60-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-600" />
            <span>Moyen (&lt;60%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

