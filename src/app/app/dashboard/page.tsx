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

export default function DashboardPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [priceFilter, setPriceFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sellerFilter, setSellerFilter] = useState("all")
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)

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
        setListings(fetchedListings)
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
    { range: "< 300k€", count: filteredListings.filter(l => l.price < 300000).length },
    { range: "300k-600k€", count: filteredListings.filter(l => l.price >= 300000 && l.price < 600000).length },
    { range: "> 600k€", count: filteredListings.filter(l => l.price >= 600000).length }
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
  }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 5)

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="Dashboard"
        subtitle="Bienvenue, voici les annonces à suivre aujourd'hui 👇"
        icon={<Home className="h-8 w-8 text-purple-600" />}
        action={
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="border-slate-200 hover:border-purple-300 hover:text-purple-600"
            >
              <Download className="mr-2 h-4 w-4" />
              Exporter
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
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                  {filteredListings.length} annonce{filteredListings.length > 1 ? 's' : ''} trouvée{filteredListings.length > 1 ? 's' : ''}
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerChildren}
          >
            <MetricCard
              title="Total Annonces"
              value={filteredListings.length}
              icon={Home}
              color="from-purple-500 to-purple-600"
              bgColor="bg-purple-50"
              textColor="text-purple-700"
            />
            <MetricCard
              title="Prix Moyen"
              value={filteredListings.length > 0 
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
              value={filteredListings.filter(l => l.isPrivateSeller).length}
              icon={Users}
              color="from-cyan-500 to-cyan-600"
              bgColor="bg-cyan-50"
              textColor="text-cyan-700"
            />
            <MetricCard
              title="Professionnels"
              value={filteredListings.filter(l => !l.isPrivateSeller).length}
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
              </ModernCard>
            </motion.div>
          </motion.div>

          {/* Top Villes */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Top 5 Villes"
              icon={<MapPin className="h-5 w-5 text-emerald-600" />}
            >
              <div className="space-y-4">
                {cityData.map((item, index) => (
                  <div key={item.city} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-500">#{index + 1}</span>
                      <span className="font-medium text-slate-800">{item.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600">{item.count} annonce{item.count > 1 ? 's' : ''}</span>
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(item.count / Math.max(...cityData.map(c => c.count))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ModernCard>
          </motion.div>

          {/* Liste des annonces */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Annonces Immobilières"
              icon={<Target className="h-5 w-5 text-cyan-600" />}
            >
              {filteredListings.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-lg font-medium">
                    {listings.length === 0 ? "Aucune annonce trouvée" : "Aucune annonce ne correspond aux filtres"}
                  </p>
                  <Button 
                    onClick={loadScrapingData} 
                    className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {listings.length === 0 ? "Lancer le scraping" : "Réinitialiser les filtres"}
                  </Button>
                </div>
              ) : (
                <motion.div 
                  className="space-y-4"
                  variants={staggerChildren}
                >
                  {filteredListings.map((listing, index) => (
                    <motion.div key={index} variants={fadeInUp}>
                      <ModernCard className="p-6 flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
                              {listing.title}
                            </h3>
                            <span className="font-bold text-purple-600 text-2xl">
                              {listing.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <p className="text-sm text-slate-600 flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              {listing.city} ({listing.postalCode})
                            </p>
                            <p className="text-sm text-slate-600 flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-slate-400" />
                              {listing.surface && `${listing.surface} m²`} {listing.rooms && `• ${listing.rooms} pièces`}
                            </p>
                            
                            <div className="flex flex-wrap gap-2">
                              <Badge variant={listing.isPrivateSeller ? "default" : "secondary"} className="bg-blue-100 text-blue-700 border-blue-200">
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
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 bg-white rounded-lg shadow-xl">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl font-bold text-slate-900">{listing.title}</DialogTitle>
                                </DialogHeader>
                                
                                <div className="space-y-6 mt-4">
                                  {/* Prix et badges */}
                                  <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="text-4xl font-bold text-purple-600">
                                      {listing.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                      <Badge variant={listing.isPrivateSeller ? "default" : "secondary"} className="bg-blue-100 text-blue-700 border-blue-200">
                                        {listing.isPrivateSeller ? "Particulier" : "Professionnel"}
                                      </Badge>
                                      <Badge variant="outline" className="border-slate-200 text-slate-600">{listing.source}</Badge>
                                      <Badge variant="outline" className="border-slate-200 text-slate-600">{listing.type}</Badge>
                                    </div>
                                  </div>

                                  {/* Informations détaillées */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <h3 className="text-xl font-semibold text-slate-800">Informations</h3>
                                      <div className="space-y-3 text-slate-700">
                                        <div className="flex items-center gap-2">
                                          <MapPin className="h-4 w-4 text-purple-500" />
                                          <span className="font-medium">Localisation :</span>
                                          <span>{listing.city} ({listing.postalCode})</span>
                                        </div>
                                        {listing.surface && (
                                          <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-blue-500" />
                                            <span className="font-medium">Surface :</span>
                                            <span>{listing.surface} m²</span>
                                          </div>
                                        )}
                                        {listing.rooms && (
                                          <div className="flex items-center gap-2">
                                            <Home className="h-4 w-4 text-emerald-500" />
                                            <span className="font-medium">Pièces :</span>
                                            <span>{listing.rooms} pièces</span>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                          <Calendar className="h-4 w-4 text-cyan-500" />
                                          <span className="font-medium">Publié le :</span>
                                          <span>{new Date(listing.publishedAt).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <h3 className="text-xl font-semibold text-slate-800">Description</h3>
                                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-inner">
                                        {listing.description ? (
                                          <p className="text-slate-700 leading-relaxed">{listing.description}</p>
                                        ) : (
                                          <p className="text-slate-500 italic">Aucune description disponible</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 mt-6">
                                    <Button asChild className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                                      <a 
                                        href={listing.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 justify-center"
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
                            
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(listing.publishedAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </ModernCard>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </ModernCard>
          </motion.div>
        </div>
      </main>
    </PageContainer>
  )
}