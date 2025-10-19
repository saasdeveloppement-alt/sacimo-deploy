"use client"

import { useState, useEffect } from "react"
import PageContainer, { fadeInUp, staggerChildren } from "@/components/ui/PageContainer"
import SectionHeader from "@/components/ui/SectionHeader"
import ModernCard from "@/components/ui/ModernCard"
import MetricCard from "@/components/ui/MetricCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
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
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Info,
  Plus,
  ArrowRight,
  Users,
  FileText,
  Brain,
  Lightbulb
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

  // Calculs pour les KPIs
  const activeNotifications = (notifications.email ? 1 : 0) + (notifications.push ? 1 : 0) + (notifications.sms ? 1 : 0)
  const securityLevel = security.twoFactor ? "Renforcée" : "Standard"
  const lastUpdate = "Aujourd'hui"

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
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* KPIs Généraux */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerChildren}
          >
            <MetricCard
              title="Compte Actif"
              value="Premium"
              icon={User}
              color="from-purple-500 to-purple-600"
              bgColor="bg-purple-50"
              textColor="text-purple-700"
            />
            <MetricCard
              title="Notifications"
              value={activeNotifications}
              icon={Bell}
              color="from-blue-500 to-blue-600"
              bgColor="bg-blue-50"
              textColor="text-blue-700"
            />
            <MetricCard
              title="Sécurité"
              value={securityLevel}
              icon={Shield}
              color="from-cyan-500 to-cyan-600"
              bgColor="bg-cyan-50"
              textColor="text-cyan-700"
            />
            <MetricCard
              title="Dernière MAJ"
              value={lastUpdate}
              icon={Clock}
              color="from-emerald-500 to-emerald-600"
              bgColor="bg-emerald-50"
              textColor="text-emerald-700"
            />
          </motion.div>

          {/* Grille des modules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* BLOC 1 - Profil */}
            <motion.div variants={fadeInUp}>
              <ModernCard
                title="Informations Personnelles"
                icon={<User className="h-5 w-5 text-purple-600" />}
                className="h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{profile.name}</p>
                      <p className="text-sm text-slate-600">{profile.role}</p>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                      {profile.agency}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-900">Email</p>
                      <p className="text-xs text-slate-600">{profile.email}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-900">Téléphone</p>
                      <p className="text-xs text-slate-600">{profile.phone || 'Non renseigné'}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 border-slate-200 hover:border-purple-300 hover:text-purple-600"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Voir profil
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
                      <User className="mr-2 h-4 w-4" />
                      Modifier
                    </Button>
                  </div>
                </div>
              </ModernCard>
            </motion.div>

            {/* BLOC 2 - Notifications */}
            <motion.div variants={fadeInUp}>
              <ModernCard
                title="Préférences Notifications"
                icon={<Bell className="h-5 w-5 text-blue-600" />}
                className="h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{activeNotifications}</p>
                      <p className="text-sm text-slate-600">canaux actifs</p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                      {notifications.frequency}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">Email</span>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">Push</span>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">SMS</span>
                      </div>
                      <Switch
                        checked={notifications.sms}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms: checked }))}
                        size="sm"
                      />
                    </div>
                  </div>
                  
                  <Link href="/app/notifications">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0">
                      <Bell className="mr-2 h-4 w-4" />
                      Configurer
                    </Button>
                  </Link>
                </div>
              </ModernCard>
            </motion.div>

            {/* BLOC 3 - Sécurité */}
            <motion.div variants={fadeInUp}>
              <ModernCard
                title="Sécurité du Compte"
                icon={<Shield className="h-5 w-5 text-emerald-600" />}
                className="h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{securityLevel}</p>
                      <p className="text-sm text-slate-600">niveau de sécurité</p>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      {security.sessionTimeout}min
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">2FA Activé</span>
                      </div>
                      <Switch
                        checked={security.twoFactor}
                        onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, twoFactor: checked }))}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">Alertes connexion</span>
                      </div>
                      <Switch
                        checked={security.loginAlerts}
                        onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, loginAlerts: checked }))}
                        size="sm"
                      />
                    </div>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white border-0">
                    <Shield className="mr-2 h-4 w-4" />
                    Renforcer la sécurité
                  </Button>
                </div>
              </ModernCard>
            </motion.div>

            {/* BLOC 4 - Apparence */}
            <motion.div variants={fadeInUp}>
              <ModernCard
                title="Apparence & Interface"
                icon={<Palette className="h-5 w-5 text-cyan-600" />}
                className="h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">Clair</p>
                      <p className="text-sm text-slate-600">thème actuel</p>
                    </div>
                    <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 border-cyan-200">
                      Français
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-900">Thème</p>
                      <p className="text-xs text-slate-600">Mode clair activé</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-900">Langue</p>
                      <p className="text-xs text-slate-600">Français (FR)</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 border-slate-200 hover:border-cyan-300 hover:text-cyan-600"
                    >
                      <Palette className="mr-2 h-4 w-4" />
                      Personnaliser
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0">
                      <Globe className="mr-2 h-4 w-4" />
                      Langues
                    </Button>
                  </div>
                </div>
              </ModernCard>
            </motion.div>

            {/* BLOC 5 - Données */}
            <motion.div variants={fadeInUp}>
              <ModernCard
                title="Données & Confidentialité"
                icon={<FileText className="h-5 w-5 text-orange-600" />}
                className="h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">2.4 GB</p>
                      <p className="text-sm text-slate-600">données stockées</p>
                    </div>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                      Sécurisé
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-900">Partage de données</p>
                      <p className="text-xs text-slate-600">Autorisé pour améliorer le service</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-900">Cookies analytiques</p>
                      <p className="text-xs text-slate-600">Acceptés</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 border-slate-200 hover:border-orange-300 hover:text-orange-600"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Exporter
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0">
                      <FileText className="mr-2 h-4 w-4" />
                      Gérer
                    </Button>
                  </div>
                </div>
              </ModernCard>
            </motion.div>

            {/* BLOC 6 - Actions Dangereuses */}
            <motion.div variants={fadeInUp}>
              <ModernCard
                title="Actions Dangereuses"
                icon={<Trash2 className="h-5 w-5 text-red-600" />}
                className="h-full border-red-200"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">⚠️</p>
                      <p className="text-sm text-slate-600">zone de danger</p>
                    </div>
                    <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
                      Irréversible
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-800">Supprimer le compte</p>
                      <p className="text-xs text-red-600">Toutes les données seront perdues</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-900">Réinitialiser les paramètres</p>
                      <p className="text-xs text-slate-600">Retour aux valeurs par défaut</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer le compte
                  </Button>
                </div>
              </ModernCard>
            </motion.div>

            {/* BLOC 7 - Configuration Avancée */}
            <motion.div variants={fadeInUp} className="lg:col-span-2 xl:col-span-3">
              <ModernCard
                title="Configuration Avancée"
                icon={<Settings className="h-5 w-5 text-purple-600" />}
                className="h-full"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-lg font-semibold text-slate-900 mb-2">Paramètres détaillés</p>
                      <p className="text-sm text-slate-600 mb-4">Accédez aux configurations avancées de votre compte</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-slate-400" />
                          <span className="font-medium">Profil complet</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Bell className="h-5 w-5 text-slate-400" />
                          <span className="font-medium">Notifications avancées</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-slate-400" />
                          <span className="font-medium">Sécurité renforcée</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900 mb-3">Actions rapides</p>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          "Changer le mot de passe",
                          "Exporter mes données",
                          "Configurer 2FA",
                          "Gérer les sessions"
                        ].map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="justify-start text-left border-slate-200 hover:border-purple-300 hover:text-purple-600"
                          >
                            <Settings className="mr-2 h-3 w-3" />
                            {action}
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