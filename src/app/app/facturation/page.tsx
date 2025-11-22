'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  mockPlans, 
  mockInvoices, 
  mockPaymentMethods, 
  mockUsage,
  type Plan 
} from '@/lib/data/mock-billing';
import { 
  Download, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  MessageCircle,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function FacturationPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [activeTab, setActiveTab] = useState('abonnement');
  const currentPlan = mockPlans.find(p => p.current);

  const handleUpgrade = (plan: Plan) => {
    setSelectedPlan(plan);
    toast.success('Changement de plan', {
      description: `Passage au plan ${plan.name} en cours...`
    });
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success('Facture téléchargée', {
      description: `Facture ${invoiceId} téléchargée au format PDF`
    });
  };

  // Données pour les graphiques
  const usageData = [
    { week: 'Sem 1', searches: 45 },
    { week: 'Sem 2', searches: 62 },
    { week: 'Sem 3', searches: 58 },
    { week: 'Sem 4', searches: 82 },
  ];

  const quotaData = [
    { name: 'Recherches', value: 65, color: '#7C5CDB' },
    { name: 'Alertes', value: 38, color: '#5E3A9B' },
    { name: 'API', value: 12, color: '#06b6d4' },
    { name: 'Disponible', value: 35, color: '#e5e7eb' },
  ];

  // Calculs d'utilisation
  const searchesUsed = 247;
  const searchesLimit = -1; // Illimité
  const alertsUsed = 38;
  const alertsLimit = 100;
  const apiCallsUsed = 1200;
  const apiCallsLimit = 10000;

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
                <motion.div
                  className="p-2 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <CreditCard className="w-8 h-8 text-white" strokeWidth={1.5} />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Facturation & Abonnement</h1>
                  <p className="text-sm text-gray-500">Gérez votre abonnement, consultez vos factures et votre consommation</p>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium">
                  Contacter le support
                </Button>
              </motion.div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 mb-8"
          >
            {[
              { id: 'abonnement', label: '📊 Abonnement', emoji: '📊' },
              { id: 'factures', label: '🧾 Factures', emoji: '🧾' },
              { id: 'paiement', label: '💳 Paiement', emoji: '💳' },
              { id: 'usage', label: '📈 Consommation', emoji: '📈' },
            ].map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </motion.div>

          {/* TAB 1 : ABONNEMENT */}
          {activeTab === 'abonnement' && (
            <>
              {/* Current Subscription Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-8 mb-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Votre abonnement actuel</h2>
                    <p className="text-gray-600">Vous êtes actuellement sur le plan {currentPlan?.name}</p>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="px-6 py-3 bg-white border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all font-medium">
                      Annuler l'abonnement
                    </Button>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Plan Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-end space-x-3 mb-4">
                      <h3 className="text-5xl font-bold text-gray-900">{currentPlan?.name}</h3>
                      <div className="pb-2">
                        <span className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                          {currentPlan?.price}€
                        </span>
                        <span className="text-gray-600">/mois</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">Renouvellement le 1er décembre 2025</p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {currentPlan?.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                          className={`flex items-center space-x-3 p-3 rounded-xl ${
                            index % 4 === 0 ? 'bg-primary-50' :
                            index % 4 === 1 ? 'bg-blue-50' :
                            index % 4 === 2 ? 'bg-indigo-50' :
                            'bg-cyan-50'
                          }`}
                        >
                          <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${
                            index % 4 === 0 ? 'text-primary-600' :
                            index % 4 === 1 ? 'text-blue-600' :
                            index % 4 === 2 ? 'text-indigo-600' :
                            'text-cyan-600'
                          }`} strokeWidth={1.5} />
                          <span className="text-sm font-semibold text-gray-900">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Usage Stats */}
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl border-2 border-primary-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Utilisation ce mois</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Recherches</span>
                            <span className="text-xs font-bold text-gray-900">
                              {searchesUsed} / {searchesLimit === -1 ? 'Illimité' : searchesLimit}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: '65%' }}
                              transition={{ duration: 1.5 }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Alertes</span>
                            <span className="text-xs font-bold text-gray-900">
                              {alertsUsed} / {alertsLimit}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(alertsUsed / alertsLimit) * 100}%` }}
                              transition={{ duration: 1.5, delay: 0.2 }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">API Calls</span>
                            <span className="text-xs font-bold text-gray-900">
                              {apiCallsUsed.toLocaleString()} / {apiCallsLimit.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(apiCallsUsed / apiCallsLimit) * 100}%` }}
                              transition={{ duration: 1.5, delay: 0.4 }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium">
                        Voir les détails
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Usage Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Consommation mensuelle</h3>
                    <Select defaultValue="30">
                      <SelectTrigger className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 derniers jours</SelectItem>
                        <SelectItem value="90">3 derniers mois</SelectItem>
                        <SelectItem value="365">12 derniers mois</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="week" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          border: "none",
                          borderRadius: "8px",
                          padding: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="searches"
                        stroke="#7C5CDB"
                        strokeWidth={3}
                        dot={{ fill: "#7C5CDB", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Répartition des quotas</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={quotaData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {quotaData.map((entry, index) => (
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
                </motion.div>
              </div>

              {/* Pricing Plans */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tous les plans</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {mockPlans.map((plan, index) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className={`bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all relative ${
                        plan.current ? 'border-2 border-primary-600' : ''
                      }`}
                      whileHover={{ y: -8 }}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="px-3 py-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs font-bold rounded-full border-0">
                            POPULAIRE
                          </Badge>
                        </div>
                      )}
                      {plan.current && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full border-0">
                            PLAN ACTUEL
                          </Badge>
                        </div>
                      )}

                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className={`text-4xl font-bold ${
                          plan.current
                            ? 'bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent'
                            : 'text-gray-900'
                        }`}>
                          {plan.price}€
                        </span>
                        <span className="text-gray-600">/mois</span>
                      </div>
                      
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <CheckCircle2
                              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                plan.current ? 'text-primary-500' : 'text-emerald-500'
                              }`}
                              strokeWidth={1.5}
                            />
                            <span className={`text-sm ${
                              plan.current ? 'font-semibold text-gray-900' : 'text-gray-700'
                            }`}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {!plan.current && (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            onClick={() => handleUpgrade(plan)}
                            className={`w-full px-4 py-3 rounded-xl font-medium transition-all ${
                              plan.popular
                                ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl'
                                : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {plan.price > (currentPlan?.price || 0) ? 'Passer à ce plan' : 'Rétrograder'}
                          </Button>
                        </motion.div>
                      )}
                      
                      {plan.current && (
                        <Button
                          className="w-full px-4 py-3 bg-primary-100 text-primary-700 rounded-xl font-medium cursor-not-allowed"
                          disabled
                        >
                          Plan actuel
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2 : FACTURES */}
          {activeTab === 'factures' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Historique de facturation</h2>
              <p className="text-sm text-gray-600 mb-6">Téléchargez vos factures au format PDF</p>
              <div className="space-y-4">
                {mockInvoices.map((invoice) => (
                  <motion.div
                    key={invoice.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">{invoice.id}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(invoice.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <Badge
                        className={
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : invoice.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            : 'bg-red-100 text-red-700 border-red-200'
                        }
                      >
                        {invoice.status === 'paid' ? 'Payé' :
                         invoice.status === 'pending' ? 'En attente' :
                         'Échoué'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-bold text-gray-900">{invoice.amount}€</p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                        >
                          <Download className="h-4 w-4 mr-2" strokeWidth={1.5} />
                          Télécharger
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3 : MOYENS DE PAIEMENT */}
          {activeTab === 'paiement' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Moyens de paiement</h2>
              <p className="text-sm text-gray-600 mb-6">Gérez vos cartes bancaires et moyens de paiement</p>
              <div className="space-y-4">
                {mockPaymentMethods.map((method) => (
                  <motion.div
                    key={method.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-8 w-8 text-primary-600" strokeWidth={1.5} />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {method.brand} •••• {method.last4}
                        </p>
                        <p className="text-sm text-gray-600">
                          Expire le {method.expiryMonth}/{method.expiryYear}
                        </p>
                      </div>
                      {method.isDefault && (
                        <Badge className="bg-primary-100 text-primary-700 border-primary-200">
                          Par défaut
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-gray-200 hover:border-primary-300 hover:bg-primary-50">
                        Modifier
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600">
                        Supprimer
                      </Button>
                    </div>
                  </motion.div>
                ))}
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className="w-full border-2 border-dashed border-gray-300 hover:border-primary-400 hover:bg-primary-50 text-gray-700 hover:text-primary-700">
                    ➕ Ajouter une carte
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* TAB 4 : CONSOMMATION */}
          {activeTab === 'usage' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Votre consommation</h2>
              <p className="text-sm text-gray-600 mb-6">Suivez votre utilisation mensuelle</p>
              <div className="space-y-6">
                {Object.entries(mockUsage).map(([key, data], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900 capitalize">
                        {key === 'searches' ? 'Recherches' :
                         key === 'reports' ? 'Rapports' :
                         key === 'alerts' ? 'Alertes' :
                         'Appels API'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {data.used.toLocaleString('fr-FR')}
                        {data.limit > 0 ? ` / ${data.limit.toLocaleString('fr-FR')}` : ' / Illimité'}
                      </p>
                    </div>
                    <Progress value={data.percentage || 0} className="h-2" />
                    {data.percentage > 80 && data.limit > 0 && (
                      <p className="text-sm text-orange-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" strokeWidth={1.5} />
                        Vous approchez de la limite
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </main>
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
