"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  Scan,
  Loader2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Map,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useGeoAI } from "@/hooks/useGeoAI"
import type { LocationFromImageResult } from "@/types/location"
import { SimpleMap } from "@/components/localisation/SimpleMap"

interface GeoAIDropzoneProps {
  annonceId?: string
  onLocationValidated?: () => void
}

// Liste des départements français
const DEPARTMENTS = [
  { code: "01", name: "Ain" },
  { code: "02", name: "Aisne" },
  { code: "03", name: "Allier" },
  { code: "04", name: "Alpes-de-Haute-Provence" },
  { code: "05", name: "Hautes-Alpes" },
  { code: "06", name: "Alpes-Maritimes" },
  { code: "07", name: "Ardèche" },
  { code: "08", name: "Ardennes" },
  { code: "09", name: "Ariège" },
  { code: "10", name: "Aube" },
  { code: "11", name: "Aude" },
  { code: "12", name: "Aveyron" },
  { code: "13", name: "Bouches-du-Rhône" },
  { code: "14", name: "Calvados" },
  { code: "15", name: "Cantal" },
  { code: "16", name: "Charente" },
  { code: "17", name: "Charente-Maritime" },
  { code: "18", name: "Cher" },
  { code: "19", name: "Corrèze" },
  { code: "21", name: "Côte-d'Or" },
  { code: "22", name: "Côtes-d'Armor" },
  { code: "23", name: "Creuse" },
  { code: "24", name: "Dordogne" },
  { code: "25", name: "Doubs" },
  { code: "26", name: "Drôme" },
  { code: "27", name: "Eure" },
  { code: "28", name: "Eure-et-Loir" },
  { code: "29", name: "Finistère" },
  { code: "2A", name: "Corse-du-Sud" },
  { code: "2B", name: "Haute-Corse" },
  { code: "30", name: "Gard" },
  { code: "31", name: "Haute-Garonne" },
  { code: "32", name: "Gers" },
  { code: "33", name: "Gironde" },
  { code: "34", name: "Hérault" },
  { code: "35", name: "Ille-et-Vilaine" },
  { code: "36", name: "Indre" },
  { code: "37", name: "Indre-et-Loire" },
  { code: "38", name: "Isère" },
  { code: "39", name: "Jura" },
  { code: "40", name: "Landes" },
  { code: "41", name: "Loir-et-Cher" },
  { code: "42", name: "Loire" },
  { code: "43", name: "Haute-Loire" },
  { code: "44", name: "Loire-Atlantique" },
  { code: "45", name: "Loiret" },
  { code: "46", name: "Lot" },
  { code: "47", name: "Lot-et-Garonne" },
  { code: "48", name: "Lozère" },
  { code: "49", name: "Maine-et-Loire" },
  { code: "50", name: "Manche" },
  { code: "51", name: "Marne" },
  { code: "52", name: "Haute-Marne" },
  { code: "53", name: "Mayenne" },
  { code: "54", name: "Meurthe-et-Moselle" },
  { code: "55", name: "Meuse" },
  { code: "56", name: "Morbihan" },
  { code: "57", name: "Moselle" },
  { code: "58", name: "Nièvre" },
  { code: "59", name: "Nord" },
  { code: "60", name: "Oise" },
  { code: "61", name: "Orne" },
  { code: "62", name: "Pas-de-Calais" },
  { code: "63", name: "Puy-de-Dôme" },
  { code: "64", name: "Pyrénées-Atlantiques" },
  { code: "65", name: "Hautes-Pyrénées" },
  { code: "66", name: "Pyrénées-Orientales" },
  { code: "67", name: "Bas-Rhin" },
  { code: "68", name: "Haut-Rhin" },
  { code: "69", name: "Rhône" },
  { code: "70", name: "Haute-Saône" },
  { code: "71", name: "Saône-et-Loire" },
  { code: "72", name: "Sarthe" },
  { code: "73", name: "Savoie" },
  { code: "74", name: "Haute-Savoie" },
  { code: "75", name: "Paris" },
  { code: "76", name: "Seine-Maritime" },
  { code: "77", name: "Seine-et-Marne" },
  { code: "78", name: "Yvelines" },
  { code: "79", name: "Deux-Sèvres" },
  { code: "80", name: "Somme" },
  { code: "81", name: "Tarn" },
  { code: "82", name: "Tarn-et-Garonne" },
  { code: "83", name: "Var" },
  { code: "84", name: "Vaucluse" },
  { code: "85", name: "Vendée" },
  { code: "86", name: "Vienne" },
  { code: "87", name: "Haute-Vienne" },
  { code: "88", name: "Vosges" },
  { code: "89", name: "Yonne" },
  { code: "90", name: "Territoire de Belfort" },
  { code: "91", name: "Essonne" },
  { code: "92", name: "Hauts-de-Seine" },
  { code: "93", name: "Seine-Saint-Denis" },
  { code: "94", name: "Val-de-Marne" },
  { code: "95", name: "Val-d'Oise" },
  { code: "971", name: "Guadeloupe" },
  { code: "972", name: "Martinique" },
  { code: "973", name: "Guyane" },
  { code: "974", name: "La Réunion" },
  { code: "976", name: "Mayotte" },
]

export function GeoAIDropzone({ annonceId = "demo-annonce-id", onLocationValidated }: GeoAIDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const { state, result, error, progress, uploadImage, validateLocation, reset, isLoading } =
    useGeoAI({
      annonceId,
      onSuccess: () => {
        // Success handled by hook
      },
    })

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    if (!selectedDepartment) {
      alert("Veuillez sélectionner un département pour aider à la localisation")
      return
    }
    
    // Créer une URL pour l'image uploadée
    const imageUrl = URL.createObjectURL(file)
    setUploadedImageUrl(imageUrl)
    
    await uploadImage(file, selectedDepartment)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      if (!selectedDepartment) {
        alert("Veuillez sélectionner un département pour aider à la localisation")
        return
      }
      
      // Créer une URL pour l'image uploadée
      const imageUrl = URL.createObjectURL(file)
      setUploadedImageUrl(imageUrl)
      
      await uploadImage(file, selectedDepartment)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleValidate = async () => {
    if (!result?.autoLocation) return

    const success = await validateLocation(
      result.autoLocation.address,
      result.autoLocation.latitude,
      result.autoLocation.longitude,
    )

    if (success) {
      onLocationValidated?.()
      // Ne pas réinitialiser l'image pour qu'elle reste visible
    }
  }

  const handleReset = () => {
    reset()
    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl)
      setUploadedImageUrl(null)
    }
  }

  // Cleanup des URLs d'objets lors du démontage
  useEffect(() => {
    return () => {
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl)
      }
    }
  }, [uploadedImageUrl])

  return (
    <Card className="border-2 border-purple-200/50 bg-gradient-to-br from-white to-purple-50/30 shadow-xl">
      <CardContent className="p-8 md:p-12">
        <AnimatePresence mode="wait">
          {/* Idle State - Dropzone */}
          {state === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* Sélection du département */}
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                  Département ou secteur <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger
                    id="department"
                    className="w-full bg-white border-purple-200 focus:border-purple-400"
                  >
                    <SelectValue placeholder="Sélectionnez un département" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept.code} value={dept.code}>
                        {dept.code} - {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Cette information aide l'IA à orienter la recherche de localisation
                </p>
              </div>

              <div
                className="relative cursor-pointer rounded-2xl border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-12 transition-all hover:border-purple-400 hover:bg-purple-50/70"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mb-6 flex justify-center"
                >
                  <div className="rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-6">
                    <Scan className="h-12 w-12 text-white" />
                  </div>
                </motion.div>

                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                  Déposez une photo de façade, rue ou entrée
                </h3>
                <p className="mb-6 text-gray-600">
                  Notre IA analysera l'image et tentera de localiser automatiquement le bien.
                </p>

                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={!selectedDepartment}
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Sélectionner une image
                </Button>

                <p className="mt-4 text-xs text-gray-500">
                  Formats supportés : JPG, PNG, WebP (max 10MB)
                </p>
              </div>
            </motion.div>
          )}

          {/* Scanning State */}
          {state === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-6 flex justify-center"
              >
                <div className="rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-6">
                  <Loader2 className="h-12 w-12 text-white" />
                </div>
              </motion.div>

              <h3 className="mb-4 text-2xl font-bold text-gray-900">Analyse en cours...</h3>
              <p className="mb-6 text-gray-600">
                Notre IA scanne l'image et recherche des indices de localisation.
              </p>

              <div className="mx-auto max-w-md">
                <Progress value={progress} className="mb-2 h-2" />
                <p className="text-sm text-gray-500">{progress}%</p>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {state === "success" && result?.autoLocation && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full p-3 ${
                      result.source === "VISION_CONTEXT_FALLBACK"
                        ? "bg-orange-100"
                        : result.source === "EXIF"
                          ? "bg-green-100"
                          : "bg-blue-100"
                    }`}
                  >
                    <CheckCircle2
                      className={`h-6 w-6 ${
                        result.source === "VISION_CONTEXT_FALLBACK"
                          ? "text-orange-600"
                          : result.source === "EXIF"
                            ? "text-green-600"
                            : "text-blue-600"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Localisation détectée</h3>
                    <p className="text-sm text-gray-600">
                      Source :{" "}
                      {result.source === "EXIF"
                        ? "GPS EXIF"
                        : result.source === "VISION_CONTEXT_FALLBACK"
                          ? "Contexte de l'annonce"
                          : "Vision + Géocodage"}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Image d'origine + Comparaison */}
              {uploadedImageUrl && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-4 md:grid-cols-2">
                    {/* Image analysée */}
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-700">Image analysée</p>
                      <div className="relative overflow-hidden rounded-lg border border-gray-200">
                        <img
                          src={uploadedImageUrl}
                          alt="Image analysée"
                          className="h-64 w-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Street View */}
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-700">Vue Street View</p>
                      {result.autoLocation.streetViewUrl ? (
                        <div className="relative overflow-hidden rounded-lg border border-gray-200">
                          <img
                            src={result.autoLocation.streetViewUrl}
                            alt="Street View"
                            className="h-64 w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                          <p className="text-sm text-gray-500">Aperçu non disponible</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Légende */}
                  <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3">
                    <p className="text-xs text-gray-600">
                      <strong>Vue globale :</strong> Comparez l'image analysée avec la vue Street View pour valider la précision de la localisation détectée.
                    </p>
                  </div>
                </div>
              )}

              {/* Address - Pleine largeur, juste après les images */}
              <div className="w-full rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Adresse détectée</span>
                    </div>
                    <p className="mb-2 text-lg font-semibold text-gray-900">
                      {result.autoLocation.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      {result.autoLocation.latitude.toFixed(6)}, {result.autoLocation.longitude.toFixed(6)}
                    </p>
                  </div>
                  
                  {/* Score de confiance - Design circulaire amélioré */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      {/* Cercle de progression SVG */}
                      <svg className="h-24 w-24 -rotate-90 transform" viewBox="0 0 100 100">
                        {/* Cercle de fond */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-gray-200"
                        />
                        {/* Cercle de progression */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 45}`}
                          strokeDashoffset={`${2 * Math.PI * 45 * (1 - result.autoLocation.confidence)}`}
                          className={
                            result.autoLocation.confidence > 0.8
                              ? "text-green-500"
                              : result.autoLocation.confidence > 0.6
                                ? "text-yellow-500"
                                : "text-orange-500"
                          }
                        />
                      </svg>
                      {/* Contenu au centre */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className={`text-3xl font-bold leading-none ${
                            result.autoLocation.confidence > 0.8
                              ? "text-green-600"
                              : result.autoLocation.confidence > 0.6
                                ? "text-yellow-600"
                                : "text-orange-600"
                          }`}
                        >
                          {Math.round(result.autoLocation.confidence * 100)}
                          <span
                            className={`ml-1 text-lg font-semibold ${
                              result.autoLocation.confidence > 0.8
                                ? "text-green-600"
                                : result.autoLocation.confidence > 0.6
                                  ? "text-yellow-600"
                                  : "text-orange-600"
                            }`}
                          >
                            %
                          </span>
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-gray-600">Score de confiance</p>
                  </div>
                </div>
              </div>

              {/* Warning si fallback */}
              {result.warning && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <p className="text-sm text-orange-800">{result.warning}</p>
                </div>
              )}

              {/* Carte interactive - Format horizontal */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Position GPS</p>
                <SimpleMap
                  latitude={result.autoLocation.latitude}
                  longitude={result.autoLocation.longitude}
                  address={result.autoLocation.address}
                  height="300px"
                  zoom={17}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleValidate}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Valider cette localisation
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleReset}>
                  Réessayer
                </Button>
              </div>

              {/* Texte explicatif - Déplacé sous les boutons */}
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                <p className="text-sm text-gray-700">
                  <strong>Comment ça fonctionne ?</strong> Notre IA a analysé votre image en utilisant{" "}
                  {result.source === "EXIF"
                    ? "les données GPS intégrées à la photo"
                    : result.source === "VISION_CONTEXT_FALLBACK"
                      ? "le contexte de l'annonce (ville, code postal)"
                      : "la reconnaissance optique de caractères (OCR) et la détection de repères visuels"}{" "}
                  pour identifier cette localisation. La précision dépend de la qualité de l'image et des informations visibles.
                </p>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {state === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-red-100 p-6">
                  <AlertCircle className="h-12 w-12 text-red-600" />
                </div>
              </div>

              <h3 className="mb-2 text-2xl font-bold text-gray-900">Erreur d'analyse</h3>
              <p className="mb-6 text-gray-600">{error || "Une erreur est survenue"}</p>

              <Button onClick={handleReset} variant="outline">
                Réessayer
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}