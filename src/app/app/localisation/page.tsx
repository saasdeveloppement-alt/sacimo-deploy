"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  BarChart3
} from "lucide-react"

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
  const [priceFilter, setPriceFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [confidenceFilter, setConfidenceFilter] = useState("all")
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
    
    const matchesPrice = priceFilter === "all" || 
      (priceFilter === "low" && listing.price < 300000) ||
      (priceFilter === "medium" && listing.price >= 300000 && listing.price < 600000) ||
      (priceFilter === "high" && listing.price >= 600000)
    
    const matchesType = typeFilter === "all" || listing.type === typeFilter
    
    const matchesConfidence = confidenceFilter === "all" || 
      (confidenceFilter === "high" && (listing.confidenceScore || 0) >= 80) ||
      (confidenceFilter === "medium" && (listing.confidenceScore || 0) >= 60 && (listing.confidenceScore || 0) < 80) ||
      (confidenceFilter === "low" && (listing.confidenceScore || 0) < 60)
    
    return matchesSearch && matchesPrice && matchesType && matchesConfidence
  })

  // Données pour les graphiques
  const estimationAccuracy = [
    { range: "Très précis (±5%)", count: filteredListings.filter(l => (l.confidenceScore || 0) >= 90).length },
    { range: "Précis (±10%)", count: filteredListings.filter(l => (l.confidenceScore || 0) >= 70 && (l.confidenceScore || 0) < 90).length },
    { range: "Moyen (±20%)", count: filteredListings.filter(l => (l.confidenceScore || 0) >= 50 && (l.confidenceScore || 0) < 70).length },
    { range: "Faible (>20%)", count: filteredListings.filter(l => (l.confidenceScore || 0) < 50).length }
  ]

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
              <h1 className="text-2xl font-bold text-gray-900">Localisation & Estimation</h1>
              <p className="text-gray-600">
                {filteredListings.length} bien{filteredListings.length > 1 ? 's' : ''} localisé{filteredListings.length > 1 ? 's' : ''} avec estimation
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={loadScrapingData} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? <Target className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
                Actualiser
              </Button>
            </div>
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
                <label className="text-sm font-medium text-gray-700 mb-2 block">Précision</label>
                <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                  <SelectTrigger>
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
            
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredListings.length} bien{filteredListings.length > 1 ? 's' : ''} trouvé{filteredListings.length > 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setPriceFilter("all")
                    setTypeFilter("all")
                    setConfidenceFilter("all")
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
                  <p className="text-sm font-medium text-gray-600">Biens localisés</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredListings.length}</p>
                </div>
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Précision moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredListings.length > 0 
                      ? Math.round(filteredListings.reduce((sum, l) => sum + (l.confidenceScore || 0), 0) / filteredListings.length)
                      : 0}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Estimation moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredListings.length > 0 
                      ? Math.round(filteredListings.reduce((sum, l) => sum + (l.estimatedValue || l.price), 0) / filteredListings.length).toLocaleString('fr-FR')
                      : 0}€
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Villes couvertes</p>
                  <p className="text-2xl font-bold text-gray-900">{cityData.length}</p>
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
              <CardTitle>Précision des Estimations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {estimationAccuracy.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.range}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.count}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            index === 0 ? 'bg-green-500' :
                            index === 1 ? 'bg-blue-500' :
                            index === 2 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(item.count / Math.max(...estimationAccuracy.map(e => e.count))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Villes Localisées</CardTitle>
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
                      <span className="text-sm font-medium">{item.count} bien{item.count > 1 ? 's' : ''}</span>
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
        </div>

        {/* Carte placeholder */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Carte Interactive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Map className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Carte interactive</p>
                <p className="text-sm">Intégration carte à venir</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des biens avec estimations */}
        <Card>
          <CardHeader>
            <CardTitle>Biens Localisés avec Estimations</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredListings.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun bien localisé trouvé</p>
                <Button onClick={loadScrapingData} className="mt-4">
                  Lancer la localisation
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredListings.map((listing, index) => (
                  <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Prix annoncé</p>
                            <p className="text-xl font-bold text-blue-600">
                              {listing.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Estimation IA</p>
                            <p className="text-xl font-bold text-green-600">
                              {(listing.estimatedValue || listing.price).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Précision</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xl font-bold text-purple-600">
                                {listing.confidenceScore || 0}%
                              </p>
                              <Badge 
                                variant={
                                  (listing.confidenceScore || 0) >= 80 ? "default" :
                                  (listing.confidenceScore || 0) >= 60 ? "secondary" : "destructive"
                                }
                              >
                                {(listing.confidenceScore || 0) >= 80 ? "Très précis" :
                                 (listing.confidenceScore || 0) >= 60 ? "Précis" : "Faible"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{listing.city} ({listing.postalCode})</span>
                          <span>{listing.surface && `${listing.surface} m²`}</span>
                          <span>{listing.rooms && `${listing.rooms} pièces`}</span>
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
                              className="flex items-center gap-1"
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
                              <div className="bg-blue-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4">Estimation Automatique</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <p className="text-sm text-gray-600">Prix annoncé</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                      {listing.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Estimation IA</p>
                                    <p className="text-2xl font-bold text-green-600">
                                      {(listing.estimatedValue || listing.price).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Score de confiance</span>
                                    <span className="text-sm font-medium">{listing.confidenceScore || 0}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        (listing.confidenceScore || 0) >= 80 ? 'bg-green-500' :
                                        (listing.confidenceScore || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${listing.confidenceScore || 0}%` }}
                                    ></div>
                                  </div>
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
                      </div>
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
