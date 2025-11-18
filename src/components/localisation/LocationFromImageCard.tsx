"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Upload,
  Check,
  X,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Map,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { LocationFromImageResult, GeocodedCandidate } from "@/types/location"
import { toast } from "sonner"

interface LocationFromImageCardProps {
  annonceId: string
  initialLocation?: {
    autoAddress?: string | null
    autoLatitude?: number | null
    autoLongitude?: number | null
    autoConfidence?: number | null
    autoSource?: string | null
    address?: string | null
    latitude?: number | null
    longitude?: number | null
  }
  onLocationValidated?: () => void
}

export function LocationFromImageCard({
  annonceId,
  initialLocation,
  onLocationValidated,
}: LocationFromImageCardProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<LocationFromImageResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [showCandidates, setShowCandidates] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Utiliser les données initiales si disponibles
  const currentLocation = initialLocation?.autoAddress
    ? {
        address: initialLocation.autoAddress,
        latitude: initialLocation.autoLatitude,
        longitude: initialLocation.autoLongitude,
        confidence: initialLocation.autoConfidence || 0,
        source: initialLocation.autoSource || "VISION_GEOCODING",
      }
    : result?.autoLocation

  const isLocationValidated =
    initialLocation?.address && initialLocation?.latitude && initialLocation?.longitude

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    await handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(
        `/api/annonces/${annonceId}/localisation/from-image`,
        {
          method: "POST",
          body: formData,
        },
      )

      const data: LocationFromImageResult = await response.json()

      if (data.status === "error") {
        setError(data.error || "Erreur lors du traitement")
        toast.error(data.error || "Erreur lors du traitement de l'image")
      } else {
        setResult(data)
        toast.success(
          `Localisation détectée avec ${Math.round((data.autoLocation?.confidence || 0) * 100)}% de confiance`,
        )
      }
    } catch (err: any) {
      const errorMessage = err.message || "Erreur lors de l'upload"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleValidate = async () => {
    if (!currentLocation) return

    setIsValidating(true)

    try {
      const response = await fetch(
        `/api/annonces/${annonceId}/localisation/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: currentLocation.address,
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            precisionMeters:
              currentLocation.source === "EXIF" ? 10 : currentLocation.confidence > 0.8 ? 20 : 50,
          }),
        },
      )

      const data = await response.json()

      if (data.success) {
        toast.success("Localisation validée avec succès")
        onLocationValidated?.()
      } else {
        throw new Error(data.error || "Erreur lors de la validation")
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la validation")
    } finally {
      setIsValidating(false)
    }
  }

  const handleUseCandidate = async (candidate: GeocodedCandidate) => {
    setIsValidating(true)

    try {
      const response = await fetch(
        `/api/annonces/${annonceId}/localisation/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: candidate.address,
            latitude: candidate.latitude,
            longitude: candidate.longitude,
            precisionMeters: candidate.globalScore > 0.8 ? 20 : 50,
          }),
        },
      )

      const data = await response.json()

      if (data.success) {
        toast.success("Localisation alternative validée")
        onLocationValidated?.()
      } else {
        throw new Error(data.error || "Erreur lors de la validation")
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la validation")
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <Card className="border-2 border-purple-100">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-purple-600 rounded-lg">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          Localisation par image (IA)
        </CardTitle>
        <CardDescription>
          Upload une photo et on essaie de retrouver automatiquement l'adresse du bien
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Zone d'upload */}
        {!currentLocation && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-700 mb-2">
                Glissez une photo ici ou cliquez pour sélectionner
              </p>
              <p className="text-xs text-gray-500">
                Formats supportés : JPG, PNG, WebP (max 10MB)
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Photo de la façade, panneau de rue, plaque d'adresse, etc.
              </p>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyse de l'image en cours...</span>
                </div>
                <Progress value={undefined} className="h-2" />
              </div>
            )}
          </div>
        )}

        {/* Erreur */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Résultat de la localisation */}
        {currentLocation && (
          <div className="space-y-4">
            {/* Badge de statut */}
            <div className="flex items-center gap-2">
              {isLocationValidated ? (
                <Badge className="bg-green-100 text-green-700 border-green-300">
                  <Check className="h-3 w-3 mr-1" />
                  Localisation validée
                </Badge>
              ) : (
                <Badge
                  className={
                    currentLocation.source === "EXIF"
                      ? "bg-blue-100 text-blue-700 border-blue-300"
                      : "bg-orange-100 text-orange-700 border-orange-300"
                  }
                >
                  {currentLocation.source === "EXIF"
                    ? "GPS EXIF (très fiable)"
                    : "Proposition automatique"}
                </Badge>
              )}
              {currentLocation.confidence > 0 && (
                <Badge variant="outline">
                  Confiance : {Math.round(currentLocation.confidence * 100)}%
                </Badge>
              )}
            </div>

            {/* Adresse proposée */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-1">Adresse proposée</p>
              <p className="text-base font-semibold text-gray-900">{currentLocation.address}</p>
              {currentLocation.latitude && currentLocation.longitude && (
                <p className="text-xs text-gray-500 mt-1">
                  {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </p>
              )}
            </div>

            {/* Street View Preview */}
            {currentLocation.streetViewUrl && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Aperçu Street View</p>
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={currentLocation.streetViewUrl}
                    alt="Street View"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                  <a
                    href={`https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 bg-white px-3 py-1.5 rounded-lg shadow-md text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                  >
                    <Map className="h-3 w-3" />
                    Voir dans Google Maps
                  </a>
                </div>
              </div>
            )}

            <Separator />

            {/* Actions */}
            {!isLocationValidated && (
              <div className="flex gap-3">
                <Button
                  onClick={handleValidate}
                  disabled={isValidating}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Validation...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Valider cette localisation
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            )}

            {/* Candidats alternatifs */}
            {result?.candidates && result.candidates.length > 1 && (
              <Collapsible open={showCandidates} onOpenChange={setShowCandidates}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="text-sm">
                      Autres propositions ({result.candidates.length - 1})
                    </span>
                    <span className="text-xs text-gray-500">
                      {showCandidates ? "Masquer" : "Afficher"}
                    </span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-2">
                  {result.candidates.slice(1).map((candidate, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{candidate.address}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Score : {Math.round(candidate.globalScore * 100)}%
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUseCandidate(candidate)}
                        disabled={isValidating}
                      >
                        Utiliser
                      </Button>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}

        {/* État initial (aucune tentative) */}
        {!currentLocation && !isUploading && !error && (
          <div className="text-center py-4">
            <Badge variant="outline" className="bg-gray-50">
              Aucune tentative encore
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
