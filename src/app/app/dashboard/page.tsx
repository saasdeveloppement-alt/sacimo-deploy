"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { RefreshCw, Building2, TrendingUp, Users, Search, Filter, Download, Eye, MapPin, Calendar, ExternalLink, Image as ImageIcon } from "lucide-react"

export default function DashboardPage() {
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [priceFilter, setPriceFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sellerFilter, setSellerFilter] = useState("all")
  const [selectedListing, setSelectedListing] = useState(null)

  const loadScrapingData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchId: 'test-search' })
      })
      const data = await response.json()
      
      if (data.success) {
        const newListings = data.data.results[0]?.listings || []
        setListings(newListings)
      }
    } catch (error) {
      console.error('Erreur:', error)
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
    { name: "Appartements", value: filteredListings.filter(l => l.type === 'APARTMENT').length, color: "#3B82F6" },
    { name: "Maisons", value: filteredListings.filter(l => l.type === 'HOUSE').length, color: "#10B981" },
    { name: "Studios", value: filteredListings.filter(l => l.type === 'STUDIO').length, color: "#F59E0B" },
    { name: "Autres", value: filteredListings.filter(l => !['APARTMENT', 'HOUSE', 'STUDIO'].includes(l.type)).length, color: "#8B5CF6" }
  ].filter(item => item.value > 0)

  const cityDistribution = filteredListings.reduce((acc, listing) => {
    const city = listing.city
    acc[city] = (acc[city] || 0) + 1
    return acc
  }, {})

  const cityData = Object.entries(cityDistribution).map(([city, count]) => ({
    city,
    count
  })).sort((a, b) => b.count - a.count).slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard SACIMO - Test</h1>
              <p className="text-gray-600">Système de veille immobilière automatisée</p>
              <p className="text-sm text-blue-600">🚀 Test de déploiement réussi !</p>
            </div>
            <Button 
              onClick={loadScrapingData} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Chargement...' : 'Actualiser'}
            </Button>
          </div>
        </div>
      </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres et Recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Recherche</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par titre ou ville..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Prix</label>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger>
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
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
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
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Vendeur</label>
                <Select value={sellerFilter} onValueChange={setSellerFilter}>
                  <SelectTrigger>
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
            
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredListings.length} annonce{filteredListings.length > 1 ? 's' : ''} trouvée{filteredListings.length > 1 ? 's' : ''}
              </p>
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
                >
                  Réinitialiser
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Annonces</p>
                  <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Prix Moyen</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {listings.length > 0 
                      ? Math.round(listings.reduce((sum, listing) => sum + listing.price, 0) / listings.length).toLocaleString('fr-FR') + '€'
                      : '0€'
                    }
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Particuliers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {listings.filter(l => l.isPrivateSeller).length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Professionnels</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {listings.filter(l => !l.isPrivateSeller).length}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Prix</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition par Type</CardTitle>
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Villes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top 5 Villes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cityData.map((item, index) => (
                <div key={item.city} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="font-medium">{item.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.count} annonce{item.count > 1 ? 's' : ''}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(item.count / Math.max(...cityData.map(c => c.count))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Liste des annonces */}
        <Card>
          <CardHeader>
            <CardTitle>Annonces Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredListings.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {listings.length === 0 ? "Aucune annonce trouvée" : "Aucune annonce ne correspond aux filtres"}
                </p>
                <Button onClick={loadScrapingData} className="mt-4">
                  {listings.length === 0 ? "Lancer le scraping" : "Réinitialiser les filtres"}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing, index) => (
                  <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {listing.title}
                      </h3>
                      <span className="text-2xl font-bold text-blue-600">
                        {listing.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        {listing.city} ({listing.postalCode})
                      </p>
                      <p className="text-sm text-gray-600">
                        {listing.surface && `${listing.surface} m²`} {listing.rooms && `• ${listing.rooms} pièces`}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={listing.isPrivateSeller ? "default" : "secondary"}>
                          {listing.isPrivateSeller ? "Particulier" : "Professionnel"}
                        </Badge>
                        <Badge variant="outline">
                          {listing.source}
                        </Badge>
                        <Badge variant="outline">
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
                            className="flex items-center gap-1"
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
                              <div className="text-3xl font-bold text-blue-600">
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
                                    <div key={photoIndex} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
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
                                  <div className="col-span-2 md:col-span-3 aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                    <div className="text-center text-gray-500">
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
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">Localisation :</span>
                                    <span>{listing.city} ({listing.postalCode})</span>
                                  </div>
                                  {listing.surface && (
                                    <div className="flex items-center gap-2">
                                      <Building2 className="h-4 w-4 text-gray-500" />
                                      <span className="font-medium">Surface :</span>
                                      <span>{listing.surface} m²</span>
                                    </div>
                                  )}
                                  {listing.rooms && (
                                    <div className="flex items-center gap-2">
                                      <Building2 className="h-4 w-4 text-gray-500" />
                                      <span className="font-medium">Pièces :</span>
                                      <span>{listing.rooms} pièces</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">Publié le :</span>
                                    <span>{new Date(listing.publishedAt).toLocaleDateString('fr-FR')}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Description</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  {listing.description ? (
                                    <p className="text-gray-700 leading-relaxed">{listing.description}</p>
                                  ) : (
                                    <p className="text-gray-500 italic">Aucune description disponible</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t">
                              <Button asChild className="flex-1">
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
                              <Button variant="outline" className="flex-1">
                                <Download className="h-4 w-4 mr-2" />
                                Sauvegarder
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <span className="text-xs text-gray-500">
                        {new Date(listing.publishedAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}