'use client';

/**
 * LANDING PAGE SACIMO - Style Skillize.fr
 * Structure identique à Skillize avec contenu SACIMO immobilier
 * Couleurs dashboard SACIMO : #7C4DFF (violet), dégradé violet-rose
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SacimoLogo } from '@/components/SacimoLogo';
import {
  ChevronDown,
  ChevronUp,
  Check,
  ArrowRight,
  Search,
  Brain,
  BarChart3,
  Calculator,
  FileText,
  TrendingUp,
  Users,
  Building2,
  Briefcase,
  Star,
  Shield,
  Zap,
  MessageSquare,
  MapPin,
  Target
} from 'lucide-react';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/auth/signup?email=' + encodeURIComponent(email);
  };

  const faqItems = [
    {
      question: "Comment fonctionne l'essai gratuit ?",
      answer: "L'essai gratuit dure 14 jours, sans carte bancaire. Vous avez accès à toutes les fonctionnalités de votre plan choisi. Aucun engagement, vous pouvez annuler à tout moment."
    },
    {
      question: "Puis-je connecter mon CRM ?",
      answer: "Oui, SACIMO s'intègre avec les principaux CRM immobiliers via notre API. Contactez-nous pour connaître les intégrations disponibles pour votre outil."
    },
    {
      question: "L'IA peut-elle répondre automatiquement ?",
      answer: "SACIMO génère des messages personnalisés que vous pouvez modifier avant envoi. Vous gardez le contrôle total sur toutes les communications avec vos clients."
    },
    {
      question: "Les données sont-elles sécurisées ?",
      answer: "Absolument. Nous utilisons un chiffrement de niveau bancaire, respectons strictement le RGPD et ne partageons jamais vos données avec des tiers."
    },
    {
      question: "Puis-je utiliser SACIMO sur mobile ?",
      answer: "Oui, SACIMO est 100% responsive et fonctionne parfaitement sur mobile, tablette et desktop. Accédez à votre copilote IA où que vous soyez."
    },
    {
      question: "Quelle est la précision de l'estimation automatique ?",
      answer: "Notre IA analyse les données du marché local et les transactions récentes pour fournir des estimations avec un score de confiance. La précision moyenne est de 85-90% selon les zones."
    }
  ];

  return (
    <div className="bg-[#F8F9FB] text-[#0F0F10] overflow-x-hidden min-h-screen">
      
      {/* ============================================
          NAVBAR
          ============================================ */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7C4DFF] to-[#C17EFF] rounded-xl flex items-center justify-center">
                <SacimoLogo size={32} />
              </div>
              <span className="text-2xl font-bold text-[#0F0F10]">SACIMO</span>
            </Link>

            {/* Menu Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#fonctionnalites" className="text-[#98A2B3] hover:text-[#0F0F10] transition-colors text-sm font-medium">
                Fonctionnalités
              </Link>
              <Link href="#tarifs" className="text-[#98A2B3] hover:text-[#0F0F10] transition-colors text-sm font-medium">
                Tarifs
              </Link>
              <Link href="#faq" className="text-[#98A2B3] hover:text-[#0F0F10] transition-colors text-sm font-medium">
                FAQ
              </Link>
              <Link href="/contact" className="text-[#98A2B3] hover:text-[#0F0F10] transition-colors text-sm font-medium">
                Contact
              </Link>
            </div>

            {/* CTA */}
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-[#98A2B3] hover:text-[#0F0F10]">
                  Connexion
                </Button>
              </Link>
              <Link href="#inscription">
                <Button className="bg-gradient-to-r from-[#7C4DFF] to-[#C17EFF] hover:from-[#6B3EE8] hover:to-[#B06EE8] text-white font-semibold rounded-xl">
                  Essai gratuit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-[#0F0F10]">
                L'IA immobilière qui décuple vos performances.
              </h1>
              <p className="text-xl text-[#98A2B3] mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                SACIMO, votre copilote intelligent : analyse d'annonces, estimation automatique, messages IA, suivi concurrents et recherche assistée.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#7C4DFF] to-[#C17EFF] hover:from-[#6B3EE8] hover:to-[#B06EE8] text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:scale-105 transition-transform"
                  asChild
                >
                  <Link href="#inscription">Essai gratuit 14 jours</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-300 text-[#0F0F10] hover:bg-gray-50 px-8 py-6 text-lg rounded-xl"
                  asChild
                >
                  <Link href="/contact">Voir une démo</Link>
                </Button>
              </div>
            </motion.div>

            {/* Right Content - UI Cards Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              {/* Carte Recherche IA */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-8 -left-8 w-80 bg-white border border-gray-200 rounded-2xl p-6 shadow-xl z-20 hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#7C4DFF] to-[#C17EFF] rounded-xl flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0F0F10]">Recherche IA</h3>
                </div>
                <div className="space-y-2">
                  <div className="bg-[#F8F9FB] rounded-lg p-3">
                    <p className="text-xs text-[#98A2B3] mb-1">Critères :</p>
                    <p className="text-sm text-[#0F0F10]">Appartement 3 pièces, Lyon, 350k€</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">12 résultats</Badge>
                </div>
              </motion.div>

              {/* Carte Suivi Concurrents */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-xl z-10 mt-8 hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#7C4DFF] to-[#C17EFF] rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0F0F10]">Suivi Concurrents</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-[#F8F9FB] rounded-lg">
                    <span className="text-sm text-[#0F0F10]">Century 21</span>
                    <span className="text-xs text-[#98A2B3]">+5 annonces</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#F8F9FB] rounded-lg">
                    <span className="text-sm text-[#0F0F10]">Orpi</span>
                    <span className="text-xs text-[#98A2B3]">+3 annonces</span>
                  </div>
                </div>
              </motion.div>

              {/* Carte Estimation */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute -bottom-8 -right-8 w-80 bg-white border border-gray-200 rounded-2xl p-6 shadow-xl z-20 hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#7C4DFF] to-[#C17EFF] rounded-xl flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0F0F10]">Estimation</h3>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#0F0F10] mb-2">245 000€</div>
                  <p className="text-xs text-[#98A2B3]">Fourchette: 230k€ - 260k€</p>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200 mt-2">Précision: 87%</Badge>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          COMMENT ÇA MARCHE (3 STEPS)
          ============================================ */}
      <section className="py-32 bg-[#F8F9FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#0F0F10]">
              Comment ça marche
            </h2>
            <p className="text-xl text-[#98A2B3] max-w-2xl mx-auto">
              En 3 étapes simples, transformez votre façon de travailler
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Décrivez votre besoin',
                desc: 'SACIMO comprend vos critères : type de bien, budget, localisation, caractéristiques.',
                icon: MessageSquare
              },
              {
                step: '2',
                title: "L'IA analyse le marché",
                desc: "L'IA parcourt les annonces, estime les biens et détecte les opportunités.",
                icon: Brain
              },
              {
                step: '3',
                title: 'Vous recevez des actions immédiates',
                desc: 'Messages prêts à l\'envoi, résumés d\'annonces, alertes de suivi concurrents.',
                icon: Zap
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#7C4DFF] to-[#C17EFF] rounded-2xl flex items-center justify-center mb-6">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-sm font-semibold text-[#7C4DFF] mb-2">Étape {item.step}</div>
                <h3 className="text-2xl font-bold text-[#0F0F10] mb-4">{item.title}</h3>
                <p className="text-[#98A2B3] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FONCTIONNALITÉS PRINCIPALES
          ============================================ */}
      <section id="fonctionnalites" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#0F0F10]">
              Fonctionnalités principales
            </h2>
            <p className="text-xl text-[#98A2B3] max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour dominer le marché immobilier
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Search, title: 'Recherche IA de biens', desc: 'Trouvez les meilleures opportunités en quelques secondes avec notre IA qui comprend vos critères complexes.' },
              { icon: Brain, title: 'Copilote IA', desc: 'Messages & analyse intelligente pour répondre à vos leads et analyser le marché en temps réel.' },
              { icon: BarChart3, title: 'Tableau de bord intelligent', desc: 'Visualisez vos performances, métriques clés et insights en un seul endroit.' },
              { icon: Calculator, title: 'Estimation automatique', desc: 'Estimez la valeur de n\'importe quel bien avec une précision de 85-90% grâce à l\'IA.' },
              { icon: FileText, title: 'Analyse et résumé d\'annonce', desc: 'Transformez des descriptions longues en résumés clairs et actionnables.' },
              { icon: TrendingUp, title: 'Suivi concurrents automatisé', desc: 'Surveillez l\'activité de vos concurrents et restez toujours en avance.' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#7C4DFF] to-[#C17EFF] rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#0F0F10] mb-2">{feature.title}</h3>
                <p className="text-[#98A2B3] text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          POUR QUI ? (3 PERSONAS)
          ============================================ */}
      <section className="py-32 bg-[#F8F9FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#0F0F10]">
              Pour qui ?
            </h2>
            <p className="text-xl text-[#98A2B3] max-w-2xl mx-auto">
              SACIMO s'adapte à tous les profils d'agents immobiliers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Agents indépendants',
                desc: 'Gagnez du temps sur les tâches répétitives et concentrez-vous sur la vente. Parfait pour les agents qui veulent optimiser leur productivité.',
                features: ['Recherche IA', 'Résumés automatiques', 'Messages IA']
              },
              {
                icon: Building2,
                title: 'Agences immobilières',
                desc: 'Équipez toute votre équipe avec un outil puissant qui standardise vos processus et améliore vos performances collectives.',
                features: ['Multi-utilisateurs', 'Tableaux de bord équipe', 'Suivi concurrents']
              },
              {
                icon: Briefcase,
                title: 'Réseaux / Mandataires',
                desc: 'Gérez plusieurs mandats simultanément avec des outils d\'analyse avancés et une vue d\'ensemble sur tous vos biens.',
                features: ['Gestion multi-mandats', 'Rapports détaillés', 'API complète']
              }
            ].map((persona, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#7C4DFF] to-[#C17EFF] rounded-2xl flex items-center justify-center mb-6">
                  <persona.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#0F0F10] mb-4">{persona.title}</h3>
                <p className="text-[#98A2B3] mb-6 leading-relaxed">{persona.desc}</p>
                <ul className="space-y-2">
                  {persona.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <Check className="w-5 h-5 text-[#7C4DFF]" />
                      <span className="text-sm text-[#0F0F10]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          TARIFS
          ============================================ */}
      <section id="tarifs" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#0F0F10]">
              Tarifs
            </h2>
            <p className="text-xl text-[#98A2B3] max-w-2xl mx-auto">
              Des plans adaptés à tous les besoins
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Agent Solo',
                price: '49€',
                period: '/mois',
                desc: 'Parfait pour les agents indépendants',
                features: [
                  'Recherche IA illimitée',
                  '100 résumés/mois',
                  '50 messages IA/mois',
                  'Estimation automatique',
                  'Support email'
                ]
              },
              {
                name: 'Équipe',
                price: '149€',
                period: '/mois',
                desc: 'Pour les petites équipes',
                features: [
                  'Tout Agent Solo +',
                  'Résumés illimités',
                  'Messages IA illimités',
                  'Suivi concurrents',
                  'Jusqu\'à 5 utilisateurs',
                  'Support prioritaire'
                ],
                popular: true
              },
              {
                name: 'Agence Pro',
                price: '399€',
                period: '/mois',
                desc: 'Pour les grandes agences',
                features: [
                  'Tout Équipe +',
                  'Utilisateurs illimités',
                  'API complète',
                  'Rapports personnalisés',
                  'Support dédié',
                  'Formation équipe'
                ]
              }
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-white border rounded-2xl p-8 ${
                  plan.popular
                    ? 'border-2 border-[#7C4DFF] shadow-xl scale-105'
                    : 'border-gray-200'
                } hover:shadow-xl transition-all hover:-translate-y-1`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-[#7C4DFF] to-[#C17EFF] text-white px-4 py-1">
                      Populaire
                    </Badge>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-[#0F0F10] mb-2">{plan.name}</h3>
                  <p className="text-[#98A2B3] text-sm mb-4">{plan.desc}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-[#0F0F10]">{plan.price}</span>
                    <span className="text-[#98A2B3] ml-2">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-[#7C4DFF] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-[#0F0F10]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full rounded-xl ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#7C4DFF] to-[#C17EFF] hover:from-[#6B3EE8] hover:to-[#B06EE8] text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-[#0F0F10]'
                  } font-semibold`}
                  asChild
                >
                  <Link href="/auth/signup">Choisir ce plan</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          TÉMOIGNAGES
          ============================================ */}
      <section className="py-32 bg-[#F8F9FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#0F0F10]">
              Témoignages
            </h2>
            <p className="text-xl text-[#98A2B3] max-w-2xl mx-auto">
              Ce que disent les agents qui utilisent SACIMO
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Marie Dubois',
                role: 'Agent indépendant, Lyon',
                content: 'Je gagne 2h par jour grâce aux résumés IA. SACIMO transforme vraiment ma façon de travailler.',
                rating: 5
              },
              {
                name: 'Thomas Martin',
                role: 'Directeur agence, Paris',
                content: 'L\'estimation automatique est bluffante. On a réduit nos erreurs de pricing de 40%.',
                rating: 5
              },
              {
                name: 'Sophie Bernard',
                role: 'Mandataire, Bordeaux',
                content: 'Le suivi des annonces concurrentes est précieux. Je ne rate plus jamais une opportunité.',
                rating: 5
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, idx) => (
                    <Star key={idx} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-[#0F0F10] mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-[#0F0F10]">{testimonial.name}</div>
                  <div className="text-sm text-[#98A2B3]">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FAQ
          ============================================ */}
      <section id="faq" className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#0F0F10]">
              Questions fréquentes
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="text-lg font-semibold text-[#0F0F10] pr-8">{item.question}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-[#98A2B3] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#98A2B3] flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-[#98A2B3] leading-relaxed">{item.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA FINAL
          ============================================ */}
      <section id="inscription" className="py-32 bg-gradient-to-br from-[#7C4DFF] to-[#C17EFF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Prêt à passer à l'immobilier assisté par IA ?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Rejoignez les centaines d'agents qui utilisent déjà SACIMO pour transformer leur productivité
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-[#7C4DFF] hover:bg-gray-100 font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:scale-105 transition-transform"
                asChild
              >
                <Link href="/auth/signup">Essai gratuit</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl"
                asChild
              >
                <Link href="/contact">Voir une démo</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="py-12 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-[#98A2B3] text-sm mb-4 md:mb-0">
              © 2025 SACIMO. Tous droits réservés.
            </div>
            <div className="flex items-center space-x-6">
              <Link href="#fonctionnalites" className="text-[#98A2B3] hover:text-[#0F0F10] text-sm transition-colors">
                Fonctionnalités
              </Link>
              <Link href="#tarifs" className="text-[#98A2B3] hover:text-[#0F0F10] text-sm transition-colors">
                Tarifs
              </Link>
              <Link href="#faq" className="text-[#98A2B3] hover:text-[#0F0F10] text-sm transition-colors">
                FAQ
              </Link>
              <Link href="/contact" className="text-[#98A2B3] hover:text-[#0F0F10] text-sm transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
