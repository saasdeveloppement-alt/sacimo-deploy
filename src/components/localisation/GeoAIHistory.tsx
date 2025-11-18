"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MapPin, Clock, ExternalLink, CheckCircle2, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface LocalizationHistoryItem {
  id: string
  address: string
  latitude: number
  longitude: number
  confidence: number
  source: string
  timestamp: Date | string
  imageUrl?: string | null
  annonceId?: string
  annonceTitle?: string
}

interface GeoAIHistoryProps {
  refreshTrigger?: number
}

export function GeoAIHistory({ refreshTrigger = 0 }: GeoAIHistoryProps) {
  const [historyItems, setHistoryItems] = useState<LocalizationHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/annonces/localisation/history")
      const data = await response.json()

      if (data.success && data.history) {
        setHistoryItems(data.history)
      } else {
        setHistoryItems([])
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error)
      setHistoryItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger])

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "EXIF":
        return "GPS EXIF"
      case "VISION_LANDMARK":
        return "Repère visuel"
      case "VISION_GEOCODING":
        return "Vision + OCR"
      case "VISION_CONTEXT_FALLBACK":
        return "Contexte"
      default:
        return "Manuel"
    }
  }

  return (
    <Card className="border-purple-200/50 bg-gradient-to-br from-white to-purple-50/30">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Historique des localisations IA</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchHistory}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-purple-600" />
            <p className="mt-2 text-sm text-gray-500">Chargement...</p>
          </div>
        ) : historyItems.length === 0 ? (
          <div className="py-12 text-center">
            <MapPin className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">Aucune localisation validée</p>
            <p className="mt-1 text-sm text-gray-400">
              Les localisations validées apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {historyItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-purple-300 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  {/* Image thumbnail */}
                  {item.imageUrl ? (
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={item.imageUrl}
                        alt="Thumbnail"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-blue-100">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{item.address}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(item.timestamp)}</span>
                        </div>
                      </div>
                      <Badge
                        className={
                          item.confidence > 0.8
                            ? "bg-green-100 text-green-700"
                            : item.confidence > 0.6
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-orange-100 text-orange-700"
                        }
                      >
                        {Math.round(item.confidence * 100)}%
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getSourceLabel(item.source)}
                      </Badge>
                      {item.annonceId && (
                        <a
                          href={`/app/annonces/${item.annonceId}`}
                          className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Voir annonce
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
