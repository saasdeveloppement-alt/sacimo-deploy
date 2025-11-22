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
      
      if (!response.ok) {
        console.error(`Erreur ${response.status}: ${response.statusText}`)
        setHistoryItems([])
        return
      }
      
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
    <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl shadow-lg hover:shadow-xl transition-all">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-xl">
              <RefreshCw className="w-6 h-6 text-primary-600" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Historique des localisations IA</h3>
              <p className="text-sm text-gray-500">Analyses récentes avec géolocalisation</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchHistory}
            disabled={loading}
            className="h-8 w-8 p-0 hover:bg-primary-50"
          >
            <RefreshCw className={`h-4 w-4 text-primary-600 ${loading ? "animate-spin" : ""}`} strokeWidth={1.5} />
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary-600" strokeWidth={1.5} />
            <p className="mt-2 text-sm text-gray-500">Chargement...</p>
          </div>
        ) : historyItems.length === 0 ? (
          <div className="py-12 text-center">
            <MapPin className="mx-auto h-12 w-12 text-gray-300" strokeWidth={1.5} />
            <p className="mt-4 text-gray-500">Aucune localisation validée</p>
            <p className="mt-1 text-sm text-gray-400">
              Les localisations validées apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {historyItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-200 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                whileHover={{ x: 4 }}
              >
                {/* Scan line effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-400/30 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                    delay: index * 0.5,
                  }}
                />
                <div className="relative z-10 flex items-center space-x-4 flex-1">
                <div className="flex items-start gap-4">
                  {/* Image thumbnail */}
                  {item.imageUrl ? (
                    <div className="relative w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt="Thumbnail"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="relative w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center overflow-hidden">
                      <MapPin className="h-8 w-8 text-white relative z-10" strokeWidth={1.5} />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.address}</h4>
                    <p className="text-sm text-gray-600 mt-1">{formatDate(item.timestamp)}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border-0">
                        {Math.round(item.confidence * 100)}% précision
                      </Badge>
                      <Badge variant="outline" className="text-xs border-primary-200">
                        {getSourceLabel(item.source)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right relative z-10">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white rounded-lg border border-primary-200">
                    <motion.div
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{
                        opacity: [1, 0.5, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <span className="text-sm font-medium text-gray-700">Validé</span>
                  </div>
                  {item.annonceId && (
                    <a
                      href={`/app/annonces/${item.annonceId}`}
                      className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 mt-2 justify-end"
                    >
                      <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                      Voir annonce
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
