"use client"

import { useState, useEffect } from "react"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  MapPin, 
  Calendar,
  Download,
  Eye,
  Phone,
  Mail,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from "lucide-react"

interface Listing {
  source: string
  isPrivateSeller: boolean
  title: string
  price: number
  type: string
  surface?: number
  rooms?: number
  photos: string[]
  city: string
  postalCode: string
  publishedAt: string
  url: string
  description?: string
}

export default function DashboardPage() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastScraping, setLastScraping] = useState<Date | null>(null)

  // Charger les données de scraping
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
        setLastScraping(new Date())
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadScrapingData()
  }, [])

  // Calculer les statistiques
  const totalListings = listings.length
  const averagePrice = listings.length > 0 
    ? Math.round(listings.reduce((sum, listing) => sum + listing.price, 0) / listings.length)
    : 0
  const privateSellers = listings.filter(l => l.isPrivateSeller).length
  const professionalSellers = listings.filter(l => !l.isPrivateSeller).length

  // Données pour les graphiques
  const hourlyData = [
    { hour: "00h", count: 0 },
    { hour: "02h", count: 0 },
    { hour: "04h", count: 0 },
    { hour: "06h", count: 0 },
    { hour: "08h", count: 0 },
    { hour: "10h", count: 0 },
    { hour: "12h", count: 0 },
    { hour: "14h", count: 0 },
    { hour: "16h", count: 0 },
    { hour: "18h", count: 0 },
    { hour: "20h", count: 0 },
    { hour: "22h", count: totalListings }
  ]

  const typeDistribution = [
    { name: "Appartements", value: listings.filter(l => l.type === 'APARTMENT').length, color: "#3B82F6" },
    { name: "Maisons", value: listings.filter(l => l.type === 'HOUSE').length, color: "#10B981" },
    { name: "Studios", value: listings.filter(l => l.type === 'STUDIO').length, color: "#F59E0B" },
    { name: "Autres", value: listings.filter(l => !['APARTMENT', 'HOUSE', 'STUDIO'].includes(l.type)).length, color: "#8B5CF6" },
  ].filter(item => item.value > 0)

  const topPostalCodes = listings
    .reduce((acc, listing) => {
      const existing = acc.find(item => item.code === listing.postalCode)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ code: listing.postalCode, count: 1, change: "+0%" })
      }
      return acc
    }, [] as { code: string; count: number; change: string }[])
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  if (!isOnboardingComplete) {
    return <OnboardingWizard onComplete={() => setIsOnboardingComplete(true)} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard SACIMO - Test</h1>
              <p className="text-gray-600">
                {lastScraping 
                  ? `Dernière mise à jour: ${lastScraping.toLocaleString('fr-FR')}`
                  : 'Aucune donnée disponible'
                }
              </p>
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
                  <p className="text-2xl font-bold text-gray-900">{totalListings}</p>
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
                    {averagePrice.toLocaleString('fr-FR')}€
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
                  <p className="text-2xl font-bold text-gray-900">{privateSellers}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{professionalSellers}</p>
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
              <CardTitle>Activité par heure</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition par type</CardTitle>
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

        {/* Top codes postaux */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top Codes Postaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPostalCodes.map((item, index) => (
                <div key={item.code} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="font-medium">{item.code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.count} annonces</span>
                    <Badge variant="secondary">{item.change}</Badge>
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
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
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
                          <Badge variant={listing.isPrivateSeller ? "default" : "secondary"}>
                            {listing.isPrivateSeller ? "Particulier" : "Professionnel"}
                          </Badge>
                          <Badge variant="outline">{listing.source}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}