"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import PageContainer, { fadeInUp, staggerChildren } from "@/components/ui/PageContainer"
import SectionHeader from "@/components/ui/SectionHeader"
import ModernCard from "@/components/ui/ModernCard"
import MetricCard from "@/components/ui/MetricCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import AdvancedFilters from "@/components/filters/AdvancedFilters"
import { AdvancedFilters as AdvancedFiltersType, initialFilters } from "@/hooks/useAdvancedFilters"
import ListingCard from "@/components/ListingCard"
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
import { showSuccess, showError, showInfo } from "@/lib/toast"

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

function AnnoncesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const agencyFromUrl = searchParams.get('agency')
  
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState<Stats | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersType>(initialFilters)
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
      
      // Recherche texte (legacy)
      if (searchTerm) params.append('search', searchTerm)
      
      // Filtres avancés
      if (advancedFilters.cities.length > 0) {
        advancedFilters.cities.forEach(city => params.append('cities', city))
      }
      
      if (advancedFilters.types.length > 0) {
        advancedFilters.types.forEach(type => params.append('types', type))
      }
      
      if (advancedFilters.minPrice) params.append('minPrice', advancedFilters.minPrice)
      if (advancedFilters.maxPrice) params.append('maxPrice', advancedFilters.maxPrice)
      if (advancedFilters.minSurface) params.append('minSurface', advancedFilters.minSurface)
      if (advancedFilters.maxSurface) params.append('maxSurface', advancedFilters.maxSurface)
      if (advancedFilters.rooms) params.append('rooms', advancedFilters.rooms)
      if (advancedFilters.sellerType !== 'all') params.append('sellerType', advancedFilters.sellerType)
      if (advancedFilters.dateFrom) params.append('dateFrom', advancedFilters.dateFrom)
      
      // Filtre par agence depuis l'URL
      if (agencyFromUrl) {
        params.append('agency', agencyFromUrl)
      }
      
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)
      
      const response = await fetch(`/api/annonces/list?${params.toString()}`)
      const data = await response.json()
      console.log("📦 Données reçues:", data)
      console.log("📦 Structure des données:", {
        status: data.status,
        hasData: !!data.data,
        dataLength: data.data?.length,
        dataType: Array.isArray(data.data) ? 'array' : typeof data.data,
        pagination: data.pagination,
        stats: data.stats
      })

      if (data.status === 'success') {
        // Vérifier que data.data existe et est un tableau
        if (!data.data || !Array.isArray(data.data)) {
          console.error("❌ data.data n'est pas un tableau:", data.data)
          setListings([])
          setTotalCount(0)
          setStats(null)
          showError("❌ Format de données invalide: data.data n'est pas un tableau")
          return
        }

        console.log(`📋 Conversion de ${data.data.length} annonces...`)
        
        // Convertir les données Prisma au format attendu avec conversions sécurisées
        const convertedListings = data.data.map((annonce: any, index: number) => {
          try {
            const converted = {
              title: String(annonce?.title || 'Annonce sans titre'),
              price: Number(annonce?.price || 0),
              surface: annonce?.surface != null ? Number(annonce.surface) : undefined,
              rooms: annonce?.rooms != null ? Number(annonce.rooms) : undefined,
              city: String(annonce?.city || 'Ville non précisée'),
              postalCode: String(annonce?.postalCode || ''),
              type: inferTypeFromTitle(annonce?.title, annonce?.url),
              source: annonce?.source || 'LeBonCoin',
              url: String(annonce?.url || ''),
              publishedAt: annonce?.publishedAt 
                ? (typeof annonce.publishedAt === 'string' 
                    ? annonce.publishedAt 
                    : new Date(annonce.publishedAt).toISOString())
                : new Date().toISOString(),
              isPrivateSeller: true,
              description: String(annonce?.description || ''),
              photos: Array.isArray(annonce?.images) ? annonce.images.map((img: any) => String(img || '')) : []
            }
            
            // Log les 3 premières conversions pour debug
            if (index < 3) {
              console.log(`  [${index + 1}] Converti:`, {
                title: converted.title.substring(0, 50),
                price: converted.price,
                city: converted.city,
                url: converted.url.substring(0, 50)
              })
            }
            
            return converted
          } catch (err) {
            console.error(`❌ Erreur conversion annonce ${index}:`, err, annonce)
            return null
          }
        }).filter((listing: any) => listing !== null) // Filtrer les conversions échouées
        
        console.log(`✅ ${convertedListings.length} annonces converties avec succès`)
        console.log(`📊 Échantillon de listings:`, convertedListings.slice(0, 2))
        
        setListings(convertedListings)
        setTotalCount(data.pagination?.total || convertedListings.length)
        setStats(data.stats || null)
        
        console.log(`✅ ${convertedListings.length} annonces chargées dans le state`)
        console.log(`📊 totalCount: ${data.pagination?.total || convertedListings.length}`)
        
        if (data.stats) {
          console.log(`📊 Statistiques: ${data.stats.total} total, prix moyen: ${data.stats.avgPrice}€`)
        }
        
        if (convertedListings.length > 0) {
          showSuccess(`✅ ${convertedListings.length} annonce${convertedListings.length > 1 ? 's' : ''} chargée${convertedListings.length > 1 ? 's' : ''}`)
        } else {
          showInfo("ℹ️ Aucune annonce trouvée avec ces critères")
        }
      } else {
        console.error("❌ Erreur chargement:", data.message)
        showError(`❌ Erreur: ${data.message || 'Impossible de charger les annonces'}`)
      }
    } catch (err: any) {
      console.error("❌ Erreur chargement:", err)
      showError(`❌ Erreur: ${err.message || 'Erreur lors du chargement'}`)
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
  }, [advancedFilters, sortBy, sortOrder, searchTerm, agencyFromUrl])

  // Logique de filtrage côté client (pour les types seulement, car pas encore stocké en base)
  const filteredListings = listings.filter(listing => {
    // Filtre par type (côté client car pas encore dans Prisma)
    if (advancedFilters.types.length > 0) {
      const matches = advancedFilters.types.includes(listing.type)
      if (!matches) {
        console.log(`🔍 Filtre type: "${listing.type}" ne correspond pas aux filtres:`, advancedFilters.types)
      }
      return matches
    }
    return true
  })
  
  // Log pour debug
  useEffect(() => {
    console.log("🔍 État des listings:", {
      totalListings: listings.length,
      filteredListings: filteredListings.length,
      totalCount,
      advancedFiltersTypes: advancedFilters.types
    })
  }, [listings, filteredListings, totalCount, advancedFilters.types])

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
          {/* Badge filtre agence */}
          {agencyFromUrl && (
            <motion.div variants={fadeInUp}>
              <div className="mb-4">
                <Badge variant="secondary" className="text-sm p-2 bg-purple-100 text-purple-700 border-purple-200">
                  🏢 Filtre actif : {agencyFromUrl}
                  <button 
                    onClick={() => {
                      router.push('/app/annonces')
                      showInfo('Filtre agence retiré')
                    }} 
                    className="ml-2 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </Badge>
              </div>
            </motion.div>
          )}

          {/* Filtres avancés et recherche */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Filtres et Recherche"
              icon={<Filter className="h-5 w-5 text-purple-600" />}
            >
              <div className="space-y-6">
                {/* Recherche texte */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Recherche texte</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Rechercher par titre, ville ou description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200"
                    />
                  </div>
                </div>
                
                <Separator />
                
                {/* Filtres avancés */}
                <AdvancedFilters
                  onFilterChange={setAdvancedFilters}
                  initialFilters={advancedFilters}
                  availableCities={stats?.cities?.map(c => c.city) || []}
                />
                
                <Separator />
                
                {/* Tri et actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Trier par</label>
                      <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                        const [by, order] = value.split('-')
                        setSortBy(by as "price" | "publishedAt")
                        setSortOrder(order as "asc" | "desc")
                      }}>
                        <SelectTrigger className="w-48 bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200">
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
                
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                      {totalCount > 0 ? `${totalCount} annonce${totalCount > 1 ? 's' : ''} trouvée${totalCount > 1 ? 's' : ''}` : filteredListings.length > 0 ? `${filteredListings.length} affichée${filteredListings.length > 1 ? 's' : ''}` : 'Aucune annonce'}
                    </Badge>
              </div>
              
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
                          setAdvancedFilters(initialFilters)
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
                <>
                  {console.log("🎨 Rendu des cartes:", {
                    filteredListingsCount: filteredListings.length,
                    viewMode,
                    firstListing: filteredListings[0]
                  })}
                  <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {filteredListings.map((listing, index) => {
                      console.log(`🎨 Rendu carte ${index + 1}/${filteredListings.length}:`, {
                        title: listing.title.substring(0, 50),
                        url: listing.url,
                        hasPhotos: listing.photos?.length > 0
                      })
                      return (
                        <ListingCard
                          key={listing.url || `listing-${index}`}
                          listing={listing}
                          viewMode={viewMode}
                          onSave={(listing) => {
                            console.log("💾 Sauvegarder:", listing.title)
                            // TODO: Implémenter la sauvegarde en base
                          }}
                          onAnalyze={(listing) => {
                            console.log("📊 Analyser:", listing.title)
                            showInfo(`📊 Analyse de "${listing.title.substring(0, 30)}..." en cours`)
                            // TODO: Implémenter l'analyse
                          }}
                          onEstimate={(listing) => {
                            console.log("💰 Estimer:", listing.title)
                            showInfo(`💰 Estimation de "${listing.title.substring(0, 30)}..." en cours`)
                            // TODO: Implémenter l'estimation IA
                          }}
                          onLocate={(listing) => {
                            console.log("📍 Localiser:", listing.title)
                            showInfo(`📍 Localisation de "${listing.city}" sur la carte`)
                            // TODO: Ouvrir modal carte
                          }}
                        />
                      )
                    })}
                  </div>
                </>
              )}
            </ModernCard>
          </motion.div>
        </div>
      </main>
    </PageContainer>
  )
}

export default function AnnoncesPage() {
  return (
    <Suspense fallback={
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center animate-pulse">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-slate-600">Chargement...</p>
          </div>
        </div>
      </PageContainer>
    }>
      <AnnoncesContent />
    </Suspense>
  )
}