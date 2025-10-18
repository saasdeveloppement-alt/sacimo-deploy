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
  const [searches, setSearches] = useState<SearchConfig[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

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
    setSearches(mockSearches)
  }, [])

  const filteredSearches = searches.filter(search => {
    const matchesSearch = search.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         search.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && search.isActive) ||
      (statusFilter === "inactive" && !search.isActive)
    return matchesSearch && matchesStatus
  })

  const activeSearches = searches.filter(s => s.isActive).length
  const totalResults = searches.reduce((sum, s) => sum + s.results, 0)
  const avgResults = searches.length > 0 ? Math.round(totalResults / searches.length) : 0
  const totalSearches = searches.length

  const toggleSearch = (id: string) => {
    setSearches(prev => prev.map(search => 
      search.id === id ? { ...search, isActive: !search.isActive } : search
    ))
  }

  const deleteSearch = (id: string) => {
    setSearches(prev => prev.filter(search => search.id !== id))
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
      case 'realtime': return 'bg-green-100 text-green-700 border-green-200'
      case 'daily': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'weekly': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="Mes recherches"
        subtitle="Gérez vos recherches automatisées et surveillez le marché"
        icon={<Search className="h-8 w-8 text-purple-600" />}
        action={
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
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
              icon={<Filter className="h-5 w-5 text-purple-600" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Recherche</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Rechercher par nom ou description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Statut</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200">
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="active">Actives</SelectItem>
                      <SelectItem value="inactive">Inactives</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Actions</label>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                      }}
                      className="border-slate-200 hover:border-purple-300 hover:text-purple-600"
                    >
                      Réinitialiser
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-slate-200 hover:border-purple-300 hover:text-purple-600"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Exporter
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                  {filteredSearches.length} recherche{filteredSearches.length > 1 ? 's' : ''} trouvée{filteredSearches.length > 1 ? 's' : ''}
                </Badge>
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
              color="from-purple-500 to-purple-600"
              bgColor="bg-purple-50"
              textColor="text-purple-700"
            />
            <MetricCard
              title="Total Résultats"
              value={totalResults}
              icon={Target}
              color="from-blue-500 to-blue-600"
              bgColor="bg-blue-50"
              textColor="text-blue-700"
            />
            <MetricCard
              title="Moyenne par Recherche"
              value={avgResults}
              icon={TrendingUp}
              color="from-cyan-500 to-cyan-600"
              bgColor="bg-cyan-50"
              textColor="text-cyan-700"
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
              icon={<Search className="h-5 w-5 text-purple-600" />}
            >
              {filteredSearches.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                    <Search className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    Aucune recherche trouvée
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {searches.length === 0 ? "Créez votre première recherche pour commencer" : "Aucune recherche ne correspond aux filtres"}
                  </p>
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
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
                                className={search.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-700 border-slate-200"}
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
                                <span className="font-semibold text-purple-600">{search.results}</span>
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
                                  onClick={() => toggleSearch(search.id)}
                                  className="border-slate-200 hover:border-purple-300 hover:text-purple-600"
                                >
                                  {search.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                  {search.isActive ? 'Pause' : 'Activer'}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-slate-200 hover:border-blue-300 hover:text-blue-600"
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