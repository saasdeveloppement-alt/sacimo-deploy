"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Plus, 
  Search, 
  Eye, 
  TrendingUp,
  TrendingDown,
  Building2,
  MapPin,
  Calendar,
  Euro,
  BarChart3,
  Users,
  Target,
  AlertCircle
} from "lucide-react"
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

const mockCompetitors = [
  {
    id: "1",
    name: "Century21 Paris 15e",
    zone: "Paris 15e",
    lastSeenAt: "2024-01-15T14:30:00Z",
    listingsCount: 12,
    avgPricePerM2: 8500,
    priceEvolution: "+3.2%",
    types: {
      "Appartements": 8,
      "Maisons": 3,
      "Studios": 1
    },
    weeklyVolume: 5,
    isActive: true
  },
  {
    id: "2",
    name: "Orpi Boulogne",
    zone: "Boulogne-Billancourt",
    lastSeenAt: "2024-01-15T12:15:00Z",
    listingsCount: 8,
    avgPricePerM2: 7200,
    priceEvolution: "-1.5%",
    types: {
      "Appartements": 5,
      "Maisons": 2,
      "Studios": 1
    },
    weeklyVolume: 3,
    isActive: true
  },
  {
    id: "3",
    name: "Guy Hoquet Paris 11e",
    zone: "Paris 11e",
    lastSeenAt: "2024-01-14T16:45:00Z",
    listingsCount: 15,
    avgPricePerM2: 9200,
    priceEvolution: "+5.1%",
    types: {
      "Appartements": 10,
      "Studios": 4,
      "Lofts": 1
    },
    weeklyVolume: 7,
    isActive: true
  },
  {
    id: "4",
    name: "Immonot Paris Centre",
    zone: "Paris 1er-4e",
    lastSeenAt: "2024-01-13T09:20:00Z",
    listingsCount: 6,
    avgPricePerM2: 12500,
    priceEvolution: "+2.8%",
    types: {
      "Appartements": 4,
      "Studios": 2
    },
    weeklyVolume: 2,
    isActive: false
  }
]

const weeklyData = [
  { name: "Lun", count: 8 },
  { name: "Mar", count: 12 },
  { name: "Mer", count: 15 },
  { name: "Jeu", count: 18 },
  { name: "Ven", count: 22 },
  { name: "Sam", count: 16 },
  { name: "Dim", count: 9 }
]

const typeDistribution = [
  { name: "Appartements", value: 65, color: "#3B82F6" },
  { name: "Maisons", value: 20, color: "#10B981" },
  { name: "Studios", value: 12, color: "#F59E0B" },
  { name: "Lofts", value: 3, color: "#EF4444" }
]

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState(mockCompetitors)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  const filteredCompetitors = competitors.filter(competitor =>
    competitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    competitor.zone.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalListings = competitors.reduce((sum, c) => sum + c.listingsCount, 0)
  const activeCompetitors = competitors.filter(c => c.isActive).length
  const avgPricePerM2 = Math.round(
    competitors.reduce((sum, c) => sum + c.avgPricePerM2, 0) / competitors.length
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Veille concurrentielle</h1>
          <p className="text-gray-600">Surveillez l'activité de vos concurrents</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} data-magnetic data-cursor="Add">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un concurrent
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concurrents actifs</p>
                <p className="text-2xl font-bold text-gray-900">{activeCompetitors}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total annonces</p>
                <p className="text-2xl font-bold text-gray-900">{totalListings}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prix moyen/m²</p>
                <p className="text-2xl font-bold text-gray-900">{avgPricePerM2}€</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Euro className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Volume hebdo</p>
                <p className="text-2xl font-bold text-gray-900">
                  {competitors.reduce((sum, c) => sum + c.weeklyVolume, 0)}
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activité hebdomadaire</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un concurrent..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Target className="w-4 h-4 mr-2" />
              Filtrer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Competitors Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredCompetitors.length} concurrent{filteredCompetitors.length > 1 ? 's' : ''} surveillé{filteredCompetitors.length > 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agence</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Dernière activité</TableHead>
                  <TableHead>Annonces</TableHead>
                  <TableHead>Prix/m²</TableHead>
                  <TableHead>Évolution</TableHead>
                  <TableHead>Volume hebdo</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompetitors.map((competitor, index) => (
                  <motion.tr
                    key={competitor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{competitor.name}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-3 h-3 mr-1" />
                            {competitor.zone}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{competitor.zone}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(competitor.lastSeenAt).toLocaleDateString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900">{competitor.listingsCount}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900">
                        {competitor.avgPricePerM2.toLocaleString()}€
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {competitor.priceEvolution.startsWith('+') ? (
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          competitor.priceEvolution.startsWith('+') 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {competitor.priceEvolution}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{competitor.weeklyVolume}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={competitor.isActive ? "default" : "secondary"}>
                        {competitor.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Competitor Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Ajouter un concurrent
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Nom de l'agence
                </label>
                <Input placeholder="ex: Century21 Paris 15e" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Zone d'activité
                </label>
                <Input placeholder="ex: Paris 15e" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Site web (optionnel)
                </label>
                <Input placeholder="https://..." />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
              >
                Annuler
              </Button>
              <Button data-magnetic data-cursor="Add">
                Ajouter
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
