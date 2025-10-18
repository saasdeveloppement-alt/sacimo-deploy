"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Building2, TrendingUp, Users } from "lucide-react"

export default function DashboardPage() {
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(false)

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

        {/* Liste des annonces */}
        <Card>
          <CardHeader>
            <CardTitle>Annonces Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {listings.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune annonce trouvée</p>
                <Button onClick={loadScrapingData} className="mt-4">
                  Lancer le scraping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map((listing, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{listing.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {listing.city} {listing.postalCode} • {listing.surface}m² • {listing.rooms} pièces
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-lg font-bold text-blue-600">
                            {listing.price.toLocaleString('fr-FR')}€
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            listing.isPrivateSeller 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {listing.isPrivateSeller ? 'Particulier' : 'Professionnel'}
                          </span>
                          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                            {listing.source}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}