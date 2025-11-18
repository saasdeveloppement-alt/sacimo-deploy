"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Settings, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GeoAIHero } from "@/components/localisation/GeoAIHero"
import { GeoAIDropzone } from "@/components/localisation/GeoAIDropzone"
import { GeoAIHistory } from "@/components/localisation/GeoAIHistory"
import { GeoAIMap } from "@/components/localisation/GeoAIMap"
import { GeoAIStats } from "@/components/localisation/GeoAIStats"
import PageContainer, { fadeInUp, staggerChildren } from "@/components/ui/PageContainer"

export default function LocalisationPage() {
  const [stats, setStats] = useState({
    totalLocalized: 0,
    averagePrecision: 0,
    totalAnalyzed: 0,
  })

  // Charger les stats depuis l'API (à implémenter)
  useEffect(() => {
    // TODO: Appel API pour récupérer les vraies stats
    // Pour l'instant, valeurs mockées
    setStats({
      totalLocalized: 127,
      averagePrecision: 87,
      totalAnalyzed: 245,
    })
  }, [])

  const handleLocationValidated = () => {
    // Recharger les stats après validation
    // TODO: Refresh stats
  }

  return (
    <PageContainer>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Hero Section */}
          <motion.div variants={fadeInUp}>
            <GeoAIHero
              totalLocalized={stats.totalLocalized}
              averagePrecision={stats.averagePrecision}
              totalAnalyzed={stats.totalAnalyzed}
            />
          </motion.div>

          {/* Main Content Grid: Dropzone + Stats side by side on large screens */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Dropzone - Takes 2 columns on large screens */}
            <motion.div variants={fadeInUp} className="lg:col-span-2">
              <GeoAIDropzone annonceId="demo-annonce-id" onLocationValidated={handleLocationValidated} />
            </motion.div>

            {/* Stats - Takes 1 column on large screens */}
            <motion.div variants={fadeInUp} className="lg:col-span-1">
              <GeoAIStats />
            </motion.div>
          </div>

          {/* Grid: History + Map - Equal columns */}
          <motion.div 
            className="grid grid-cols-1 gap-6 lg:grid-cols-2"
            variants={staggerChildren}
          >
            <motion.div variants={fadeInUp}>
              <GeoAIHistory />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <GeoAIMap />
            </motion.div>
          </motion.div>

          {/* Footer */}
                    <motion.div
                      variants={fadeInUp}
            className="flex flex-col items-center justify-between gap-4 rounded-xl border border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-6 sm:flex-row"
          >
            <div className="text-center sm:text-left">
              <p className="font-semibold text-gray-900">SACIMO — IA Localisation Engine</p>
              <p className="text-sm text-gray-600">Version BETA — En développement actif</p>
                              </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" asChild>
                <a href="/app/parametres">
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres IA
                                      </a>
                                    </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="/docs/localisation" target="_blank" rel="noopener noreferrer">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Documentation
                </a>
                                    </Button>
                                  </div>
          </motion.div>
        </div>
      </main>
    </PageContainer>
  )
}
