/**
 * 📸 IMAGE COMPARISON
 * 
 * Compare l'image de l'annonce avec le crop satellite de la parcelle
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Maximize2, ZoomIn, ZoomOut } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { getIgnOrthophotoTile } from "@/lib/services/ign"

interface ImageComparisonProps {
  annonceImageUrl?: string
  satelliteImageUrl?: string
  latitude?: number
  longitude?: number
  address?: string
}

export function ImageComparison({
  annonceImageUrl,
  satelliteImageUrl,
  latitude,
  longitude,
  address,
}: ImageComparisonProps) {
  const [zoom, setZoom] = useState(1)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [ignImageUrl, setIgnImageUrl] = useState<string | null>(null)
  const [isLoadingIgn, setIsLoadingIgn] = useState(false)

  // Charger l'image IGN si lat/lng fournis et pas d'image satellite fournie
  useEffect(() => {
    if (latitude && longitude && !satelliteImageUrl && !ignImageUrl) {
      setIsLoadingIgn(true)
      getIgnOrthophotoTile(latitude, longitude, { zoom: 19 })
        .then((imageData) => {
          if (imageData) {
            setIgnImageUrl(imageData)
            console.log("✅ [ImageComparison] Image IGN chargée")
          }
        })
        .catch((error) => {
          console.error("❌ [ImageComparison] Erreur chargement IGN:", error)
        })
        .finally(() => {
          setIsLoadingIgn(false)
        })
    }
  }, [latitude, longitude, satelliteImageUrl, ignImageUrl])

  // Utiliser l'image IGN si disponible, sinon l'image satellite fournie
  const displaySatelliteUrl = satelliteImageUrl || ignImageUrl

  if (!annonceImageUrl && !displaySatelliteUrl) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <p className="text-sm">Aucune image disponible pour la comparaison</p>
        </CardContent>
      </Card>
    )
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5))
  const handleResetZoom = () => setZoom(1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Comparaison visuelle</CardTitle>
        {address && <p className="text-sm text-gray-600">{address}</p>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Image annonce */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Image annonce</h3>
              {annonceImageUrl && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <img
                      src={annonceImageUrl}
                      alt="Image annonce (plein écran)"
                      className="w-full h-auto rounded-lg"
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
            {annonceImageUrl ? (
              <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <img
                  src={annonceImageUrl}
                  alt="Image de l'annonce"
                  className="w-full h-auto cursor-pointer transition-transform"
                  style={{ transform: `scale(${zoom})` }}
                  onClick={() => setSelectedImage(annonceImageUrl)}
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    e.currentTarget.nextElementSibling?.classList.remove("hidden")
                  }}
                />
                <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100">
                  <p className="text-sm text-gray-500">Image non disponible</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 rounded-lg border border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-500">Aucune image</p>
              </div>
            )}
          </div>

          {/* Image satellite */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">
                Vue satellite {ignImageUrl && !satelliteImageUrl && "(IGN)"}
              </h3>
              {displaySatelliteUrl && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <img
                      src={displaySatelliteUrl}
                      alt="Vue satellite (plein écran)"
                      className="w-full h-auto rounded-lg"
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
            {isLoadingIgn ? (
              <div className="flex items-center justify-center h-48 rounded-lg border border-gray-200 bg-gray-50">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Chargement image IGN...</p>
                </div>
              </div>
            ) : displaySatelliteUrl ? (
              <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <img
                  src={displaySatelliteUrl}
                  alt="Vue satellite de la parcelle"
                  className="w-full h-auto cursor-pointer transition-transform"
                  style={{ transform: `scale(${zoom})` }}
                  onClick={() => setSelectedImage(displaySatelliteUrl)}
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    e.currentTarget.nextElementSibling?.classList.remove("hidden")
                  }}
                />
                <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100">
                  <p className="text-sm text-gray-500">Image non disponible</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 rounded-lg border border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-500">Aucune image</p>
              </div>
            )}
          </div>
        </div>

        {/* Contrôles zoom */}
        {(annonceImageUrl || displaySatelliteUrl) && (
          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleResetZoom}>
              Réinitialiser
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

