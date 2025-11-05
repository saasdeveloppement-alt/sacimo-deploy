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
import { 
  Search, 
  Filter, 
  Building2, 
  TrendingUp, 
  Users, 
  MapPin, 
  Calendar,
  Eye,
  ExternalLink,
  Target,
  Zap,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { motion } from "framer-motion"
import AdvancedFilters from "@/components/filters/AdvancedFilters"
import { AdvancedFilters as AdvancedFiltersType, initialFilters } from "@/hooks/useAdvancedFilters"
import { Separator } from "@/components/ui/separator"

interface Competitor {
  id: string
  name: string
  location: string
  listingsCount: number
  avgPrice: number
  lastUpdate: Date
  status: 'active' | 'inactive' | 'monitoring'
  website: string
  specialties: string[]
  marketShare: number
}

export default function ConcurrentsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("listings")
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersType>(initialFilters)

  // Données de démonstration
  useEffect(() => {
    const mockCompetitors: Competitor[] = [
      {
        id: '1',
        name: 'Agence Immobilière Paris',
        location: 'Paris 1er, 2e, 3e',
        listingsCount: 45,
        avgPrice: 650000,
        lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'active',
        website: 'https://agence-paris.fr',
        specialties: ['Luxe', 'Centre-ville'],
        marketShare: 12.5
      },
      {
        id: '2',
        name: 'Propriétés & Co',
        location: 'Paris 4e, 5e, 6e',
        listingsCount: 32,
        avgPrice: 580000,
        lastUpdate: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'monitoring',
        website: 'https://proprietes-co.fr',
        specialties: ['Familial', 'Rénovation'],
        marketShare: 8.2
      },
      {
        id: '3',
        name: 'Lyon Immobilier Pro',
        location: 'Lyon 1er, 2e, 3e',
        listingsCount: 28,
        avgPrice: 420000,
        lastUpdate: new Date(Date.now() - 6 * 60 * 60 * 1000),
        status: 'active',
        website: 'https://lyon-immobilier.fr',
        specialties: ['Commercial', 'Bureaux'],
        marketShare: 6.8
      },
      {
        id: '4',
        name: 'Marseille Habitat',
        location: 'Marseille 1er, 2e',
        listingsCount: 18,
        avgPrice: 380000,
        lastUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'inactive',
        website: 'https://marseille-habitat.fr',
        specialties: ['Appartements', 'Studios'],
        marketShare: 4.1
      }
    ]
    setCompetitors(mockCompetitors)
  }, [])

  const filteredCompetitors = competitors.filter(competitor => {
    const matchesSearch = competitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         competitor.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || competitor.status === statusFilter
    
    // Filtres avancés
    const matchesCities = advancedFilters.cities.length === 0 || 
      advancedFilters.cities.some(city => 
        competitor.location.toLowerCase().includes(city.toLowerCase())
      )
    
    const matchesPrice = (!advancedFilters.minPrice || competitor.avgPrice >= parseInt(advancedFilters.minPrice)) &&
      (!advancedFilters.maxPrice || competitor.avgPrice <= parseInt(advancedFilters.maxPrice))
    
    return matchesSearch && matchesStatus && matchesCities && matchesPrice
  })

  const sortedCompetitors = [...filteredCompetitors].sort((a, b) => {
    switch (sortBy) {
      case 'listings':
        return b.listingsCount - a.listingsCount
      case 'price':
        return b.avgPrice - a.avgPrice
      case 'marketShare':
        return b.marketShare - a.marketShare
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  const totalListings = competitors.reduce((sum, c) => sum + c.listingsCount, 0)
  const avgMarketPrice = competitors.length > 0 
    ? Math.round(competitors.reduce((sum, c) => sum + c.avgPrice, 0) / competitors.length)
    : 0
  const activeCompetitors = competitors.filter(c => c.status === 'active').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200'
      case 'monitoring': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'inactive': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif'
      case 'monitoring': return 'Surveillance'
      case 'inactive': return 'Inactif'
      default: return 'Inconnu'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="h-4 w-4" />
      case 'monitoring': return <Eye className="h-4 w-4" />
      case 'inactive': return <AlertCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="Suivi concurrents"
        subtitle="Analysez la concurrence et surveillez les agences immobilières"
        icon={<Building2 className="h-8 w-8 text-purple-600" />}
        action={
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="border-slate-200 hover:border-purple-300 hover:text-purple-600"
            >
              <Building2 className="mr-2 h-4 w-4" />
              Ajouter un concurrent
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <Zap className="mr-2 h-4 w-4" />
              Actualiser les données
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
              <div className="space-y-6">
                {/* Recherche texte et statut */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <SelectItem value="monitoring">Surveillance</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
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
                
                {/* Tri et actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Trier par</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-48 bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200">
                          <SelectValue placeholder="Trier par" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="listings">Nombre d'annonces</SelectItem>
                          <SelectItem value="price">Prix moyen</SelectItem>
                          <SelectItem value="marketShare">Part de marché</SelectItem>
                          <SelectItem value="name">Nom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                      {filteredCompetitors.length} concurrent{filteredCompetitors.length > 1 ? 's' : ''} surveillé{filteredCompetitors.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("all")
                      setSortBy("listings")
                      setAdvancedFilters(initialFilters)
                    }}
                    className="border-slate-200 hover:border-purple-300 hover:text-purple-600"
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </ModernCard>
          </motion.div>

          {/* KPIs */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerChildren}
          >
            <MetricCard
              title="Total Annonces Concurrence"
              value={totalListings}
              icon={Target}
              color="from-purple-500 to-purple-600"
              bgColor="bg-purple-50"
              textColor="text-purple-700"
            />
            <MetricCard
              title="Prix Moyen Marché"
              value={avgMarketPrice.toLocaleString('fr-FR') + '€'}
              icon={TrendingUp}
              color="from-blue-500 to-blue-600"
              bgColor="bg-blue-50"
              textColor="text-blue-700"
            />
            <MetricCard
              title="Agences Actives"
              value={activeCompetitors}
              icon={Building2}
              color="from-cyan-500 to-cyan-600"
              bgColor="bg-cyan-50"
              textColor="text-cyan-700"
            />
          </motion.div>

          {/* Liste des concurrents */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Agences Concurrentes"
              icon={<Building2 className="h-5 w-5 text-emerald-600" />}
            >
              {sortedCompetitors.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    Aucun concurrent trouvé
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Ajustez vos filtres pour voir les agences concurrentes
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedCompetitors.map((competitor, index) => (
                    <motion.div
                      key={competitor.id}
                      variants={fadeInUp}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-6 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors border border-slate-200/60">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <h3 className="text-lg font-semibold text-slate-900">{competitor.name}</h3>
                              <Badge className={getStatusColor(competitor.status)}>
                                {getStatusIcon(competitor.status)}
                                <span className="ml-1">{getStatusText(competitor.status)}</span>
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-600 mb-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Zone :</span>
                                <span>{competitor.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Annonces :</span>
                                <span>{competitor.listingsCount}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Prix moyen :</span>
                                <span>{competitor.avgPrice.toLocaleString('fr-FR')}€</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Dernière MAJ :</span>
                                <span>{competitor.lastUpdate.toLocaleString('fr-FR', { 
                                  day: '2-digit', 
                                  month: '2-digit', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-slate-600">Part de marché :</span>
                                  <Badge variant="outline" className="border-slate-200 text-slate-600">
                                    {competitor.marketShare}%
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-slate-600">Spécialités :</span>
                                  <div className="flex gap-1">
                                    {competitor.specialties.map((specialty, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {specialty}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  asChild
                                  className="border-slate-200 hover:border-purple-300 hover:text-purple-600"
                                >
                                  <a 
                                    href={competitor.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    Site web
                                  </a>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-slate-200 hover:border-blue-300 hover:text-blue-600"
                                >
                                  <Eye className="h-4 w-4" />
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
