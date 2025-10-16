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
  ArrowDownRight
} from "lucide-react"

// Données factices pour les 24 dernières heures
const hourlyData = [
  { hour: "00h", count: 2 },
  { hour: "02h", count: 1 },
  { hour: "04h", count: 0 },
  { hour: "06h", count: 3 },
  { hour: "08h", count: 8 },
  { hour: "10h", count: 12 },
  { hour: "12h", count: 15 },
  { hour: "14h", count: 18 },
  { hour: "16h", count: 22 },
  { hour: "18h", count: 19 },
  { hour: "20h", count: 14 },
  { hour: "22h", count: 7 },
]

const topPostalCodes = [
  { code: "75015", count: 12, change: "+15%" },
  { code: "75011", count: 8, change: "+8%" },
  { code: "75020", count: 7, change: "-3%" },
  { code: "75012", count: 6, change: "+12%" },
  { code: "75013", count: 5, change: "+5%" },
]

const typeDistribution = [
  { name: "Appartements", value: 45, color: "#3B82F6" },
  { name: "Maisons", value: 25, color: "#10B981" },
  { name: "Studios", value: 15, color: "#F59E0B" },
  { name: "Lofts", value: 10, color: "#EF4444" },
  { name: "Autres", value: 5, color: "#8B5CF6" },
]

const recentListings = [
  {
    id: "1",
    title: "Appartement 3 pièces",
    price: 450000,
    surface: 75,
    rooms: 3,
    city: "Paris 15e",
    postalCode: "75015",
    type: "Particulier",
    publishedAt: "2024-01-15T10:30:00Z",
    source: "LeBonCoin",
    photo: "/placeholder.jpg",
    isNew: true
  },
  {
    id: "2", 
    title: "Maison 4 pièces avec jardin",
    price: 680000,
    surface: 120,
    rooms: 4,
    city: "Boulogne-Billancourt",
    postalCode: "92100",
    type: "Professionnel",
    publishedAt: "2024-01-15T09:15:00Z",
    source: "SeLoger",
    photo: "/placeholder.jpg",
    isNew: true
  },
  {
    id: "3",
    title: "Studio meublé",
    price: 280000,
    surface: 25,
    rooms: 1,
    city: "Paris 11e",
    postalCode: "75011",
    type: "Particulier",
    publishedAt: "2024-01-15T08:45:00Z",
    source: "PAP",
    photo: "/placeholder.jpg",
    isNew: false
  },
  {
    id: "4",
    title: "Loft 2 pièces",
    price: 520000,
    surface: 65,
    rooms: 2,
    city: "Paris 20e",
    postalCode: "75020",
    type: "Professionnel",
    publishedAt: "2024-01-15T07:20:00Z",
    source: "Orpi",
    photo: "/placeholder.jpg",
    isNew: true
  },
  {
    id: "5",
    title: "Appartement 5 pièces",
    price: 890000,
    surface: 140,
    rooms: 5,
    city: "Paris 12e",
    postalCode: "75012",
    type: "Particulier",
    publishedAt: "2024-01-15T06:30:00Z",
    source: "Century21",
    photo: "/placeholder.jpg",
    isNew: false
  }
]

const stats = [
  {
    title: "Nouvelles annonces",
    value: "47",
    change: "+12%",
    changeType: "positive" as const,
    icon: TrendingUp
  },
  {
    title: "Particuliers",
    value: "32",
    change: "+8%",
    changeType: "positive" as const,
    icon: Users
  },
  {
    title: "Professionnels",
    value: "15",
    change: "+25%",
    changeType: "positive" as const,
    icon: Building2
  },
  {
    title: "Prix moyen",
    value: "485k€",
    change: "-2%",
    changeType: "negative" as const,
    icon: TrendingDown
  }
]

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("24h")
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Vérifier si c'est la première visite
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('sacimo-onboarding-completed')
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  const handleOnboardingComplete = () => {
    localStorage.setItem('sacimo-onboarding-completed', 'true')
    setShowOnboarding(false)
  }

  return (
    <>
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Vue d'ensemble de vos annonces immobilières</p>
        </div>
        <div className="flex items-center space-x-4">
          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <TabsList>
              <TabsTrigger value="24h">24h</TabsTrigger>
              <TabsTrigger value="48h">48h</TabsTrigger>
              <TabsTrigger value="7j">7j</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" data-magnetic data-cursor="Download">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.changeType === "positive" ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs hier</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Annonces par heure (24h)</CardTitle>
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

        {/* Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par type de bien</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {typeDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Postal Codes */}
      <Card>
        <CardHeader>
          <CardTitle>Top codes postaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPostalCodes.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.code}</p>
                    <p className="text-sm text-gray-500">{item.count} annonces</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`text-sm font-medium ${
                    item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Particuliers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-600" />
              Particuliers (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentListings
                .filter(listing => listing.type === "Particulier")
                .map((listing) => (
                  <div key={listing.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {listing.title}
                        </h3>
                        {listing.isNew && (
                          <Badge variant="secondary" className="ml-2">
                            Nouveau
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {listing.surface}m² • {listing.rooms} pièces • {listing.city}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {listing.price.toLocaleString()}€
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(listing.publishedAt).toLocaleString('fr-FR')}
                        </span>
                        <span className="text-xs text-gray-500">{listing.source}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Professionnels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-purple-600" />
              Professionnels (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentListings
                .filter(listing => listing.type === "Professionnel")
                .map((listing) => (
                  <div key={listing.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {listing.title}
                        </h3>
                        {listing.isNew && (
                          <Badge variant="secondary" className="ml-2">
                            Nouveau
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {listing.surface}m² • {listing.rooms} pièces • {listing.city}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {listing.price.toLocaleString()}€
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(listing.publishedAt).toLocaleString('fr-FR')}
                        </span>
                        <span className="text-xs text-gray-500">{listing.source}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  )
}
