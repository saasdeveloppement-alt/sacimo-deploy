'use client';

/**
 * STRUCTURE COMPLÈTE - LANDING PAGE SACIMO (Style Nexio)
 * 
 * 8 SECTIONS :
 * 1. Navigation (sticky, glassmorphism)
 * 2. Hero Section (gradient 3D, floating cards)
 * 3. Trust/Partners (pills avec logos)
 * 4. Stats Section (métriques clés)
 * 5. Features Section (fonctionnalités détaillées SACIMO)
 * 6. Workflow Section (grandes cartes processus)
 * 7. Dashboard Preview (aperçu interface)
 * 8. CTA/Footer (appel à l'action)
 */

import { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  Play,
  Eye,
  Filter,
  Zap
} from 'lucide-react';

export default function HomePageStructure() {
  const [email, setEmail] = useState('');
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <div className="bg-[#0a0a0a] text-white overflow-x-hidden min-h-screen">
      
      {/* ============================================
          SECTION 1: NAVIGATION (Sticky, Glassmorphism)
          ============================================ */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <SacimoLogo size={32} />
              </div>
              <span className="text-xl font-bold text-white">SACIMO</span>
            </Link>

            {/* Menu Desktop */}
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

            {/* CTA */}
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-gray-300 hover:text-white border-white/10">
                  Connexion
                </Button>
              </Link>
              <Link href="#inscription">
                <Button className="bg-white text-black hover:bg-gray-100 font-semibold">
                  Essai gratuit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ============================================
          SECTION 2: HERO (Gradient 3D, Floating Cards)
          ============================================ */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Gradient 3D Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-violet-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-rose-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -50, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Pill Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-8"
              >
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Simplifiez votre workflow</span>
              </motion.div>

              {/* Main Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight"
              >
                <span className="text-white">Renforcez votre contrôle</span>
                <br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 bg-clip-text text-transparent">
                  immobilier avec SACIMO
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0"
              >
                Rationalisez la gestion de votre activité immobilière avec notre plateforme SaaS intuitive et évolutive. Conçue pour les professionnels français.
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <Button 
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100 font-bold px-8 py-6 text-lg"
                  asChild
                >
                  <Link href="#inscription">Commencer</Link>
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
                  asChild
                >
                  <Link href="#dashboard">
                    <Play className="mr-2 h-5 w-5" />
                    Voir la démo
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Right Content - Floating Cards */}
            <div className="relative">
              {/* Floating Card 1 - Top Left */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -top-8 -left-8 w-64 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl z-20"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-pink-400" />
                    </div>
                    <span className="text-xs text-gray-400">Nouvelles annonces</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">+23</div>
                <div className="text-xs text-green-400">+5% cette semaine</div>
              </motion.div>

              {/* Floating Card 2 - Center Large */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl z-10"
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-400">Solde total</h3>
                      <p className="text-3xl font-bold text-white">245 090€</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Revenus</span>
                    <span className="text-green-400 font-semibold">+100 000€</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Dépenses</span>
                    <span className="text-pink-400 font-semibold">-50 000€</span>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 3 - Top Right */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -top-8 -right-8 w-56 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl z-20"
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
              >
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Bell className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-xs text-gray-400">Alertes IA</span>
                </div>
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-xs text-purple-400">Actives</div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 3: TRUST/PARTNERS (Pills avec logos)
          ============================================ */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Pill Badge */}
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

          {/* Partner Logos Grid */}
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

      {/* ============================================
          SECTION 4: STATS (Métriques clés)
          ============================================ */}
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

      {/* ============================================
          SECTION 5: FEATURES (Fonctionnalités détaillées SACIMO)
          ============================================ */}
      <section id="fonctionnalites" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
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

          {/* Features Cards - Contenu SACIMO conservé */}
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

            {/* Features 4-7: Rapports, Suivi Concurrents, Copilote IA, Notifications */}
            {/* (Structure similaire, contenu SACIMO conservé) */}
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 6: WORKFLOW (Grandes cartes processus)
          ============================================ */}
      <section id="workflow" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Pill Badge */}
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

          {/* Section Title */}
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

          {/* Workflow Cards */}
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
                  {i === 0 ? <Users className="w-6 h-6 text-white" /> : <Zap className="w-6 h-6 text-white" />}
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

      {/* ============================================
          SECTION 7: DASHBOARD PREVIEW
          ============================================ */}
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

          {/* Dashboard Preview Grid */}
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
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                  <item.icon className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-pink-400 transition-colors">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 8: CTA/FOOTER
          ============================================ */}
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
            <form onSubmit={(e) => { e.preventDefault(); }} className="max-w-md mx-auto space-y-4">
              <Input
                type="email"
                placeholder="Votre email professionnel"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
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

