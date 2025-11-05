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
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { 
  RefreshCw, 
  Building2, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Image as ImageIcon, 
  List, 
  Grid3X3,
  Target,
  TrendingUp,
  Users,
  Home,
  Zap
} from "lucide-react"
import { motion } from "framer-motion"

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
}

interface Stats {
  total: number
  avgPrice: number
  minPrice: number
  maxPrice: number
  cities: Array<{
    city: string
    count: number
    avgPrice: number
    minPrice: number
    maxPrice: number
  }>
  sellers: {
    private: number
    professional: number
  }
}

export default function AnnoncesPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState<Stats | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [priceFilter, setPriceFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sellerFilter, setSellerFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"price" | "publishedAt">("publishedAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)

  const loadScrapingData = async () => {
    setIsLoading(true)
    try {
      console.log("🔍 Chargement des annonces depuis la base de données...")
      
      // Construire les paramètres de recherche
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (cityFilter !== 'all') params.append('city', cityFilter)
      
      if (priceFilter !== 'all') {
        if (priceFilter === 'low') {
          params.append('minPrice', '0')
          params.append('maxPrice', '300000')
        } else if (priceFilter === 'medium') {
          params.append('minPrice', '300000')
          params.append('maxPrice', '600000')
        } else if (priceFilter === 'high') {
          params.append('minPrice', '600000')
        }
      }
      
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)
      
      const response = await fetch(`/api/annonces/list?${params.toString()}`)
      const data = await response.json()
      console.log("📦 Données reçues:", data)

      if (data.status === 'success') {
        // Convertir les données Prisma au format attendu avec conversions sécurisées
        const convertedListings = data.data.map((annonce: any) => ({
          title: String(annonce?.title || 'Annonce sans titre'),
          price: Number(annonce?.price || 0),
          surface: annonce?.surface != null ? Number(annonce.surface) : undefined,
          rooms: annonce?.rooms != null ? Number(annonce.rooms) : undefined,
          city: String(annonce?.city || 'Ville non précisée'),
          postalCode: String(annonce?.postalCode || ''),
          type: inferTypeFromTitle(annonce?.title, annonce?.url),
          source: 'LeBonCoin',
          url: String(annonce?.url || ''),
          publishedAt: annonce?.publishedAt 
            ? (typeof annonce.publishedAt === 'string' 
                ? annonce.publishedAt 
                : new Date(annonce.publishedAt).toISOString())
            : new Date().toISOString(),
          isPrivateSeller: true,
          description: String(annonce?.description || ''),
          photos: Array.isArray(annonce?.images) ? annonce.images.map((img: any) => String(img || '')) : []
        }))
        
        setListings(convertedListings)
        setTotalCount(data.pagination?.total || convertedListings.length)
        setStats(data.stats || null)
        console.log(`✅ ${convertedListings.length} annonces chargées depuis la base`)
        if (data.stats) {
          console.log(`📊 Statistiques: ${data.stats.total} total, prix moyen: ${data.stats.avgPrice}€`)
        }
      } else {
        console.error("❌ Erreur chargement:", data.message)
      }
    } catch (err) {
      console.error("❌ Erreur chargement:", err)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Helper pour extraire le type depuis le titre/URL
  const inferTypeFromTitle = (title: string | undefined | null, url: string | undefined | null): string => {
    if (!title && !url) return 'APARTMENT';
    
    const lowerTitle = String(title || '').toLowerCase();
    const lowerUrl = String(url || '').toLowerCase();
    
    if (lowerTitle.includes('maison') || lowerTitle.includes('villa') || lowerUrl.includes('maison')) return 'HOUSE';
    if (lowerTitle.includes('studio') || lowerUrl.includes('studio')) return 'STUDIO';
    if (lowerTitle.includes('loft') || lowerUrl.includes('loft')) return 'LOFT';
    return 'APARTMENT';
  }

  useEffect(() => {
    loadScrapingData()
  }, [cityFilter, priceFilter, sortBy, sortOrder, searchTerm])

  // Logique de filtrage côté client (pour filtres type et seller uniquement, car Prisma ne les gère pas encore)
  const filteredListings = listings.filter(listing => {
    const matchesType = typeFilter === "all" || listing.type === typeFilter
    
    const matchesSeller = sellerFilter === "all" || 
      (sellerFilter === "private" && listing.isPrivateSeller) ||
      (sellerFilter === "professional" && !listing.isPrivateSeller)
    
    return matchesType && matchesSeller
  })

  // Données pour les graphiques
  const priceDistribution = [
    { range: "< 300k€", count: filteredListings.filter(l => l.price < 300000).length, color: "#8B5CF6" },
    { range: "300k-600k€", count: filteredListings.filter(l => l.price >= 300000 && l.price < 600000).length, color: "#3B82F6" },
    { range: "> 600k€", count: filteredListings.filter(l => l.price >= 600000).length, color: "#06B6D4" }
  ]

  const typeDistribution = [
    { name: "Appartements", value: filteredListings.filter(l => l.type === 'APARTMENT').length, color: "#8B5CF6" },
    { name: "Maisons", value: filteredListings.filter(l => l.type === 'HOUSE').length, color: "#3B82F6" },
    { name: "Studios", value: filteredListings.filter(l => l.type === 'STUDIO').length, color: "#06B6D4" },
    { name: "Autres", value: filteredListings.filter(l => !['APARTMENT', 'HOUSE', 'STUDIO'].includes(l.type)).length, color: "#10B981" }
  ].filter(item => item.value > 0)

  // Utiliser les statistiques de villes depuis l'API si disponibles, sinon calculer depuis filteredListings
  const cityData = stats?.cities 
    ? stats.cities.slice(0, 5).map(c => ({ city: c.city, count: c.count }))
    : (() => {
        const cityDistribution = filteredListings.reduce((acc, listing) => {
          const city = listing.city
          acc[city] = (acc[city] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        return Object.entries(cityDistribution).map(([city, count]) => ({
          city,
          count
        })).sort((a, b) => b.count - a.count).slice(0, 5)
      })()

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="Piges"
        subtitle="Suivez les dernières annonces des particuliers et professionnels"
        icon={<Target className="h-8 w-8 text-purple-600" />}
        action={
          <div className="flex gap-2">
            <Button 
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-purple-600 hover:bg-purple-700" : "border-slate-200 hover:border-purple-300"}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-purple-600 hover:bg-purple-700" : "border-slate-200 hover:border-purple-300"}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button 
              onClick={loadScrapingData} 
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {isLoading ? 'Actualisation...' : 'Actualiser'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Recherche</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Rechercher par titre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Ville</label>
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger className="bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200">
                      <SelectValue placeholder="Toutes les villes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les villes</SelectItem>
                      <SelectItem value="Paris">Paris</SelectItem>
                      <SelectItem value="Lyon">Lyon</SelectItem>
                      <SelectItem value="Marseille">Marseille</SelectItem>
                      <SelectItem value="Toulouse">Toulouse</SelectItem>
                      <SelectItem value="Bordeaux">Bordeaux</SelectItem>
                      <SelectItem value="Nantes">Nantes</SelectItem>
                      <SelectItem value="Nice">Nice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Prix</label>
                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger className="bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200">
                      <SelectValue placeholder="Tous les prix" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les prix</SelectItem>
                      <SelectItem value="low">Moins de 300k€</SelectItem>
                      <SelectItem value="medium">300k€ - 600k€</SelectItem>
                      <SelectItem value="high">Plus de 600k€</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200">
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="APARTMENT">Appartement</SelectItem>
                      <SelectItem value="HOUSE">Maison</SelectItem>
                      <SelectItem value="STUDIO">Studio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Trier par</label>
                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                    const [by, order] = value.split('-')
                    setSortBy(by as "price" | "publishedAt")
                    setSortOrder(order as "asc" | "desc")
                  }}>
                    <SelectTrigger className="bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publishedAt-desc">Plus récentes</SelectItem>
                      <SelectItem value="publishedAt-asc">Plus anciennes</SelectItem>
                      <SelectItem value="price-asc">Prix croissant</SelectItem>
                      <SelectItem value="price-desc">Prix décroissant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                  {totalCount > 0 ? `${totalCount} annonce${totalCount > 1 ? 's' : ''} trouvée${totalCount > 1 ? 's' : ''}` : filteredListings.length > 0 ? `${filteredListings.length} affichée${filteredListings.length > 1 ? 's' : ''}` : 'Aucune annonce'}
                </Badge>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSearchTerm("")
                      setPriceFilter("all")
                      setTypeFilter("all")
                      setSellerFilter("all")
                      setCityFilter("all")
                      setSortBy("publishedAt")
                      setSortOrder("desc")
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
            </ModernCard>
          </motion.div>

          {/* KPIs */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerChildren}
          >
            <MetricCard
              title="Total Annonces"
              value={stats?.total || totalCount || 0}
              icon={Home}
              color="from-purple-500 to-purple-600"
              bgColor="bg-purple-50"
              textColor="text-purple-700"
            />
            <MetricCard
              title="Prix Moyen"
              value={stats?.avgPrice 
                ? stats.avgPrice.toLocaleString('fr-FR') + '€'
                : filteredListings.length > 0 
                  ? Math.round(filteredListings.reduce((sum, l) => sum + l.price, 0) / filteredListings.length).toLocaleString('fr-FR') + '€'
                  : '0€'
              }
              icon={TrendingUp}
              color="from-blue-500 to-blue-600"
              bgColor="bg-blue-50"
              textColor="text-blue-700"
            />
            <MetricCard
              title="Particuliers"
              value={stats?.sellers?.private || filteredListings.filter(l => l.isPrivateSeller).length}
              icon={Users}
              color="from-cyan-500 to-cyan-600"
              bgColor="bg-cyan-50"
              textColor="text-cyan-700"
            />
            <MetricCard
              title="Professionnels"
              value={stats?.sellers?.professional || filteredListings.filter(l => !l.isPrivateSeller).length}
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
                title="Répartition par Prix"
                icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priceDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="range" stroke="#64748B" />
                    <YAxis stroke="#64748B" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </ModernCard>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <ModernCard
                title="Répartition par Type"
                icon={<Building2 className="h-5 w-5 text-blue-600" />}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ModernCard>
            </motion.div>
          </motion.div>

          {/* Top Villes */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Top 5 Villes"
              icon={<MapPin className="h-5 w-5 text-cyan-600" />}
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
                      <span className="text-sm font-medium text-slate-600">{item.count} annonce{item.count > 1 ? 's' : ''}</span>
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

          {/* Liste des annonces */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Annonces Immobilières"
              icon={<Target className="h-5 w-5 text-emerald-600" />}
            >
              {filteredListings.length === 0 ? (
                <div className="text-center py-16">
                  <motion.div 
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                  >
                    <Building2 className="h-10 w-10 text-purple-600" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">
                    {totalCount === 0 ? "Aucune annonce trouvée" : "Aucune annonce ne correspond aux filtres"}
                  </h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    {totalCount === 0 
                      ? "La base de données est vide. Lancez le scraping depuis la page 'Mes recherches' pour découvrir de nouvelles annonces." 
                      : "Essayez de modifier vos critères de recherche ou de réinitialiser les filtres."}
                  </p>
                  <div className="flex gap-3 justify-center">
                    {totalCount === 0 ? (
                      <Button 
                        onClick={() => window.location.href = '/app/recherches'} 
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Aller aux recherches
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => {
                          setSearchTerm("")
                          setPriceFilter("all")
                          setTypeFilter("all")
                          setSellerFilter("all")
                          setCityFilter("all")
                          setSortBy("publishedAt")
                          setSortOrder("desc")
                        }}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                      >
                        Réinitialiser les filtres
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                  {filteredListings.map((listing) => (
                    <motion.div
                      key={listing.url}
                      variants={fadeInUp}
                      whileHover={{ y: -4, scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className={`bg-white/90 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group rounded-xl ${viewMode === "list" ? "p-4" : "p-6"}`}>
                        <div className={viewMode === "list" ? "flex items-start gap-4" : ""}>
                          {/* Image */}
                          {viewMode === "list" && (
                            <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                              {listing.photos && listing.photos.length > 0 ? (
                                <img 
                                  src={listing.photos[0]} 
                                  alt={listing.title}
                                  className="w-full h-full object-cover"
                                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = '/placeholder.svg'
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="h-8 w-8 text-slate-400" />
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex-1">
                            <div className={viewMode === "list" ? "flex justify-between items-start mb-2" : "flex justify-between items-start mb-4"}>
                              <h3 className={`font-semibold text-slate-900 group-hover:text-purple-700 transition-colors ${viewMode === "list" ? "text-lg" : "text-lg line-clamp-2"}`}>
                                {listing.title}
                              </h3>
                              <div className={`font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ${viewMode === "list" ? "text-xl" : "text-2xl"}`}>
                                {listing.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                              </div>
                            </div>
                            
                            <div className={`space-y-2 ${viewMode === "list" ? "mb-3" : "mb-4"}`}>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                {listing.city} ({listing.postalCode})
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Home className="h-4 w-4 text-slate-400" />
                                {listing.surface && `${listing.surface} m²`} {listing.rooms && `• ${listing.rooms} pièces`}
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                <Badge 
                                  variant={listing.isPrivateSeller ? "default" : "secondary"}
                                  className={listing.isPrivateSeller 
                                    ? "bg-purple-100 text-purple-700 border-purple-200" 
                                    : "bg-slate-100 text-slate-700 border-slate-200"
                                  }
                                >
                                  {listing.isPrivateSeller ? "Particulier" : "Professionnel"}
                                </Badge>
                                <Badge variant="outline" className="border-slate-200 text-slate-600">
                                  {listing.source}
                                </Badge>
                                <Badge variant="outline" className="border-slate-200 text-slate-600">
                                  {listing.type}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setSelectedListing(listing)}
                                    className="flex items-center gap-1 border-slate-200 hover:border-purple-300 hover:text-purple-600"
                                  >
                                    <Eye className="h-4 w-4" />
                                    Voir détails
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl font-bold">{listing.title}</DialogTitle>
                                  </DialogHeader>
                                  
                                  <div className="space-y-6">
                                    {/* Prix et badges */}
                                    <div className="flex items-center justify-between">
                                      <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                        {listing.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                                      </div>
                                      <div className="flex gap-2">
                                        <Badge variant={listing.isPrivateSeller ? "default" : "secondary"}>
                                          {listing.isPrivateSeller ? "Particulier" : "Professionnel"}
                                        </Badge>
                                        <Badge variant="outline">{listing.source}</Badge>
                                        <Badge variant="outline">{listing.type}</Badge>
                                      </div>
                                    </div>

                                    {/* Photos */}
                                    <div className="space-y-2">
                                      <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5" />
                                        Photos
                                      </h3>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {listing.photos && listing.photos.length > 0 ? (
                                          listing.photos.map((photo, photoIndex) => (
                                            <div key={photoIndex} className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                                              <img 
                                                src={photo} 
                                                alt={`Photo ${photoIndex + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                                  const target = e.target as HTMLImageElement
                                                  target.src = '/placeholder.svg'
                                                }}
                                              />
                                            </div>
                                          ))
                                        ) : (
                                          <div className="col-span-2 md:col-span-3 aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                                            <div className="text-center text-slate-500">
                                              <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                                              <p>Aucune photo disponible</p>
                                            </div>
                                          </div>
                                        )}
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
                                              <Home className="h-4 w-4 text-slate-500" />
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
                              
                              <span className="text-xs text-slate-500">
                                {new Date(listing.publishedAt).toLocaleDateString('fr-FR')}
                              </span>
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