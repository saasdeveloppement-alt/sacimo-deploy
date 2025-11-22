'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  MessageCircle,
  Info,
  CreditCard,
  Settings,
  BookOpen,
  Shield
} from 'lucide-react';
import Link from 'next/link';

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Message envoyé !', {
      description: 'Notre équipe vous répondra dans les 24h.'
    });

    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });

    setIsSubmitting(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Floating Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
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
            rotate: [0, -5, 0],
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
            rotate: [0, 3, 0],
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
        {/* Hero Section with Enhanced Design */}
        <section className="relative overflow-hidden py-20" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(124, 92, 219, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(94, 58, 155, 0.1) 0%, transparent 50%)
          `,
        }}>
          {/* Decorative Elements */}
          <motion.div
            className="absolute top-10 left-20 w-20 h-20 border-2 border-primary-200 rounded-full opacity-50"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-32 w-32 h-32 border-2 border-primary-300 rounded-lg opacity-50"
            animate={{
              y: [0, 20, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          <motion.div
            className="absolute top-1/2 right-20 w-16 h-16 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full opacity-30"
            animate={{
              y: [0, -15, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />

          <div className="max-w-7xl mx-auto px-6 relative">
            {/* Main Icon with Animation */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <motion.div
                  className="w-24 h-24 bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl flex items-center justify-center shadow-2xl"
                  initial={{ scale: 0, rotate: -180, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                >
                  <Phone className="w-12 h-12 text-white" strokeWidth={1.5} />
                </motion.div>
                {/* Orbiting dots */}
                <motion.div
                  className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full shadow-lg"
                  animate={{
                    y: [0, -10, 0],
                    x: [0, 5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-400 rounded-full shadow-lg"
                  animate={{
                    y: [0, 10, 0],
                    x: [0, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
                {/* Pulse ring effect */}
                <motion.div
                  className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-600 to-primary-700 opacity-20"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.2, 0, 0.2],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              </div>
            </div>

            {/* Title with Gradient */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-600 bg-clip-text text-transparent">
                  Contactez-nous
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                Une question ? Un problème ? Notre équipe est là pour vous aider
              </p>

              {/* Status Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center space-x-4 flex-wrap gap-4"
              >
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-md border-2 border-green-200">
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <motion.div
                      className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [1, 0, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Disponible maintenant</span>
                </div>
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-md border-2 border-blue-200">
                  <MessageCircle className="w-4 h-4 text-blue-600" strokeWidth={1.5} />
                  <span className="text-sm font-semibold text-gray-700">Réponse en 24h</span>
                </div>
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-md border-2 border-primary-200">
                  <Info className="w-4 h-4 text-primary-600" strokeWidth={1.5} />
                  <span className="text-sm font-semibold text-gray-700">Support expert</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Wave Separator */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
            </svg>
          </div>
        </section>

        {/* Rest of the content */}
        <main className="max-w-7xl mx-auto px-6 py-12 -mt-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Envoyez-nous un message</h2>
                  <p className="text-gray-600">Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nom complet <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        name="name"
                        type="text"
                        placeholder="Jean Dupont"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="jean@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</Label>
                      <Input
                        name="phone"
                        type="tel"
                        placeholder="+33 6 12 34 56 78"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sujet <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        name="subject"
                        type="text"
                        placeholder="Problème technique, Question..."
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      name="message"
                      rows={6}
                      placeholder="Décrivez votre demande en détail..."
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all resize-none"
                      required
                    />
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Envoi en cours...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" strokeWidth={1.5} />
                          <span>Envoyer le message</span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
                whileHover={{ y: -4 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Email</h3>
                    <a
                      href="mailto:contact@sacimo.com"
                      className="text-primary-600 font-medium mb-1 hover:text-primary-700 transition-colors block"
                    >
                      contact@sacimo.com
                    </a>
                    <p className="text-sm text-gray-500">Réponse sous 24h</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
                whileHover={{ y: -4 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Téléphone</h3>
                    <a
                      href="tel:+33123456789"
                      className="text-blue-600 font-medium mb-1 hover:text-blue-700 transition-colors block"
                    >
                      +33 1 23 45 67 89
                    </a>
                    <p className="text-sm text-gray-500">Lun-Ven : 9h-18h</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
                whileHover={{ y: -4 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-indigo-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Adresse</h3>
                    <p className="text-gray-700 font-medium">123 Avenue des Champs-Élysées</p>
                    <p className="text-sm text-gray-500">75008 Paris, France</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Questions fréquentes</h2>
              <p className="text-gray-600">Trouvez rapidement des réponses à vos questions</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: CreditCard,
                  iconBg: "from-primary-500 to-primary-600",
                  title: "💳 Facturation",
                  description: "Questions sur les plans, la facturation, les paiements et les remboursements",
                  delay: 0.7,
                },
                {
                  icon: Settings,
                  iconBg: "from-blue-500 to-cyan-500",
                  title: "🔧 Support technique",
                  description: "Aide sur les fonctionnalités, bugs, intégrations et API",
                  delay: 0.8,
                },
                {
                  icon: BookOpen,
                  iconBg: "from-indigo-500 to-primary-600",
                  title: "📚 Documentation",
                  description: "Guides complets, tutoriels et bonnes pratiques",
                  delay: 0.9,
                },
                {
                  icon: Shield,
                  iconBg: "from-emerald-500 to-teal-500",
                  title: "🔒 Sécurité",
                  description: "Protection des données, confidentialité et conformité",
                  delay: 1,
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: faq.delay }}
                  className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group"
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br ${faq.iconBg} rounded-xl flex items-center justify-center`}>
                      <faq.icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{faq.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-16 bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-10 text-center shadow-lg hover:shadow-xl transition-all"
          >
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Besoin d'une assistance immédiate ?</h2>
              <p className="text-lg text-gray-600 mb-8">
                Notre équipe support est disponible 24/7 pour les clients Pro et Enterprise
              </p>
              <div className="flex items-center justify-center space-x-4 flex-wrap gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold inline-flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
                    <span>Démarrer un chat</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    asChild
                    className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold inline-flex items-center space-x-2"
                  >
                    <Link href="/resources/faq">
                      <BookOpen className="w-5 h-5" strokeWidth={1.5} />
                      <span>Voir la documentation</span>
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>

    </div>
  );
}
