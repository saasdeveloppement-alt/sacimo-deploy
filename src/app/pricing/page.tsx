"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Star, Zap, Shield, Users, BarChart3, Bell } from "lucide-react"
import Link from "next/link"

const pricingPlans = [
  {
    name: "Starter",
    price: "29",
    period: "/mois",
    description: "Parfait pour les agents individuels",
    icon: Users,
    features: [
      "1 utilisateur",
      "5 recherches actives",
      "1 rapport quotidien",
      "Support email",
      "Données 30 jours",
      "Export CSV basique"
    ],
    limitations: [
      "Pas de veille concurrentielle",
      "Pas d'API",
      "Support standard uniquement"
    ],
    popular: false,
    cta: "Commencer l'essai"
  },
  {
    name: "Pro", 
    price: "79",
    period: "/mois",
    description: "Idéal pour les petites équipes",
    icon: BarChart3,
    features: [
      "5 utilisateurs",
      "20 recherches actives", 
      "Rapports illimités",
      "Export CSV/PDF",
      "Support prioritaire",
      "Données 90 jours",
      "Veille concurrentielle",
      "Analytics avancés"
    ],
    limitations: [
      "Pas d'API complète",
      "Pas de SSO"
    ],
    popular: true,
    cta: "Commencer l'essai"
  },
  {
    name: "Agence",
    price: "199",
    period: "/mois", 
    description: "Pour les grandes agences",
    icon: Shield,
    features: [
      "Utilisateurs illimités",
      "Recherches illimitées",
      "SSO & API complète",
      "Support dédié",
      "Formation personnalisée",
      "Données 1 an",
      "Webhooks temps réel",
      "Intégrations avancées",
      "Rapports personnalisés"
    ],
    limitations: [],
    popular: false,
    cta: "Nous contacter"
  }
]

const faqs = [
  {
    question: "Puis-je changer de plan à tout moment ?",
    answer: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement et nous ajustons la facturation proportionnellement."
  },
  {
    question: "Que se passe-t-il après l'essai gratuit ?",
    answer: "Après 14 jours, votre compte passe automatiquement au plan Starter. Vous pouvez changer de plan ou annuler à tout moment sans frais."
  },
  {
    question: "Les données sont-elles sécurisées ?",
    answer: "Absolument. Nous utilisons un chiffrement de bout en bout, respectons le RGPD et avons des certifications de sécurité. Vos données ne sont jamais partagées avec des tiers."
  },
  {
    question: "Puis-je annuler à tout moment ?",
    answer: "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. Aucun frais de résiliation n'est appliqué."
  },
  {
    question: "Y a-t-il des frais cachés ?",
    answer: "Non, nos tarifs sont transparents. Le prix affiché est le prix final, taxes comprises. Aucun frais caché ou de configuration."
  },
  {
    question: "Le support est-il disponible en français ?",
    answer: "Oui, notre équipe de support est entièrement francophone et disponible du lundi au vendredi de 9h à 18h."
  }
]

export default function PricingPage() {
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
              <Star className="w-4 h-4 mr-2" />
              Tarifs transparents
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Choisissez le plan qui vous
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                correspond
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Des tarifs simples et transparents, sans frais cachés. 
              Commencez gratuitement pendant 14 jours.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Essai gratuit 14 jours
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Aucune carte requise
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Annulation à tout moment
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1">
                      <Star className="w-4 h-4 mr-1" />
                      Meilleur choix
                    </Badge>
                  </div>
                )}
                
                <Card className={`h-full ${plan.popular ? 'border-blue-500 shadow-xl scale-105' : 'border-gray-200 shadow-lg'}`}>
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        plan.popular 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
                          : 'bg-gray-100'
                      }`}>
                        <plan.icon className={`w-8 h-8 ${plan.popular ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-gray-600 mb-6">
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

                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Inclus :</h4>
                        <ul className="space-y-3">
                          {plan.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center">
                              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                              <span className="text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {plan.limitations.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4">Limitations :</h4>
                          <ul className="space-y-3">
                            {plan.limitations.map((limitation, limitationIndex) => (
                              <li key={limitationIndex} className="flex items-center">
                                <div className="w-5 h-5 rounded-full bg-gray-200 mr-3 flex-shrink-0 flex items-center justify-center">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                </div>
                                <span className="text-gray-500">{limitation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="mt-8">
                      <Button 
                        className={`w-full ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' 
                            : ''
                        }`}
                        variant={plan.popular ? 'default' : 'outline'}
                        size="lg"
                        data-magnetic
                        data-cursor="Try"
                      >
                        {plan.cta}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Questions fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce que vous devez savoir sur nos tarifs et notre service
            </p>
          </motion.div>

          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
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
              Prêt à commencer ?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Rejoignez des centaines d'agences qui utilisent déjà SACIMO pour 
              transformer leur veille immobilière.
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
                Nous contacter
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}



