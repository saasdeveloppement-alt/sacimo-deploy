/**
 * 🛰️ IGN ORTHOPHOTO VIEW
 * 
 * Affiche les orthophotos IGN via WMTS
 */

"use client"

import { useEffect, useRef, useState } from "react"
// @ts-ignore - maplibre-gl n'a pas de types par défaut
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { Loader2 } from "lucide-react"

interface IGNOrthophotoViewProps {
  latitude: number
  longitude: number
  height?: string
  zoom?: number
  address?: string
}

export function IGNOrthophotoView({
  latitude,
  longitude,
  height = "400px",
  zoom = 18,
  address,
}: IGNOrthophotoViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    try {
      // Créer la carte MapLibre avec le style IGN
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            "ign-ortho": {
              type: "raster",
              tiles: [
                "https://wxs.ign.fr/choisirgeoportail/geoportail/wmts?LAYER=ORTHOIMAGERY.ORTHOPHOTOS&EXCEPTIONS=text/xml&FORMAT=image/jpeg&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}",
              ],
              tileSize: 256,
              attribution:
                '© <a href="https://www.ign.fr/">IGN</a> - Orthophotos',
            },
          },
          layers: [
            {
              id: "ign-ortho-layer",
              type: "raster",
              source: "ign-ortho",
              minzoom: 0,
              maxzoom: 20,
            },
          ],
          glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        },
        center: [longitude, latitude],
        zoom,
        attributionControl: true,
      })

      // Ajouter un marqueur
      new maplibregl.Marker({
        color: "#ef4444",
      })
        .setLngLat([longitude, latitude])
        .addTo(map.current)

      map.current.on("load", () => {
        setIsLoading(false)
      })

      map.current.on("error", (e) => {
        console.error("Erreur carte IGN:", e)
        setError("Erreur lors du chargement de la carte IGN")
        setIsLoading(false)
      })
    } catch (err: any) {
      console.error("Erreur initialisation carte IGN:", err)
      setError(err.message || "Erreur lors de l'initialisation")
      setIsLoading(false)
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [latitude, longitude, zoom])

  if (error) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50"
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-sm font-medium text-red-700">Erreur</p>
          <p className="mt-1 text-xs text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <div ref={mapContainer} style={{ width: "100%", height }} />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
            <p className="mt-2 text-sm text-gray-600">Chargement IGN...</p>
          </div>
        </div>
      )}
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

