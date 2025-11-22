"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
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
  Mail,
  Phone,
  Building2,
  Zap,
  Clock,
  CheckCircle2,
  FileText,
  ArrowLeft,
  Sparkles
} from "lucide-react"
import { toast } from "sonner"

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

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

export default function ParametresPage() {
  const [profileForm, setProfileForm] = useState({
    fullName: "John Doe",
    email: "john.doe@sacimo.com",
    phone: "+33 6 12 34 56 78",
    contactRole: "",
    agency: "",
    companySize: "",
    objectives: [] as string[],
    notes: "",
    opportunities: "",
    coordination: "",
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
    twoFactor: true,
    sessionTimeout: 30,
    loginAlerts: true,
    passwordExpiry: 90
  })

  const [appearance, setAppearance] = useState({
    theme: 'light' as 'light' | 'dark',
    language: 'fr' as 'fr' | 'en' | 'es',
    analyticsCookies: true,
  })

  const [isLoading, setIsLoading] = useState(false)
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
          fullName: data.fullName ?? "John Doe",
          email: data.email ?? "john.doe@sacimo.com",
          phone: data.phone ?? "+33 6 12 34 56 78",
          contactRole: data.contactRole ?? "",
          agency: data.agency ?? "",
          companySize: data.companySize ?? "",
          objectives: data.objectives ?? [],
          notes: data.notes ?? "",
          opportunities: data.opportunities ?? "",
          coordination: data.coordination ?? "",
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
      toast.success("Paramètres sauvegardés avec succès")
    } catch (error) {
      console.error(error)
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Une erreur est survenue pendant l'enregistrement.",
      })
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    toast.info("Export des paramètres en cours...")
  }

  const handleImport = () => {
    toast.info("Import des paramètres en cours...")
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

  // Calculs pour les KPIs
  const activeNotifications = (notifications.email ? 1 : 0) + (notifications.push ? 1 : 0) + (notifications.sms ? 1 : 0)
  const securityLevel = security.twoFactor ? "Renforcée" : "Standard"
  const lastUpdate = "Aujourd'hui"
  const accountStatus = "Premium"

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Floating Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
                  <p className="text-sm text-gray-500">Gérez votre compte, vos préférences et vos paramètres de sécurité</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    className="border-gray-300 hover:bg-gray-50 transition-all font-medium"
                  >
                    <Download className="mr-2 h-4 w-4" strokeWidth={1.5} />
                    Exporter
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={handleImport}
                    className="border-gray-300 hover:bg-gray-50 transition-all font-medium"
                  >
                    <Upload className="mr-2 h-4 w-4" strokeWidth={1.5} />
                    Importer
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading || isFetching}
                    className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
                  >
                    {isLoading ? (
                      <Zap className="mr-2 h-4 w-4 animate-spin" strokeWidth={1.5} />
                    ) : (
                      <Save className="mr-2 h-4 w-4" strokeWidth={1.5} />
                    )}
                    Sauvegarder
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm mb-6 ${
                feedback.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}
            >
              <span>{feedback.message}</span>
              <Button variant="ghost" size="sm" onClick={() => setFeedback(null)}>
                OK
              </Button>
            </motion.div>
          )}

          {/* Quick Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {[
              {
                icon: CreditCard,
                iconBg: "from-primary-100 to-primary-200",
                iconColor: "text-primary-600",
                title: "Compte Actif",
                value: accountStatus,
                badge: "ACTIF",
                badgeColor: "bg-primary-100 text-primary-700",
                delay: 0,
              },
              {
                icon: Bell,
                iconBg: "from-blue-100 to-blue-200",
                iconColor: "text-blue-600",
                title: "Notifications",
                value: activeNotifications.toString(),
                delay: 0.1,
              },
              {
                icon: Shield,
                iconBg: "from-indigo-100 to-indigo-200",
                iconColor: "text-indigo-600",
                title: "Sécurité",
                value: securityLevel,
                delay: 0.2,
              },
              {
                icon: Clock,
                iconBg: "from-emerald-100 to-emerald-200",
                iconColor: "text-emerald-600",
                title: "Données MAJ",
                value: lastUpdate,
                delay: 0.3,
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={slideUp}
                transition={{ delay: stat.delay }}
                className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
                whileHover={{ y: -4, scale: 1.02 }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-200/30 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 0.5,
                      ease: "easeInOut",
                    }}
                  />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 bg-gradient-to-br ${stat.iconBg} rounded-xl`}>
                      <stat.icon className={`w-5 h-5 ${stat.iconColor}`} strokeWidth={1.5} />
                    </div>
                    {stat.badge && (
                      <Badge className={`px-2 py-1 text-xs font-bold rounded-full border-0 ${stat.badgeColor}`}>
                        {stat.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <motion.div
                variants={slideUp}
                transition={{ delay: 0.4 }}
                className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl">
                    <User className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Informations Personnelles</h2>
                    <p className="text-sm text-gray-500">Gérez vos informations de compte</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-2">Nom & Prénom</Label>
                    <Input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      disabled={isFetching}
                    />
                  </div>

                  <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-2">Numéro de téléphone</Label>
                    <Input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      disabled={isFetching}
                    />
                  </div>

                  <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-2">Email Professionnel</Label>
                    <Input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      disabled={isFetching}
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-4">
                      Les informations personnelles ne figurent pas dans votre profil public mais servent à vous identifier en interne et en externe selon vos besoins.
                    </p>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
                      >
                        Mettre à jour les informations
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Agency & Goals */}
              <motion.div
                variants={slideUp}
                transition={{ delay: 0.5 }}
                className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
                    <Building2 className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Agence & Objectifs</h2>
                    <p className="text-sm text-gray-500">Définissez vos objectifs professionnels</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-2">Agence / Structure</Label>
                    <Input
                      type="text"
                      value={profileForm.agency}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, agency: e.target.value }))}
                      placeholder="Nom de votre agence"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      disabled={isFetching}
                    />
                  </div>

                  <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-2">Type de bien</Label>
                    <div className="flex items-center space-x-3 p-4 bg-primary-50 border-2 border-primary-200 rounded-xl">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Vos objectifs</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {profileForm.objectives.length > 0
                            ? profileForm.objectives.join(", ")
                            : "Investissement commercial, Résidentiel"}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-4 py-2 bg-white border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50"
                        onClick={() => {
                          // Toggle objectives modal or show selection
                        }}
                      >
                        Modifier
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-2">
                      Identifier les opportunités dans vos IAs
                    </Label>
                    <Textarea
                      rows={3}
                      value={profileForm.opportunities}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, opportunities: e.target.value }))}
                      placeholder="Décrivez vos opportunités..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      disabled={isFetching}
                    />
                  </div>

                  <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-2">
                      Coordonner vos pages et rapports
                    </Label>
                    <Textarea
                      rows={2}
                      value={profileForm.coordination}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, coordination: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      disabled={isFetching}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Billing & Subscription */}
              <motion.div
                variants={slideUp}
                transition={{ delay: 0.6 }}
                className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
                    <CreditCard className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Facturation & Abonnement</h2>
                    <p className="text-sm text-gray-500">Gérez votre abonnement</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">Plan actuel: Pro</p>
                        <p className="text-xs text-gray-600">Facturation mensuelle</p>
                      </div>
                      <Badge className="px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full border-0">
                        PRO
                      </Badge>
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        asChild
                        className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
                      >
                        <Link href="/app/facturation">Gérer votre abonnement</Link>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Notification Preferences */}
              <motion.div
                variants={slideUp}
                transition={{ delay: 0.7 }}
                className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                    <Bell className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                    <p className="text-xs text-gray-500">{activeNotifications} actives en tout</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'email', label: 'Email', description: 'Notifications par email', icon: Mail },
                    { key: 'push', label: 'Push', description: 'Notifications push', icon: Bell },
                    { key: 'sms', label: 'SMS', description: 'Notifications par SMS', icon: Phone },
                  ].map((notif) => (
                    <div
                      key={notif.key}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-all"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{notif.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{notif.description}</p>
                      </div>
                      <Switch
                        checked={notifications[notif.key as keyof NotificationSettings] as boolean}
                        onCheckedChange={(checked) =>
                          setNotifications((prev) => ({ ...prev, [notif.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-4">
                  <Button
                    asChild
                    className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
                  >
                    <Link href="/app/notifications">Configurer</Link>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Security */}
              <motion.div
                variants={slideUp}
                transition={{ delay: 0.8 }}
                className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                    <Shield className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Sécurité</h2>
                    <p className="text-xs text-gray-500">Niveau: {securityLevel}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" strokeWidth={1.5} />
                      <span className="text-sm font-semibold text-gray-900">2FA Activé</span>
                    </div>
                    <p className="text-xs text-gray-600">Double authentification active</p>
                  </div>

                  <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                      <span className="text-sm font-semibold text-gray-900">Appareils connectés</span>
                    </div>
                    <p className="text-xs text-gray-600">3 appareils autorisés</p>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium">
                      Modifier la sécurité
                    </Button>
                  </motion.div>
                </div>
              </motion.div>

              {/* Appearance */}
              <motion.div
                variants={slideUp}
                transition={{ delay: 0.9 }}
                className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-primary-600 rounded-xl">
                    <Palette className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Apparence</h2>
                    <p className="text-xs text-gray-500">Thème: {appearance.theme === 'light' ? 'Clair' : 'Sombre'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div
                    className={`p-4 bg-gray-50 border-2 rounded-xl cursor-pointer transition-all ${
                      appearance.theme === 'light'
                        ? 'border-primary-600'
                        : 'border-gray-200 hover:border-primary-400'
                    }`}
                    onClick={() => setAppearance((prev) => ({ ...prev, theme: 'light' }))}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white border-2 border-gray-200 rounded-lg" />
                        <span className="text-sm font-semibold text-gray-900">Clair</span>
                      </div>
                      {appearance.theme === 'light' && (
                        <CheckCircle2 className="w-5 h-5 text-primary-600" strokeWidth={1.5} />
                      )}
                    </div>
                  </div>

                  <div
                    className={`p-4 bg-gray-50 border-2 rounded-xl cursor-pointer transition-all ${
                      appearance.theme === 'dark'
                        ? 'border-primary-600'
                        : 'border-gray-200 hover:border-primary-400'
                    }`}
                    onClick={() => setAppearance((prev) => ({ ...prev, theme: 'dark' }))}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-900 border-2 border-gray-700 rounded-lg" />
                        <span className="text-sm font-semibold text-gray-900">Sombre</span>
                      </div>
                      {appearance.theme === 'dark' && (
                        <CheckCircle2 className="w-5 h-5 text-primary-600" strokeWidth={1.5} />
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-2">Langue</Label>
                    <Select
                      value={appearance.language}
                      onValueChange={(value) =>
                        setAppearance((prev) => ({ ...prev, language: value as 'fr' | 'en' | 'es' }))
                      }
                    >
                      <SelectTrigger className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français (FR)</SelectItem>
                        <SelectItem value="en">English (EN)</SelectItem>
                        <SelectItem value="es">Español (ES)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-primary-600 hover:from-indigo-700 hover:to-primary-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium">
                      Personnaliser
                    </Button>
                  </motion.div>
                </div>
              </motion.div>

              {/* Data & Privacy */}
              <motion.div
                variants={slideUp}
                transition={{ delay: 1 }}
                className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                    <FileText className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Données</h2>
                    <p className="text-xs text-gray-500">2.4 GB utilisés</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900">Partage de données</span>
                      <Badge className="text-xs text-amber-600 font-bold bg-amber-100 border-0">LIMITÉ</Badge>
                    </div>
                    <p className="text-xs text-gray-600">Contrôlez qui accède à vos données</p>
                  </div>

                  <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900">Cookies analytiques</span>
                      <Switch
                        checked={appearance.analyticsCookies}
                        onCheckedChange={(checked) =>
                          setAppearance((prev) => ({ ...prev, analyticsCookies: checked }))
                        }
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      {appearance.analyticsCookies ? 'Activé' : 'Désactivé'}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                      <Button
                        variant="outline"
                        onClick={handleExport}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm"
                      >
                        Exporter
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                      <Button
                        variant="destructive"
                        className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium text-sm"
                      >
                        Supprimer
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
