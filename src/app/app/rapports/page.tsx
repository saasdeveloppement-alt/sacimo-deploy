'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { generateReportPDF } from '@/lib/services/pdf-generator';
import { mockMetrics, mockPriceEvolution, mockReports, type Report } from '@/lib/data/mock-reports';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  FileText,
  Eye,
  Zap,
  Bell,
  Clock,
  Heart,
  Mail,
  MessageCircle,
} from 'lucide-react';
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
} from 'recharts';

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
};

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

// Mock data for charts
const priceEvolutionData = [
  { date: '7 oct', price: 275000 },
  { date: '14 oct', price: 282000 },
  { date: '21 oct', price: 278000 },
  { date: '28 oct', price: 285000 },
  { date: '4 nov', price: 283000 },
];

const typeDistributionData = [
  { name: 'Appartements', value: 45, color: '#7C5CDB' },
  { name: 'Maisons', value: 30, color: '#5E3A9B' },
  { name: 'Studios', value: 18, color: '#A590F0' },
  { name: 'Autres', value: 7, color: '#8B72E7' },
];

const activityData = [
  { day: 'Lun', count: 18 },
  { day: 'Mar', count: 24 },
  { day: 'Mer', count: 19 },
  { day: 'Jeu', count: 27 },
  { day: 'Ven', count: 23 },
  { day: 'Sam', count: 15 },
  { day: 'Dim', count: 12 },
];

const geographicData = [
  { city: 'Paris', count: 45 },
  { city: 'Lyon', count: 28 },
  { city: 'Marseille', count: 22 },
  { city: 'Toulouse', count: 18 },
  { city: 'Bordeaux', count: 15 },
  { city: 'Nice', count: 12 },
];

export default function RapportsPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  const handleAnalyzeReport = (report: Report) => {
    toast.info('Analyse en cours de développement', {
      description: `Analyse détaillée du rapport "${report.title}" bientôt disponible.`
    });
  };

  const handleDownloadReport = (report: Report) => {
    try {
      const fileName = generateReportPDF(report);
      
      toast.success('Rapport PDF téléchargé', {
        description: `Le rapport "${report.title}" a été téléchargé : ${fileName}`
      });
    } catch (error) {
      toast.error('Erreur lors du téléchargement', {
        description: 'Impossible de générer le PDF. Veuillez réessayer.'
      });
    }
  };

  const handleCreateReport = () => {
    toast.success('Rapport en cours de génération', {
      description: 'Votre nouveau rapport sera disponible dans quelques instants.'
    });
    setIsCreateDialogOpen(false);
  };

  if (!mounted) {
  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
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
          {/* Page Header */}
          <motion.div className="mb-8" variants={slideUp}>
            <div className="flex items-center space-x-4 mb-3">
              <motion.div
                className="p-3 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <BarChart3 className="w-8 h-8 text-white" strokeWidth={1.5} />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                  Rapports
                </h1>
                <p className="text-gray-600 mt-1">Analysez vos performances et générez des rapports détaillés</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
          >
            {[
              {
                icon: TrendingUp,
                iconBg: "from-pink-400 to-red-500",
                title: "Nouvelles Annonces",
                value: mockMetrics.newListings.value.toString(),
                subtitle: "7 derniers jours",
                trend: mockMetrics.newListings.trend,
                trendDirection: mockMetrics.newListings.trendDirection,
                progress: 65,
                delay: 0,
              },
              {
                icon: FileText,
                iconBg: "from-amber-400 to-orange-500",
                title: "Prix Médian",
                value: mockMetrics.medianPrice.value,
                subtitle: "Paris",
                trend: mockMetrics.medianPrice.trend,
                trendDirection: mockMetrics.medianPrice.trendDirection,
                progress: 58,
                delay: 0.1,
              },
              {
                icon: Zap,
                iconBg: "from-yellow-400 to-amber-500",
                title: "Bonnes Affaires",
                value: mockMetrics.opportunities.value.toString(),
                subtitle: "Prix < -15% marché",
                badge: "HOT 🔥",
                progress: 85,
                delay: 0.2,
              },
              {
                icon: Bell,
                iconBg: "from-amber-400 to-yellow-500",
                title: "Alertes",
                value: mockMetrics.alerts.value.toString(),
                subtitle: "Aujourd'hui",
                badge: "À VOIR",
                progress: 42,
                delay: 0.3,
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                transition={{ delay: stat.delay }}
                className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
                whileHover={{ y: -8, scale: 1.02 }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
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
                    <div className={`p-3 bg-gradient-to-br ${stat.iconBg} rounded-xl shadow-md`}>
                      <stat.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                    </div>
                    {stat.badge && (
                      <Badge className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 rounded-full text-xs font-bold border-0">
                        {stat.badge}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">{stat.title}</p>
                    <motion.h3
                      className="text-4xl font-bold text-gray-900 mb-2"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + stat.delay, type: "spring" }}
                    >
                      {stat.value}
                    </motion.h3>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs text-gray-500">{stat.subtitle}</p>
                      {stat.trend && (
                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${
                          stat.trendDirection === 'up'
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {stat.trendDirection === 'up' ? (
                            <TrendingUp className="w-4 h-4" strokeWidth={2} />
                          ) : (
                            <TrendingDown className="w-4 h-4" strokeWidth={2} />
                          )}
                          <span>{stat.trend}</span>
                        </div>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className={`bg-gradient-to-r ${stat.iconBg} h-2 rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.progress}%` }}
                        transition={{ duration: 1.5, delay: 1 + stat.delay }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Price Evolution Chart */}
            <motion.div
              className="lg:col-span-2"
              variants={slideUp}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl">
                        <TrendingUp className="w-5 h-5 text-white" strokeWidth={1.5} />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Évolution Prix Moyen</CardTitle>
                        <CardDescription className="text-sm text-gray-500">30 derniers jours</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium border-primary-200">
                        30J
                      </Button>
                      <Button variant="outline" size="sm" className="px-3 py-1 text-gray-500 rounded-lg text-sm font-medium hover:bg-gray-100 border-gray-200">
                        90J
                      </Button>
                      <Button variant="outline" size="sm" className="px-3 py-1 text-gray-500 rounded-lg text-sm font-medium hover:bg-gray-100 border-gray-200">
                        1A
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={priceEvolutionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                      <YAxis
                        stroke="#64748B"
                        fontSize={11}
                        tickFormatter={(value) => `${value / 1000}k €`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          border: "none",
                          borderRadius: "8px",
                          padding: "12px",
                        }}
                        formatter={(value: number) => [`${value.toLocaleString()} €`, "Prix moyen"]}
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

            {/* Distribution Pie Chart */}
            <motion.div
              variants={slideUp}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
                      <BarChart3 className="w-5 h-5 text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Par Type</CardTitle>
                      <CardDescription className="text-sm text-gray-500">Distribution actuelle</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={typeDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {typeDistributionData.map((entry, index) => (
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
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Secondary Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Activity Chart */}
            <motion.div
              variants={slideUp}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                      <BarChart3 className="w-5 h-5 text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Activité Hebdomadaire</CardTitle>
                      <CardDescription className="text-sm text-gray-500">Nouvelles annonces par jour</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          border: "none",
                          borderRadius: "8px",
                          padding: "12px",
                        }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {activityData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index % 2 === 0 ? "#10B981" : "#34D399"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Geographic Chart */}
            <motion.div
              variants={slideUp}
              transition={{ delay: 0.7 }}
            >
              <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
        <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-primary-600 rounded-xl">
                      <BarChart3 className="w-5 h-5 text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Top Villes</CardTitle>
                      <CardDescription className="text-sm text-gray-500">Nombre d'annonces par ville</CardDescription>
                    </div>
                  </div>
        </CardHeader>
        <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={geographicData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis type="number" stroke="#64748B" fontSize={11} />
                      <YAxis dataKey="city" type="category" stroke="#64748B" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          border: "none",
                          borderRadius: "8px",
                          padding: "12px",
                        }}
                      />
                      <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                        {geographicData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index % 2 === 0 ? "#7C5CDB" : "#5E3A9B"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
        </CardContent>
      </Card>
            </motion.div>
          </div>

          {/* Performance Metrics */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
          >
            {[
              {
                icon: Eye,
                iconBg: "from-blue-400 to-indigo-500",
                title: "Vues Totales",
                value: "2,847",
                trend: "+18.3%",
                delay: 0.8,
              },
              {
                icon: Heart,
                iconBg: "from-primary-400 to-pink-500",
                title: "Favoris",
                value: "184",
                trend: "+12.4%",
                delay: 0.9,
              },
              {
                icon: Mail,
                iconBg: "from-green-400 to-emerald-500",
                title: "Messages",
                value: "67",
                trend: "+8.2%",
                delay: 1,
              },
              {
                icon: Clock,
                iconBg: "from-orange-400 to-red-500",
                title: "Temps Moyen",
                value: "3m 24s",
                trend: "+24.1%",
                delay: 1.1,
              },
            ].map((metric, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                transition={{ delay: metric.delay }}
                className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${metric.iconBg} rounded-xl shadow-md`}>
                    <metric.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-2">{metric.title}</p>
                <motion.h3
                  className="text-3xl font-bold text-gray-900 mb-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + metric.delay, type: "spring" }}
                >
                  {metric.value}
                </motion.h3>
                <div className="flex items-center space-x-1 text-green-600 text-sm font-semibold">
                  <TrendingUp className="w-4 h-4" strokeWidth={2} />
                  <span>{metric.trend}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Reports Table */}
          <motion.div
            variants={slideUp}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl shadow-lg hover:shadow-xl transition-all mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-1">Vos rapports générés</CardTitle>
                    <CardDescription className="text-sm text-gray-500">Gérez et analysez vos rapports</CardDescription>
                  </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                          ➕ Nouveau rapport
                        </Button>
                      </motion.div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau rapport</DialogTitle>
                  <DialogDescription>
                    Configurez les paramètres de votre rapport
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ville</label>
                          <select className="w-full p-2 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200">
                      <option>Paris</option>
                      <option>Lyon</option>
                      <option>Marseille</option>
                      <option>Bordeaux</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Période</label>
                          <select className="w-full p-2 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200">
                      <option>7 derniers jours</option>
                      <option>30 derniers jours</option>
                      <option>90 derniers jours</option>
                    </select>
                  </div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            onClick={handleCreateReport}
                            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                          >
                    Générer le rapport
                  </Button>
                        </motion.div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
                <div className="space-y-3">
                  {mockReports.map((report, index) => (
                    <motion.div
                key={report.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/50 transition-all group"
              >
                <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
                        <p className="text-sm text-gray-600">
                    📍 {report.location}
                  </p>
                </div>

                      <div className="flex items-center gap-6 text-sm mr-6">
                        <div className="text-gray-700">💰 {report.medianPrice.toLocaleString('fr-FR')}€</div>
                        <div className="text-gray-700">📊 {report.listingsCount} annonces</div>
                        <div className="text-gray-700">👥 {report.newClients} clients</div>
                        <div className="text-gray-700">📈 {report.marketShare}% marché</div>
                </div>

                {report.badges && report.badges.length > 0 && (
                        <div className="flex gap-2 mr-4">
                    {report.badges.includes('opportunity') && (
                            <Badge className="bg-gradient-to-r from-primary-600 to-primary-700 text-white border-0">🔥 Opportunité</Badge>
                    )}
                    {report.badges.includes('trending') && (
                            <Badge className="bg-primary-100 text-primary-700 border-primary-200">📈 Tendance</Badge>
                    )}
                    {report.badges.includes('hot') && (
                      <Badge variant="destructive">⚡ Hot</Badge>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewReport(report)}
                          className="border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                  >
                          <Eye className="h-4 w-4 mr-1" strokeWidth={1.5} />
                          Voir
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAnalyzeReport(report)}
                          className="border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                  >
                          <BarChart3 className="h-4 w-4 mr-1" strokeWidth={1.5} />
                          Analyser
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadReport(report)}
                          className="border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                  >
                          <Download className="h-4 w-4 mr-1" strokeWidth={1.5} />
                          Télécharger
                  </Button>
                </div>
                    </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
          </motion.div>

          {/* Export Section */}
          <motion.div
            variants={slideUp}
            transition={{ delay: 1.2 }}
          >
            <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-all">
              <CardContent className="max-w-2xl mx-auto">
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl mb-6"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(124, 92, 219, 0.4)",
                      "0 0 40px rgba(124, 92, 219, 0.6)",
                      "0 0 20px rgba(124, 92, 219, 0.4)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Download className="w-8 h-8 text-white" strokeWidth={1.5} />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Exporter vos rapports</h2>
                <p className="text-gray-600 mb-6">
                  Téléchargez vos données et analyses sous différents formats
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2">
                      <FileText className="w-5 h-5" strokeWidth={1.5} />
                      <span>Export PDF</span>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" className="px-6 py-3 bg-white border-2 border-primary-200 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-all inline-flex items-center space-x-2">
                      <FileText className="w-5 h-5" strokeWidth={1.5} />
                      <span>Export Excel</span>
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

      {/* Dialog Voir Rapport */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>
              📍 {selectedReport?.location}
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Prix médian</p>
                  <p className="text-2xl font-bold">
                    {selectedReport.medianPrice.toLocaleString('fr-FR')}€
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Annonces</p>
                  <p className="text-2xl font-bold">{selectedReport.listingsCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nouveaux clients</p>
                  <p className="text-2xl font-bold">{selectedReport.newClients}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Part de marché</p>
                  <p className="text-2xl font-bold">{selectedReport.marketShare}%</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Évolution des prix</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={mockPriceEvolution.map(item => ({ date: item.date, price: item.price }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                        <YAxis
                          stroke="#64748B"
                          fontSize={11}
                          tickFormatter={(value) => `${value / 1000}k €`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            border: "none",
                            borderRadius: "8px",
                            padding: "12px",
                          }}
                          formatter={(value: number) => [`${value.toLocaleString()} €`, "Prix"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="#7C5CDB"
                          strokeWidth={2}
                          dot={{ fill: "#7C5CDB", r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
              </div>
              
              {selectedReport.badges && selectedReport.badges.length > 0 && (
                <div className="flex gap-2">
                  {selectedReport.badges.map(badge => (
                    <Badge key={badge}>{badge}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
        </motion.div>
      </div>

      {/* Floating Chat Button */}
      <motion.button
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-full shadow-2xl z-50 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            "0 0 20px rgba(124, 92, 219, 0.4)",
            "0 0 40px rgba(124, 92, 219, 0.6)",
            "0 0 20px rgba(124, 92, 219, 0.4)",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <MessageCircle className="w-6 h-6" strokeWidth={1.5} />
      </motion.button>
    </div>
  );
}
