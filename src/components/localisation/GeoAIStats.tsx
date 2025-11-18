"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Clock, MapPin, TrendingUp, Image as ImageIcon, Globe } from "lucide-react"

interface GeoAIStatsProps {
  exifMatchRate?: number
  streetViewMatchRate?: number
  ocrMatchRate?: number
  averageAnalysisTime?: number
  topCities?: Array<{ city: string; count: number }>
  totalImagesAnalyzed?: number
}

export function GeoAIStats({
  exifMatchRate = 15,
  streetViewMatchRate = 25,
  ocrMatchRate = 60,
  averageAnalysisTime = 3.2,
  topCities = [
    { city: "Paris", count: 45 },
    { city: "Lyon", count: 12 },
    { city: "Marseille", count: 8 },
  ],
  totalImagesAnalyzed = 127,
}: GeoAIStatsProps) {
  const stats = [
    {
      icon: Camera,
      label: "Matching EXIF",
      value: `${exifMatchRate}%`,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      icon: Globe,
      label: "Matching StreetView",
      value: `${streetViewMatchRate}%`,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      icon: ImageIcon,
      label: "Matching OCR",
      value: `${ocrMatchRate}%`,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-700",
    },
    {
      icon: Clock,
      label: "Temps moyen",
      value: `${averageAnalysisTime}s`,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
    {
      icon: MapPin,
      label: "Top ville",
      value: topCities[0]?.city || "N/A",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
    },
    {
      icon: TrendingUp,
      label: "Images analysées",
      value: totalImagesAnalyzed.toString(),
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      textColor: "text-pink-700",
    },
  ]

  return (
    <Card className="h-full border-purple-200/50 bg-gradient-to-br from-white to-purple-50/30">
      <CardContent className="p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Statistiques IA</h3>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl ${stat.bgColor} p-3 text-center transition-transform hover:scale-105`}
            >
              <div className={`mb-2 inline-flex rounded-lg bg-gradient-to-r ${stat.color} p-1.5`}>
                <stat.icon className={`h-4 w-4 ${stat.textColor.replace("text-", "text-white")}`} />
              </div>
              <p className="mb-1 text-xl font-bold text-gray-900">{stat.value}</p>
              <p className={`text-xs font-medium ${stat.textColor}`}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Top Cities */}
        {topCities.length > 0 && (
          <div className="mt-4 rounded-xl bg-gray-50 p-3">
            <p className="mb-2 text-xs font-medium text-gray-700">Top villes</p>
            <div className="space-y-2">
              {topCities.slice(0, 3).map((city, index) => (
                <div key={city.city} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                      {index + 1}
                    </div>
                    <span className="text-xs text-gray-700">{city.city}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-900">{city.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

