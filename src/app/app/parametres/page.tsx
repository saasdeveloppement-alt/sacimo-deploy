"use client"

import { useState, useEffect, useMemo } from "react"
import PageContainer, { fadeInUp, staggerChildren } from "@/components/ui/PageContainer"
import SectionHeader from "@/components/ui/SectionHeader"
import ModernCard from "@/components/ui/ModernCard"
import MetricCard from "@/components/ui/MetricCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
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

const objectiveOptions = [
  "Automatiser ma veille immobilière",
  "Identifier les opportunités plus vite",
  "Centraliser mes piges et rapports",
  "Suivre la concurrence en temps réel",
  "Accélérer mes rendez-vous vendeurs",
]

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
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    contactRole: "",
    agency: "",
    companySize: "",
    objectives: [] as string[],
    notes: "",
  })
  const [isFetching, setIsFetching] = useState(true)

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
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/settings/profile")
        if (!res.ok) {
          throw new Error("Impossible de charger vos informations.")
        }
        const data = await res.json()
        setProfileForm({
          fullName: data.fullName ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          contactRole: data.contactRole ?? "",
          agency: data.agency ?? "",
          companySize: data.companySize ?? "",
          objectives: data.objectives ?? [],
          notes: data.notes ?? "",
        })
      } catch (error) {
        console.error(error)
        setFeedback({
          type: "error",
          message: error instanceof Error ? error.message : "Erreur lors du chargement des données.",
        })
      } finally {
        setIsFetching(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSave = async () => {
    try {
      setIsLoading(true)
      setFeedback(null)

      const response = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Impossible d'enregistrer les modifications.")
      }

      setFeedback({
        type: "success",
        message: "Profil mis à jour avec succès.",
      })
    } catch (error) {
      console.error(error)
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Une erreur est survenue pendant l'enregistrement.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    // Simuler l'export
    console.log("Export des paramètres")
  }

  const handleImport = () => {
    // Simuler l'import
    console.log("Import des paramètres")
  }

  const toggleObjective = (objective: string) => {
    setProfileForm((prev) => {
      const selected = prev.objectives.includes(objective)
      return {
        ...prev,
        objectives: selected
          ? prev.objectives.filter((item) => item !== objective)
          : [...prev.objectives, objective],
      }
    })
  }

  const objectivesDisplay = useMemo(
    () => [
      {
        title: "Veille automatisée",
        description: "Gardez un temps d'avance en détectant automatiquement les nouvelles opportunités.",
        icon: Target,
      },
      {
        title: "Analyse marché",
        description: "Suivez vos concurrents et les tendances locales en temps réel.",
        icon: BarChart3,
      },
      {
        title: "Equipe alignée",
        description: "Centralisez rapports, piges et alertes dans une plateforme unique.",
        icon: Users,
      },
    ],
    [],
  )

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
        icon={<Settings className="h-8 w-8 text-violet-600" />}
        action={
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleExport}
              className="border-slate-200 hover:border-violet-300 hover:text-violet-600"
            >
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button 
              variant="outline"
              onClick={handleImport}
              className="border-slate-200 hover:border-violet-300 hover:text-violet-600"
            >
              <Upload className="mr-2 h-4 w-4" />
              Importer
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading || isFetching}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
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
          {feedback && (
            <div
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
                feedback.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}
            >
              <span>{feedback.message}</span>
              <Button variant="ghost" size="sm" onClick={() => setFeedback(null)}>
                OK
              </Button>
            </div>
          )}
          
          {/* KPIs Généraux */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerChildren}
          >
            <MetricCard
              title="Compte Actif"
              value="Premium"
              icon={User}
              color="from-violet-500 to-violet-600"
              bgColor="bg-violet-50"
              textColor="text-violet-700"
            />
            <MetricCard
              title="Notifications"
              value={activeNotifications}
              icon={Bell}
              color="from-indigo-500 to-indigo-600"
              bgColor="bg-indigo-50"
              textColor="text-indigo-700"
            />
            <MetricCard
              title="Sécurité"
              value={securityLevel}
              icon={Shield}
              color="from-violet-500 to-indigo-600"
              bgColor="bg-violet-50"
              textColor="text-violet-700"
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
                icon={<User className="h-5 w-5 text-violet-600" />}
                className="h-full"
              >
                <div className="space-y-4">
                  <div className="grid gap-3">
                    <div>
                      <Label htmlFor="fullName" className="text-xs uppercase tracking-wide text-slate-500">
                        Nom & prénom
                      </Label>
                      <Input
                        id="fullName"
                        value={profileForm.fullName}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, fullName: event.target.value }))}
                        placeholder="Votre nom et prénom"
                        disabled={isFetching}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role" className="text-xs uppercase tracking-wide text-slate-500">
                        Poste / rôle
                      </Label>
                      <Input
                        id="role"
                        value={profileForm.contactRole}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, contactRole: event.target.value }))}
                        placeholder="Directeur commercial, agent, etc."
                        disabled={isFetching}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="email" className="text-xs uppercase tracking-wide text-slate-500">
                          Email professionnel
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email}
                          onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
                          placeholder="prenom@agence.fr"
                          disabled={isFetching}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-xs uppercase tracking-wide text-slate-500">
                          Téléphone
                        </Label>
                        <Input
                          id="phone"
                          value={profileForm.phone}
                          onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))}
                          placeholder="+33 6 12 34 56 78"
                          disabled={isFetching}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Ces informations personnalisent les rapports, sécurisent votre compte et facilitent le suivi de votre équipe par nos Customer Success.
                  </p>
                </div>
              </ModernCard>
            </motion.div>

            {/* BLOC 1.5 - Agence & objectifs */}
            <motion.div variants={fadeInUp}>
              <ModernCard
                title="Agence & Objectifs"
                icon={<Building2 className="h-5 w-5 text-indigo-600" />}
                className="h-full"
              >
                <div className="space-y-4">
                  <div className="grid gap-3">
                    <div>
                      <Label htmlFor="agency" className="text-xs uppercase tracking-wide text-slate-500">
                        Agence / structure
                      </Label>
                      <Input
                        id="agency"
                        value={profileForm.agency}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, agency: event.target.value }))}
                        placeholder="Agence Horizon Immobilier"
                        disabled={isFetching}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="companySize" className="text-xs uppercase tracking-wide text-slate-500">
                          Taille de l’équipe
                        </Label>
                        <Select
                          value={profileForm.companySize}
                          onValueChange={(value) => setProfileForm((prev) => ({ ...prev, companySize: value }))}
                          disabled={isFetching}
                        >
                          <SelectTrigger id="companySize">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-3">1-3 collaborateurs</SelectItem>
                            <SelectItem value="4-10">4-10 collaborateurs</SelectItem>
                            <SelectItem value="11-30">11-30 collaborateurs</SelectItem>
                            <SelectItem value="31+">31 et +</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-700">
                        <span className="font-medium">Vos objectifs clés</span>
                        <p className="text-xs text-violet-600">Choisissez jusqu’à 3 priorités.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {objectiveOptions.map((objective) => {
                      const selected = profileForm.objectives.includes(objective)
                      return (
                        <button
                          key={objective}
                          type="button"
                          onClick={() => toggleObjective(objective)}
                          disabled={isFetching}
                          className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                            selected
                              ? "border-violet-500 bg-violet-50 text-violet-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
                          }`}
                        >
                          <span>{objective}</span>
                          {selected && <CheckCircle2 className="h-5 w-5 text-violet-500" />}
                        </button>
                      )
                    })}
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-xs uppercase tracking-wide text-slate-500">
                      Précisions supplémentaires
                    </Label>
                    <Textarea
                      id="notes"
                      value={profileForm.notes}
                      onChange={(event) => setProfileForm((prev) => ({ ...prev, notes: event.target.value }))}
                      placeholder="Partagez vos attentes, vos outils actuels ou un besoin spécifique…"
                      className="min-h-[120px]"
                      disabled={isFetching}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {objectivesDisplay.map(({ title, description, icon: Icon }) => (
                      <div key={title} className="rounded-xl border border-white/10 bg-gradient-to-br from-violet-600/10 to-indigo-600/10 p-3 text-slate-600">
                        <Icon className="h-5 w-5 text-violet-500" />
                        <p className="mt-2 text-sm font-semibold text-slate-800">{title}</p>
                        <p className="text-xs text-slate-500">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ModernCard>
            </motion.div>

            {/* BLOC 2 - Notifications */}
            <motion.div variants={fadeInUp}>
              <ModernCard
                title="Préférences Notifications"
                icon={<Bell className="h-5 w-5 text-indigo-600" />}
                className="h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{activeNotifications}</p>
                      <p className="text-sm text-slate-600">canaux actifs</p>
                    </div>
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200">
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
                    <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0">
                      <Bell className="mr-2 h-4 w-4" />
                      Configurer
                    </Button>
                  </Link>
                </div>
              </ModernCard>
            </motion.div>

            {/* BLOC 2.5 - Facturation */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full border-slate-200/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>💳</span>
                    Facturation & Abonnement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Plan actuel : Pro</p>
                        <p className="text-sm text-muted-foreground">99€/mois</p>
                      </div>
                      <Badge>Actif</Badge>
                    </div>
                    
                    <Button asChild className="w-full">
                      <Link href="/app/facturation">
                        Gérer mon abonnement
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
                  
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white border-0">
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
                icon={<Palette className="h-5 w-5 text-indigo-600" />}
                className="h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">Clair</p>
                      <p className="text-sm text-slate-600">thème actuel</p>
                    </div>
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200">
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
                      className="flex-1 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                    >
                      <Palette className="mr-2 h-4 w-4" />
                      Personnaliser
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0">
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
                icon={<Settings className="h-5 w-5 text-violet-600" />}
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
                            className="justify-start text-left border-slate-200 hover:border-violet-300 hover:text-violet-600"
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