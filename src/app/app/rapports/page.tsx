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
  Line,
  Area,
  AreaChart
} from "recharts"
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  Filter,
  Search,
  Target,
  Users,
  Building2,
  Home,
  Zap,
  FileText,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react"
import { motion } from "framer-motion"

interface ReportData {
  id: string
  title: string
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  period: string
  generatedAt: Date
  status: 'ready' | 'generating' | 'error'
  metrics: {
    totalListings: number
    newListings: number
    avgPrice: number
    topCity: string
    conversionRate: number
  }
}

export default function RapportsPage() {
  const [reports, setReports] = useState<ReportData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedPeriod, setSelectedPeriod] = useState("7d")

  // Données de démonstration
  useEffect(() => {
    const mockReports: ReportData[] = [
      {
        id: '1',
        title: 'Rapport Quotidien - Paris',
        type: 'daily',
        period: '2024-01-15',
        generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'ready',
        metrics: {
          totalListings: 45,
          newListings: 12,
          avgPrice: 650000,
          topCity: 'Paris 1er',
          conversionRate: 8.5
        }
      },
      {
        id: '2',
        title: 'Rapport Hebdomadaire - Lyon',
        type: 'weekly',
        period: '2024-W03',
        generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'ready',
        metrics: {
          totalListings: 128,
          newListings: 35,
          avgPrice: 420000,
          topCity: 'Lyon 2e',
          conversionRate: 12.3
        }
      },
      {
        id: '3',
        title: 'Rapport Mensuel - Global',
        type: 'monthly',
        period: '2024-01',
        generatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'ready',
        metrics: {
          totalListings: 450,
          newListings: 120,
          avgPrice: 520000,
          topCity: 'Paris 1er',
          conversionRate: 15.2
        }
      },
      {
        id: '4',
        title: 'Rapport Personnalisé - Marseille',
        type: 'custom',
        period: '2024-01-10 à 2024-01-17',
        generatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        status: 'generating',
        metrics: {
          totalListings: 0,
          newListings: 0,
          avgPrice: 0,
          topCity: '',
          conversionRate: 0
        }
      }
    ]
    setReports(mockReports)
  }, [])

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.period.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || report.type === typeFilter
    return matchesSearch && matchesType
  })

  const readyReports = reports.filter(r => r.status === 'ready')
  const totalListings = readyReports.reduce((sum, r) => sum + r.metrics.totalListings, 0)
  const totalNewListings = readyReports.reduce((sum, r) => sum + r.metrics.newListings, 0)
  const avgConversionRate = readyReports.length > 0 
    ? Math.round(readyReports.reduce((sum, r) => sum + r.metrics.conversionRate, 0) / readyReports.length * 10) / 10
    : 0

  // Données pour les graphiques
  const dailyData = [
    { day: 'Lun', listings: 12, new: 3 },
    { day: 'Mar', listings: 18, new: 5 },
    { day: 'Mer', listings: 15, new: 4 },
    { day: 'Jeu', listings: 22, new: 7 },
    { day: 'Ven', listings: 28, new: 8 },
    { day: 'Sam', listings: 20, new: 6 },
    { day: 'Dim', listings: 16, new: 4 }
  ]

  const cityDistribution = [
    { name: 'Paris', value: 45, color: '#8B5CF6' },
    { name: 'Lyon', value: 28, color: '#3B82F6' },
    { name: 'Marseille', value: 18, color: '#06B6D4' },
    { name: 'Toulouse', value: 12, color: '#10B981' }
  ]

  const priceTrend = [
    { month: 'Jan', price: 520000, listings: 120 },
    { month: 'Fév', price: 535000, listings: 135 },
    { month: 'Mar', price: 550000, listings: 150 },
    { month: 'Avr', price: 540000, listings: 145 },
    { month: 'Mai', price: 565000, listings: 160 },
    { month: 'Juin', price: 580000, listings: 175 }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-700 border-green-200'
      case 'generating': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'error': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Prêt'
      case 'generating': return 'Génération...'
      case 'error': return 'Erreur'
      default: return 'Inconnu'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'daily': return 'Quotidien'
      case 'weekly': return 'Hebdomadaire'
      case 'monthly': return 'Mensuel'
      case 'custom': return 'Personnalisé'
      default: return 'Inconnu'
    }
  }

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="Rapports"
        subtitle="Analysez vos performances et générez des rapports détaillés"
        icon={<BarChart3 className="h-8 w-8 text-purple-600" />}
        action={
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40 border-slate-200 focus:border-purple-300 focus:ring-purple-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Aujourd'hui</SelectItem>
                <SelectItem value="7d">7 derniers jours</SelectItem>
                <SelectItem value="30d">30 derniers jours</SelectItem>
                <SelectItem value="90d">3 derniers mois</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              className="border-slate-200 hover:border-purple-300 hover:text-purple-600"
            >
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <FileText className="mr-2 h-4 w-4" />
              Nouveau rapport
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Recherche</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Rechercher par titre ou période..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Type de rapport</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200">
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="daily">Quotidien</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                      <SelectItem value="custom">Personnalisé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Actions</label>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSearchTerm("")
                        setTypeFilter("all")
                      }}
                      className="border-slate-200 hover:border-purple-300 hover:text-purple-600"
                    >
                      Réinitialiser
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                  {filteredReports.length} rapport{filteredReports.length > 1 ? 's' : ''} trouvé{filteredReports.length > 1 ? 's' : ''}
                </Badge>
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
              value={totalListings}
              icon={Home}
              color="from-purple-500 to-purple-600"
              bgColor="bg-purple-50"
              textColor="text-purple-700"
            />
            <MetricCard
              title="Nouvelles Annonces"
              value={totalNewListings}
              icon={TrendingUp}
              color="from-blue-500 to-blue-600"
              bgColor="bg-blue-50"
              textColor="text-blue-700"
            />
            <MetricCard
              title="Taux de Conversion"
              value={avgConversionRate + '%'}
              icon={Target}
              color="from-cyan-500 to-cyan-600"
              bgColor="bg-cyan-50"
              textColor="text-cyan-700"
            />
            <MetricCard
              title="Rapports Générés"
              value={readyReports.length}
              icon={FileText}
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
                title="Activité Quotidienne"
                icon={<Activity className="h-5 w-5 text-purple-600" />}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="day" stroke="#64748B" />
                    <YAxis stroke="#64748B" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="listings" 
                      stackId="1" 
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="new" 
                      stackId="2" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ModernCard>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <ModernCard
                title="Répartition par Ville"
                icon={<PieChartIcon className="h-5 w-5 text-blue-600" />}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={cityDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {cityDistribution.map((entry, index) => (
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

          {/* Tendance des prix */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Tendance des Prix"
              icon={<TrendingUp className="h-5 w-5 text-cyan-600" />}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ModernCard>
          </motion.div>

          {/* Liste des rapports */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Rapports Générés"
              icon={<FileText className="h-5 w-5 text-emerald-600" />}
            >
              {filteredReports.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    Aucun rapport trouvé
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Générez votre premier rapport pour commencer l'analyse
                  </p>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    <FileText className="h-4 w-4 mr-2" />
                    Créer un rapport
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReports.map((report, index) => (
                    <motion.div
                      key={report.id}
                      variants={fadeInUp}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-6 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors border border-slate-200/60">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <h3 className="text-lg font-semibold text-slate-900">{report.title}</h3>
                              <Badge className={getStatusColor(report.status)}>
                                {getStatusText(report.status)}
                              </Badge>
                              <Badge variant="outline" className="border-slate-200 text-slate-600">
                                {getTypeText(report.type)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm text-slate-600 mb-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Période :</span>
                                <span>{report.period}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Home className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Total :</span>
                                <span>{report.metrics.totalListings}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Nouvelles :</span>
                                <span>{report.metrics.newListings}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Conversion :</span>
                                <span>{report.metrics.conversionRate}%</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Top ville :</span>
                                <span>{report.metrics.topCity || 'N/A'}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">
                                  Généré le {report.generatedAt.toLocaleString('fr-FR', { 
                                    day: '2-digit', 
                                    month: '2-digit', 
                                    year: 'numeric',
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                              
                              <div className="flex gap-2">
                                {report.status === 'ready' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-slate-200 hover:border-purple-300 hover:text-purple-600"
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Télécharger
                                  </Button>
                                )}
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-slate-200 hover:border-blue-300 hover:text-blue-600"
                                >
                                  <BarChart3 className="h-4 w-4 mr-1" />
                                  Analyser
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-slate-200 hover:border-green-300 hover:text-green-600"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Voir
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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
