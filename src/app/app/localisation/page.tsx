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
import { LocalisationAdvanced } from "@/components/localisation/LocalisationAdvanced"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PageContainer, { fadeInUp, staggerChildren } from "@/components/ui/PageContainer"

export default function LocalisationPage() {
  const [stats, setStats] = useState({
    totalLocalized: 0,
    averagePrecision: 0,
    totalAnalyzed: 0,
  })
  const [annonceId, setAnnonceId] = useState<string | null>(null)
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const fetchAnnonceId = async () => {
      try {
        const response = await fetch("/api/annonces?limit=1")
      const data = await response.json()
        if (data.success && data.annonces && data.annonces.length > 0) {
          setAnnonceId(data.annonces[0].id)
        } else {
          setAnnonceId("demo-annonce-id")
        }
      } catch (error) {
        console.error("Erreur lors de la récupération d'une annonce:", error)
        setAnnonceId("demo-annonce-id")
      }
    }
    fetchAnnonceId()

    setStats({
      totalLocalized: 127,
      averagePrecision: 87,
      totalAnalyzed: 245,
    })
  }, [])

  const handleLocationValidated = () => {
    setHistoryRefreshTrigger((prev) => prev + 1)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
    <PageContainer>
      {/* Floating Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
                  </div>
                  
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Hero Section */}
          <motion.div variants={fadeInUp}>
            <GeoAIHero
              totalLocalized={stats.totalLocalized}
              averagePrecision={stats.averagePrecision}
              totalAnalyzed={stats.totalAnalyzed}
            />
          </motion.div>

          {/* Main Content: Tabs pour ancien/nouveau système */}
          <motion.div variants={fadeInUp}>
            <Tabs defaultValue="advanced" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="advanced">🎯 Localisation Avancée (Nouveau)</TabsTrigger>
                <TabsTrigger value="legacy">📸 Par Image (Ancien)</TabsTrigger>
              </TabsList>
              <TabsContent value="advanced">
                <LocalisationAdvanced />
              </TabsContent>
              <TabsContent value="legacy">
                {annonceId ? (
                  <GeoAIDropzone annonceId={annonceId} onLocationValidated={handleLocationValidated} />
                ) : (
                  <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                    <p className="text-gray-500">Chargement...</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Grid: History + Map - Equal columns */}
          <motion.div 
            className="grid grid-cols-1 gap-6 lg:grid-cols-2"
            variants={staggerChildren}
          >
            <motion.div variants={fadeInUp}>
              <GeoAIHistory refreshTrigger={historyRefreshTrigger} />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <GeoAIMap />
            </motion.div>
          </motion.div>

          {/* Stats - En bas */}
          <motion.div variants={fadeInUp}>
            <GeoAIStats />
          </motion.div>

          {/* Footer */}
                    <motion.div
                      variants={fadeInUp}
            className="flex flex-col items-center justify-between gap-4 rounded-xl border border-primary-200/50 bg-gradient-to-br from-primary-50/50 to-blue-50/50 p-6 sm:flex-row"
          >
            <div className="text-center sm:text-left">
              <p className="font-semibold text-gray-900">SACIMO — IA Localisation Engine</p>
              <p className="text-sm text-gray-600">Version BETA — En développement actif</p>
                              </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" asChild>
                <a href="/app/parametres">
                  <Settings className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  Paramètres IA
                                      </a>
                                    </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="/docs/localisation" target="_blank" rel="noopener noreferrer">
                  <BookOpen className="mr-2 h-4 w-4" strokeWidth={1.5} />
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
