"use client"

import { useState, useEffect } from "react"
import PageContainer, { fadeInUp } from "@/components/ui/PageContainer"
import SectionHeader from "@/components/ui/SectionHeader"
import ModernCard from "@/components/ui/ModernCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bug, 
  RefreshCw, 
  MapPin, 
  Home, 
  TrendingUp, 
  Maximize2, 
  Bed,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { motion } from "framer-motion"
import { showSuccess, showError, showLoading, dismissToast } from "@/lib/toast"

interface Stats {
  total: number
  villes: Array<{ ville: string; count: number }>
  types: Array<{ type: string; count: number }>
  prix: {
    min: number
    max: number
    avg: number
  }
  surface: {
    min: number
    max: number
    avg: number
  }
  pieces: {
    min: number
    max: number
    avg: number
  }
}

interface Annonce {
  title: string
  city: string
  postalCode?: string
  price: string
  surface?: string
  rooms?: number
  url: string
  publishedAt: string
}

export default function DebugMeloPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadAllAnnonces = async () => {
    setIsLoading(true)
    setError(null)
    const loadingToastId = showLoading("🔍 Récupération de TOUTES les annonces Melo.io...")
    
    try {
      const response = await fetch('/api/annonces/all')
      const data = await response.json()
      
      dismissToast(loadingToastId)
      
      if (data.status === 'success') {
        setStats(data.stats)
        setAnnonces(data.annonces || [])
        showSuccess(`✅ ${data.total} annonces récupérées depuis Melo.io`)
      } else {
        setError(data.message || 'Erreur inconnue')
        showError(`❌ ${data.message || 'Erreur lors de la récupération'}`)
      }
    } catch (err: any) {
      dismissToast(loadingToastId)
      const errorMsg = err.message || 'Erreur réseau'
      setError(errorMsg)
      showError(`❌ ${errorMsg}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAllAnnonces()
  }, [])

  return (
    <PageContainer>
      <SectionHeader
        title="🐛 Debug Melo.io"
        subtitle="Récupération de TOUTES les annonces disponibles (sans filtre)"
        icon={<Bug className="h-8 w-8 text-orange-600" />}
        action={
          <Button 
            onClick={loadAllAnnonces} 
            disabled={isLoading}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </>
            )}
          </Button>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {error && (
            <motion.div variants={fadeInUp}>
              <ModernCard>
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-900">Erreur</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </ModernCard>
            </motion.div>
          )}

          {stats && (
            <>
              {/* Statistiques globales */}
              <motion.div variants={fadeInUp}>
                <ModernCard
                  title="📊 Statistiques Globales"
                  icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">Total annonces</p>
                      <p className="text-3xl font-bold text-purple-900">{stats.total}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Prix moyen</p>
                      <p className="text-3xl font-bold text-blue-900">
                        {stats.prix.avg.toLocaleString('fr-FR')}€
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Surface moyenne</p>
                      <p className="text-3xl font-bold text-green-900">
                        {stats.surface.avg}m²
                      </p>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>

              {/* Villes disponibles */}
              <motion.div variants={fadeInUp}>
                <ModernCard
                  title="🏙️ Villes Disponibles"
                  icon={<MapPin className="h-5 w-5 text-blue-600" />}
                >
                  <div className="space-y-2">
                    {stats.villes.length > 0 ? (
                      stats.villes.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="font-medium text-slate-900">{item.ville}</span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            {item.count} annonce{item.count > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-center py-4">Aucune ville trouvée</p>
                    )}
                  </div>
                </ModernCard>
              </motion.div>

              {/* Types disponibles */}
              <motion.div variants={fadeInUp}>
                <ModernCard
                  title="🏠 Types de Biens Disponibles"
                  icon={<Home className="h-5 w-5 text-green-600" />}
                >
                  <div className="space-y-2">
                    {stats.types.length > 0 ? (
                      stats.types.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="font-medium text-slate-900">{item.type}</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {item.count} annonce{item.count > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-center py-4">Aucun type trouvé</p>
                    )}
                  </div>
                </ModernCard>
              </motion.div>

              {/* Prix */}
              <motion.div variants={fadeInUp}>
                <ModernCard
                  title="💰 Prix"
                  icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">Minimum</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {stats.prix.min.toLocaleString('fr-FR')}€
                      </p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">Maximum</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {stats.prix.max.toLocaleString('fr-FR')}€
                      </p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">Moyen</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {stats.prix.avg.toLocaleString('fr-FR')}€
                      </p>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>

              {/* Surface */}
              <motion.div variants={fadeInUp}>
                <ModernCard
                  title="📐 Surface"
                  icon={<Maximize2 className="h-5 w-5 text-blue-600" />}
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Minimum</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.surface.min}m²</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Maximum</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.surface.max}m²</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Moyenne</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.surface.avg}m²</p>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>

              {/* Pièces */}
              <motion.div variants={fadeInUp}>
                <ModernCard
                  title="🛏️ Nombre de Pièces"
                  icon={<Bed className="h-5 w-5 text-green-600" />}
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Minimum</p>
                      <p className="text-2xl font-bold text-green-900">{stats.pieces.min}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Maximum</p>
                      <p className="text-2xl font-bold text-green-900">{stats.pieces.max}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Moyenne</p>
                      <p className="text-2xl font-bold text-green-900">{stats.pieces.avg}</p>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>

              {/* Liste des annonces */}
              <motion.div variants={fadeInUp}>
                <ModernCard
                  title={`📋 Toutes les Annonces (${annonces.length})`}
                  icon={<Home className="h-5 w-5 text-emerald-600" />}
                >
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {annonces.length > 0 ? (
                      annonces.map((annonce, index) => (
                        <div key={index} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 mb-2">{annonce.title}</h4>
                              <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                                {annonce.city && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {annonce.city} {annonce.postalCode && `(${annonce.postalCode})`}
                                  </span>
                                )}
                                {annonce.price && (
                                  <span className="font-medium text-purple-600">{annonce.price}</span>
                                )}
                                {annonce.surface && (
                                  <span className="flex items-center gap-1">
                                    <Maximize2 className="h-3 w-3" />
                                    {annonce.surface}
                                  </span>
                                )}
                                {annonce.rooms && (
                                  <span className="flex items-center gap-1">
                                    <Bed className="h-3 w-3" />
                                    {annonce.rooms} pièce{annonce.rooms > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                            <a 
                              href={annonce.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Voir →
                            </a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-center py-8">Aucune annonce trouvée</p>
                    )}
                  </div>
                </ModernCard>
              </motion.div>
            </>
          )}
        </div>
      </main>
    </PageContainer>
  )
}

