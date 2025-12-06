/**
 * 🎠 CARROUSEL DE CANDIDATS
 * 
 * Affiche les hypothèses de localisation sous forme de carrousel
 */

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  CheckCircle2,
  X,
  Eye,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SimpleMap } from "@/components/localisation/SimpleMap"
import { HypothesisMapView } from "@/components/localisation/hypotheses/HypothesisMapView"

export interface Candidate {
  id: string
  address: string
  latitude: number
  longitude: number
  confidence: number
  confidenceBreakdown?: Record<string, number>
  satelliteImageUrl?: string
  streetViewUrl?: string
  annonceImageUrl?: string
  postalCode?: string
  parcelId?: string
  reasons?: string[]
  scoreImage?: number
  scorePiscine?: number
  scoreToiture?: number
  scoreTerrain?: number
  scoreHints?: number
  scoreDVF?: number
}

interface CandidateCarouselProps {
  candidates: Candidate[]
  onSelect?: (candidate: Candidate) => void
  onValidate?: (candidate: Candidate) => void
}

export function CandidateCarousel({
  candidates,
  onSelect,
  onValidate,
}: CandidateCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  const currentCandidate = candidates[currentIndex]

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % candidates.length)
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + candidates.length) % candidates.length)
  }

  const handleSelect = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    onSelect?.(candidate)
  }

  if (candidates.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Aucun candidat trouvé</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Indicateur de position */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Hypothèse {currentIndex + 1} sur {candidates.length}
        </div>
        <div className="flex gap-1">
          {candidates.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === currentIndex ? "bg-primary-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Carte principale */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {/* Image satellite */}
              {currentCandidate.satelliteImageUrl && (
                <div className="relative h-64 w-full bg-gray-100">
                  <img
                    src={currentCandidate.satelliteImageUrl}
                    alt="Vue satellite"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <Badge
                      className={
                        currentCandidate.confidence >= 80
                          ? "bg-green-100 text-green-800"
                          : currentCandidate.confidence >= 60
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-orange-100 text-orange-800"
                      }
                    >
                      {currentCandidate.confidence}% de confiance
                    </Badge>
                  </div>
                </div>
              )}

              {/* Informations */}
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-primary-600" />
                    <h3 className="text-lg font-semibold">{currentCandidate.address}</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {currentCandidate.latitude.toFixed(6)}, {currentCandidate.longitude.toFixed(6)}
                  </p>
                </div>

                {/* Barre de progression */}
                <div className="space-y-2">
                  <Progress value={currentCandidate.confidence} className="h-3" />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Score global</span>
                    <span>{currentCandidate.confidence}%</span>
                  </div>
                </div>

                {/* Breakdown détaillé */}
                {(currentCandidate.scoreImage ||
                  currentCandidate.scorePiscine ||
                  currentCandidate.scoreToiture ||
                  currentCandidate.scoreTerrain ||
                  currentCandidate.scoreHints ||
                  currentCandidate.scoreDVF) && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {currentCandidate.scoreImage !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Image</span>
                        <span className="font-medium">{currentCandidate.scoreImage}%</span>
                      </div>
                    )}
                    {currentCandidate.scorePiscine !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Piscine</span>
                        <span className="font-medium">{currentCandidate.scorePiscine}%</span>
                      </div>
                    )}
                    {currentCandidate.scoreToiture !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Toiture</span>
                        <span className="font-medium">{currentCandidate.scoreToiture}%</span>
                      </div>
                    )}
                    {currentCandidate.scoreTerrain !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Terrain</span>
                        <span className="font-medium">{currentCandidate.scoreTerrain}%</span>
                      </div>
                    )}
                    {currentCandidate.scoreHints !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hints</span>
                        <span className="font-medium">{currentCandidate.scoreHints}%</span>
                      </div>
                    )}
                    {currentCandidate.scoreDVF !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">DVF</span>
                        <span className="font-medium">{currentCandidate.scoreDVF}%</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Raisons */}
                {currentCandidate.reasons && currentCandidate.reasons.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Raisons :</p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {currentCandidate.reasons.slice(0, 3).map((reason, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary-600 mt-1">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Carte multi-vues */}
                <div className="space-y-2">
                  <HypothesisMapView
                    latitude={currentCandidate.latitude}
                    longitude={currentCandidate.longitude}
                    address={currentCandidate.address}
                    postalCode={currentCandidate.postalCode}
                    parcelId={currentCandidate.parcelId}
                    annonceImageUrl={currentCandidate.annonceImageUrl}
                    satelliteImageUrl={currentCandidate.satelliteImageUrl}
                    height="300px"
                    zoom={18}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      if (currentCandidate.streetViewUrl) {
                        window.open(currentCandidate.streetViewUrl, "_blank")
                      }
                    }}
                    disabled={!currentCandidate.streetViewUrl}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Street View
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleSelect(currentCandidate)
                      onValidate?.(currentCandidate)
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Valider
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={candidates.length <= 1}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Précédent
        </Button>

        <div className="text-sm text-gray-600">
          {currentIndex + 1} / {candidates.length}
        </div>

        <Button variant="outline" onClick={handleNext} disabled={candidates.length <= 1}>
          Suivant
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}


