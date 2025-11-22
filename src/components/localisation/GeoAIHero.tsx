"use client"

import { motion } from "framer-motion"
import { Sparkles, MapPin, Target, Camera, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
      iconBg: "bg-primary-100",
      iconColor: "text-primary-600",
    },
    {
      label: "Précision moyenne",
      value: `${averagePrecision}%`,
      icon: Target,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Images analysées",
      value: totalAnalyzed,
      icon: Camera,
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
    },
  ]

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-12 border-0 shadow-2xl">
      {/* Neural Network Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Animated Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 border-2 border-white opacity-20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-40 h-40 border-2 border-white opacity-20 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white opacity-10 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <CardContent className="relative z-10 p-0">
        <div className="mx-auto max-w-4xl">
          {/* Title Section */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-3 mb-6 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm"
            >
              <div className="relative">
                <div className="w-3 h-3 bg-green-400 rounded-full" />
                <motion.div
                  className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full"
                  animate={{
                    scale: [1, 2, 1],
                    opacity: [1, 0, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <span className="text-white font-semibold text-sm">IA Active • Analyse en temps réel</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-4 flex items-center justify-center space-x-3"
            >
              <motion.div
                className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(255, 255, 255, 0.4)",
                    "0 0 40px rgba(255, 255, 255, 0.6)",
                    "0 0 20px rgba(255, 255, 255, 0.4)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Zap className="w-12 h-12 text-white" strokeWidth={1.5} />
              </motion.div>
              <h1 className="text-5xl font-bold text-white">Localisation IA</h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-white/90 max-w-3xl mx-auto"
            >
              Localisez automatiquement vos biens immobiliers à partir d'images grâce à l'intelligence artificielle de pointe
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
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1, type: "spring" }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className={`p-3 ${stat.iconBg} rounded-xl`}>
                      <Icon className={`w-8 h-8 ${stat.iconColor}`} strokeWidth={1.5} />
                    </div>
                  </div>
                  <motion.p
                    className="text-4xl font-bold text-gray-900 mb-1"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className={`text-sm font-semibold ${stat.iconColor}`}>
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

