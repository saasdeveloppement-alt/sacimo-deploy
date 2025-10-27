"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Cell,
  LineChart,
  Line
} from "recharts"
import { 
  RefreshCw, 
  Building2, 
  TrendingUp, 
  Users, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Image as ImageIcon,
  Home,
  Target,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardHover = {
  hover: { 
    y: -2,
    transition: { duration: 0.2 }
  }
}

export default function ModernDashboard() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastScraping, setLastScraping] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [priceFilter, setPriceFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sellerFilter, setSellerFilter] = useState("all")
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)

  const loadScrapingData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchId: 'test-search' }),
      })
      const data = await response.json()

      if (data.success) {
        const fetchedListings = data.data.results.flatMap((res: any) => res.listings)
        setListings(fetchedListings)
        setLastScraping(new Date())
      } else {
        setError(data.message || 'Erreur lors du chargement des données de scraping.')
      }
    } catch (err) {
      setError('Impossible de se connecter à l\'API de scraping.')
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
    
    const matchesPrice = priceFilter === "all" || 
      (priceFilter === "low" && listing.price < 300000) ||
      (priceFilter === "medium" && listing.price >= 300000 && listing.price < 600000) ||
      (priceFilter === "high" && listing.price >= 600000)
    
    const matchesType = typeFilter === "all" || listing.type === typeFilter
    
    const matchesSeller = sellerFilter === "all" || 
      (sellerFilter === "private" && listing.isPrivateSeller) ||
      (sellerFilter === "professional" && !listing.isPrivateSeller)
    
    return matchesSearch && matchesPrice && matchesType && matchesSeller
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
  const averagePrice = totalListings > 0
    ? filteredListings.reduce((sum, l) => sum + l.price, 0) / totalListings
    : 0
  const privateSellers = filteredListings.filter(l => l.isPrivateSeller).length
  const professionalSellers = filteredListings.filter(l => !l.isPrivateSeller).length

  const kpiCards = [
    {
      title: "Total Annonces",
      value: totalListings,
      icon: Home,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    },
    {
      title: "Prix Moyen",
      value: averagePrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }),
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      title: "Particuliers",
      value: privateSellers,
      icon: Users,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-700"
    },
    {
      title: "Professionnels",
      value: professionalSellers,
      icon: Building2,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700"
    }
  ]

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30"
      initial="initial"
      animate="animate"
      variants={staggerChildren}
    >
      {/* Header moderne */}
      <motion.div 
        className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10"
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <motion.h1 
                className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent"
                variants={fadeInUp}
              >
                Bienvenue sur SACIMO 👋
              </motion.h1>
              <motion.p 
                className="text-slate-600 text-lg"
                variants={fadeInUp}
              >
                Voici les annonces à suivre aujourd'hui
              </motion.p>
              <motion.div 
                className="flex items-center gap-2 text-sm text-slate-500"
                variants={fadeInUp}
              >
                <Activity className="h-4 w-4" />
                {lastScraping 
                  ? `Dernière mise à jour: ${lastScraping.toLocaleString('fr-FR')}`
                  : 'Aucune donnée disponible'
                }
              </motion.div>
            </div>
            <motion.div variants={fadeInUp}>
              <Button 
                onClick={loadScrapingData} 
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Actualisation...' : 'Actualiser'}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {error && (
            <motion.div 
              className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <strong className="font-semibold">Erreur:</strong>
              <span className="block sm:inline ml-1">{error}</span>
            </motion.div>
          )}

          {/* Filtres modernes */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-800">
                  <Filter className="h-5 w-5 text-purple-600" />
                  Filtres et Recherche
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <label className="text-sm font-medium text-slate-700">Vendeur</label>
                    <Select value={sellerFilter} onValueChange={setSellerFilter}>
                      <SelectTrigger className="bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200">
                        <SelectValue placeholder="Tous les vendeurs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les vendeurs</SelectItem>
                        <SelectItem value="private">Particuliers</SelectItem>
                        <SelectItem value="professional">Professionnels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                      {filteredListings.length} annonce{filteredListings.length > 1 ? 's' : ''} trouvée{filteredListings.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSearchTerm("")
                        setPriceFilter("all")
                        setTypeFilter("all")
                        setSellerFilter("all")
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
              </CardContent>
            </Card>
          </motion.div>

          {/* KPIs modernes */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerChildren}
          >
            {kpiCards.map((card, index) => (
              <motion.div key={card.title} variants={fadeInUp}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-600">{card.title}</p>
                          <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color} shadow-lg`}>
                          <card.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Graphiques modernes */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            variants={staggerChildren}
          >
            <motion.div variants={fadeInUp}>
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Répartition par Prix
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {priceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                    <PieChartIcon className="h-5 w-5 text-blue-600" />
                    Répartition par Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={typeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Top Villes moderne */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <MapPin className="h-5 w-5 text-cyan-600" />
                  Top 5 Villes
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </motion.div>

          {/* Liste des annonces moderne */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <Target className="h-5 w-5 text-emerald-600" />
                  Annonces Récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredListings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      {listings.length === 0 ? "Aucune annonce trouvée" : "Aucune annonce ne correspond aux filtres"}
                    </h3>
                    <p className="text-slate-600 mb-4">
                      {listings.length === 0 ? "Lancez le scraping pour découvrir de nouvelles annonces" : "Essayez de modifier vos critères de recherche"}
                    </p>
                    <Button 
                      onClick={loadScrapingData} 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      {listings.length === 0 ? "Lancer le scraping" : "Réinitialiser les filtres"}
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredListings.map((listing, index) => (
                      <motion.div
                        key={index}
                        variants={fadeInUp}
                        whileHover={{ y: -4, scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 group-hover:text-purple-700 transition-colors">
                                {listing.title}
                              </h3>
                              <div className="text-right">
                                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                  {listing.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3 mb-4">
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
                                                onError={(e) => {
                                                  e.target.src = '/placeholder.svg'
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
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </motion.div>
  )
}





