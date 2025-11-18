"use client"

import { motion } from "framer-motion"
import { MapPin, Clock, ExternalLink, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface LocalizationHistoryItem {
  id: string
  address: string
  confidence: number
  source: string
  timestamp: Date
  imageUrl?: string
  annonceId?: string
}

interface GeoAIHistoryProps {
  items?: LocalizationHistoryItem[]
}

export function GeoAIHistory({ items = [] }: GeoAIHistoryProps) {
  // Mock data si pas d'items
  const historyItems: LocalizationHistoryItem[] =
    items.length > 0
      ? items
      : [
          {
            id: "1",
            address: "15 Rue de la Paix, 75001 Paris",
            confidence: 0.92,
            source: "VISION_GEOCODING",
            timestamp: new Date(Date.now() - 3600000),
          },
          {
            id: "2",
            address: "42 Avenue des Champs-Élysées, 75008 Paris",
            confidence: 0.98,
            source: "EXIF",
            timestamp: new Date(Date.now() - 7200000),
          },
        ]

  return (
    <Card className="border-purple-200/50 bg-gradient-to-br from-white to-purple-50/30">
      <CardContent className="p-6">
        <h3 className="mb-6 text-xl font-bold text-gray-900">Historique des localisations IA</h3>

        {historyItems.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">Aucune localisation dans l'historique</p>
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
                          <span>{item.timestamp.toLocaleDateString("fr-FR")}</span>
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
                        {item.source === "EXIF" ? "GPS EXIF" : "Vision + OCR"}
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

