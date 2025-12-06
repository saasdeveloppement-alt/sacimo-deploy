"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  Building2,
  CreditCard,
  FileText,
  Home,
  MapPin,
  MessageCircle,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  TrendingDown,
  Zap,
  HelpCircle,
  Download,
  Activity,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
}

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
}

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
}

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -8,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
}

// Mock data for charts
const marketData = [
  { month: "Jan", price: 9800 },
  { month: "Fév", price: 10100 },
  { month: "Mar", price: 10200 },
  { month: "Avr", price: 10450 },
  { month: "Mai", price: 10350 },
  { month: "Juin", price: 10600 },
  { month: "Juil", price: 10800 },
  { month: "Août", price: 11000 },
  { month: "Sep", price: 10900 },
  { month: "Oct", price: 11200 },
  { month: "Nov", price: 11400 },
]

const distributionData = [
  { name: "Appartements", value: 45, color: "#7C5CDB" },
  { name: "Maisons", value: 30, color: "#5E3A9B" },
  { name: "Studios", value: 15, color: "#A590F0" },
  { name: "Autres", value: 10, color: "#8B72E7" },
]

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Floating Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
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
          className="absolute top-40 right-10 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
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
          className="absolute bottom-20 left-1/3 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
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
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Hero Section */}
          <motion.div
            className="mb-8 relative overflow-hidden"
            variants={slideUp}
          >
            <Card className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 relative overflow-hidden border-0 shadow-2xl">
              {/* Background decorative elements */}
              <div className="absolute inset-0 opacity-10">
                <motion.div
                  className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full filter blur-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute bottom-10 left-10 w-64 h-64 bg-white rounded-full filter blur-3xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                  }}
                />
              </div>

              <div className="relative z-10">
                <motion.div
                  className="flex items-center space-x-2 mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Badge className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full backdrop-blur-sm border-0">
                    Nouveau
                  </Badge>
                </motion.div>

                <motion.h1
                  className="text-4xl font-bold text-white mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Bonjour Utilisateur{" "}
                  <motion.span
                    animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                    transition={{
                      duration: 0.5,
                      delay: 1,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                    className="inline-block"
                  >
                    👋
                  </motion.span>
                </motion.h1>

                <motion.p
                  className="text-white/90 mb-6 max-w-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Connecté en tant que utilisateur@sacimo.com. Pilotez votre activité immobilière et découvrez les dernières opportunités du marché.
                </motion.p>

                <motion.div
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      className="px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-white/90 transition-all shadow-lg"
                      asChild
                    >
                      <Link href="/app/annonces">
                        <Search className="w-5 h-5 mr-2" strokeWidth={1.5} />
                        Nouvelle recherche
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-all backdrop-blur-sm border-white/30"
                      asChild
                    >
                      <Link href="/app/rapports">
                        <FileText className="w-5 h-5 mr-2" strokeWidth={1.5} />
                        Voir les rapports
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* Quick Stats Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
          >
            {[
              {
                icon: Search,
                iconBg: "bg-primary-100",
                iconColor: "text-primary-600",
                badge: "+15%",
                badgeColor: "bg-green-100 text-green-700",
                value: "2",
                label: "Recherches Actives",
                sublabel: "vs 1 la semaine dernière",
                delay: 0.1,
              },
              {
                icon: Building2,
                iconBg: "bg-blue-100",
                iconColor: "text-blue-600",
                badge: "Nouveau",
                badgeColor: "bg-green-100 text-green-700",
                value: "2",
                label: "Nouvelles Annonces",
                sublabel: "Ajoutées aujourd'hui",
                delay: 0.2,
              },
              {
                icon: FileText,
                iconBg: "bg-indigo-100",
                iconColor: "text-indigo-600",
                badge: "+2",
                badgeColor: "bg-blue-100 text-blue-700",
                value: "3",
                label: "Rapports Prêts",
                sublabel: "Depuis il y a 2h",
                delay: 0.3,
              },
              {
                icon: Bell,
                iconBg: "bg-amber-100",
                iconColor: "text-amber-600",
                badge: "!",
                badgeColor: "bg-red-100 text-red-700",
                value: "2",
                label: "Alertes Non Lues",
                sublabel: "Derniers: il y a 30min",
                delay: 0.4,
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={cardHoverVariants}
                initial="rest"
                whileHover="hover"
                className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
                style={{ animationDelay: `${stat.delay}s` }}
              >
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
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
                  <div className="flex items-start justify-between mb-4">
                    <motion.div
                      className={`p-3 ${stat.iconBg} rounded-xl`}
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <stat.icon className={`w-6 h-6 ${stat.iconColor}`} strokeWidth={1.5} />
                    </motion.div>
                    <Badge className={`px-2 py-1 ${stat.badgeColor} text-xs font-semibold rounded-full border-0`}>
                      {stat.badge}
                    </Badge>
                  </div>
                  <motion.h3
                    className="text-3xl font-bold text-gray-900 mb-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + stat.delay, type: "spring", stiffness: 200 }}
                  >
                    {stat.value}
                  </motion.h3>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-xs text-gray-400">{stat.sublabel}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column - 2 cols */}
            <div className="lg:col-span-2 space-y-6">
              {/* Market Overview Chart */}
              <motion.div variants={slideInLeft}>
                <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900 mb-1">Aperçu du Marché</CardTitle>
                        <CardDescription className="text-sm text-gray-500">Évolution des prix moyens par m²</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium border-primary-200">
                          Mensuel
                        </Button>
                        <Button variant="outline" size="sm" className="px-3 py-1 text-gray-500 rounded-lg text-sm font-medium hover:bg-gray-100 border-gray-200">
                          Annuel
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={marketData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                        <YAxis
                          stroke="#64748B"
                          fontSize={11}
                          tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            border: "none",
                            borderRadius: "8px",
                            padding: "12px",
                          }}
                          formatter={(value: number) => [`${value.toLocaleString()} €/m²`, "Prix"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="#7C5CDB"
                          strokeWidth={3}
                          dot={{ fill: "#7C5CDB", r: 6 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Activity Timeline */}
              <motion.div variants={slideInLeft} transition={{ delay: 0.2 }}>
                <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900 mb-1">Activités Récentes</CardTitle>
                        <CardDescription className="text-sm text-gray-500">Vos dernières actions</CardDescription>
                      </div>
                      <Button variant="link" className="text-primary-600 text-sm font-semibold hover:text-primary-700 p-0 h-auto" asChild>
                        <Link href="/app/annonces">
                          Tout voir →
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          icon: FileText,
                          iconBg: "bg-primary-100",
                          iconColor: "text-primary-600",
                          title: "Nouvelle recherche créée",
                          time: "Il y a 2h",
                          description: "Paris 2P < 500k€ • 23 résultats trouvés",
                          status: "Actif",
                          statusColor: "bg-green-100 text-green-700",
                          hoverBg: "hover:bg-primary-50",
                        },
                        {
                          icon: MessageCircle,
                          iconBg: "bg-blue-100",
                          iconColor: "text-blue-600",
                          title: "Nouvelle annonce détectée",
                          time: "Il y a 4h",
                          description: "Appartement T3 • Paris • 450 000€",
                          status: "Nouveau",
                          statusColor: "bg-green-100 text-green-700",
                          hoverBg: "hover:bg-blue-50",
                        },
                        {
                          icon: Download,
                          iconBg: "bg-indigo-100",
                          iconColor: "text-indigo-600",
                          title: "Rapport généré",
                          time: "Hier",
                          description: "Studio rénové • Marseille • 280 000€",
                          status: "Récent",
                          statusColor: "bg-primary-100 text-primary-700",
                          hoverBg: "hover:bg-indigo-50",
                        },
                      ].map((activity, index) => (
                        <Link key={index} href="/app/annonces">
                          <motion.div
                            className={`flex items-start space-x-4 p-4 rounded-xl ${activity.hoverBg} transition-colors cursor-pointer`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            whileHover={{ x: 4 }}
                          >
                          <div className={`flex-shrink-0 w-10 h-10 ${activity.iconBg} rounded-full flex items-center justify-center`}>
                            <activity.icon className={`w-5 h-5 ${activity.iconColor}`} strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                              <span className="text-xs text-gray-400">{activity.time}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={`px-2 py-1 ${activity.statusColor} text-xs font-medium rounded-full border-0`}>
                                {activity.status}
                              </Badge>
                              {activity.status === "Actif" && (
                                <span className="text-xs text-gray-400">Dernière mise à jour: il y a 2h</span>
                              )}
                              {activity.status === "Nouveau" && (
                                <span className="text-xs text-gray-400">Ajoutée aujourd'hui il y a 30min</span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - 1 col */}
            <div className="space-y-6">
              {/* Performance Gauge */}
              <motion.div variants={slideInRight}>
                <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-900 mb-6">Performance Globale</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative">
                        <svg className="w-40 h-40 transform -rotate-90">
                          <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="#e5e7eb"
                            strokeWidth="12"
                            fill="none"
                          />
                          <motion.circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="url(#gradient2)"
                            strokeWidth="12"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={440}
                            initial={{ strokeDashoffset: 440 }}
                            animate={{ strokeDashoffset: 96.8 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                          />
                          <defs>
                            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#7C5CDB" stopOpacity={1} />
                              <stop offset="100%" stopColor="#5E3A9B" stopOpacity={1} />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <motion.span
                            className="text-3xl font-bold text-gray-900"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1, type: "spring" }}
                          >
                            78%
                          </motion.span>
                          <span className="text-sm text-gray-500">Succès</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Taux de conversion</span>
                        <span className="text-sm font-semibold text-gray-900">67%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "67%" }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                        />
                      </div>
                    </div>
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Engagement</span>
                        <span className="text-sm font-semibold text-gray-900">89%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-primary-600 to-primary-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "89%" }}
                          transition={{ duration: 1.5, delay: 0.7 }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Distribution Chart */}
              <motion.div variants={slideInRight} transition={{ delay: 0.2 }}>
                <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-900 mb-4">Répartition des Biens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            border: "none",
                            borderRadius: "8px",
                            padding: "12px",
                          }}
                          formatter={(value: number) => [`${value}%`, ""]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="text-center p-3 bg-primary-50 rounded-xl">
                        <p className="text-2xl font-bold text-primary-600">45%</p>
                        <p className="text-xs text-gray-600 mt-1">Appartements</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <p className="text-2xl font-bold text-blue-600">30%</p>
                        <p className="text-xs text-gray-600 mt-1">Maisons</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={slideInRight} transition={{ delay: 0.3 }}>
                <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-900 mb-4">Actions Rapides</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          className="w-full p-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-between group"
                          asChild
                        >
                          <Link href="/app/concurrents">
                            <span className="font-semibold">Voir les concurrents</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
                          </Link>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="w-full p-4 bg-white border-2 border-primary-200 text-primary-600 rounded-xl hover:bg-primary-50 transition-all flex items-center justify-center space-x-2"
                          asChild
                        >
                          <Link href="/app/rapports">
                            <BarChart3 className="w-5 h-5" strokeWidth={1.5} />
                            <span className="font-semibold">Analyser</span>
                          </Link>
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Search Activity */}
            <motion.div variants={slideUp} transition={{ delay: 0.5 }}>
              <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 mb-1">Mes Recherches</CardTitle>
                      <CardDescription className="text-sm text-gray-500">Recherches actives • 2 résultats</CardDescription>
                    </div>
                    <Button variant="link" className="text-primary-600 text-sm font-semibold hover:text-primary-700 p-0 h-auto">
                      Voir toutes →
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        title: "Paris 2P < 500k€",
                        description: "23 résultats • Dernière mise à jour: il y a 2h",
                        status: "Actif",
                        gradient: "from-primary-50 to-blue-50",
                        border: "border-primary-200",
                      },
                      {
                        title: "Lyon Maisons 4P+",
                        description: "16 résultats • Dernière mise à jour: il y a 4h",
                        status: "Actif",
                        gradient: "from-blue-50 to-primary-50",
                        border: "border-blue-200",
                      },
                    ].map((search, index) => (
                      <motion.div
                        key={index}
                        className={`p-4 bg-gradient-to-r ${search.gradient} rounded-xl border ${search.border} hover:shadow-md transition-all cursor-pointer`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{search.title}</h4>
                          <Badge className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full border-0">
                            {search.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{search.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Price Trends */}
            <motion.div variants={slideUp} transition={{ delay: 0.6 }}>
              <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 mb-1">Suivi Concurrents</CardTitle>
                      <CardDescription className="text-sm text-gray-500">45 annonces suivies</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <motion.div
                      className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Volume hebdomadaire</h4>
                        <p className="text-sm text-gray-600 mt-1">45 nouvelles annonces</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">+12%</p>
                        <p className="text-xs text-gray-500">vs semaine dernière</p>
                      </div>
                    </motion.div>
                    <motion.div
                      className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Prix moyen</h4>
                        <p className="text-sm text-gray-600 mt-1">520 000€ sur le marché</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600">-3%</p>
                        <p className="text-xs text-gray-500">vs mois dernier</p>
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
