"use client"

import { useState, useRef } from "react"
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
import { useGeoAI } from "@/hooks/useGeoAI"
import type { LocationFromImageResult } from "@/types/location"

interface GeoAIDropzoneProps {
  annonceId?: string
  onLocationValidated?: () => void
}

export function GeoAIDropzone({ annonceId = "demo-annonce-id", onLocationValidated }: GeoAIDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
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
    await uploadImage(file)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      await uploadImage(file)
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
    }
  }

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
              className="text-center"
            >
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
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Localisation détectée</h3>
                    <p className="text-sm text-gray-600">
                      Source : {result.source === "EXIF" ? "GPS EXIF" : "Vision + Géocodage"}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={reset}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Address */}
              <div className="rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 p-6">
                <div className="mb-4 flex items-center gap-2">
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

              {/* Confidence Score */}
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                <span className="text-sm font-medium text-gray-700">Score de confiance</span>
                <Badge
                  className={
                    result.autoLocation.confidence > 0.8
                      ? "bg-green-100 text-green-700"
                      : result.autoLocation.confidence > 0.6
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-orange-100 text-orange-700"
                  }
                >
                  {Math.round(result.autoLocation.confidence * 100)}%
                </Badge>
              </div>

              {/* Street View Preview */}
              {result.autoLocation.streetViewUrl && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Aperçu Street View</p>
                  <div className="relative overflow-hidden rounded-lg border border-gray-200">
                    <img
                      src={result.autoLocation.streetViewUrl}
                      alt="Street View"
                      className="h-64 w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                    <a
                      href={`https://www.google.com/maps?q=${result.autoLocation.latitude},${result.autoLocation.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 right-2 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-md hover:bg-gray-50"
                    >
                      <Map className="mr-1 inline h-3 w-3" />
                      Voir dans Google Maps
                    </a>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleValidate}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Valider cette localisation
                </Button>
                <Button variant="outline" className="flex-1" onClick={reset}>
                  Réessayer
                </Button>
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

              <Button onClick={reset} variant="outline">
                Réessayer
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

