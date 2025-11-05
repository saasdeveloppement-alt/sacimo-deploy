"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  HelpCircle, 
  Search, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react"
import Link from "next/link"

const faqCategories = [
  {
    id: "general",
    title: "Général",
    icon: HelpCircle,
    color: "bg-blue-100 text-blue-600"
  },
  {
    id: "pricing",
    title: "Tarifs & Facturation",
    icon: CheckCircle,
    color: "bg-green-100 text-green-600"
  },
  {
    id: "technical",
    title: "Technique",
    icon: AlertCircle,
    color: "bg-orange-100 text-orange-600"
  },
  {
    id: "compliance",
    title: "Conformité",
    icon: Info,
    color: "bg-purple-100 text-purple-600"
  }
]

const faqs = {
  general: [
    {
      question: "Qu'est-ce que SACIMO ?",
      answer: "SACIMO est une plateforme SaaS qui automatise la veille immobilière pour les agences. Elle surveille en continu les nouvelles annonces selon vos critères et vous envoie des rapports quotidiens personnalisés."
    },
    {
      question: "Comment fonctionne la surveillance des annonces ?",
      answer: "SACIMO surveille en continu les principaux sites immobiliers (LeBonCoin, SeLoger, PAP, etc.) selon vos critères de recherche. Dès qu'une nouvelle annonce correspond à vos filtres, elle est ajoutée à votre tableau de bord et incluse dans votre rapport quotidien."
    },
    {
      question: "Quels sites immobiliers sont surveillés ?",
      answer: "Nous surveillons les principaux sites français : LeBonCoin, SeLoger, PAP, Orpi, Century21, Guy Hoquet, Immonot, et bien d'autres. La liste s'enrichit régulièrement selon les demandes de nos utilisateurs."
    },
    {
      question: "Puis-je essayer SACIMO gratuitement ?",
      answer: "Oui ! Nous offrons un essai gratuit de 14 jours sans engagement. Aucune carte de crédit n'est requise pour commencer."
    },
    {
      question: "SACIMO est-il conforme au RGPD ?",
      answer: "Absolument. Nous respectons strictement le RGPD et toutes les réglementations en vigueur. Vos données sont chiffrées et stockées de manière sécurisée. Nous ne partageons jamais vos informations avec des tiers."
    }
  ],
  pricing: [
    {
      question: "Quels sont les tarifs de SACIMO ?",
      answer: "Nous proposons 3 formules : Starter (29€/mois), Pro (79€/mois) et Agence (199€/mois). Toutes incluent un essai gratuit de 14 jours. Consultez notre page tarifs pour plus de détails."
    },
    {
      question: "Puis-je changer de plan à tout moment ?",
      answer: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement et nous ajustons la facturation proportionnellement."
    },
    {
      question: "Y a-t-il des frais cachés ?",
      answer: "Non, nos tarifs sont transparents. Le prix affiché est le prix final, taxes comprises. Aucun frais de configuration ou de résiliation."
    },
    {
      question: "Que se passe-t-il après l'essai gratuit ?",
      answer: "Après 14 jours, votre compte passe automatiquement au plan Starter. Vous pouvez changer de plan ou annuler à tout moment sans frais."
    },
    {
      question: "Proposez-vous des tarifs préférentiels pour les grandes agences ?",
      answer: "Oui, nous proposons des tarifs personnalisés pour les agences de plus de 50 agents. Contactez-nous pour discuter de vos besoins spécifiques."
    }
  ],
  technical: [
    {
      question: "Comment configurer mes critères de recherche ?",
      answer: "C'est très simple ! Allez dans la section 'Recherches' et créez vos critères comme sur LeBonCoin : zones géographiques, fourchettes de prix, types de biens, surface, nombre de pièces, etc. Vous pouvez créer autant de recherches que nécessaire."
    },
    {
      question: "À quelle fréquence les données sont-elles mises à jour ?",
      answer: "Nous surveillons les sites en continu, 24h/24. Les nouvelles annonces apparaissent dans votre tableau de bord en temps réel, et vous recevez un rapport quotidien à 8h00."
    },
    {
      question: "Puis-je exporter mes données ?",
      answer: "Oui, vous pouvez exporter toutes vos données en CSV ou PDF. Les rapports quotidiens sont également disponibles en format PDF pour archivage."
    },
    {
      question: "SACIMO fonctionne-t-il sur mobile ?",
      answer: "Oui, notre interface est entièrement responsive et optimisée pour tous les écrans. Vous pouvez consulter vos annonces et rapports depuis votre smartphone ou tablette."
    },
    {
      question: "Proposez-vous une API ?",
      answer: "Oui, nous proposons une API complète pour les plans Pro et Agence. Elle vous permet d'intégrer SACIMO dans vos outils existants."
    }
  ],
  compliance: [
    {
      question: "SACIMO respecte-t-il les CGU des sites immobiliers ?",
      answer: "Oui, nous respectons scrupuleusement les conditions d'utilisation de tous les sites que nous surveillons. Nous utilisons uniquement des méthodes conformes et transparentes."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Absolument. Nous utilisons un chiffrement de bout en bout, des serveurs sécurisés et des certifications de sécurité. Vos données ne sont jamais partagées avec des tiers."
    },
    {
      question: "Puis-je supprimer mes données ?",
      answer: "Oui, vous pouvez supprimer toutes vos données à tout moment depuis votre tableau de bord. Nous respectons votre droit à l'effacement conformément au RGPD."
    },
    {
      question: "SACIMO est-il conforme aux réglementations françaises ?",
      answer: "Oui, nous sommes basés en France et respectons toutes les réglementations françaises et européennes en matière de données personnelles et de commerce électronique."
    },
    {
      question: "Comment puis-je signaler un problème de conformité ?",
      answer: "Vous pouvez nous contacter à tout moment via notre formulaire de contact ou par email à compliance@sacimo.com. Nous traitons tous les signalements dans les plus brefs délais."
    }
  ]
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="secondary" className="mb-6">
              <HelpCircle className="w-4 h-4 mr-2" />
              Centre d'aide
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Questions fréquentes
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Trouvez rapidement les réponses à vos questions sur SACIMO
            </p>
            
            {/* Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher dans la FAQ..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {faqCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <category.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
              </motion.div>
            ))}
          </div>

          {/* FAQ Sections */}
          <div className="space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center mr-3`}>
                    <category.icon className="w-5 h-5" />
                  </div>
                  {category.title}
                </h2>
                
                <Card>
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                      {faqs[category.id as keyof typeof faqs].map((faq, faqIndex) => (
                        <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                          <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                            <span className="font-medium text-gray-900">{faq.question}</span>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-4">
                            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Vous ne trouvez pas votre réponse ?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Notre équipe support est là pour vous aider
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" data-magnetic data-cursor="Contact">
                <HelpCircle className="w-5 h-5 mr-2" />
                Contacter le support
              </Button>
              <Button variant="outline" size="lg" data-magnetic data-cursor="View">
                <ArrowRight className="w-5 h-5 mr-2" />
                Voir la documentation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}











