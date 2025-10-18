"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Mail,
  Settings,
  Plus,
  Filter,
  Search,
  Eye,
  EyeOff
} from "lucide-react"

interface Notification {
  id: string;
  type: 'new_listing' | 'price_drop' | 'new_competitor' | 'daily_report';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  searchId?: string;
  listingId?: string;
}

interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  frequency: 'realtime' | 'daily' | 'weekly';
  conditions: {
    priceMin?: number;
    priceMax?: number;
    cities?: string[];
    types?: string[];
    sources?: string[];
  };
  lastTriggered?: Date;
  triggerCount: number;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [alertRules, setAlertRules] = useState<AlertRule[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [showRead, setShowRead] = useState(true)

  // Données simulées
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'new_listing',
        title: 'Nouvelle annonce correspondante',
        message: 'Appartement T3 à Paris 15e - 450 000€ (recherche "Paris T3 <500k")',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
        read: false,
        priority: 'high',
        searchId: 'search-1',
        listingId: 'listing-1'
      },
      {
        id: '2',
        type: 'price_drop',
        title: 'Baisse de prix détectée',
        message: 'Maison 4 pièces à Lyon - Prix passé de 680k€ à 650k€',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
        read: false,
        priority: 'medium',
        listingId: 'listing-2'
      },
      {
        id: '3',
        type: 'daily_report',
        title: 'Rapport quotidien disponible',
        message: '5 nouvelles annonces trouvées aujourd\'hui. 2 baisses de prix détectées.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
        priority: 'low'
      },
      {
        id: '4',
        type: 'new_competitor',
        title: 'Nouvelle agence concurrente',
        message: 'Agence "Immobilier Pro" a publié 12 nouvelles annonces dans votre zone',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        read: true,
        priority: 'medium'
      }
    ]

    const mockAlertRules: AlertRule[] = [
      {
        id: 'rule-1',
        name: 'Paris T3 <500k€',
        enabled: true,
        frequency: 'realtime',
        conditions: {
          priceMax: 500000,
          cities: ['Paris'],
          types: ['APARTMENT'],
          sources: ['LEBONCOIN', 'PAP']
        },
        lastTriggered: new Date(Date.now() - 1000 * 60 * 30),
        triggerCount: 5
      },
      {
        id: 'rule-2',
        name: 'Baisse de prix >10%',
        enabled: true,
        frequency: 'daily',
        conditions: {
          priceMin: 200000,
          priceMax: 1000000
        },
        lastTriggered: new Date(Date.now() - 1000 * 60 * 60 * 2),
        triggerCount: 2
      },
      {
        id: 'rule-3',
        name: 'Nouvelles agences concurrentes',
        enabled: false,
        frequency: 'weekly',
        conditions: {
          sources: ['SELOGER', 'ORPI', 'CENTURY21']
        },
        triggerCount: 0
      }
    ]

    setNotifications(mockNotifications)
    setAlertRules(mockAlertRules)
  }, [])

  // Filtrage des notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === "all" || notification.type === typeFilter
    
    const matchesPriority = priorityFilter === "all" || notification.priority === priorityFilter
    
    const matchesRead = showRead || !notification.read
    
    return matchesSearch && matchesType && matchesPriority && matchesRead
  })

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const toggleAlertRule = (id: string) => {
    setAlertRules(prev => 
      prev.map(rule => 
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Urgent'
      case 'medium': return 'Normal'
      case 'low': return 'Faible'
      default: return 'Faible'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_listing': return <Bell className="h-4 w-4" />
      case 'price_drop': return <AlertCircle className="h-4 w-4" />
      case 'new_competitor': return <Eye className="h-4 w-4" />
      case 'daily_report': return <Clock className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'new_listing': return 'Nouvelle annonce'
      case 'price_drop': return 'Baisse de prix'
      case 'new_competitor': return 'Nouveau concurrent'
      case 'daily_report': return 'Rapport quotidien'
      default: return 'Notification'
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const activeRulesCount = alertRules.filter(r => r.enabled).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications & Alertes</h1>
              <p className="text-gray-600">
                {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''} • {activeRulesCount} règle{activeRulesCount > 1 ? 's' : ''} active{activeRulesCount > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Tout marquer comme lu
                </Button>
              )}
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle règle
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
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Recherche</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher dans les notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="new_listing">Nouvelles annonces</SelectItem>
                    <SelectItem value="price_drop">Baisse de prix</SelectItem>
                    <SelectItem value="new_competitor">Nouveaux concurrents</SelectItem>
                    <SelectItem value="daily_report">Rapports</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Priorité</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les priorités" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les priorités</SelectItem>
                    <SelectItem value="high">Urgent</SelectItem>
                    <SelectItem value="medium">Normal</SelectItem>
                    <SelectItem value="low">Faible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-read"
                  checked={showRead}
                  onCheckedChange={setShowRead}
                />
                <label htmlFor="show-read" className="text-sm font-medium text-gray-700">
                  Afficher les lues
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notifications */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications ({filteredNotifications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune notification trouvée</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          notification.read 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`p-2 rounded-full ${
                              notification.read ? 'bg-gray-200' : 'bg-blue-200'
                            }`}>
                              {getTypeIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-medium ${
                                  notification.read ? 'text-gray-900' : 'text-blue-900'
                                }`}>
                                  {notification.title}
                                </h3>
                                <Badge variant={getPriorityColor(notification.priority)}>
                                  {getPriorityLabel(notification.priority)}
                                </Badge>
                                <Badge variant="outline">
                                  {getTypeLabel(notification.type)}
                                </Badge>
                              </div>
                              <p className={`text-sm ${
                                notification.read ? 'text-gray-600' : 'text-blue-700'
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {notification.timestamp.toLocaleString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Règles d'alerte */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Règles d'alerte ({activeRulesCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alertRules.map((rule) => (
                    <div key={rule.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{rule.name}</h3>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => toggleAlertRule(rule.id)}
                        />
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span>
                            {rule.frequency === 'realtime' ? 'Temps réel' :
                             rule.frequency === 'daily' ? 'Quotidien' : 'Hebdomadaire'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-3 w-3" />
                          <span>{rule.triggerCount} déclenchement{rule.triggerCount > 1 ? 's' : ''}</span>
                        </div>
                        {rule.lastTriggered && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>
                              Dernière fois: {rule.lastTriggered.toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Modifier
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une nouvelle règle
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
