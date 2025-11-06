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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  MapPin, 
  Target, 
  TrendingUp, 
  Building2, 
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  ExternalLink,
  Image as ImageIcon,
  Map,
  BarChart3,
  Zap,
  Calculator,
  Home
} from "lucide-react"
import { motion } from "framer-motion"
import AdvancedFilters from "@/components/filters/AdvancedFilters"
import { AdvancedFilters as AdvancedFiltersType, initialFilters } from "@/hooks/useAdvancedFilters"
import { Separator } from "@/components/ui/separator"

interface Listing {
  title: string;
  price: number;
  surface?: number;
  rooms?: number;
  city: string;
  postalCode: string;
  type: string;
  source: string;
  url: string;
  publishedAt: string;
  isPrivateSeller: boolean;
  description?: string;
  photos: string[];
  geo?: { lat: number; lng: number };
  estimatedValue?: number;
  confidenceScore?: number;
}

export default function LocalisationPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [confidenceFilter, setConfidenceFilter] = useState("all")
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersType>(initialFilters)

  const loadScrapingData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchId: 'test-search' }),
      })
      const data = await response.json()

      if (data.success) {
        const fetchedListings = data.data.results.flatMap((res: any) => res.listings)
        // Ajouter des estimations simulées
        const listingsWithEstimations = fetchedListings.map((listing: any) => ({
          ...listing,
          estimatedValue: Math.round(listing.price * (0.9 + Math.random() * 0.2)), // ±10% de variation
          confidenceScore: Math.round(60 + Math.random() * 35), // Score de confiance 60-95%
          geo: {
            lat: 48.8566 + (Math.random() - 0.5) * 0.1, // Paris ±0.05°
            lng: 2.3522 + (Math.random() - 0.5) * 0.1
          }
        }))
        setListings(listingsWithEstimations)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadScrapingData()
  }, [])

  // Logique de filtrage
  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filtres avancés
    const matchesCities = advancedFilters.cities.length === 0 || 
      advancedFilters.cities.some(city => listing.city.toLowerCase().includes(city.toLowerCase()))
    
    const matchesTypes = advancedFilters.types.length === 0 || 
      advancedFilters.types.includes(listing.type)
    
    const matchesPrice = (!advancedFilters.minPrice || listing.price >= parseInt(advancedFilters.minPrice)) &&
      (!advancedFilters.maxPrice || listing.price <= parseInt(advancedFilters.maxPrice))
    
    const matchesSurface = (!advancedFilters.minSurface || !listing.surface || listing.surface >= parseInt(advancedFilters.minSurface)) &&
      (!advancedFilters.maxSurface || !listing.surface || listing.surface <= parseInt(advancedFilters.maxSurface))
    
    const matchesRooms = !advancedFilters.rooms || !listing.rooms || listing.rooms >= parseInt(advancedFilters.rooms)
    
    const matchesConfidence = confidenceFilter === "all" || 
      (confidenceFilter === "high" && (listing.confidenceScore || 0) >= 80) ||
      (confidenceFilter === "medium" && (listing.confidenceScore || 0) >= 60 && (listing.confidenceScore || 0) < 80) ||
      (confidenceFilter === "low" && (listing.confidenceScore || 0) < 60)
    
    return matchesSearch && matchesCities && matchesTypes && matchesPrice && matchesSurface && matchesRooms && matchesConfidence
  })

  // Données pour les graphiques
  const estimationAccuracy = [
    { range: "Très précis (±5%)", count: filteredListings.filter(l => (l.confidenceScore || 0) >= 90).length, color: "#10B981" },
    { range: "Précis (±10%)", count: filteredListings.filter(l => (l.confidenceScore || 0) >= 70 && (l.confidenceScore || 0) < 90).length, color: "#3B82F6" },
    { range: "Moyen (±20%)", count: filteredListings.filter(l => (l.confidenceScore || 0) >= 50 && (l.confidenceScore || 0) < 70).length, color: "#F59E0B" },
    { range: "Faible (>20%)", count: filteredListings.filter(l => (l.confidenceScore || 0) < 50).length, color: "#EF4444" }
  ]

  const cityDistribution = filteredListings.reduce((acc, listing) => {
    const city = listing.city
    acc[city] = (acc[city] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const cityData = Object.entries(cityDistribution).map(([city, count]) => ({
    city,
    count
  })).sort((a, b) => b.count - a.count).slice(0, 5)

  const totalListings = filteredListings.length
  const avgConfidence = totalListings > 0 
    ? Math.round(filteredListings.reduce((sum, l) => sum + (l.confidenceScore || 0), 0) / totalListings)
    : 0
  const avgEstimation = totalListings > 0 
    ? Math.round(filteredListings.reduce((sum, l) => sum + (l.estimatedValue || l.price), 0) / totalListings)
    : 0
  const citiesCount = cityData.length

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="Localisation & estimation"
        subtitle="Analysez les biens avec géolocalisation et estimations IA"
        icon={<MapPin className="h-8 w-8 text-purple-600" />}
        action={
          <Button 
            onClick={loadScrapingData} 
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isLoading ? <Target className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {isLoading ? 'Analyse...' : 'Actualiser'}
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
              <div className="space-y-6">
                {/* Recherche texte et précision */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Recherche</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Rechercher par titre ou ville..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Précision</label>
                    <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                      <SelectTrigger className="bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200">
                        <SelectValue placeholder="Tous les niveaux" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les niveaux</SelectItem>
                        <SelectItem value="high">Très précis (≥80%)</SelectItem>
                        <SelectItem value="medium">Précis (60-79%)</SelectItem>
                        <SelectItem value="low">Faible (&lt;60%)</SelectItem>
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
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                    {filteredListings.length} bien{filteredListings.length > 1 ? 's' : ''} localisé{filteredListings.length > 1 ? 's' : ''}
                  </Badge>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSearchTerm("")
                        setConfidenceFilter("all")
                        setAdvancedFilters(initialFilters)
                      }}
                      className="border-slate-200 hover:border-purple-300 hover:text-purple-600"
                    >
                      Réinitialiser
                    </Button>
                    <Button variant="outline" size="sm" className="border-slate-200 hover:border-purple-300 hover:text-purple-600">
                      <Download className="h-4 w-4 mr-2" />
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
              title="Biens Localisés"
              value={totalListings}
              icon={MapPin}
              color="from-purple-500 to-purple-600"
              bgColor="bg-purple-50"
              textColor="text-purple-700"
            />
            <MetricCard
              title="Précision Moyenne"
              value={avgConfidence + '%'}
              icon={Target}
              color="from-blue-500 to-blue-600"
              bgColor="bg-blue-50"
              textColor="text-blue-700"
            />
            <MetricCard
              title="Estimation Moyenne"
              value={avgEstimation.toLocaleString('fr-FR') + '€'}
              icon={TrendingUp}
              color="from-cyan-500 to-cyan-600"
              bgColor="bg-cyan-50"
              textColor="text-cyan-700"
            />
            <MetricCard
              title="Villes Couvertes"
              value={citiesCount}
              icon={Building2}
              color="from-emerald-500 to-emerald-600"
              bgColor="bg-emerald-50"
              textColor="text-emerald-700"
            />
          </motion.div>

          {/* Graphiques */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            variants={staggerChildren}
          >
            <motion.div variants={fadeInUp}>
              <ModernCard
                title="Précision des Estimations"
                icon={<Target className="h-5 w-5 text-purple-600" />}
              >
                <div className="space-y-4">
                  {estimationAccuracy.map((item, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-slate-800">{item.range}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-600">{item.count} bien{item.count > 1 ? 's' : ''}</span>
                        <div className="w-20 bg-slate-200 rounded-full h-2">
                          <motion.div 
                            className="h-2 rounded-full" 
                            style={{ 
                              backgroundColor: item.color,
                              width: `${(item.count / Math.max(...estimationAccuracy.map(e => e.count))) * 100}%` 
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.count / Math.max(...estimationAccuracy.map(e => e.count))) * 100}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ModernCard>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <ModernCard
                title="Top Villes Localisées"
                icon={<MapPin className="h-5 w-5 text-blue-600" />}
              >
                <div className="space-y-4">
                  {cityData.map((item, index) => (
                    <motion.div 
                      key={item.city} 
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-slate-800">{item.city}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-600">{item.count} bien{item.count > 1 ? 's' : ''}</span>
                        <div className="w-20 bg-slate-200 rounded-full h-2">
                          <motion.div 
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" 
                            style={{ width: `${(item.count / Math.max(...cityData.map(c => c.count))) * 100}%` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.count / Math.max(...cityData.map(c => c.count))) * 100}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ModernCard>
            </motion.div>
          </motion.div>

          {/* Carte placeholder */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Carte Interactive"
              icon={<Map className="h-5 w-5 text-cyan-600" />}
            >
              <div className="h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <Map className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                  <p className="text-lg font-medium">Carte interactive</p>
                  <p className="text-sm">Intégration carte à venir</p>
                </div>
              </div>
            </ModernCard>
          </motion.div>

          {/* Liste des biens avec estimations */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Biens Localisés avec Estimations"
              icon={<Calculator className="h-5 w-5 text-emerald-600" />}
            >
              {filteredListings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    Aucun bien localisé trouvé
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Lancez l'analyse pour découvrir les biens avec géolocalisation et estimations
                  </p>
                  <Button 
                    onClick={loadScrapingData} 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    Lancer la localisation
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredListings.map((listing, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      whileHover={{ y: -2, scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-6 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors border border-slate-200/60">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">{listing.title}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                              <div className="text-center p-4 rounded-lg bg-blue-50">
                                <p className="text-sm text-slate-600 mb-1">Prix annoncé</p>
                                <p className="text-2xl font-bold text-blue-600">
                                  {listing.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                                </p>
                              </div>
                              <div className="text-center p-4 rounded-lg bg-green-50">
                                <p className="text-sm text-slate-600 mb-1">Estimation IA</p>
                                <p className="text-2xl font-bold text-green-600">
                                  {(listing.estimatedValue || listing.price).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                                </p>
                              </div>
                              <div className="text-center p-4 rounded-lg bg-purple-50">
                                <p className="text-sm text-slate-600 mb-1">Précision</p>
                                <div className="flex items-center justify-center gap-2">
                                  <p className="text-2xl font-bold text-purple-600">
                                    {listing.confidenceScore || 0}%
                                  </p>
                                  <Badge 
                                    variant={
                                      (listing.confidenceScore || 0) >= 80 ? "default" :
                                      (listing.confidenceScore || 0) >= 60 ? "secondary" : "destructive"
                                    }
                                    className="text-xs"
                                  >
                                    {(listing.confidenceScore || 0) >= 80 ? "Très précis" :
                                     (listing.confidenceScore || 0) >= 60 ? "Précis" : "Faible"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {listing.city} ({listing.postalCode})
                              </span>
                              <span className="flex items-center gap-1">
                                <Home className="h-4 w-4" />
                                {listing.surface && `${listing.surface} m²`}
                              </span>
                              <span className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                {listing.rooms && `${listing.rooms} pièces`}
                              </span>
                              <Badge variant={listing.isPrivateSeller ? "default" : "secondary"}>
                                {listing.isPrivateSeller ? "Particulier" : "Professionnel"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedListing(listing)}
                                  className="flex items-center gap-1 border-slate-200 hover:border-purple-300 hover:text-purple-600"
                                >
                                  <Eye className="h-4 w-4" />
                                  Détails
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-xl font-bold">{listing.title}</DialogTitle>
                                </DialogHeader>
                                
                                <div className="space-y-6">
                                  {/* Estimation détaillée */}
                                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                      <Calculator className="h-5 w-5" />
                                      Estimation Automatique
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="text-center p-4 rounded-lg bg-white/80">
                                        <p className="text-sm text-slate-600 mb-2">Prix annoncé</p>
                                        <p className="text-3xl font-bold text-blue-600">
                                          {listing.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                                        </p>
                                      </div>
                                      <div className="text-center p-4 rounded-lg bg-white/80">
                                        <p className="text-sm text-slate-600 mb-2">Estimation IA</p>
                                        <p className="text-3xl font-bold text-green-600">
                                          {(listing.estimatedValue || listing.price).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="mt-6">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Score de confiance</span>
                                        <span className="text-sm font-medium">{listing.confidenceScore || 0}%</span>
                                      </div>
                                      <div className="w-full bg-slate-200 rounded-full h-3">
                                        <motion.div 
                                          className={`h-3 rounded-full ${
                                            (listing.confidenceScore || 0) >= 80 ? 'bg-green-500' :
                                            (listing.confidenceScore || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                          }`}
                                          style={{ width: `${listing.confidenceScore || 0}%` }}
                                          initial={{ width: 0 }}
                                          animate={{ width: `${listing.confidenceScore || 0}%` }}
                                          transition={{ duration: 1, delay: 0.2 }}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Informations détaillées */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <h3 className="text-lg font-semibold">Informations</h3>
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                          <MapPin className="h-4 w-4 text-slate-500" />
                                          <span className="font-medium">Localisation :</span>
                                          <span>{listing.city} ({listing.postalCode})</span>
                                        </div>
                                        {listing.surface && (
                                          <div className="flex items-center gap-2">
                                            <Home className="h-4 w-4 text-slate-500" />
                                            <span className="font-medium">Surface :</span>
                                            <span>{listing.surface} m²</span>
                                          </div>
                                        )}
                                        {listing.rooms && (
                                          <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-slate-500" />
                                            <span className="font-medium">Pièces :</span>
                                            <span>{listing.rooms} pièces</span>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                          <Calendar className="h-4 w-4 text-slate-500" />
                                          <span className="font-medium">Publié le :</span>
                                          <span>{new Date(listing.publishedAt).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <h3 className="text-lg font-semibold">Description</h3>
                                      <div className="bg-slate-50 p-4 rounded-lg">
                                        {listing.description ? (
                                          <p className="text-slate-700 leading-relaxed">{listing.description}</p>
                                        ) : (
                                          <p className="text-slate-500 italic">Aucune description disponible</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex gap-3 pt-4 border-t">
                                    <Button asChild className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                                      <a 
                                        href={listing.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                        Voir sur {listing.source}
                                      </a>
                                    </Button>
                                    <Button variant="outline" className="flex-1 border-slate-200 hover:border-purple-300 hover:text-purple-600">
                                      <Download className="h-4 w-4 mr-2" />
                                      Sauvegarder
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
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