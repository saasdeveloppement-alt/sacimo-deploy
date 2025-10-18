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
import { Switch } from "@/components/ui/switch"
import { 
  Bell, 
  Search, 
  Filter, 
  Settings, 
  Target,
  TrendingUp,
  Users,
  Building2,
  Home,
  Zap,
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  Phone
} from "lucide-react"
import { motion } from "framer-motion"

interface Notification {
  id: string
  title: string
  message: string
  type: 'new_listing' | 'price_drop' | 'market_alert' | 'system' | 'reminder'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isRead: boolean
  createdAt: Date
  actionUrl?: string
  category: string
}

interface AlertRule {
  id: string
  name: string
  type: 'price' | 'location' | 'type' | 'keyword'
  condition: string
  isActive: boolean
  notifications: number
  lastTriggered?: Date
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [alertRules, setAlertRules] = useState<AlertRule[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [showOnlyUnread, setShowOnlyUnread] = useState(false)

  // Données de démonstration
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Nouvelle annonce - Paris 1er',
        message: 'Un appartement T3 de 75m² à 450k€ vient d\'être publié dans votre zone de recherche',
        type: 'new_listing',
        priority: 'high',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        actionUrl: '/app/annonces',
        category: 'Nouvelles annonces'
      },
      {
        id: '2',
        title: 'Baisse de prix - Lyon 2e',
        message: 'Le prix de l\'appartement T4 a été réduit de 520k€ à 480k€',
        type: 'price_drop',
        priority: 'medium',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        actionUrl: '/app/annonces',
        category: 'Prix'
      },
      {
        id: '3',
        title: 'Alerte marché - Paris',
        message: 'Le marché parisien montre une tendance à la hausse de 3.2% ce mois-ci',
        type: 'market_alert',
        priority: 'low',
        isRead: true,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        category: 'Marché'
      },
      {
        id: '4',
        title: 'Rapport hebdomadaire disponible',
        message: 'Votre rapport de la semaine est prêt à être consulté',
        type: 'system',
        priority: 'low',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        actionUrl: '/app/rapports',
        category: 'Système'
      },
      {
        id: '5',
        title: 'Rappel - Recherche expirée',
        message: 'Votre recherche "Paris 2P < 500k€" expire dans 3 jours',
        type: 'reminder',
        priority: 'medium',
        isRead: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        actionUrl: '/app/recherches',
        category: 'Rappels'
      }
    ]

    const mockAlertRules: AlertRule[] = [
      {
        id: '1',
        name: 'Nouveautés Paris 1er-3e',
        type: 'location',
        condition: 'Paris 1er, 2e, 3e',
        isActive: true,
        notifications: 12,
        lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        name: 'Baisse de prix > 10%',
        type: 'price',
        condition: 'Réduction > 10%',
        isActive: true,
        notifications: 5,
        lastTriggered: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: '3',
        name: 'Appartements T3-T4',
        type: 'type',
        condition: 'Appartement 3-4 pièces',
        isActive: false,
        notifications: 8,
        lastTriggered: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: '4',
        name: 'Mots-clés "balcon"',
        type: 'keyword',
        condition: 'Description contient "balcon"',
        isActive: true,
        notifications: 3,
        lastTriggered: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ]

    setNotifications(mockNotifications)
    setAlertRules(mockAlertRules)
  }, [])

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || notification.type === typeFilter
    const matchesPriority = priorityFilter === "all" || notification.priority === priorityFilter
    const matchesRead = !showOnlyUnread || !notification.isRead
    return matchesSearch && matchesType && matchesPriority && matchesRead
  })

  const unreadCount = notifications.filter(n => !n.isRead).length
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.isRead).length
  const activeRules = alertRules.filter(r => r.isActive).length
  const totalNotifications = notifications.length

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgent'
      case 'high': return 'Élevée'
      case 'medium': return 'Moyenne'
      case 'low': return 'Faible'
      default: return 'Inconnue'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_listing': return <Home className="h-4 w-4" />
      case 'price_drop': return <TrendingUp className="h-4 w-4" />
      case 'market_alert': return <Target className="h-4 w-4" />
      case 'system': return <Settings className="h-4 w-4" />
      case 'reminder': return <Clock className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'new_listing': return 'Nouvelle annonce'
      case 'price_drop': return 'Baisse de prix'
      case 'market_alert': return 'Alerte marché'
      case 'system': return 'Système'
      case 'reminder': return 'Rappel'
      default: return 'Inconnu'
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const toggleAlertRule = (id: string) => {
    setAlertRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ))
  }

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="Notifications & alertes"
        subtitle="Restez informé des dernières opportunités et alertes du marché"
        icon={<Bell className="h-8 w-8 text-purple-600" />}
        action={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="outline"
                onClick={markAllAsRead}
                className="border-slate-200 hover:border-purple-300 hover:text-purple-600"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Tout marquer comme lu
              </Button>
            )}
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Recherche</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Rechercher dans les notifications..."
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
                      <SelectItem value="new_listing">Nouvelles annonces</SelectItem>
                      <SelectItem value="price_drop">Baisse de prix</SelectItem>
                      <SelectItem value="market_alert">Alerte marché</SelectItem>
                      <SelectItem value="system">Système</SelectItem>
                      <SelectItem value="reminder">Rappels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Priorité</label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200">
                      <SelectValue placeholder="Toutes les priorités" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les priorités</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">Élevée</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="low">Faible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Filtres</label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showOnlyUnread}
                      onCheckedChange={setShowOnlyUnread}
                    />
                    <span className="text-sm text-slate-600">Non lues uniquement</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                  {filteredNotifications.length} notification{filteredNotifications.length > 1 ? 's' : ''} trouvée{filteredNotifications.length > 1 ? 's' : ''}
                </Badge>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSearchTerm("")
                      setTypeFilter("all")
                      setPriorityFilter("all")
                      setShowOnlyUnread(false)
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerChildren}
          >
            <MetricCard
              title="Non lues"
              value={unreadCount}
              icon={Bell}
              color="from-purple-500 to-purple-600"
              bgColor="bg-purple-50"
              textColor="text-purple-700"
            />
            <MetricCard
              title="Urgentes"
              value={urgentCount}
              icon={AlertCircle}
              color="from-red-500 to-red-600"
              bgColor="bg-red-50"
              textColor="text-red-700"
            />
            <MetricCard
              title="Règles Actives"
              value={activeRules}
              icon={Target}
              color="from-blue-500 to-blue-600"
              bgColor="bg-blue-50"
              textColor="text-blue-700"
            />
            <MetricCard
              title="Total Notifications"
              value={totalNotifications}
              icon={MessageSquare}
              color="from-cyan-500 to-cyan-600"
              bgColor="bg-cyan-50"
              textColor="text-cyan-700"
            />
          </motion.div>

          {/* Règles d'alerte */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Règles d'Alerte"
              icon={<Target className="h-5 w-5 text-emerald-600" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alertRules.map((rule, index) => (
                  <motion.div
                    key={rule.id}
                    variants={fadeInUp}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-4 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors border border-slate-200/60">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-slate-900">{rule.name}</h3>
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => toggleAlertRule(rule.id)}
                        />
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Type :</span>
                          <Badge variant="outline" className="border-slate-200 text-slate-600">
                            {rule.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Condition :</span>
                          <span>{rule.condition}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Notifications :</span>
                          <span>{rule.notifications}</span>
                        </div>
                        {rule.lastTriggered && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Dernière alerte :</span>
                            <span>{rule.lastTriggered.toLocaleString('fr-FR', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ModernCard>
          </motion.div>

          {/* Liste des notifications */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Notifications Récentes"
              icon={<Bell className="h-5 w-5 text-purple-600" />}
            >
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                    <Bell className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    Aucune notification trouvée
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {notifications.length === 0 ? "Vous n'avez pas encore de notifications" : "Aucune notification ne correspond aux filtres"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      variants={fadeInUp}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div 
                        className={`p-6 rounded-xl transition-colors border border-slate-200/60 cursor-pointer ${
                          notification.isRead 
                            ? 'bg-slate-50/50 hover:bg-slate-100/50' 
                            : 'bg-blue-50/50 hover:bg-blue-100/50 border-blue-200/60'
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${
                            notification.isRead ? 'bg-slate-100' : 'bg-blue-100'
                          }`}>
                            {getTypeIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className={`font-semibold ${
                                notification.isRead ? 'text-slate-900' : 'text-slate-900'
                              }`}>
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                              )}
                              <Badge className={getPriorityColor(notification.priority)}>
                                {getPriorityText(notification.priority)}
                              </Badge>
                              <Badge variant="outline" className="border-slate-200 text-slate-600">
                                {getTypeText(notification.type)}
                              </Badge>
                            </div>
                            <p className="text-slate-600 mb-3">{notification.message}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {notification.createdAt.toLocaleString('fr-FR', { 
                                    day: '2-digit', 
                                    month: '2-digit', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Target className="h-4 w-4" />
                                  {notification.category}
                                </span>
                              </div>
                              {notification.actionUrl && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-slate-200 hover:border-purple-300 hover:text-purple-600"
                                >
                                  Voir
                                </Button>
                              )}
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