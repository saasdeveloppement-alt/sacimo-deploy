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
import { 
  Search, 
  Filter, 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Target,
  TrendingUp,
  Calendar,
  MapPin,
  Building2,
  Zap
} from "lucide-react"
import { motion } from "framer-motion"

interface SearchConfig {
  id: string
  name: string
  location: string
  priceRange: string
  type: string
  isActive: boolean
  lastRun: Date
  results: number
  status: 'active' | 'paused' | 'error'
}

export default function RecherchesPage() {
  const [searches, setSearches] = useState<SearchConfig[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Données de démonstration
  useEffect(() => {
    const mockSearches: SearchConfig[] = [
      {
        id: '1',
        name: 'Paris 2P < 500k€',
        location: 'Paris 1er, 2e, 3e',
        priceRange: '300k€ - 500k€',
        type: 'Appartement',
        isActive: true,
        lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
        results: 12,
        status: 'active'
      },
      {
        id: '2',
        name: 'Lyon Maisons Centre',
        location: 'Lyon 1er, 2e, 3e',
        priceRange: '400k€ - 800k€',
        type: 'Maison',
        isActive: false,
        lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1j ago
        results: 8,
        status: 'paused'
      },
      {
        id: '3',
        name: 'Marseille Studios',
        location: 'Marseille 1er, 2e',
        priceRange: '150k€ - 300k€',
        type: 'Studio',
        isActive: true,
        lastRun: new Date(Date.now() - 30 * 60 * 1000), // 30min ago
        results: 25,
        status: 'active'
      }
    ]
    setSearches(mockSearches)
  }, [])

  const filteredSearches = searches.filter(search => {
    const matchesSearch = search.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         search.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || search.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const activeSearches = searches.filter(s => s.isActive).length
  const totalResults = searches.reduce((sum, s) => sum + s.results, 0)
  const avgResults = searches.length > 0 ? Math.round(totalResults / searches.length) : 0

  const toggleSearch = (id: string) => {
    setSearches(prev => prev.map(search => 
      search.id === id 
        ? { ...search, isActive: !search.isActive, status: !search.isActive ? 'active' : 'paused' }
        : search
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200'
      case 'paused': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'error': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif'
      case 'paused': return 'En pause'
      case 'error': return 'Erreur'
      default: return 'Inconnu'
    }
  }

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="Mes recherches"
        subtitle="Gérez vos recherches automatisées et suivez les nouvelles annonces"
        icon={<Target className="h-8 w-8 text-purple-600" />}
        action={
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle recherche
          </Button>
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
                      placeholder="Rechercher par nom ou localisation..."
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
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="paused">En pause</SelectItem>
                      <SelectItem value="error">Erreur</SelectItem>
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
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerChildren}
          >
            <MetricCard
              title="Recherches Actives"
              value={activeSearches}
              icon={Zap}
              color="from-purple-500 to-purple-600"
              bgColor="bg-purple-50"
              textColor="text-purple-700"
            />
            <MetricCard
              title="Total Résultats"
              value={totalResults}
              icon={TrendingUp}
              color="from-blue-500 to-blue-600"
              bgColor="bg-blue-50"
              textColor="text-blue-700"
            />
            <MetricCard
              title="Moyenne par Recherche"
              value={avgResults}
              icon={Target}
              color="from-cyan-500 to-cyan-600"
              bgColor="bg-cyan-50"
              textColor="text-cyan-700"
            />
          </motion.div>

          {/* Liste des recherches */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Recherches Configurées"
              icon={<Search className="h-5 w-5 text-emerald-600" />}
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
                    Créez votre première recherche pour commencer à surveiller le marché
                  </p>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
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
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-slate-900">{search.name}</h3>
                              <Badge className={getStatusColor(search.status)}>
                                {getStatusText(search.status)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Zone :</span>
                                <span>{search.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Prix :</span>
                                <span>{search.priceRange}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Type :</span>
                                <span>{search.type}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Dernière exécution :</span>
                                <span>{search.lastRun.toLocaleString('fr-FR', { 
                                  day: '2-digit', 
                                  month: '2-digit', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}</span>
                              </div>
                            </div>
                            
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-slate-600">Résultats :</span>
                                  <Badge variant="outline" className="border-slate-200 text-slate-600">
                                    {search.results} annonces
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={search.isActive}
                                    onCheckedChange={() => toggleSearch(search.id)}
                                  />
                                  <span className="text-sm text-slate-600">
                                    {search.isActive ? 'Activé' : 'Désactivé'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="border-slate-200 hover:border-purple-300 hover:text-purple-600">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="border-slate-200 hover:border-red-300 hover:text-red-600">
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
    </PageContainer>
  )
}
