"use client"

import { useState, useEffect } from "react"
import PageContainer, { fadeInUp, staggerChildren } from "@/components/ui/PageContainer"
import SectionHeader from "@/components/ui/SectionHeader"
import ModernCard from "@/components/ui/ModernCard"
import MetricCard from "@/components/ui/MetricCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Play, 
  Pause,
  Target,
  TrendingUp,
  Building2,
  MapPin,
  Home,
  Zap,
  Calendar,
  Settings,
  Eye,
  BarChart3,
  Clock
} from "lucide-react"
import { motion } from "framer-motion"
import AdvancedFilters from "@/components/filters/AdvancedFilters"
import { AdvancedFilters as AdvancedFiltersType, initialFilters } from "@/hooks/useAdvancedFilters"
import { Separator } from "@/components/ui/separator"
import { showSuccess, showError, showInfo, showLoading, dismissToast } from "@/lib/toast"

interface SearchConfig {
  id: string
  name: string
  description: string
  isActive: boolean
  createdAt: Date
  lastRun?: Date
  nextRun?: Date
  results: number
  params: {
    postalCodes: string[]
    priceMin?: number
    priceMax?: number
    types: string[]
    surfaceMin?: number
    surfaceMax?: number
    roomsMin?: number
    roomsMax?: number
    textSearch?: string
  }
  notifications: {
    email: boolean
    push: boolean
    frequency: 'realtime' | 'daily' | 'weekly'
  }
}

export default function RecherchesPage() {
  console.log("🚀🚀🚀 RECHERCHES PAGE LOADED - SCRAPER BUTTON SHOULD BE VISIBLE 🚀🚀🚀")
  
  const [searches, setSearches] = useState<SearchConfig[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersType>(initialFilters)

  // Données de démonstration
  useEffect(() => {
    const mockSearches: SearchConfig[] = [
      {
        id: '1',
        name: 'Paris 2P < 500k€',
        description: 'Appartements 2 pièces à Paris centre, budget max 500k€',
        isActive: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
        nextRun: new Date(Date.now() + 4 * 60 * 60 * 1000),
        results: 23,
        params: {
          postalCodes: ['75001', '75002', '75003'],
          priceMax: 500000,
          types: ['APARTMENT'],
          roomsMin: 2,
          roomsMax: 2,
          textSearch: 'balcon ou terrasse'
        },
        notifications: {
          email: true,
          push: true,
          frequency: 'realtime'
        }
      },
      {
        id: '2',
        name: 'Lyon Maisons 4P+',
        description: 'Maisons 4 pièces et plus à Lyon, surface min 100m²',
        isActive: true,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000),
        nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000),
        results: 15,
        params: {
          postalCodes: ['69001', '69002', '69003', '69004', '69005'],
          priceMin: 300000,
          priceMax: 800000,
          types: ['HOUSE'],
          roomsMin: 4,
          surfaceMin: 100
        },
        notifications: {
          email: true,
          push: false,
          frequency: 'daily'
        }
      },
      {
        id: '3',
        name: 'Marseille Investissement',
        description: 'Biens d\'investissement à Marseille, rendement locatif',
        isActive: false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        nextRun: undefined,
        results: 8,
        params: {
          postalCodes: ['13001', '13002', '13003'],
          priceMin: 150000,
          priceMax: 400000,
          types: ['APARTMENT', 'STUDIO'],
          surfaceMin: 25,
          surfaceMax: 60
        },
        notifications: {
          email: false,
          push: true,
          frequency: 'weekly'
        }
      }
    ]
    console.log("📋 Mock searches loaded:", mockSearches.length, "searches")
    setSearches(mockSearches)
  }, [])

  const filteredSearches = searches.filter(search => {
    const matchesSearch = search.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         search.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && search.isActive) ||
      (statusFilter === "inactive" && !search.isActive)
    
    // Filtres avancés
    const matchesCities = advancedFilters.cities.length === 0 || 
      search.params.postalCodes.some(code => 
        advancedFilters.cities.some(city => 
          code.includes(city.substring(0, 2)) || city.toLowerCase().includes(code)
        )
      )
    
    const matchesPrice = (!advancedFilters.minPrice || search.params.priceMin === undefined || search.params.priceMin >= parseInt(advancedFilters.minPrice)) &&
      (!advancedFilters.maxPrice || search.params.priceMax === undefined || search.params.priceMax <= parseInt(advancedFilters.maxPrice))
    
    const matchesSurface = (!advancedFilters.minSurface || search.params.surfaceMin === undefined || search.params.surfaceMin >= parseInt(advancedFilters.minSurface)) &&
      (!advancedFilters.maxSurface || search.params.surfaceMax === undefined || search.params.surfaceMax <= parseInt(advancedFilters.maxSurface))
    
    const matchesRooms = !advancedFilters.rooms || search.params.roomsMin === undefined || search.params.roomsMin >= parseInt(advancedFilters.rooms)
    
    return matchesSearch && matchesStatus && matchesCities && matchesPrice && matchesSurface && matchesRooms
  })

  const activeSearches = searches.filter(s => s.isActive).length
  const totalResults = searches.reduce((sum, s) => sum + s.results, 0)
  const avgResults = searches.length > 0 ? Math.round(totalResults / searches.length) : 0
  const totalSearches = searches.length

  const toggleSearch = (id: string) => {
    setSearches(prev => prev.map(search => {
      if (search.id === id) {
        const newActive = !search.isActive
        if (newActive) {
          showSuccess(`✅ Recherche "${search.name}" activée`)
        } else {
          showInfo(`⏸️ Recherche "${search.name}" mise en pause`)
        }
        return { ...search, isActive: newActive }
      }
      return search
    }))
  }

  const runScraping = async (search: SearchConfig) => {
    setIsLoading(true)
    const loadingToast = showLoading(`Scraping en cours pour "${search.name}"...`)
    
    try {
      console.log("🔍 Lancement du scraping pour:", search.name)
      
      // Convertir les paramètres de recherche en format scraper
      const mapType = (type: string) => {
        const mapping: Record<string, string> = {
          'apartment': 'appartement',
          'house': 'maison',
          'studio': 'studio',
          'loft': 'loft',
          'penthouse': 'penthouse'
        }
        return mapping[type.toLowerCase()] || 'appartement'
      }
      
      const mapCity = (postalCode: string) => {
        const code = postalCode.substring(0, 2)
        const cityMap: Record<string, string> = {
          '75': 'Paris',
          '69': 'Lyon',
          '13': 'Marseille',
          '31': 'Toulouse',
          '33': 'Bordeaux',
          '44': 'Nantes',
          '06': 'Nice'
        }
        return cityMap[code] || postalCode
      }
      
      const scraperParams = {
        ville: search.params.postalCodes[0] ? mapCity(search.params.postalCodes[0]) : 'Paris',
        minPrix: search.params.priceMin,
        maxPrix: search.params.priceMax,
        minSurface: search.params.surfaceMin,
        maxSurface: search.params.surfaceMax,
        typeBien: mapType(search.params.types[0] || 'apartment'),
        pieces: search.params.roomsMin,
        pages: 1
      }

      const response = await fetch('/api/scraper/leboncoin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scraperParams)
      })

      const data = await response.json()
      
      dismissToast(loadingToast)
      
      if (data.status === 'success') {
        // Mettre à jour le nombre de résultats
        setSearches(prev => prev.map(s => 
          s.id === search.id 
            ? { ...s, results: data.count, lastRun: new Date() }
            : s
        ))
        console.log(`✅ Scraping terminé: ${data.count} annonces trouvées`)
        showSuccess(`✅ Scraping terminé ! ${data.count} annonce${data.count > 1 ? 's' : ''} trouvée${data.count > 1 ? 's' : ''} (${data.saved || 0} nouvelles, ${data.updated || 0} mises à jour)`)
      } else {
        console.error("❌ Erreur scraping:", data.message)
        showError(`❌ Erreur lors du scraping: ${data.message || 'Erreur inconnue'}`)
      }
    } catch (err: any) {
      dismissToast(loadingToast)
      console.error("❌ Erreur scraping:", err)
      showError(`❌ Erreur: ${err.message || 'Erreur lors du scraping'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSearch = (id: string) => {
    const search = searches.find(s => s.id === id)
    setSearches(prev => prev.filter(search => search.id !== id))
    if (search) {
      showInfo(`🗑️ Recherche "${search.name}" supprimée`)
    }
  }

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'realtime': return 'Temps réel'
      case 'daily': return 'Quotidien'
      case 'weekly': return 'Hebdomadaire'
      default: return 'Inconnu'
    }
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'realtime': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'daily': return 'bg-violet-100 text-violet-700 border-violet-200'
      case 'weekly': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="Mes recherches"
        subtitle="Gérez vos recherches automatisées et surveillez le marché"
        icon={<Search className="h-8 w-8 text-violet-600" />}
        action={
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle recherche
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Filtres */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Filtres et Recherche"
              icon={<Filter className="h-5 w-5 text-violet-600" />}
            >
              <div className="space-y-6">
                {/* Recherche texte */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Recherche</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Rechercher par nom ou description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/80 border-slate-200 focus:border-violet-300 focus:ring-violet-200"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Statut</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="bg-white/80 border-slate-200 focus:border-violet-300 focus:ring-violet-200">
                        <SelectValue placeholder="Tous les statuts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="active">Actives</SelectItem>
                        <SelectItem value="inactive">Inactives</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                {/* Filtres avancés */}
                <AdvancedFilters
                  onFilterChange={setAdvancedFilters}
                  initialFilters={advancedFilters}
                  availableCities={['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille']}
                />
                
                <Separator />
                
                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-violet-100 text-violet-700 border-violet-200">
                    {filteredSearches.length} recherche{filteredSearches.length > 1 ? 's' : ''} trouvée{filteredSearches.length > 1 ? 's' : ''}
                  </Badge>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                        setAdvancedFilters(initialFilters)
                      }}
                      className="border-slate-200 hover:border-violet-300 hover:text-violet-600"
                    >
                      Réinitialiser
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-slate-200 hover:border-violet-300 hover:text-violet-600"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Exporter
                    </Button>
                  </div>
                </div>
              </div>
            </ModernCard>
          </motion.div>

          {/* KPIs */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerChildren}
          >
            <MetricCard
              title="Recherches Actives"
              value={activeSearches}
              icon={Search}
              color="from-violet-500 to-violet-600"
              bgColor="bg-violet-50"
              textColor="text-violet-700"
            />
            <MetricCard
              title="Total Résultats"
              value={totalResults}
              icon={Target}
              color="from-indigo-500 to-indigo-600"
              bgColor="bg-indigo-50"
              textColor="text-indigo-700"
            />
            <MetricCard
              title="Moyenne par Recherche"
              value={avgResults}
              icon={TrendingUp}
              color="from-violet-500 to-indigo-600"
              bgColor="bg-violet-50"
              textColor="text-violet-700"
            />
            <MetricCard
              title="Total Recherches"
              value={totalSearches}
              icon={Building2}
              color="from-emerald-500 to-emerald-600"
              bgColor="bg-emerald-50"
              textColor="text-emerald-700"
            />
          </motion.div>

          {/* Liste des recherches */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Recherches Configurées"
              icon={<Search className="h-5 w-5 text-violet-600" />}
            >
              {filteredSearches.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 flex items-center justify-center">
                    <Search className="h-8 w-8 text-violet-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    Aucune recherche trouvée
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {searches.length === 0 ? "Créez votre première recherche pour commencer" : "Aucune recherche ne correspond aux filtres"}
                  </p>
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une recherche
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSearches.map((search, index) => (
                    <motion.div
                      key={search.id}
                      variants={fadeInUp}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-6 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors border border-slate-200/60">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <h3 className="text-lg font-semibold text-slate-900">{search.name}</h3>
                              <Badge 
                                variant={search.isActive ? "default" : "secondary"}
                                className={search.isActive ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-700 border-slate-200"}
                              >
                                {search.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <Badge className={getFrequencyColor(search.notifications.frequency)}>
                                {getFrequencyText(search.notifications.frequency)}
                              </Badge>
                            </div>
                            
                            <p className="text-slate-600 mb-4">{search.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-600 mb-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Zones :</span>
                                <span>{search.params.postalCodes.join(', ')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Home className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Types :</span>
                                <span>{search.params.types.join(', ')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Résultats :</span>
                                <span className="font-semibold text-violet-600">{search.results}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Créée :</span>
                                <span>{search.createdAt.toLocaleDateString('fr-FR')}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                {search.lastRun && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    Dernière exécution : {search.lastRun.toLocaleString('fr-FR', { 
                                      day: '2-digit', 
                                      month: '2-digit', 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                )}
                                {search.nextRun && (
                                  <span className="flex items-center gap-1">
                                    <Zap className="h-4 w-4" />
                                    Prochaine exécution : {search.nextRun.toLocaleString('fr-FR', { 
                                      day: '2-digit', 
                                      month: '2-digit', 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    console.log("⚡ SCRAPER BUTTON CLICKED for:", search.name)
                                    runScraping(search)
                                  }}
                                  disabled={isLoading}
                                  className="border-slate-200 hover:border-emerald-300 hover:text-emerald-600"
                                >
                                  <Zap className="h-4 w-4" />
                                  Scraper
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => toggleSearch(search.id)}
                                  className="border-slate-200 hover:border-violet-300 hover:text-violet-600"
                                >
                                  {search.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                  {search.isActive ? 'Pause' : 'Activer'}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-slate-200 hover:border-yellow-300 hover:text-yellow-600"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => deleteSearch(search.id)}
                                  className="border-slate-200 hover:border-red-300 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ModernCard>
          </motion.div>
        </div>
      </main>

      {/* Dialog de création */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">Nouvelle Recherche</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                <Plus className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Assistant de création
              </h3>
              <p className="text-slate-600 mb-4">
                L'assistant de création de recherche sera bientôt disponible
              </p>
              <Button 
                onClick={() => setShowCreateDialog(false)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}