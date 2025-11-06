"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import PageContainer, { fadeInUp, staggerChildren } from "@/components/ui/PageContainer"
import SectionHeader from "@/components/ui/SectionHeader"
import ModernCard from "@/components/ui/ModernCard"
import MetricCard from "@/components/ui/MetricCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { 
  Search, 
  Filter, 
  Building2, 
  TrendingUp, 
  Users, 
  MapPin, 
  Calendar,
  Eye,
  ExternalLink,
  Target,
  Zap,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  BarChart3
} from "lucide-react"
import { motion } from "framer-motion"
import AdvancedFilters from "@/components/filters/AdvancedFilters"
import { AdvancedFilters as AdvancedFiltersType, initialFilters } from "@/hooks/useAdvancedFilters"
import { Separator } from "@/components/ui/separator"
import { showSuccess, showError, showInfo, showLoading, dismissToast } from "@/lib/toast"
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  BarChart, 
  Bar, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  ResponsiveContainer 
} from "recharts"

interface Competitor {
  id: string
  name: string
  location: string
  listingsCount: number
  avgPrice: number
  lastUpdate: Date
  status: 'active' | 'inactive' | 'monitoring'
  website: string
  specialties: string[]
  marketShare: number
  zone?: string
  listings?: number
  rank?: number
  isGrowing?: boolean
  lastSeen?: string
}

export default function ConcurrentsPage() {
  const router = useRouter()
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("listings")
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersType>(initialFilters)
  const [selectedZone, setSelectedZone] = useState("75001")

  // Données de démonstration
  useEffect(() => {
    const mockCompetitors: Competitor[] = [
      {
        id: '1',
        name: 'Century 21 Paris 1er',
        location: 'Paris 1er, 2e, 3e',
        listingsCount: 45,
        avgPrice: 520000,
        lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'active',
        website: 'https://century21.fr',
        specialties: ['Luxe', 'Centre-ville'],
        marketShare: 18.2,
        zone: 'Paris 1er, 2e, 3e',
        listings: 45,
        rank: 1,
        isGrowing: true,
        lastSeen: 'Il y a 2h'
      },
      {
        id: '2',
        name: 'Orpi Centre Paris',
        location: 'Paris 4e, 5e, 6e',
        listingsCount: 38,
        avgPrice: 485000,
        lastUpdate: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'active',
        website: 'https://orpi.fr',
        specialties: ['Familial', 'Rénovation'],
        marketShare: 15.4,
        zone: 'Paris 4e, 5e, 6e',
        listings: 38,
        rank: 2,
        isGrowing: true,
        lastSeen: 'Il y a 4h'
      },
      {
        id: '3',
        name: 'Guy Hoquet',
        location: 'Paris 7e, 8e, 9e',
        listingsCount: 32,
        avgPrice: 510000,
        lastUpdate: new Date(Date.now() - 6 * 60 * 60 * 1000),
        status: 'active',
        website: 'https://guyhoquet.fr',
        specialties: ['Commercial', 'Bureaux'],
        marketShare: 13.0,
        zone: 'Paris 7e, 8e, 9e',
        listings: 32,
        rank: 3,
        isGrowing: false,
        lastSeen: 'Il y a 6h'
      },
      {
        id: '4',
        name: 'Foncia',
        location: 'Paris 10e, 11e',
        listingsCount: 28,
        avgPrice: 495000,
        lastUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'active',
        website: 'https://foncia.fr',
        specialties: ['Appartements', 'Studios'],
        marketShare: 11.3,
        zone: 'Paris 10e, 11e',
        listings: 28,
        rank: 4,
        isGrowing: false,
        lastSeen: 'Il y a 1j'
      }
    ]
    setCompetitors(mockCompetitors)
  }, [])

  const filteredCompetitors = competitors.filter(competitor => {
    const matchesSearch = competitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         competitor.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || competitor.status === statusFilter
    
    // Filtres avancés
    const matchesCities = advancedFilters.cities.length === 0 || 
      advancedFilters.cities.some(city => 
        competitor.location.toLowerCase().includes(city.toLowerCase())
      )
    
    const matchesPrice = (!advancedFilters.minPrice || competitor.avgPrice >= parseInt(advancedFilters.minPrice)) &&
      (!advancedFilters.maxPrice || competitor.avgPrice <= parseInt(advancedFilters.maxPrice))
    
    return matchesSearch && matchesStatus && matchesCities && matchesPrice
  })

  const sortedCompetitors = [...filteredCompetitors].sort((a, b) => {
    switch (sortBy) {
      case 'listings':
        return b.listingsCount - a.listingsCount
      case 'price':
        return b.avgPrice - a.avgPrice
      case 'marketShare':
        return b.marketShare - a.marketShare
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  const totalListings = competitors.reduce((sum, c) => sum + c.listingsCount, 0)
  const avgMarketPrice = competitors.length > 0 
    ? Math.round(competitors.reduce((sum, c) => sum + c.avgPrice, 0) / competitors.length)
    : 0
  const activeCompetitors = competitors.filter(c => c.status === 'active').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200'
      case 'monitoring': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'inactive': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif'
      case 'monitoring': return 'Surveillance'
      case 'inactive': return 'Inactif'
      default: return 'Inconnu'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="h-4 w-4" />
      case 'monitoring': return <Eye className="h-4 w-4" />
      case 'inactive': return <AlertCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const handleRefresh = () => {
    console.log("🔄 Actualisation des données pour la zone:", selectedZone)
    const loadingToast = showLoading("Actualisation des données...")
    // TODO: Implémenter l'actualisation des données
    setTimeout(() => {
      dismissToast(loadingToast)
      showSuccess(`✅ Données actualisées pour la zone ${selectedZone}`)
    }, 1000)
  }

  const handleViewAnnonces = (agencyName: string) => {
    showInfo(`🏢 Affichage des annonces de ${agencyName}`)
    router.push(`/app/annonces?agency=${encodeURIComponent(agencyName)}`)
  }

  // Données mock pour le top 5 agences
  const topAgencies = [
    { rank: 1, name: "Century 21 Paris 1er", annonces: 45, prixMoyen: 520000, partMarche: 18.2 },
    { rank: 2, name: "Orpi Centre Paris", annonces: 38, prixMoyen: 485000, partMarche: 15.4 },
    { rank: 3, name: "Guy Hoquet", annonces: 32, prixMoyen: 510000, partMarche: 13.0 },
    { rank: 4, name: "Foncia", annonces: 28, prixMoyen: 495000, partMarche: 11.3 },
    { rank: 5, name: "Laforêt", annonces: 24, prixMoyen: 505000, partMarche: 9.7 }
  ]

  // Données mock pour les graphiques
  const marketShareData = [
    { name: "Century 21", value: 18.2, color: "#8B5CF6" },
    { name: "Orpi", value: 15.4, color: "#3B82F6" },
    { name: "Guy Hoquet", value: 13.0, color: "#06B6D4" },
    { name: "Foncia", value: 11.3, color: "#10B981" },
    { name: "Autres", value: 42.1, color: "#94A3B8" }
  ]

  const annoncesBarData = [
    { name: "Century 21", annonces: 45 },
    { name: "Orpi", annonces: 38 },
    { name: "Guy Hoquet", annonces: 32 },
    { name: "Foncia", annonces: 28 },
    { name: "Laforêt", annonces: 24 }
  ]

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="Suivi concurrents"
        subtitle="Analysez la concurrence et surveillez les agences immobilières"
        icon={<Building2 className="h-8 w-8 text-purple-600" />}
        action={
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="border-slate-200 hover:border-purple-300 hover:text-purple-600"
            >
              <Building2 className="mr-2 h-4 w-4" />
              Ajouter un concurrent
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <Zap className="mr-2 h-4 w-4" />
              Actualiser les données
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Sélecteur de zone */}
          <motion.div variants={fadeInUp}>
            <div className="flex items-center gap-4 mb-6">
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sélectionner une zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="75001">Paris 1er (75001)</SelectItem>
                  <SelectItem value="75002">Paris 2e (75002)</SelectItem>
                  <SelectItem value="75003">Paris 3e (75003)</SelectItem>
                  <SelectItem value="75004">Paris 4e (75004)</SelectItem>
                  <SelectItem value="75005">Paris 5e (75005)</SelectItem>
                  <SelectItem value="75006">Paris 6e (75006)</SelectItem>
                  <SelectItem value="75007">Paris 7e (75007)</SelectItem>
                  <SelectItem value="75008">Paris 8e (75008)</SelectItem>
                  <SelectItem value="75009">Paris 9e (75009)</SelectItem>
                  <SelectItem value="75010">Paris 10e (75010)</SelectItem>
                  <SelectItem value="75011">Paris 11e (75011)</SelectItem>
                  <SelectItem value="75012">Paris 12e (75012)</SelectItem>
                  <SelectItem value="75013">Paris 13e (75013)</SelectItem>
                  <SelectItem value="75014">Paris 14e (75014)</SelectItem>
                  <SelectItem value="75015">Paris 15e (75015)</SelectItem>
                  <SelectItem value="75016">Paris 16e (75016)</SelectItem>
                  <SelectItem value="75017">Paris 17e (75017)</SelectItem>
                  <SelectItem value="75018">Paris 18e (75018)</SelectItem>
                  <SelectItem value="75019">Paris 19e (75019)</SelectItem>
                  <SelectItem value="75020">Paris 20e (75020)</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline">Zone: {selectedZone}</Badge>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </motion.div>

          {/* TOP 5 AGENCES */}
          <motion.div variants={fadeInUp}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🏆 Top 5 Agences - {selectedZone}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rang</TableHead>
                      <TableHead>Agence</TableHead>
                      <TableHead>Annonces</TableHead>
                      <TableHead>Prix moyen</TableHead>
                      <TableHead>Part de marché</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topAgencies.map((agency) => (
                      <TableRow key={agency.rank}>
                        <TableCell>
                          {agency.rank === 1 && "🥇"}
                          {agency.rank === 2 && "🥈"}
                          {agency.rank === 3 && "🥉"}
                          {agency.rank > 3 && agency.rank}
                        </TableCell>
                        <TableCell className="font-semibold">{agency.name}</TableCell>
                        <TableCell>{agency.annonces}</TableCell>
                        <TableCell>{agency.prixMoyen.toLocaleString('fr-FR')}€</TableCell>
                        <TableCell>{agency.partMarche}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>

          {/* Graphiques */}
          <motion.div variants={fadeInUp}>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition des parts de marché</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={marketShareData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {marketShareData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
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

              <Card>
                <CardHeader>
                  <CardTitle>Nombre d'annonces par agence</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={annoncesBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#64748B" />
                      <YAxis stroke="#64748B" />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="annonces" radius={[4, 4, 0, 0]} fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Filtres */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Filtres et Recherche"
              icon={<Filter className="h-5 w-5 text-purple-600" />}
            >
              <div className="space-y-6">
                {/* Recherche texte et statut */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Recherche</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Rechercher par nom ou localisation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Statut</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200">
                        <SelectValue placeholder="Tous les statuts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="monitoring">Surveillance</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                {/* Filtres avancés */}
                <AdvancedFilters
                  onFilterChange={setAdvancedFilters}
                  initialFilters={advancedFilters}
                  availableCities={['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille']}
                />
                
                <Separator />
                
                {/* Tri et actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Trier par</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-48 bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200">
                          <SelectValue placeholder="Trier par" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="listings">Nombre d'annonces</SelectItem>
                          <SelectItem value="price">Prix moyen</SelectItem>
                          <SelectItem value="marketShare">Part de marché</SelectItem>
                          <SelectItem value="name">Nom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                      {filteredCompetitors.length} concurrent{filteredCompetitors.length > 1 ? 's' : ''} surveillé{filteredCompetitors.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("all")
                      setSortBy("listings")
                      setAdvancedFilters(initialFilters)
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
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerChildren}
          >
            <MetricCard
              title="Total Annonces Concurrence"
              value={totalListings}
              icon={Target}
              color="from-purple-500 to-purple-600"
              bgColor="bg-purple-50"
              textColor="text-purple-700"
            />
            <MetricCard
              title="Prix Moyen Marché"
              value={avgMarketPrice.toLocaleString('fr-FR') + '€'}
              icon={TrendingUp}
              color="from-blue-500 to-blue-600"
              bgColor="bg-blue-50"
              textColor="text-blue-700"
            />
            <MetricCard
              title="Agences Actives"
              value={activeCompetitors}
              icon={Building2}
              color="from-cyan-500 to-cyan-600"
              bgColor="bg-cyan-50"
              textColor="text-cyan-700"
            />
          </motion.div>

          {/* Liste des concurrents */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Agences Concurrentes"
              icon={<Building2 className="h-5 w-5 text-emerald-600" />}
            >
              {sortedCompetitors.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    Aucun concurrent trouvé
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Ajustez vos filtres pour voir les agences concurrentes
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedCompetitors.map((competitor, index) => (
                    <motion.div
                      key={competitor.id}
                      variants={fadeInUp}
                      whileHover={{ y: -4, scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow h-full">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <Building2 className="h-5 w-5 text-purple-600" />
                              {competitor.name}
                            </CardTitle>
                            <Badge variant={competitor.rank === 1 ? "default" : "outline"} className={competitor.rank === 1 ? "bg-purple-600" : ""}>
                              {competitor.rank === 1 ? "🏆 Leader" : competitor.isGrowing ? "📈 En croissance" : "Actif"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Métriques principales */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-sm text-slate-500">Annonces actives</p>
                              <p className="text-2xl font-bold text-slate-900">{competitor.listings || competitor.listingsCount}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-slate-500">Part de marché</p>
                              <p className="text-2xl font-bold text-purple-600">{competitor.marketShare}%</p>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          {/* Infos détaillées */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              <span className="text-sm text-slate-600">{competitor.zone || competitor.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-slate-400" />
                              <span className="text-sm text-slate-600">Prix moyen : {competitor.avgPrice.toLocaleString('fr-FR')}€</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              <span className="text-sm text-slate-600">Dernière MAJ : {competitor.lastSeen || competitor.lastUpdate.toLocaleString('fr-FR', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}</span>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          {/* Boutons d'action */}
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                              onClick={() => handleViewAnnonces(competitor.name)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Voir les {competitor.listings || competitor.listingsCount} annonces
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-slate-200 hover:border-purple-300 hover:text-purple-600"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
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
