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
    <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl shadow-lg hover:shadow-xl transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Statistiques IA</h3>
            <p className="text-sm text-gray-500">Performance et précision du modèle</p>
          </div>
          <UIBadge className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold border-0">
            ✓ Modèle actif
          </UIBadge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-6 bg-gradient-to-br ${stat.bgColor} rounded-2xl overflow-hidden`}
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 ${stat.bgColor.replace("bg-", "bg-").replace("-50", "-200")} rounded-lg`}>
                    <stat.icon className={`w-5 h-5 ${stat.textColor}`} strokeWidth={1.5} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className={`text-sm font-semibold ${stat.textColor}`}>{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progress Bars */}
        <div className="space-y-4">
          {[
            { label: "Précision globale du modèle", value: 87, color: "from-primary-500 via-primary-600 to-primary-500" },
            { label: "Taux de succès (localisations validées)", value: 94, color: "from-green-400 to-emerald-500" },
            { label: "Vitesse de traitement", value: 78, color: "from-blue-400 to-indigo-500", suffix: "2.3s/image" },
          ].map((progress, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">{progress.label}</span>
                <span className={`text-sm font-bold ${index === 0 ? "text-primary-600" : index === 1 ? "text-green-600" : "text-blue-600"}`}>
                  {progress.suffix || `${progress.value}%`}
                </span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${progress.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.value}%` }}
                  transition={{ duration: 1.5, delay: 0.5 + index * 0.1 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
