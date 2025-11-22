'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Star,
  MessageCircle,
  Zap,
  Brain,
  Home,
  Twitter,
  Github,
  Linkedin
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HomePage() {
  const pathname = usePathname();

  return (
    <>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                  <SacimoLogo size={40} />
                </div>
                <span className="text-2xl font-bold text-gray-900">SACIMO</span>
              </Link>
            </motion.div>

            {/* Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#fonctionnalites" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Fonctionnalités
              </Link>
              <Link href="#tarifs" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Tarifs
              </Link>
              <Link href="/ressources" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Ressources
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Contact
              </Link>
            </div>

            {/* CTA */}
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-gray-700 hover:text-primary-600">
                  Se connecter
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white">
                  Essai gratuit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(124, 92, 219, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(94, 58, 155, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 40% 20%, rgba(139, 114, 231, 0.1) 0%, transparent 50%)
        `
      }}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-40 left-20 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-60 right-20 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{
              y: [0, 30, 0],
              scale: [1, 1.3, 1],
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
            className="absolute bottom-20 left-1/3 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{
              y: [0, -20, 0],
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

        {/* Decorative Shapes */}
        <motion.div
          className="absolute top-32 right-32 w-20 h-20 border-2 border-primary-300 rounded-full opacity-40"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-32 h-32 border-2 border-primary-300 rounded-lg opacity-40"
          animate={{
            y: [0, 20, 0],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-100 rounded-full mb-6"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-primary-600 rounded-full"
                />
                <span className="text-sm font-semibold text-primary-700">Plus de 500 agents immobiliers</span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-6xl md:text-7xl font-bold mb-6"
              >
                Connectez avec les meilleures opportunités immobilières{' '}
                <motion.span
                  className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                  }}
                  style={{
                    backgroundSize: '200% auto',
                  }}
                >
                  IA & automatisation
                </motion.span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-xl text-gray-600 mb-8 leading-relaxed"
              >
                Découvrez SACIMO, un suivi humain et des talents triés sur le volet pour trouver rapidement les profils qui vous correspondent.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex items-center space-x-4 mb-12"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all font-semibold text-lg"
                    asChild
                  >
                    <Link href="/auth/signup">
                      Commencer gratuitement
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-primary-300 transition-all font-semibold text-lg"
                  >
                    Voir la démo
                  </Button>
                </motion.div>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="flex items-center space-x-6 flex-wrap"
              >
                {[
                  'Essai gratuit 14 jours',
                  'Sans carte bancaire',
                  'Configuration en 2 min'
                ].map((badge, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-600">{badge}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Content - Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative"
            >
              {/* Floating Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="absolute -top-8 -left-8 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl z-10 border border-primary-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Nouvelles annonces</p>
                    <p className="text-lg font-bold text-gray-900">+23</p>
                    <p className="text-xs text-green-600">+5% cette semaine</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.05, y: 5 }}
                className="absolute -bottom-8 -left-8 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl z-10 border border-primary-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Alertes IA</p>
                    <p className="text-lg font-bold text-gray-900">12</p>
                  </div>
                </div>
              </motion.div>

              {/* Dashboard Preview */}
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-primary-100"
              >
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Home className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Dashboard Preview</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '500+', label: 'Agents immobiliers' },
              { number: '10k+', label: 'Annonces analysées' },
              { number: '2k+', label: 'Rapports générés' },
              { number: '4.9/5', label: 'Satisfaction client' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.3, type: "spring" }}
                  className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2"
                >
                  {stat.number}
                </motion.div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white" id="fonctionnalites">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Comment ça marche ?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Commencez à utiliser SACIMO en 3 étapes simples
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Configurez vos critères',
                description: 'Définissez vos zones de recherche, types de biens et budget',
                icon: Search,
                gradient: 'from-primary-500 to-primary-600'
              },
              {
                step: '2',
                title: 'Analysez les données',
                description: 'Notre IA analyse le marché et vous livre des opportunités',
                icon: BarChart3,
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                step: '3',
                title: 'Générez des rapports',
                description: 'Créez des rapports professionnels en quelques clics',
                icon: FileText,
                gradient: 'from-cyan-500 to-emerald-500'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative group"
              >
                <Card className="glass rounded-3xl p-8 text-center h-full hover:shadow-xl transition-all">
                  <div className="relative inline-block mb-6">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`w-20 h-20 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mx-auto shadow-lg`}
                    >
                      <item.icon className="w-10 h-10 text-white" />
                    </motion.div>
                    <div className={`absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br ${item.gradient} text-white rounded-full flex items-center justify-center font-bold shadow-lg`}>
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des outils puissants pour analyser et optimiser votre activité
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: 'Recherches intelligentes',
                description: 'Trouvez les meilleures opportunités grâce à nos algorithmes avancés',
                gradient: 'from-primary-500 to-primary-600'
              },
              {
                icon: TrendingUp,
                title: 'Analyse de marché',
                description: 'Suivez les tendances et anticipez les évolutions du marché',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Users,
                title: 'Suivi concurrents',
                description: 'Surveillez l\'activité de vos concurrents en temps réel',
                gradient: 'from-cyan-500 to-emerald-500'
              },
              {
                icon: FileText,
                title: 'Rapports automatisés',
                description: 'Générez des rapports professionnels en quelques clics',
                gradient: 'from-emerald-500 to-green-500'
              },
              {
                icon: Bell,
                title: 'Alertes intelligentes',
                description: 'Recevez des notifications pour les opportunités correspondant à vos critères',
                gradient: 'from-amber-500 to-orange-500'
              },
              {
                icon: Brain,
                title: 'Copilote IA',
                description: 'Assistant intelligent pour vos négociations et emails',
                gradient: 'from-pink-500 to-purple-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Card className="glass rounded-3xl p-8 hover:shadow-xl transition-all h-full">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <Link href="#" className="text-primary-600 font-semibold inline-flex items-center space-x-2 hover:space-x-3 transition-all">
                    <span>En savoir plus</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden" style={{
        background: 'linear-gradient(-45deg, #7C5CDB, #5E3A9B, #8B72E7, #7C5CDB)',
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite'
      }}>
        <style jsx>{`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-bold text-white mb-6"
          >
            Prêt à transformer votre activité ?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/90 mb-10"
          >
            Rejoignez des centaines d'agents immobiliers qui utilisent déjà SACIMO
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center space-x-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="px-10 py-5 bg-white text-primary-700 hover:bg-gray-50 rounded-xl shadow-2xl transition-all font-bold text-lg"
                asChild
              >
                <Link href="/auth/signup">Commencer gratuitement</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="px-10 py-5 bg-white/20 backdrop-blur-sm text-white border-2 border-white rounded-xl hover:bg-white/30 transition-all font-bold text-lg"
              >
                Planifier une démo
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Company */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                  <SacimoLogo size={40} />
                </div>
                <span className="text-2xl font-bold">SACIMO</span>
              </div>
              <p className="text-gray-400 mb-6">L'immobilier intelligent</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold mb-4">Produit</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="#fonctionnalites" className="hover:text-white transition-colors">Fonctionnalités</Link></li>
                <li><Link href="#tarifs" className="hover:text-white transition-colors">Tarifs</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold mb-4">Entreprise</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">À propos</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold mb-4">Légal</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">CGU</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Confidentialité</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Mentions légales</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">© 2025 SACIMO. Tous droits réservés.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-6 h-6" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
