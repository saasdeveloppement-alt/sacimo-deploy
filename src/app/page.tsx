"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  Search, 
  Bell, 
  Users, 
  TrendingUp, 
  Shield,
  CheckCircle,
  ArrowRight,
  Star,
  Building2,
  Target,
  Zap
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const features = [
  {
    icon: Search,
    title: "Recherches intelligentes",
    description: "Configurez vos critères de recherche comme sur LeBonCoin et recevez les nouvelles annonces en temps réel."
  },
  {
    icon: BarChart3,
    title: "Tableau de bord centralisé",
    description: "Visualisez toutes vos données immobilières en un seul endroit avec des graphiques interactifs."
  },
  {
    icon: Bell,
    title: "Rapports quotidiens",
    description: "Recevez chaque matin un rapport détaillé des nouvelles annonces par email et dans l'app."
  },
  {
    icon: Users,
    title: "Veille concurrentielle",
    description: "Surveillez l'activité des agences concurrentes dans vos zones d'intervention."
  },
  {
    icon: TrendingUp,
    title: "Analytics avancés",
    description: "Analysez les tendances du marché et optimisez votre stratégie commerciale."
  },
  {
    icon: Shield,
    title: "Sécurité & conformité",
    description: "Respect des CGU des sites tiers et conformité RGPD pour une utilisation en toute sécurité."
  }
]

const stats = [
  { value: "500+", label: "Agences partenaires" },
  { value: "98%", label: "Satisfaction client" },
  { value: "50k+", label: "Annonces suivies" },
  { value: "24/7", label: "Surveillance continue" }
]

const steps = [
  {
    number: "01",
    title: "S'inscrire",
    description: "Créez votre compte en quelques clics et commencez votre essai gratuit de 14 jours."
  },
  {
    number: "02", 
    title: "Configurer",
    description: "Définissez vos critères de recherche (zones, prix, types de biens) comme vous le feriez sur LeBonCoin."
  },
  {
    number: "03",
    title: "Recevoir le reporting",
    description: "Obtenez chaque matin un rapport détaillé des nouvelles annonces correspondant à vos critères."
  }
]

const pricingPlans = [
  {
    name: "Starter",
    price: "29",
    period: "/mois",
    description: "Parfait pour les agents individuels",
    features: [
      "1 utilisateur",
      "5 recherches actives",
      "1 rapport quotidien",
      "Support email",
      "Données 30 jours"
    ],
    popular: false
  },
  {
    name: "Pro", 
    price: "79",
    period: "/mois",
    description: "Idéal pour les petites équipes",
    features: [
      "5 utilisateurs",
      "20 recherches actives", 
      "Rapports illimités",
      "Export CSV/PDF",
      "Support prioritaire",
      "Données 90 jours"
    ],
    popular: true
  },
  {
    name: "Agence",
    price: "199",
    period: "/mois", 
    description: "Pour les grandes agences",
    features: [
      "Utilisateurs illimités",
      "Recherches illimitées",
      "SSO & API",
      "Support dédié",
      "Formation personnalisée",
      "Données 1 an"
    ],
    popular: false
  }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-6"
            >
              <Badge variant="secondary" className="mb-4">
                <Star className="w-4 h-4 mr-2" />
                Nouveau : Veille concurrentielle
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Ne ratez plus
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  aucune opportunité
                </span>
                immobilière
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-gray-600 mb-8 max-w-2xl"
            >
              SACIMO surveille en continu les nouvelles annonces immobilières selon vos critères 
              et vous envoie un rapport quotidien personnalisé. Comme LeBonCoin, mais automatisé.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button size="lg" className="text-lg px-8 py-6" data-magnetic data-cursor="Try">
                Commencer l'essai gratuit
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" data-magnetic data-cursor="View">
                Voir les tarifs
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-8 text-sm text-gray-500"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                Essai gratuit 14 jours
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                Aucune carte requise
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                Support en français
              </div>
            </motion.div>
          </motion.div>

          {/* Right content - Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
              {/* Mockup header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <span className="font-semibold text-gray-900">SACIMO Dashboard</span>
                </div>
                <Badge variant="secondary">24h</Badge>
              </div>

              {/* Mockup content */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">47</div>
                    <div className="text-sm text-gray-600">Nouvelles annonces</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">32</div>
                    <div className="text-sm text-gray-600">Particuliers</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">15</div>
                    <div className="text-sm text-gray-600">Professionnels</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded flex items-center justify-center">
                    <BarChart3 className="w-12 h-12 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded"></div>
                      <div>
                        <div className="font-medium text-sm">Appartement 3 pièces</div>
                        <div className="text-xs text-gray-500">Paris 15e • 450 000€</div>
                      </div>
                    </div>
                    <Badge variant="outline">Particulier</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded"></div>
                      <div>
                        <div className="font-medium text-sm">Maison 4 pièces</div>
                        <div className="text-xs text-gray-500">Boulogne • 680 000€</div>
                      </div>
                    </div>
                    <Badge variant="outline">Pro</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              +12 nouvelles
            </motion.div>
            <motion.div
              className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
            >
              Rapport envoyé
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
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
              Tout ce dont vous avez besoin pour
              <span className="block text-blue-600">dominer le marché</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une plateforme complète qui automatise votre veille immobilière et vous donne 
              un avantage concurrentiel décisif.
            </p>
          </motion.div>

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
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Des résultats qui parlent
            </h2>
            <p className="text-xl text-gray-600">
              Rejoignez des centaines d'agences qui font confiance à SACIMO
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
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
              3 étapes pour démarrer
            </h2>
            <p className="text-xl text-gray-600">
              Commencez à recevoir vos rapports en moins de 5 minutes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 transform translate-x-1/2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Tarifs simples et transparents
            </h2>
            <p className="text-xl text-gray-600">
              Choisissez le plan qui correspond à vos besoins
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1">
                      Meilleur choix
                    </Badge>
                  </div>
                )}
                
                <Card className={`h-full ${plan.popular ? 'border-blue-500 shadow-lg' : 'border-gray-200'}`}>
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {plan.description}
                      </p>
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-bold text-gray-900">
                          {plan.price}€
                        </span>
                        <span className="text-gray-600 ml-1">
                          {plan.period}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      data-magnetic
                      data-cursor="Try"
                    >
                      Commencer l'essai
                    </Button>
                  </CardContent>
                </Card>
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
              Prêt à transformer votre veille immobilière ?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Rejoignez des centaines d'agences qui utilisent déjà SACIMO pour 
              ne plus rater aucune opportunité.
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