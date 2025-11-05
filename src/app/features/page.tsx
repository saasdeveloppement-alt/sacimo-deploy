"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  BarChart3, 
  Bell, 
  Users, 
  TrendingUp, 
  Shield,
  Zap,
  Target,
  Building2,
  Clock,
  FileText,
  Download,
  Eye,
  Filter,
  MapPin,
  Calendar,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: Search,
    title: "Recherches intelligentes",
    description: "Configurez vos critères de recherche comme sur LeBonCoin et recevez les nouvelles annonces en temps réel.",
    details: [
      "Critères avancés (prix, surface, pièces, zones)",
      "Recherche par mots-clés",
      "Filtres par type de vendeur (particulier/pro)",
      "Sauvegarde de recherches multiples"
    ]
  },
  {
    icon: BarChart3,
    title: "Tableau de bord centralisé",
    description: "Visualisez toutes vos données immobilières en un seul endroit avec des graphiques interactifs.",
    details: [
      "Vue d'ensemble 24h/48h/7j",
      "Graphiques de tendances",
      "Top codes postaux",
      "Répartition par type de bien"
    ]
  },
  {
    icon: Bell,
    title: "Rapports quotidiens",
    description: "Recevez chaque matin un rapport détaillé des nouvelles annonces par email et dans l'app.",
    details: [
      "Rapport automatique à 8h00",
      "Séparation particuliers/pros",
      "Export PDF et CSV",
      "Historique des rapports"
    ]
  },
  {
    icon: Users,
    title: "Veille concurrentielle",
    description: "Surveillez l'activité des agences concurrentes dans vos zones d'intervention.",
    details: [
      "Liste des concurrents",
      "Dernières mises en vente",
      "Prix moyen au m² observé",
      "Volume hebdomadaire"
    ]
  },
  {
    icon: TrendingUp,
    title: "Analytics avancés",
    description: "Analysez les tendances du marché et optimisez votre stratégie commerciale.",
    details: [
      "Évolution des prix",
      "Temps de vente moyen",
      "Saisonnalité du marché",
      "Comparaisons de zones"
    ]
  },
  {
    icon: Shield,
    title: "Sécurité & conformité",
    description: "Respect des CGU des sites tiers et conformité RGPD pour une utilisation en toute sécurité.",
    details: [
      "Conformité RGPD",
      "Respect des CGU",
      "Chiffrement des données",
      "Sauvegarde sécurisée"
    ]
  }
]

const workflowSteps = [
  {
    step: "1",
    title: "Configuration",
    description: "Définissez vos critères de recherche comme sur LeBonCoin",
    icon: Filter
  },
  {
    step: "2", 
    title: "Surveillance",
    description: "SACIMO surveille en continu les nouvelles annonces",
    icon: Eye
  },
  {
    step: "3",
    title: "Rapport",
    description: "Recevez chaque matin un rapport personnalisé",
    icon: FileText
  },
  {
    step: "4",
    title: "Action",
    description: "Contactez les vendeurs en premier",
    icon: Target
  }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="secondary" className="mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Fonctionnalités complètes
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Tout ce dont vous avez besoin pour
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                dominer le marché
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Une plateforme complète qui automatise votre veille immobilière et vous donne 
              un avantage concurrentiel décisif.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" data-magnetic data-cursor="Try">
                Commencer l'essai gratuit
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" data-magnetic data-cursor="View">
                Voir les tarifs
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-sm text-gray-500">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600">
              Un processus simple en 4 étapes pour transformer votre veille immobilière
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">
                  {step.step}
                </div>
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md">
                  <step.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
                
                {index < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 transform translate-x-1/2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Prêt à découvrir toutes ces fonctionnalités ?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Commencez votre essai gratuit de 14 jours et explorez toutes les fonctionnalités 
              de SACIMO sans engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100"
                data-magnetic
                data-cursor="Try"
              >
                Commencer l'essai gratuit
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-blue-600"
                data-magnetic
                data-cursor="View"
              >
                Voir les tarifs
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}











