"use client"

import { useState, useEffect } from "react"
import PageContainer, { fadeInUp, staggerChildren } from "@/components/ui/PageContainer"
import SectionHeader from "@/components/ui/SectionHeader"
import ModernCard from "@/components/ui/ModernCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Globe, 
  Palette,
  Save,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Key,
  Mail,
  Phone,
  MapPin,
  Building2,
  Zap,
  Target,
  BarChart3,
  Home,
  Clock,
  TrendingUp
} from "lucide-react"
import { motion } from "framer-motion"

interface UserProfile {
  name: string
  email: string
  phone?: string
  role: string
  agency: string
  avatar?: string
}

interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  frequency: 'realtime' | 'daily' | 'weekly'
  newListings: boolean
  priceDrops: boolean
  marketAlerts: boolean
  systemUpdates: boolean
}

interface SecuritySettings {
  twoFactor: boolean
  sessionTimeout: number
  loginAlerts: boolean
  passwordExpiry: number
}

export default function ParametresPage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "SaaS Développement",
    email: "saasdeveloppement@gmail.com",
    phone: "+33 6 12 34 56 78",
    role: "Propriétaire",
    agency: "Agence Immobilière Demo"
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    frequency: 'realtime',
    newListings: true,
    priceDrops: true,
    marketAlerts: true,
    systemUpdates: false
  })

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactor: false,
    sessionTimeout: 30,
    loginAlerts: true,
    passwordExpiry: 90
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    // Simuler la sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const handleExport = () => {
    // Simuler l'export
    console.log("Export des paramètres")
  }

  const handleImport = () => {
    // Simuler l'import
    console.log("Import des paramètres")
  }

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="Paramètres"
        subtitle="Gérez votre compte, vos préférences et vos paramètres de sécurité"
        icon={<Settings className="h-8 w-8 text-purple-600" />}
        action={
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleExport}
              className="border-slate-200 hover:border-purple-300 hover:text-purple-600"
            >
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button 
              variant="outline"
              onClick={handleImport}
              className="border-slate-200 hover:border-purple-300 hover:text-purple-600"
            >
              <Upload className="mr-2 h-4 w-4" />
              Importer
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? <Zap className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="profile" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Sécurité
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Préférences
              </TabsTrigger>
            </TabsList>

            {/* Profil */}
            <TabsContent value="profile" className="space-y-6">
              <motion.div variants={fadeInUp}>
                <ModernCard
                  title="Informations Personnelles"
                  icon={<User className="h-5 w-5 text-purple-600" />}
                  className="shadow-lg hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                        className="border-slate-200 focus:border-purple-300 focus:ring-purple-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        className="border-slate-200 focus:border-purple-300 focus:ring-purple-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={profile.phone || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        className="border-slate-200 focus:border-purple-300 focus:ring-purple-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rôle</Label>
                      <Input
                        id="role"
                        value={profile.role}
                        disabled
                        className="border-slate-200 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="agency">Agence</Label>
                      <Input
                        id="agency"
                        value={profile.agency}
                        disabled
                        className="border-slate-200 bg-slate-50"
                      />
                    </div>
                  </div>
                </ModernCard>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <ModernCard
                  title="Mot de Passe"
                  icon={<Key className="h-5 w-5 text-blue-600" />}
                  className="shadow-lg hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Mot de passe actuel</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showPassword ? "text" : "password"}
                          className="border-slate-200 focus:border-purple-300 focus:ring-purple-200 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nouveau mot de passe</Label>
                      <Input
                        id="new-password"
                        type="password"
                        className="border-slate-200 focus:border-purple-300 focus:ring-purple-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        className="border-slate-200 focus:border-purple-300 focus:ring-purple-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Force du mot de passe</Label>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <p className="text-sm text-slate-600">Fort</p>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="space-y-6">
              <motion.div variants={fadeInUp}>
                <ModernCard
                  title="Préférences de Notification"
                  icon={<Bell className="h-5 w-5 text-purple-600" />}
                  className="shadow-lg hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800">Canaux de notification</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Mail className="h-5 w-5 text-slate-400" />
                              <span className="font-medium">Email</span>
                            </div>
                            <Switch
                              checked={notifications.email}
                              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Bell className="h-5 w-5 text-slate-400" />
                              <span className="font-medium">Notifications push</span>
                            </div>
                            <Switch
                              checked={notifications.push}
                              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Phone className="h-5 w-5 text-slate-400" />
                              <span className="font-medium">SMS</span>
                            </div>
                            <Switch
                              checked={notifications.sms}
                              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms: checked }))}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800">Fréquence</h3>
                        <div className="space-y-3">
                          <Label htmlFor="frequency">Fréquence des notifications</Label>
                          <Select 
                            value={notifications.frequency} 
                            onValueChange={(value: any) => setNotifications(prev => ({ ...prev, frequency: value }))}
                          >
                            <SelectTrigger className="border-slate-200 focus:border-purple-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="realtime">Temps réel</SelectItem>
                              <SelectItem value="daily">Quotidien</SelectItem>
                              <SelectItem value="weekly">Hebdomadaire</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <ModernCard
                  title="Types de Notifications"
                  icon={<Target className="h-5 w-5 text-blue-600" />}
                  className="shadow-lg hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-800">Immobilier</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Home className="h-5 w-5 text-slate-400" />
                            <span className="font-medium">Nouvelles annonces</span>
                          </div>
                          <Switch
                            checked={notifications.newListings}
                            onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, newListings: checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <TrendingUp className="h-5 w-5 text-slate-400" />
                            <span className="font-medium">Baisses de prix</span>
                          </div>
                          <Switch
                            checked={notifications.priceDrops}
                            onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, priceDrops: checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <BarChart3 className="h-5 w-5 text-slate-400" />
                            <span className="font-medium">Alertes marché</span>
                          </div>
                          <Switch
                            checked={notifications.marketAlerts}
                            onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketAlerts: checked }))}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-800">Système</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Settings className="h-5 w-5 text-slate-400" />
                            <span className="font-medium">Mises à jour système</span>
                          </div>
                          <Switch
                            checked={notifications.systemUpdates}
                            onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, systemUpdates: checked }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>
            </TabsContent>

            {/* Sécurité */}
            <TabsContent value="security" className="space-y-6">
              <motion.div variants={fadeInUp}>
                <ModernCard
                  title="Authentification à Deux Facteurs"
                  icon={<Shield className="h-5 w-5 text-purple-600" />}
                  className="shadow-lg hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">2FA Activé</h3>
                        <p className="text-slate-600">Protégez votre compte avec une authentification à deux facteurs</p>
                      </div>
                      <Switch
                        checked={security.twoFactor}
                        onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, twoFactor: checked }))}
                      />
                    </div>
                    {security.twoFactor && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                          ✅ L'authentification à deux facteurs est activée. Votre compte est mieux protégé.
                        </p>
                      </div>
                    )}
                  </div>
                </ModernCard>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <ModernCard
                  title="Paramètres de Session"
                  icon={<Clock className="h-5 w-5 text-blue-600" />}
                  className="shadow-lg hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Délai d'expiration de session (minutes)</Label>
                      <Select 
                        value={security.sessionTimeout.toString()} 
                        onValueChange={(value) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(value) }))}
                      >
                        <SelectTrigger className="border-slate-200 focus:border-purple-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 heure</SelectItem>
                          <SelectItem value="120">2 heures</SelectItem>
                          <SelectItem value="480">8 heures</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password-expiry">Expiration du mot de passe (jours)</Label>
                      <Select 
                        value={security.passwordExpiry.toString()} 
                        onValueChange={(value) => setSecurity(prev => ({ ...prev, passwordExpiry: parseInt(value) }))}
                      >
                        <SelectTrigger className="border-slate-200 focus:border-purple-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 jours</SelectItem>
                          <SelectItem value="60">60 jours</SelectItem>
                          <SelectItem value="90">90 jours</SelectItem>
                          <SelectItem value="180">6 mois</SelectItem>
                          <SelectItem value="365">1 an</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Alertes de connexion</h3>
                        <p className="text-slate-600">Recevez une notification lors de nouvelles connexions</p>
                      </div>
                      <Switch
                        checked={security.loginAlerts}
                        onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, loginAlerts: checked }))}
                      />
                    </div>
                  </div>
                </ModernCard>
              </motion.div>
            </TabsContent>

            {/* Préférences */}
            <TabsContent value="preferences" className="space-y-6">
              <motion.div variants={fadeInUp}>
                <ModernCard
                  title="Apparence et Interface"
                  icon={<Palette className="h-5 w-5 text-purple-600" />}
                  className="shadow-lg hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="theme">Thème</Label>
                        <Select defaultValue="light">
                          <SelectTrigger className="border-slate-200 focus:border-purple-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Clair</SelectItem>
                            <SelectItem value="dark">Sombre</SelectItem>
                            <SelectItem value="auto">Automatique</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="language">Langue</Label>
                        <Select defaultValue="fr">
                          <SelectTrigger className="border-slate-200 focus:border-purple-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <ModernCard
                  title="Données et Confidentialité"
                  icon={<Shield className="h-5 w-5 text-blue-600" />}
                  className="shadow-lg hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Partage de données</h3>
                        <p className="text-slate-600">Autoriser le partage de données anonymisées pour améliorer le service</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Cookies analytiques</h3>
                        <p className="text-slate-600">Accepter les cookies pour l'analyse d'usage</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </ModernCard>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <ModernCard
                  title="Actions Dangereuses"
                  icon={<Trash2 className="h-5 w-5 text-red-600" />}
                  className="shadow-lg hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h3 className="text-lg font-semibold text-red-800 mb-2">Supprimer le compte</h3>
                      <p className="text-red-700 mb-4">
                        Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                      </p>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer le compte
                      </Button>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </PageContainer>
  )
}
