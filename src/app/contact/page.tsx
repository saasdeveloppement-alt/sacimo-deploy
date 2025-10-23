"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  CheckCircle,
  MessageCircle,
  Headphones,
  Users
} from "lucide-react"

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    description: "Réponse sous 24h",
    contact: "contact@sacimo.com",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: Phone,
    title: "Téléphone",
    description: "Lun-Ven 9h-18h",
    contact: "+33 1 23 45 67 89",
    color: "bg-green-100 text-green-600"
  },
  {
    icon: MessageCircle,
    title: "Chat en direct",
    description: "Support instantané",
    contact: "Disponible 24/7",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: Headphones,
    title: "Support prioritaire",
    description: "Plans Pro et Agence",
    contact: "support@sacimo.com",
    color: "bg-orange-100 text-orange-600"
  }
]

const teamMembers = [
  {
    name: "Marie Dubois",
    role: "Responsable Support",
    email: "marie@sacimo.com",
    avatar: "/team/marie.jpg"
  },
  {
    name: "Pierre Martin",
    role: "Ingénieur Support",
    email: "pierre@sacimo.com",
    avatar: "/team/pierre.jpg"
  },
  {
    name: "Sophie Bernard",
    role: "Chef de produit",
    email: "sophie@sacimo.com",
    avatar: "/team/sophie.jpg"
  }
]

const faqs = [
  {
    question: "Comment puis-je contacter le support ?",
    answer: "Vous pouvez nous contacter par email, téléphone, chat en direct ou via le formulaire ci-dessous. Nous répondons généralement sous 24h."
  },
  {
    question: "Y a-t-il un support en français ?",
    answer: "Oui, notre équipe support est entièrement francophone et basée en France. Nous sommes disponibles du lundi au vendredi de 9h à 18h."
  },
  {
    question: "Puis-je programmer un appel de démonstration ?",
    answer: "Absolument ! Nous proposons des démonstrations personnalisées pour vous montrer toutes les fonctionnalités de SACIMO. Contactez-nous pour planifier un rendez-vous."
  }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
    urgency: "normal"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simuler l'envoi du formulaire
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 2000)
  }

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
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Nous sommes là pour vous aider
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Une question ? Un problème ? Notre équipe support est à votre disposition
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Plusieurs façons de nous contacter
            </h2>
            <p className="text-xl text-gray-600">
              Choisissez la méthode qui vous convient le mieux
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      <method.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {method.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {method.description}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {method.contact}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Envoyez-nous un message</CardTitle>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Message envoyé !
                      </h3>
                      <p className="text-gray-600">
                        Nous vous répondrons dans les plus brefs délais.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nom complet *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="company">Entreprise</Label>
                          <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) => setFormData({...formData, company: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Téléphone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="subject">Sujet *</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="urgency">Urgence</Label>
                        <select
                          id="urgency"
                          value={formData.urgency}
                          onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="normal">Normale</option>
                          <option value="urgent">Urgente</option>
                          <option value="critical">Critique</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          rows={6}
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting}
                        data-magnetic
                        data-cursor="Send"
                      >
                        {isSubmitting ? (
                          "Envoi en cours..."
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Envoyer le message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Informations de contact
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Adresse</p>
                      <p className="text-gray-600">
                        123 Rue de la Paix<br />
                        75001 Paris, France
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Horaires</p>
                      <p className="text-gray-600">
                        Lundi - Vendredi : 9h00 - 18h00<br />
                        Samedi : 10h00 - 16h00
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Téléphone</p>
                      <p className="text-gray-600">+33 1 23 45 67 89</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Notre équipe support
                </h3>
                <div className="space-y-4">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Questions fréquentes
                </h3>
                <div className="space-y-3">
                  {faqs.map((faq, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900 text-sm mb-1">
                        {faq.question}
                      </p>
                      <p className="text-sm text-gray-600">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}



