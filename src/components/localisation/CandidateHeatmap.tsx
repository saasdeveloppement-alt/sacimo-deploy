/**
 * 🗺️ HEATMAP DE CANDIDATS
 * 
 * Affiche une carte avec heatmap des hypothèses de localisation
 */

"use client"

import { useMemo } from "react"
import { SimpleMap } from "@/components/localisation/SimpleMap"
import type { Candidate } from "./CandidateCarousel"

interface CandidateHeatmapProps {
  candidates: Candidate[]
  onCandidateClick?: (candidate: Candidate) => void
}

export function CandidateHeatmap({
  candidates,
  onCandidateClick,
}: CandidateHeatmapProps) {
  // Calculer le centre de la carte (moyenne des candidats)
  const center = useMemo(() => {
    if (candidates.length === 0) {
      return { lat: 48.8566, lng: 2.3522 } // Paris par défaut
    }

    const avgLat =
      candidates.reduce((sum, c) => sum + c.latitude, 0) / candidates.length
    const avgLng =
      candidates.reduce((sum, c) => sum + c.longitude, 0) / candidates.length

    return { lat: avgLat, lng: avgLng }
  }, [candidates])

  // Trier par confiance pour afficher les meilleurs en premier
  const sortedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => b.confidence - a.confidence)
  }, [candidates])

  if (candidates.length === 0) {
    return (
      <div className="h-96 rounded-lg border bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Aucun candidat à afficher</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="h-96 rounded-lg border overflow-hidden relative">
        <SimpleMap
          latitude={center.lat}
          longitude={center.lng}
          address="Zone de recherche"
          height="100%"
          zoom={15}
        />

        {/* Overlay avec les marqueurs de candidats */}
        <div className="absolute inset-0 pointer-events-none">
          {sortedCandidates.map((candidate, index) => {
            // Calculer la position relative sur la carte (approximation)
            // Pour une vraie implémentation, utiliser une librairie de mapping
            const opacity = candidate.confidence / 100
            const size = Math.max(8, Math.min(20, candidate.confidence / 5))

            return (
              <div
                key={candidate.id}
                className="absolute pointer-events-auto cursor-pointer"
                style={{
                  // Position approximative (nécessiterait une vraie projection)
                  left: `${50 + (candidate.longitude - center.lng) * 10000}%`,
                  top: `${50 - (candidate.latitude - center.lat) * 10000}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={() => onCandidateClick?.(candidate)}
                title={`${candidate.address} (${candidate.confidence}%)`}
              >
                <div
                  className={`rounded-full border-2 border-white shadow-lg ${
                    candidate.confidence >= 80
                      ? "bg-green-500"
                      : candidate.confidence >= 60
                        ? "bg-yellow-500"
                        : "bg-orange-500"
                  }`}
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    opacity,
                  }}
                />
                {index === 0 && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-semibold bg-white px-2 py-1 rounded shadow">
                    {candidate.confidence}%
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span>≥ 80%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500" />
            <span>60-79%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500" />
            <span>&lt; 60%</span>
          </div>
        </div>
        <div>
          {candidates.length} hypothèse{candidates.length > 1 ? "s" : ""}
        </div>
      </div>
    </div>
  )
}


