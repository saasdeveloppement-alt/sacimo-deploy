"use client"

import { motion } from "framer-motion"
import { MapPin, Target, Image as ImageIcon, Sparkles } from "lucide-react"
import { MetricCard } from "@/components/ui/MetricCard"

interface GeoAIHeroProps {
  totalLocalized?: number
  averagePrecision?: number
  totalAnalyzed?: number
}

export function GeoAIHero({
  totalLocalized = 0,
  averagePrecision = 0,
  totalAnalyzed = 0,
}: GeoAIHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-8 md:p-12">
      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)] opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)] opacity-50" />

      {/* Content */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-white/90">IA Localisation Engine</span>
          </div>

          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Localisation intelligente
          </h1>
          <p className="text-lg text-white/90 md:text-xl">
            Analyse, géolocalisation et détection automatique par IA.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-white" />
              <span className="text-sm font-medium text-white/80">Biens localisés</span>
            </div>
            <p className="text-3xl font-bold text-white">{totalLocalized}</p>
          </div>

          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2">
              <Target className="h-5 w-5 text-white" />
              <span className="text-sm font-medium text-white/80">Précision moyenne</span>
            </div>
            <p className="text-3xl font-bold text-white">{averagePrecision}%</p>
          </div>

          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-white" />
              <span className="text-sm font-medium text-white/80">Images analysées</span>
            </div>
            <p className="text-3xl font-bold text-white">{totalAnalyzed}</p>
          </div>
        </motion.div>
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />
    </div>
  )
}

