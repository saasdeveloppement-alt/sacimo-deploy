'use client';

/**
 * LANDING PAGE SACIMO - Style Nexio Ultra-Futuriste
 * Fond noir pur (#0a0a0a), glassmorphism, gradients rose-violet
 * Contenu SACIMO conservé intégralement
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SacimoLogo } from '@/components/SacimoLogo';
import { 
  Search, 
  TrendingUp, 
  MapPin,
  Bell, 
  FileText,
  BarChart3,
  Users, 
  ArrowRight,
  Check,
  Shield,
  Clock,
  Target,
  Building2,
  Calculator,
  Brain,
  CheckCircle2,
  Sparkles,
  Play
} from 'lucide-react';

export default function HomePage() {
  const [email, setEmail] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/auth/signup?email=' + encodeURIComponent(email);
  };

  return (
    <div className="bg-[#0a0a0a] text-white overflow-x-hidden min-h-screen">
      
      {/* SECTION 1: NAVIGATION */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <SacimoLogo size={32} />
              </div>
              <span className="text-xl font-bold text-white">SACIMO</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="#fonctionnalites" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                Fonctionnalités
              </Link>
              <Link href="#workflow" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                Workflow
              </Link>
              <Link href="#tarifs" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                Tarifs
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                Contact
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-gray-300 hover:text-white border-white/10">
                  Connexion
                </Button>
              </Link>
              <Link href="#inscription">
                <Button className="bg-white text-black hover:bg-gray-100 font-semibold">
                  Commencer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* SECTION 2: HERO */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Gradient 3D Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-violet-500/30 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -50, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-rose-500/30 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1], x: [0, -50, 0], y: [0, 50, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-8"
            >
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">Révolutionnez l'immobilier avec l'IA</span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
            >
              <span className="text-white block mb-4">SACIMO est le</span>
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 bg-clip-text text-transparent block mb-4">
                nouveau standard
              </span>
              <span className="text-white block">de l'immobilier</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto"
            >
              La plateforme ultra-intelligente pour analyser, automatiser et dominer le marché immobilier
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Button 
                size="lg"
                className="bg-white text-black hover:bg-gray-100 font-bold px-10 py-6 text-lg"
                asChild
              >
                <Link href="#inscription">Commencer gratuitement</Link>
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-10 py-6 text-lg"
                asChild
              >
                <Link href="#dashboard">
                  <Play className="mr-2 h-5 w-5" />
                  Voir la démo
                </Link>
              </Button>
            </motion.div>

            {/* Trust Line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center space-x-8 text-gray-500 text-sm"
            >
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Essai 14 jours</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span>Sans CB</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-green-400" />
                <span>Setup 2 min</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 3: TRUST/PARTNERS */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center mb-12"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span className="text-sm text-gray-300">Fait confiance par plus de 500+ agences</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <div className="text-gray-400 text-sm font-medium">Logo {i + 1}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: STATS */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: '500+', label: 'Agents', sublabel: 'actifs' },
              { number: '10k+', label: 'Annonces', sublabel: 'analysées/jour' },
              { number: '2k+', label: 'Rapports', sublabel: 'générés/mois' },
              { number: '4.9', label: 'Satisfaction', sublabel: 'sur 5.0' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-pink-500/50 transition-colors"
              >
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-300 font-semibold">{stat.label}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.sublabel}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: FEATURES - Toutes les fonctionnalités détaillées SACIMO */}
      <section id="fonctionnalites" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-gray-300">Fonctionnalités Complètes</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
              <span className="text-white">Découvrez toutes nos</span>
              <br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 bg-clip-text text-transparent">
                fonctionnalités
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Une suite complète d'outils pour automatiser et optimiser votre activité immobilière
            </p>
          </motion.div>

          <div className="space-y-8">
            {/* Feature 1: Annonces */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-pink-500/50 transition-all"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">Annonces</h3>
                      <p className="text-pink-400 font-semibold">Recherche & Veille Automatisée</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed text-lg">
                    Recherchez et surveillez automatiquement les nouvelles annonces immobilières selon vos critères. 
                    Notre système scanne en continu les principales plateformes (LeBonCoin, SeLoger, Bien'ici, PAP, etc.) 
                    et vous alerte en temps réel des opportunités correspondant à vos besoins.
                  </p>
                  <div className="space-y-3 mb-6">
                    {[
                      { title: 'Recherche multi-sources', desc: 'Surveillance simultanée de 10+ plateformes immobilières' },
                      { title: 'Filtres avancés', desc: 'Prix, surface, nombre de pièces, zones géographiques, type de bien' },
                      { title: 'Alertes instantanées', desc: 'Notifications en temps réel dès qu\'une nouvelle annonce correspond à vos critères' },
                      { title: 'Historique complet', desc: 'Consultez toutes les annonces détectées avec filtres et tri avancés' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-white">{item.title}</p>
                          <p className="text-sm text-gray-400">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white" asChild>
                    <Link href="/auth/signup">
                      Essayer maintenant
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="relative">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Nouvelles annonces détectées</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">+23 aujourd'hui</Badge>
                      </div>
                      <div className="h-48 bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-center">
                        <div className="text-center">
                          <Search className="w-12 h-12 text-pink-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">Aperçu des annonces</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Feature 2: Localisation IA */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-blue-500/50 transition-all"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                  >
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-400">Localisation automatique</p>
                    </div>
                  </motion.div>
                </div>
                <div className="order-1 md:order-2">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">Localisation IA</h3>
                      <p className="text-blue-400 font-semibold">Géolocalisation Automatique</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed text-lg">
                    Localisez automatiquement vos biens immobiliers à partir d'images grâce à notre intelligence artificielle de pointe. 
                    Téléchargez une photo de façade, de rue ou d'entrée, et notre IA identifie la localisation exacte en quelques secondes.
                  </p>
                  <div className="space-y-3 mb-6">
                    {[
                      { title: 'Analyse d\'images IA', desc: 'Reconnaissance de repères visuels, panneaux de rue, architecture' },
                      { title: 'Matching Street View', desc: 'Comparaison avec Google Street View pour validation précise' },
                      { title: 'OCR avancé', desc: 'Extraction de texte depuis les images (numéros de rue, panneaux)' },
                      { title: 'Score de confiance', desc: 'Chaque localisation inclut un score de précision pour validation' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-white">{item.title}</p>
                          <p className="text-sm text-gray-400">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white" asChild>
                    <Link href="/auth/signup">
                      Découvrir la localisation IA
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Feature 3: Estimation */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-emerald-500/50 transition-all"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center">
                      <Calculator className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">Estimation</h3>
                      <p className="text-emerald-400 font-semibold">Évaluation Automatique</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed text-lg">
                    Estimez la valeur de marché de n'importe quel bien immobilier en quelques clics. 
                    Notre algorithme analyse les données du marché local, les caractéristiques du bien 
                    et les transactions récentes pour vous fournir une estimation précise et fiable.
                  </p>
                  <div className="space-y-3 mb-6">
                    {[
                      { title: 'Analyse de marché local', desc: 'Comparaison avec les biens similaires vendus récemment dans la zone' },
                      { title: 'Prix au m² intelligent', desc: 'Calcul basé sur la localisation, l\'état et les caractéristiques du bien' },
                      { title: 'Fourchette de prix', desc: 'Estimation avec fourchette basse/haute pour négociation' },
                      { title: 'Rapport détaillé', desc: 'Export PDF avec justification de l\'estimation et données de marché' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-white">{item.title}</p>
                          <p className="text-sm text-gray-400">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white" asChild>
                    <Link href="/auth/signup">
                      Essayer l'estimation
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                  >
                    <div className="text-center space-y-4">
                      <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                        245 000€
                      </div>
                      <div className="text-sm text-gray-400">
                        <p className="font-semibold">Estimation</p>
                        <p className="text-xs">Fourchette: 230k€ - 260k€</p>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Précision: 87%</Badge>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Feature 4: Rapports */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-purple-500/50 transition-all"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Rapport généré</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">PDF</Badge>
                      </div>
                      <FileText className="w-16 h-16 text-purple-400 mx-auto my-4" />
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Rapport mensuel</p>
                        <p className="text-sm font-semibold text-gray-300">Janvier 2025</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">Rapports</h3>
                      <p className="text-purple-400 font-semibold">Analyse & Export Automatique</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed text-lg">
                    Générez des rapports professionnels et détaillés sur votre activité immobilière. 
                    Analysez les tendances du marché, visualisez vos performances et partagez vos insights 
                    avec votre équipe ou vos clients.
                  </p>
                  <div className="space-y-3 mb-6">
                    {[
                      { title: 'Rapports automatisés', desc: 'Génération quotidienne, hebdomadaire ou mensuelle selon vos besoins' },
                      { title: 'Graphiques interactifs', desc: 'Évolution des prix, distribution par type, top villes, tendances' },
                      { title: 'Export multi-formats', desc: 'PDF professionnel, Excel pour analyse, partage collaboratif' },
                      { title: 'Personnalisation', desc: 'Ajoutez votre logo, vos couleurs et choisissez les données à inclure' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-white">{item.title}</p>
                          <p className="text-sm text-gray-400">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white" asChild>
                    <Link href="/auth/signup">
                      Créer un rapport
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Feature 5: Suivi Concurrents */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-orange-500/50 transition-all"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">Suivi Concurrents</h3>
                      <p className="text-orange-400 font-semibold">Veille Concurrentielle</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed text-lg">
                    Surveillez l'activité de vos concurrents en temps réel. Analysez leurs stratégies de prix, 
                    leurs zones d'intervention et leurs volumes de ventes pour rester toujours en avance sur le marché.
                  </p>
                  <div className="space-y-3 mb-6">
                    {[
                      { title: 'Liste de concurrents', desc: 'Ajoutez et suivez les agences concurrentes de votre choix' },
                      { title: 'Activité en temps réel', desc: 'Alertes dès qu\'un concurrent publie une nouvelle annonce' },
                      { title: 'Analyse de prix', desc: 'Prix moyen au m², évolution, comparaison avec vos biens' },
                      { title: 'Statistiques détaillées', desc: 'Volume hebdomadaire, top zones, types de biens favoris' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-white">{item.title}</p>
                          <p className="text-sm text-gray-400">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white" asChild>
                    <Link href="/auth/signup">
                      Surveiller mes concurrents
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="relative">
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Concurrents suivis</span>
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">12 agences</Badge>
                      </div>
                      <div className="space-y-2">
                        {['Century 21', 'Orpi', 'Laforêt'].map((name, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10">
                            <span className="text-sm text-gray-300">{name}</span>
                            <span className="text-xs text-gray-500">+5 annonces</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Feature 6: Copilote IA */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-pink-500/50 transition-all"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="text-center space-y-3">
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full mx-auto flex items-center justify-center"
                      >
                        <Brain className="w-8 h-8 text-white" />
                      </motion.div>
                      <p className="text-sm font-semibold text-gray-300">Assistant IA</p>
                      <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">Actif 24/7</Badge>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">Copilote IA</h3>
                      <p className="text-pink-400 font-semibold">Assistant Intelligent</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed text-lg">
                    Votre assistant IA personnel pour l'immobilier. Obtenez de l'aide pour gérer les objections clients, 
                    rédiger des emails professionnels, analyser le marché et prendre des décisions éclairées basées sur les données.
                  </p>
                  <div className="space-y-3 mb-6">
                    {[
                      { title: 'Gestion d\'objections', desc: 'Stratégies personnalisées pour répondre aux objections clients' },
                      { title: 'Rédaction d\'emails', desc: 'Templates professionnels et reformulation de vos messages' },
                      { title: 'Analyse de marché', desc: 'Insights et recommandations basées sur les données du marché' },
                      { title: 'Stratégies de négociation', desc: 'Conseils personnalisés pour optimiser vos négociations' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-white">{item.title}</p>
                          <p className="text-sm text-gray-400">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white" asChild>
                    <Link href="/auth/signup">
                      Tester le Copilote IA
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Feature 7: Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-yellow-500/50 transition-all"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                      <Bell className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">Notifications</h3>
                      <p className="text-yellow-400 font-semibold">Alertes Intelligentes</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed text-lg">
                    Ne ratez plus jamais une opportunité. Configurez vos préférences de notification 
                    et recevez des alertes en temps réel pour les annonces importantes, les changements de prix 
                    ou les nouvelles opportunités correspondant à vos critères.
                  </p>
                  <div className="space-y-3 mb-6">
                    {[
                      { title: 'Multi-canaux', desc: 'Email, notifications push, SMS selon vos préférences' },
                      { title: 'Filtres personnalisés', desc: 'Choisissez les types d\'alertes qui vous intéressent' },
                      { title: 'Alertes prioritaires', desc: 'Système de priorité pour les opportunités exceptionnelles' },
                      { title: 'Historique complet', desc: 'Consultez toutes vos notifications et marquez-les comme lues' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-white">{item.title}</p>
                          <p className="text-sm text-gray-400">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white" asChild>
                    <Link href="/auth/signup">
                      Configurer les notifications
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Alertes actives</span>
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">12 nouvelles</Badge>
                      </div>
                      <div className="space-y-2">
                        {['Nouvelle annonce', 'Prix réduit', 'Opportunité'].map((alert, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10"
                          >
                            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                            <span className="text-xs text-gray-300">{alert}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 6: WORKFLOW */}
      <section id="workflow" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center mb-12"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span className="text-sm text-gray-300">Notre workflow</span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-center mb-16"
          >
            <span className="text-white">Comment notre plateforme</span>
            <br />
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 bg-clip-text text-transparent">
              simplifie votre workflow
            </span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Bienvenue, Agent !',
                subtitle: 'Solde total',
                amount: '245 090€',
                details: [
                  { label: 'Revenus', value: '+100 000€', color: 'green' },
                  { label: 'Dépenses', value: '-50 000€', color: 'pink' }
                ],
                gradient: 'from-pink-500 to-purple-600'
              },
              {
                title: 'Liez vos comptes',
                subtitle: 'Créez votre compte en quelques minutes et personnalisez la plateforme pour répondre aux besoins uniques de votre entreprise immobilière.',
                gradient: 'from-purple-500 to-violet-600'
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-pink-500/50 transition-all"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center mb-6`}>
                  {i === 0 ? <Users className="w-6 h-6 text-white" /> : <BarChart3 className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{card.title}</h3>
                {card.subtitle && <p className="text-gray-400 mb-4">{card.subtitle}</p>}
                {card.amount && (
                  <div className="text-4xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-6">
                    {card.amount}
                  </div>
                )}
                {card.details && (
                  <div className="space-y-3">
                    {card.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">{detail.label}</span>
                        <span className={`text-${detail.color}-400 font-semibold`}>{detail.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: DASHBOARD PREVIEW */}
      <section id="dashboard" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-gray-300">Aperçu du Dashboard</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
              <span className="text-white">L'interface la plus</span>
              <br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 bg-clip-text text-transparent">
                avancée du marché
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: 'Tableaux de bord IA', desc: 'Visualisez vos métriques en temps réel avec des graphiques interactifs', icon: BarChart3, gradient: 'from-pink-500 to-purple-500' },
              { title: 'Moteur IA avancé', desc: 'Algorithmes de machine learning pour identifier les meilleures opportunités', icon: Search, gradient: 'from-blue-500 to-cyan-500' },
              { title: 'Géolocalisation intelligente', desc: 'Détection automatique via EXIF, OCR et analyse d\'image par IA', icon: MapPin, gradient: 'from-emerald-500 to-green-500' },
              { title: 'Assistant IA', desc: 'Génération automatique d\'emails, réponses aux objections et aide à la négociation', icon: Brain, gradient: 'from-orange-500 to-red-500' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-pink-500/50 transition-all group"
              >
                <div className={`relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br ${item.gradient} aspect-video flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer-dark"></div>
                  <item.icon className="w-16 h-16 text-white relative z-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-pink-400 transition-colors">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: CTA/FOOTER */}
      <section id="inscription" className="py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              <span className="text-white">Prêt à révolutionner</span>
              <br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 bg-clip-text text-transparent">
                votre activité immobilière ?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Plus de 500 agents nous font déjà confiance. Pourquoi pas vous ?
            </p>
            <form onSubmit={handleSignup} className="max-w-md mx-auto space-y-4">
              <Input
                type="email"
                placeholder="Votre email professionnel"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                required
              />
              <Button 
                type="submit"
                size="lg"
                className="w-full bg-white text-black hover:bg-gray-100 font-bold"
              >
                Commencer gratuitement
              </Button>
            </form>
            <div className="flex items-center justify-center space-x-6 mt-8 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Essai 14 jours</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Sans CB</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span>Setup 2 min</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400 text-sm">
            © 2025 SACIMO. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}

