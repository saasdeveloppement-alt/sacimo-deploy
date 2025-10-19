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
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react"
import { motion } from "framer-motion"

interface ReportData {
  id: string
  title: string
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  period: string
  status: 'ready' | 'generating' | 'failed'
  createdAt: Date
  data: {
    totalListings: number
    avgPrice: number
    newClients: number
    marketShare: number
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
        status: 'ready',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        data: { totalListings: 45, avgPrice: 520000, newClients: 8, marketShare: 12.5 }
      },
      {
        id: '2',
        title: 'Rapport Hebdomadaire - Lyon',
        type: 'weekly',
        period: 'Semaine 3',
        status: 'ready',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        data: { totalListings: 120, avgPrice: 380000, newClients: 15, marketShare: 8.2 }
      },
      {
        id: '3',
        title: 'Rapport Mensuel - Global',
        type: 'monthly',
        period: 'Janvier 2024',
        status: 'generating',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        data: { totalListings: 0, avgPrice: 0, newClients: 0, marketShare: 0 }
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

  const readyReports = reports.filter(r => r.status === 'ready').length
  const totalReports = reports.length
  const avgPrice = reports.length > 0 
    ? Math.round(reports.reduce((sum, r) => sum + r.data.avgPrice, 0) / reports.length)
    : 0
  const totalListings = reports.reduce((sum, r) => sum + r.data.totalListings, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-700 border-green-200'
      case 'generating': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'failed': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Prêt'
      case 'generating': return 'En cours'
      case 'failed': return 'Échec'
      default: return 'Inconnu'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle2 className="h-4 w-4" />
      case 'generating': return <Clock className="h-4 w-4 animate-spin" />
      case 'failed': return <AlertCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
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
          
          {/* KPIs */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerChildren}
          >
            <MetricCard
              title="Rapports Prêts"
              value={readyReports}
              icon={FileText}
              color="from-purple-500 to-purple-600"
              bgColor="bg-purple-50"
              textColor="text-purple-700"
            />
            <MetricCard
              title="Total Rapports"
              value={totalReports}
              icon={BarChart3}
              color="from-blue-500 to-blue-600"
              bgColor="bg-blue-50"
              textColor="text-blue-700"
            />
            <MetricCard
              title="Prix Moyen"
              value={avgPrice.toLocaleString('fr-FR') + '€'}
              icon={TrendingUp}
              color="from-cyan-500 to-cyan-600"
              bgColor="bg-cyan-50"
              textColor="text-cyan-700"
            />
            <MetricCard
              title="Total Annonces"
              value={totalListings}
              icon={Home}
              color="from-emerald-500 to-emerald-600"
              bgColor="bg-emerald-50"
              textColor="text-emerald-700"
            />
          </motion.div>

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
                      placeholder="Rechercher par titre ou période..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Type</label>
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
                  <label className="text-sm font-medium text-slate-700">Période</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200">
                      <SelectValue placeholder="Sélectionner une période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">Aujourd'hui</SelectItem>
                      <SelectItem value="7d">7 derniers jours</SelectItem>
                      <SelectItem value="30d">30 derniers jours</SelectItem>
                      <SelectItem value="90d">3 derniers mois</SelectItem>
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
                        setSelectedPeriod("7d")
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

          {/* Liste des rapports */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Vos rapports générés"
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
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
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
                                {getStatusIcon(report.status)}
                                <span className="ml-1">{getStatusText(report.status)}</span>
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-600 mb-4">
                              <div className="flex items-center gap-2">
                                <Home className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Annonces :</span>
                                <span>{report.data.totalListings}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Prix moyen :</span>
                                <span>{report.data.avgPrice.toLocaleString('fr-FR')}€</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Nouveaux clients :</span>
                                <span>{report.data.newClients}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Part de marché :</span>
                                <span>{report.data.marketShare}%</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Créé le {report.createdAt.toLocaleString('fr-FR', { 
                                  day: '2-digit', 
                                  month: '2-digit', 
                                  year: 'numeric', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              
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
                                  <FileText className="h-4 w-4 mr-1" />
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