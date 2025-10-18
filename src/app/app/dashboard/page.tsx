"use client"

import { useState, useEffect } from "react"
import PageContainer, { fadeInUp, staggerChildren } from "@/components/ui/PageContainer"
import SectionHeader from "@/components/ui/SectionHeader"
import ModernCard from "@/components/ui/ModernCard"
import MetricCard from "@/components/ui/MetricCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { 
  Search, 
  Target, 
  Building2, 
  MapPin, 
  FileText, 
  Bell, 
  Brain,
  Plus,
  Eye,
  Download,
  TrendingUp,
  Users,
  Home,
  Zap,
  BarChart3,
  ArrowRight,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Lightbulb
} from "lucide-react"
import { motion } from "framer-motion"

interface QuickSearch {
  id: string
  name: string
  status: 'active' | 'paused'
  results: number
  lastRun: Date
}

interface QuickListing {
  id: string
  title: string
  price: number
  city: string
  publishedAt: Date
  isNew: boolean
}

interface QuickReport {
  id: string
  name: string
  type: 'daily' | 'weekly' | 'monthly'
  generatedAt: Date
  status: 'ready' | 'generating'
}

interface QuickNotification {
  id: string
  title: string
  type: 'new_listing' | 'price_drop' | 'market_alert'
  createdAt: Date
  isRead: boolean
}

export default function DashboardPage() {
  const [quickSearches, setQuickSearches] = useState<QuickSearch[]>([])
  const [quickListings, setQuickListings] = useState<QuickListing[]>([])
  const [quickReports, setQuickReports] = useState<QuickReport[]>([])
  const [quickNotifications, setQuickNotifications] = useState<QuickNotification[]>([])
  const [copilotQuestion, setCopilotQuestion] = useState("")

  // Données de démonstration
  useEffect(() => {
    // Recherches actives
    setQuickSearches([
      {
        id: '1',
        name: 'Paris 2P < 500k€',
        status: 'active',
        results: 23,
        lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        name: 'Lyon Maisons 4P+',
        status: 'active',
        results: 15,
        lastRun: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: '3',
        name: 'Marseille Investissement',
        status: 'paused',
        results: 8,
        lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ])

    // Nouvelles annonces
    setQuickListings([
      {
        id: '1',
        title: 'Appartement T3 lumineux - Centre ville',
        price: 350000,
        city: 'Paris',
        publishedAt: new Date(Date.now() - 30 * 60 * 1000),
        isNew: true
      },
      {
        id: '2',
        title: 'Maison 5 pièces avec jardin - Lyon',
        price: 620000,
        city: 'Lyon',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isNew: true
      },
      {
        id: '3',
        title: 'Studio rénové - Marseille',
        price: 280000,
        city: 'Marseille',
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isNew: false
      }
    ])

    // Rapports récents
    setQuickReports([
      {
        id: '1',
        name: 'Rapport Quotidien - Paris',
        type: 'daily',
        generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'ready'
      },
      {
        id: '2',
        name: 'Rapport Hebdomadaire - Lyon',
        type: 'weekly',
        generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'ready'
      },
      {
        id: '3',
        name: 'Rapport Mensuel - Global',
        type: 'monthly',
        generatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'ready'
      }
    ])

    // Notifications récentes
    setQuickNotifications([
      {
        id: '1',
        title: 'Nouvelle annonce - Paris 1er',
        type: 'new_listing',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        isRead: false
      },
      {
        id: '2',
        title: 'Baisse de prix - Lyon 2e',
        type: 'price_drop',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: false
      },
      {
        id: '3',
        title: 'Alerte marché - Paris',
        type: 'market_alert',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isRead: true
      }
    ])
  }, [])

  const activeSearches = quickSearches.filter(s => s.status === 'active').length
  const totalSearches = quickSearches.length
  const totalListings = quickListings.length
  const newListings = quickListings.filter(l => l.isNew).length
  const activeCompetitors = 12 // Données mockées
  const weeklyVolume = 45 // Données mockées
  const localizedProperties = 28 // Données mockées
  const readyReports = quickReports.filter(r => r.status === 'ready').length
  const unreadNotifications = quickNotifications.filter(n => !n.isRead).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_listing': return <Home className="h-4 w-4" />
      case 'price_drop': return <TrendingUp className="h-4 w-4" />
      case 'market_alert': return <AlertCircle className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_listing': return 'bg-green-100 text-green-700 border-green-200'
      case 'price_drop': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'market_alert': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="Dashboard"
        subtitle="Bienvenue, voici votre tableau de bord centralisé 👇"
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
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <Zap className="mr-2 h-4 w-4" />
              Actualiser tout
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* KPIs Généraux */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerChildren}
          >
            <MetricCard
              title="Recherches Actives"
              value={activeSearches}
              icon={Search}
              color="from-purple-500 to-purple-600"
              bgColor="bg-purple-50"
              textColor="text-purple-700"
            />
            <MetricCard
              title="Nouvelles Annonces"
              value={newListings}
              icon={Target}
              color="from-blue-500 to-blue-600"
              bgColor="bg-blue-50"
              textColor="text-blue-700"
            />
            <MetricCard
              title="Rapports Prêts"
              value={readyReports}
              icon={FileText}
              color="from-cyan-500 to-cyan-600"
              bgColor="bg-cyan-50"
              textColor="text-cyan-700"
            />
            <MetricCard
              title="Alertes Non Lues"
              value={unreadNotifications}
              icon={Bell}
              color="from-emerald-500 to-emerald-600"
              bgColor="bg-emerald-50"
              textColor="text-emerald-700"
            />
          </motion.div>

          {/* Grille des modules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* BLOC 1 - Recherches */}
            <motion.div variants={fadeInUp}>
              <ModernCard
                title="Mes Recherches"
                icon={<Search className="h-5 w-5 text-purple-600" />}
                className="h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{activeSearches}</p>
                      <p className="text-sm text-slate-600">recherches actives</p>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                      {totalSearches} total
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {quickSearches.slice(0, 3).map((search) => (
                      <div key={search.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{search.name}</p>
                          <p className="text-xs text-slate-600">{search.results} résultats</p>
                        </div>
                        <Badge 
                          variant={search.status === 'active' ? "default" : "secondary"}
                          className={search.status === 'active' ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-700 border-slate-200"}
                        >
                          {search.status === 'active' ? 'Actif' : 'Pause'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href="/app/recherches" className="flex-1">
                      <Button 
                        variant="outline" 
                        className="w-full border-slate-200 hover:border-purple-300 hover:text-purple-600"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Voir toutes
                      </Button>
                    </Link>
                    <Link href="/app/recherches" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
                        <Plus className="mr-2 h-4 w-4" />
                        Créer
                      </Button>
                    </Link>
                  </div>
                </div>
              </ModernCard>
            </motion.div>

            {/* BLOC 2 - Annonces */}
            <motion.div variants={fadeInUp}>
              <ModernCard
                title="Nouvelles Annonces"
                icon={<Target className="h-5 w-5 text-blue-600" />}
                className="h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{newListings}</p>
                      <p className="text-sm text-slate-600">nouvelles aujourd'hui</p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                      {totalListings} total
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {quickListings.slice(0, 3).map((listing) => (
                      <div key={listing.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 line-clamp-1">{listing.title}</p>
                          <p className="text-xs text-slate-600">{listing.city} • {listing.price.toLocaleString('fr-FR')}€</p>
                        </div>
                        {listing.isNew && (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            Nouveau
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href="/app/annonces" className="flex-1">
                      <Button 
                        variant="outline" 
                        className="w-full border-slate-200 hover:border-blue-300 hover:text-blue-600"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Voir toutes
                      </Button>
                    </Link>
                    <Link href="/app/annonces" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0">
                        <Target className="mr-2 h-4 w-4" />
                        Analyser
                      </Button>
                    </Link>
                  </div>
                </div>
              </ModernCard>
            </motion.div>

            {/* BLOC 3 - Concurrents */}
            <motion.div variants={fadeInUp}>
              <ModernCard
                title="Suivi Concurrents"
                icon={<Building2 className="h-5 w-5 text-emerald-600" />}
                className="h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{activeCompetitors}</p>
                      <p className="text-sm text-slate-600">concurrents suivis</p>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      {weeklyVolume} annonces/sem
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-900">Volume hebdomadaire</p>
                      <p className="text-xs text-slate-600">{weeklyVolume} nouvelles annonces professionnelles</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-900">Prix moyen</p>
                      <p className="text-xs text-slate-600">520 000€ sur le marché</p>
                    </div>
                  </div>
                  
                  <Link href="/app/concurrents">
                    <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white border-0">
                      <Building2 className="mr-2 h-4 w-4" />
                      Voir les concurrents
                    </Button>
                  </Link>
                </div>
              </ModernCard>
            </motion.div>

            {/* BLOC 4 - Localisation */}
            <motion.div variants={fadeInUp}>
              <ModernCard
                title="Localisation & Estimation"
                icon={<MapPin className="h-5 w-5 text-cyan-600" />}
                className="h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{localizedProperties}</p>
                      <p className="text-sm text-slate-600">biens localisés</p>
                    </div>
                    <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 border-cyan-200">
                      85% précision
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-900">Estimation moyenne</p>
                      <p className="text-xs text-slate-600">450 000€ avec 78% de confiance</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-900">Dernière mise à jour</p>
                      <p className="text-xs text-slate-600">Il y a 2 heures</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href="/app/localisation" className="flex-1">
                      <Button 
                        variant="outline" 
                        className="w-full border-slate-200 hover:border-cyan-300 hover:text-cyan-600"
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        Carte
                      </Button>
                    </Link>
                    <Link href="/app/localisation" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Estimations
                      </Button>
                    </Link>
                  </div>
                </div>
              </ModernCard>
            </motion.div>

            {/* BLOC 5 - Rapports */}
            <motion.div variants={fadeInUp}>
              <ModernCard
                title="Derniers Rapports"
                icon={<FileText className="h-5 w-5 text-orange-600" />}
                className="h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{readyReports}</p>
                      <p className="text-sm text-slate-600">rapports prêts</p>
                    </div>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                      {quickReports.length} total
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {quickReports.slice(0, 3).map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{report.name}</p>
                          <p className="text-xs text-slate-600">{report.type} • {report.generatedAt.toLocaleDateString('fr-FR')}</p>
                        </div>
                        <Badge 
                          variant={report.status === 'ready' ? "default" : "secondary"}
                          className={report.status === 'ready' ? "bg-green-100 text-green-700 border-green-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"}
                        >
                          {report.status === 'ready' ? 'Prêt' : 'En cours'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href="/app/rapports" className="flex-1">
                      <Button 
                        variant="outline" 
                        className="w-full border-slate-200 hover:border-orange-300 hover:text-orange-600"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Voir tous
                      </Button>
                    </Link>
                    <Link href="/app/rapports" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0">
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger
                      </Button>
                    </Link>
                  </div>
                </div>
              </ModernCard>
            </motion.div>

            {/* BLOC 6 - Notifications */}
            <motion.div variants={fadeInUp}>
              <ModernCard
                title="Dernières Alertes"
                icon={<Bell className="h-5 w-5 text-red-600" />}
                className="h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{unreadNotifications}</p>
                      <p className="text-sm text-slate-600">non lues</p>
                    </div>
                    <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
                      {quickNotifications.length} total
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {quickNotifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className="flex items-start gap-3 p-2 bg-slate-50 rounded-lg">
                        <div className={`p-1 rounded ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                          <p className="text-xs text-slate-600">{notification.createdAt.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-1" />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <Link href="/app/notifications">
                    <Button className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-0">
                      <Bell className="mr-2 h-4 w-4" />
                      Voir toutes les alertes
                    </Button>
                  </Link>
                </div>
              </ModernCard>
            </motion.div>

            {/* BLOC 7 - Copilote IA */}
            <motion.div variants={fadeInUp} className="lg:col-span-2 xl:col-span-3">
              <ModernCard
                title="Copilote IA"
                icon={<Brain className="h-5 w-5 text-purple-600" />}
                className="h-full"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-lg font-semibold text-slate-900 mb-2">Votre assistant commercial</p>
                      <p className="text-sm text-slate-600 mb-4">Posez une question à votre IA spécialisée en immobilier</p>
                    </div>
                    
                    <div className="space-y-3">
                      <Input
                        placeholder="Posez une question au Copilote IA…"
                        value={copilotQuestion}
                        onChange={(e) => setCopilotQuestion(e.target.value)}
                        className="border-slate-200 focus:border-purple-300 focus:ring-purple-200"
                      />
                      
                      <div className="flex gap-2">
                        <Link href="/app/copilote" className="flex-1">
                          <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
                            <Brain className="mr-2 h-4 w-4" />
                            Ouvrir Copilote
                          </Button>
                        </Link>
                        <Link href="/app/copilote" className="flex-1">
                          <Button 
                            variant="outline"
                            className="w-full border-slate-200 hover:border-purple-300 hover:text-purple-600"
                          >
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Poser la question
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900 mb-3">Suggestions rapides</p>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          "Comment répondre à une objection ?",
                          "Reformuler un email client",
                          "Stratégie de négociation prix",
                          "Analyse du marché local"
                        ].map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="justify-start text-left border-slate-200 hover:border-purple-300 hover:text-purple-600"
                          >
                            <Lightbulb className="mr-2 h-3 w-3" />
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ModernCard>
            </motion.div>

          </div>
        </div>
      </main>
    </PageContainer>
  )
}