"use client"

import { motion } from "framer-motion"
import { Sparkles, MapPin, Target, Camera } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface GeoAIHeroProps {
  totalLocalized: number
  averagePrecision: number
  totalAnalyzed: number
}

export function GeoAIHero({
  totalLocalized,
  averagePrecision,
  totalAnalyzed,
}: GeoAIHeroProps) {
  const stats = [
    {
      label: "Biens localisés",
      value: totalLocalized,
      icon: MapPin,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      label: "Précision moyenne",
      value: `${averagePrecision}%`,
      icon: Target,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      label: "Images analysées",
      value: totalAnalyzed,
      icon: Camera,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-700",
    },
  ]

  return (
    <Card className="relative overflow-hidden border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-cyan-50/30 shadow-xl">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          backgroundImage:
            "linear-gradient(45deg, #8b5cf6, #3b82f6, #06b6d4, #8b5cf6)",
          backgroundSize: "400% 400%",
        }}
      />

      <CardContent className="relative p-8 md:p-12">
        <div className="mx-auto max-w-4xl">
          {/* Title Section */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4 flex items-center justify-center gap-3"
            >
              <div className="rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-3">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                Localisation IA
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-600 md:text-xl"
            >
              Localisez automatiquement vos biens immobiliers à partir d'images
              grâce à l'intelligence artificielle
            </motion.p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`rounded-xl ${stat.bgColor} p-6 text-center transition-all hover:shadow-lg`}
                >
                  <div
                    className={`mb-3 inline-flex rounded-lg bg-gradient-to-r ${stat.color} p-2`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="mb-1 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className={`text-sm font-medium ${stat.textColor}`}>
                    {stat.label}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

