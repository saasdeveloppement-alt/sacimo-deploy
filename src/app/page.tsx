'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  ChevronDown
} from 'lucide-react';

export default function HomePage() {
  const pathname = usePathname();

  return (
    <>
      {/* Navbar inline */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '80px',
        background: 'linear-gradient(to right, rgb(46, 16, 101), rgb(76, 29, 149), rgb(79, 70, 229))',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        zIndex: 9999
      }}>
        <div style={{
          height: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative'
        }}>
          <div style={{ flexShrink: 0 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: 'white',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: 'rgb(76, 29, 149)'
              }}>S</div>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>SACIMO</span>
            </Link>
          </div>
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '32px'
          }}>
            <Link href="/fonctionnalites" style={{ color: pathname === '/fonctionnalites' ? 'white' : 'rgba(255,255,255,0.7)', fontSize: '15px', textDecoration: 'none', fontWeight: pathname === '/fonctionnalites' ? '600' : '400' }}>
              Fonctionnalités
            </Link>
            <Link href="/tarifs" style={{ color: pathname === '/tarifs' ? 'white' : 'rgba(255,255,255,0.7)', fontSize: '15px', textDecoration: 'none', fontWeight: pathname === '/tarifs' ? '600' : '400' }}>
              Tarifs
            </Link>
            <Link href="/contact" style={{ color: pathname === '/contact' ? 'white' : 'rgba(255,255,255,0.7)', fontSize: '15px', textDecoration: 'none', fontWeight: pathname === '/contact' ? '600' : '400' }}>
              Contact
            </Link>
            <Link href="/ressources" style={{ color: pathname === '/ressources' ? 'white' : 'rgba(255,255,255,0.7)', fontSize: '15px', textDecoration: 'none', fontWeight: pathname === '/ressources' ? '600' : '400' }}>
              Ressources
            </Link>
            <Link href="/about" style={{ color: pathname === '/about' ? 'white' : 'rgba(255,255,255,0.7)', fontSize: '15px', textDecoration: 'none', fontWeight: pathname === '/about' ? '600' : '400' }}>
              À propos
            </Link>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
            <Link href="/auth/signin" style={{ padding: '10px 20px', color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Se connecter</Link>
            <Link href="/auth/signup" style={{ padding: '12px 24px', background: 'white', color: 'rgb(76, 29, 149)', borderRadius: '12px', fontWeight: '600', textDecoration: 'none', display: 'inline-block' }}>Essai gratuit</Link>
          </div>
        </div>
      </nav>

      <div style={{paddingTop:'80px'}}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/40">

      {/* Hero Section avec animations complexes */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        {/* Background avec gradient animé */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/40" />
        
        {/* Animated gradient blobs en arrière-plan */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
            y: [0, 50, 0],
            }}
            transition={{
            duration: 20,
              repeat: Infinity,
            ease: "easeInOut"
            }}
          className="absolute top-1/4 -left-48 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: [0, -100, 0],
            y: [0, -50, 0],
            }}
            transition={{
            duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-1/3 -right-48 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"
        />
        
        {/* Container centré avec max-width */}
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center relative">
            
                     {/* AVATARS ÉLÉGANTS - Version haut de gamme */}
                     
                     {/* Icône 1 - Top Left - Violet doux */}
          <motion.div
                       animate={{
                         y: [0, -15, 0],
                         rotate: [0, 3, 0],
                       }}
                       transition={{
                         duration: 5,
                         repeat: Infinity,
                         ease: "easeInOut"
                       }}
                       style={{ position: 'absolute', top: '80px', left: '128px', width: '48px', height: '48px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', zIndex: 0 }}
                     >
                       <Search style={{ width: '20px', height: '20px', color: 'rgb(124, 58, 237)' }} />
                     </motion.div>

                     {/* Icône 2 - Top Center - Emerald subtil */}
                     <motion.div
                       animate={{
                         y: [0, 12, 0],
                       }}
                       transition={{
                         duration: 6,
                         repeat: Infinity,
                         ease: "easeInOut",
                         delay: 1
                       }}
                       style={{ position: 'absolute', top: '40px', left: '33%', width: '44px', height: '44px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', zIndex: 0 }}
                     >
                       <TrendingUp style={{ width: '16px', height: '16px', color: 'rgb(16, 185, 129)' }} />
                     </motion.div>

                     {/* Icône 3 - Top Right - Orange doux */}
                     <motion.div
                       animate={{
                         y: [0, -12, 0],
                         rotate: [0, -3, 0],
                       }}
                       transition={{
                         duration: 5.5,
                         repeat: Infinity,
                         ease: "easeInOut",
                         delay: 1.5
                       }}
                       style={{ position: 'absolute', top: '64px', right: '160px', width: '48px', height: '48px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', zIndex: 0 }}
                     >
                       <Bell style={{ width: '20px', height: '20px', color: 'rgb(249, 115, 22)' }} />
                     </motion.div>

                     {/* Icône 4 - Middle Left - Indigo */}
                     <motion.div
                       animate={{
                         y: [0, 15, 0],
                       }}
                       transition={{
                         duration: 6.5,
                         repeat: Infinity,
                         ease: "easeInOut",
                         delay: 2
                       }}
                       style={{ position: 'absolute', top: '33%', left: '80px', width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', zIndex: 0 }}
                     >
                       <FileText style={{ width: '16px', height: '16px', color: 'rgb(99, 102, 241)' }} />
                     </motion.div>

                     {/* Icône 5 - Middle Right - Bleu */}
                     <motion.div
                       animate={{
                         y: [0, -18, 0],
                       }}
                       transition={{
                         duration: 5.8,
                         repeat: Infinity,
                         ease: "easeInOut",
                         delay: 2.5
                       }}
                       style={{ position: 'absolute', top: '33%', right: '112px', width: '44px', height: '44px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', zIndex: 0 }}
                     >
                       <BarChart3 style={{ width: '20px', height: '20px', color: 'rgb(59, 130, 246)' }} />
                     </motion.div>

                     {/* Icône 6 - Bottom Left - Cyan */}
                     <motion.div
                       animate={{
                         y: [0, 10, 0],
                         rotate: [0, -2, 0],
                       }}
                       transition={{
                         duration: 6.2,
                         repeat: Infinity,
                         ease: "easeInOut",
                         delay: 3
                       }}
                       style={{ position: 'absolute', bottom: '128px', left: '160px', width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 10px 25px rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', zIndex: 0 }}
                     >
                       <MapPin style={{ width: '16px', height: '16px', color: 'rgb(6, 182, 212)' }} />
                     </motion.div>

                     {/* Icône 7 - Bottom Right - Purple */}
                     <motion.div
                       animate={{
                         y: [0, -10, 0],
                       }}
                       transition={{
                         duration: 5.3,
                         repeat: Infinity,
                         ease: "easeInOut",
                         delay: 3.5
                       }}
                       style={{ position: 'absolute', bottom: '160px', right: '192px', width: '48px', height: '48px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', zIndex: 0 }}
                     >
                       <Users style={{ width: '20px', height: '20px', color: 'rgb(168, 85, 247)' }} />
                     </motion.div>

                     {/* Élément décoratif - Cercle violet subtil */}
                     <motion.div
                       animate={{
                         scale: [1, 1.2, 1],
                         opacity: [0.4, 0.6, 0.4],
                       }}
                       transition={{
                         duration: 4,
                         repeat: Infinity,
                         ease: "easeInOut"
                       }}
                       style={{ position: 'absolute', top: '25%', right: '25%', width: '12px', height: '12px', backgroundColor: 'rgba(124, 58, 237, 0.4)', borderRadius: '50%', filter: 'blur(4px)', zIndex: 0 }}
                     />

                     {/* Élément décoratif - Petit carré */}
                     <motion.div
                       animate={{
                         rotate: [0, 90, 0],
                         opacity: [0.3, 0.5, 0.3],
                       }}
                       transition={{
                         duration: 8,
                         repeat: Infinity,
                         ease: "linear"
                       }}
                       style={{ position: 'absolute', bottom: '25%', left: '25%', width: '8px', height: '8px', backgroundColor: 'rgba(99, 102, 241, 0.3)', borderRadius: '2px', zIndex: 0 }}
                     />

            {/* CONTENU PRINCIPAL (Badge, Titre, etc.) */}
            
            {/* Badge animé */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', marginBottom: '32px', backgroundColor: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(24px)', border: '1px solid rgba(76, 29, 149, 0.2)', borderRadius: '999px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', position: 'relative', zIndex: 10 }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: '8px', height: '8px', backgroundColor: 'rgb(76, 29, 149)', borderRadius: '50%' }}
              />
              <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Déjà +500 agents immobiliers
                </span>
            </motion.div>

            {/* Titre avec animation lettre par lettre */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl md:text-7xl mb-6 leading-tight tracking-tight relative z-10"
            >
              <span className="block font-light text-slate-900 mb-2">
                Connectez avec les meilleures
              </span>
              <span className="block font-normal text-slate-900">
                opportunités immobilières{' '}
                <motion.span 
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ background: 'linear-gradient(to right, rgb(76, 29, 149), rgb(79, 70, 229), rgb(88, 28, 135))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', backgroundSize: '200% auto', fontStyle: 'italic', fontWeight: '300' }}
                >
                  IA & automatisation
                </motion.span>
              </span>
            </motion.h1>

            {/* Sous-titre animé */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto font-light leading-relaxed relative z-10"
            >
              Découvrez SACIMO : un suivi humain et des talents triés sur le volet pour 
              trouver rapidement les profils qui vous correspondent.
            </motion.p>

            {/* CTA avec gradient VIOLET (pas orange) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex items-center justify-center mb-16 relative z-10"
            >
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(76, 29, 149, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  style={{ position: 'relative', background: 'linear-gradient(to right, rgb(76, 29, 149), rgb(79, 70, 229))', color: 'white', fontWeight: '500', padding: '24px 40px', fontSize: '16px', borderRadius: '12px', boxShadow: '0 25px 50px rgba(76, 29, 149, 0.3)', overflow: 'hidden' }}
                  asChild
                >
                  <Link href="/auth/signup">
                    <motion.span
                      className="absolute inset-0 bg-white/10"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                    <span className="relative">Commencer gratuitement</span>
                  </Link>
              </Button>
            </motion.div>
            </motion.div>
          </div>

          {/* Dashboard Preview avec animations */}
            <motion.div
            initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-20 relative"
          >
            {/* Glow animé */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(76, 29, 149, 0.2), rgba(79, 70, 229, 0.2))', filter: 'blur(64px)' }}
            />
            
            {/* Container principal */}
            <motion.div
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
              style={{ position: 'relative', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(24px)', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)', border: '1px solid rgba(76, 29, 149, 0.1)', overflow: 'hidden' }}
            >
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=90" 
                alt="SACIMO Dashboard"
                className="w-full"
              />
              
              {/* Card flottante animée 1 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  y: [0, -10, 0],
                }}
                transition={{ 
                  delay: 1.2, 
                  duration: 0.6,
                  y: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                whileHover={{ scale: 1.05 }}
                className="absolute top-8 right-8 bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-violet-100/50"
              >
                <div className="flex items-center gap-4">
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <TrendingUp className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Nouvelles annonces</div>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-2xl font-semibold text-slate-900"
                    >
                      +23
                    </motion.div>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1, delay: 1.5 }}
                      className="text-xs text-emerald-600 mt-1"
                    >
                      +15% cette semaine
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Card flottante animée 2 */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  y: [0, 10, 0],
                }}
                transition={{ 
                  delay: 1.4, 
                  duration: 0.6,
                  y: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }
                }}
                whileHover={{ scale: 1.05 }}
                className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-indigo-100/50"
              >
                <div className="flex items-center gap-4">
                  <motion.div 
                    whileHover={{ rotate: -360 }}
                    transition={{ duration: 0.6 }}
                            style={{ width: '48px', height: '48px', background: 'linear-gradient(to bottom right, rgb(76, 29, 149), rgb(79, 70, 229))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(76, 29, 149, 0.3)' }}
                  >
                    <Bell className="h-6 w-6 text-white" />
                  </motion.div>
                      <div>
                    <div className="text-xs text-slate-500 mb-1">Alertes actives</div>
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.6, type: "spring" }}
                      className="text-2xl font-semibold text-slate-900"
                    >
                      12
                    </motion.div>
                  </div>
                  </div>
            </motion.div>
            </motion.div>
          </motion.div>
                  </div>
      </section>

      {/* Stats Section avec animations au scroll */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ padding: '96px 24px', background: 'linear-gradient(to bottom right, rgba(76, 29, 149, 0.05), rgba(79, 70, 229, 0.05))' }}
      >
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-4 gap-12">
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
                className="text-center group"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.3, type: "spring" }}
                        style={{ fontSize: '48px', fontWeight: '300', background: 'linear-gradient(to right, rgb(76, 29, 149), rgb(79, 70, 229))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '8px' }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </motion.div>
            ))}
                  </div>
                </div>
      </motion.section>

      {/* How it works */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 px-6 bg-white"
      >
        <div className="container mx-auto max-w-5xl">
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-light text-slate-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-slate-600 font-light max-w-2xl mx-auto">
              Commencez à utiliser SACIMO en 3 étapes simples
            </p>
            </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Configurez vos critères',
                description: 'Définissez vos zones de recherche, types de biens et budget',
                icon: Search,
                gradient: 'linear-gradient(to bottom right, rgb(76, 29, 149), rgb(79, 70, 229))'
              },
              {
                step: '02',
                title: 'Analysez les données',
                description: 'Notre IA analyse le marché et vous alerte des opportunités',
                icon: BarChart3,
                gradient: 'linear-gradient(to bottom right, rgb(76, 29, 149), rgb(79, 70, 229))'
              },
              {
                step: '03',
                title: 'Générez des rapports',
                description: 'Créez des rapports professionnels en quelques clics',
                icon: FileText,
                gradient: 'linear-gradient(to bottom right, rgb(76, 29, 149), rgb(79, 70, 229))'
              }
            ].map((item, index) => (
            <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="text-center group"
              >
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: item.gradient, borderRadius: '16px', marginBottom: '24px', boxShadow: '0 10px 25px rgba(76, 29, 149, 0.3)' }}
                >
                  <item.icon className="h-7 w-7 text-white" />
            </motion.div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'rgb(76, 29, 149)', marginBottom: '8px' }}>ÉTAPE {item.step}</div>
                <h3 className="text-lg font-medium text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 font-light leading-relaxed text-[15px]">{item.description}</p>
          </motion.div>
            ))}
        </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="fonctionnalites"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ padding: '96px 24px', background: 'linear-gradient(to bottom, white, rgba(76, 29, 149, 0.03))' }}
      >
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-light text-slate-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-slate-600 font-light">
              Des outils puissants pour analyser et optimiser votre activité
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: Search,
                title: 'Recherches intelligentes',
                description: 'Trouvez les meilleures opportunités grâce à nos algorithmes avancés',
                gradient: 'linear-gradient(to bottom right, rgb(76, 29, 149), rgb(79, 70, 229))'
              },
              {
                icon: TrendingUp,
                title: 'Analyse de marché',
                description: 'Suivez les tendances et anticipez les évolutions du marché',
                gradient: 'linear-gradient(to bottom right, rgb(76, 29, 149), rgb(79, 70, 229))'
              },
              {
                icon: Users,
                title: 'Suivi concurrents',
                description: 'Surveillez l\'activité de vos concurrents en temps réel',
                gradient: 'linear-gradient(to bottom right, rgb(76, 29, 149), rgb(79, 70, 229))'
              },
              {
                icon: FileText,
                title: 'Rapports automatisés',
                description: 'Générez des rapports professionnels en quelques clics',
                gradient: 'linear-gradient(to bottom right, rgb(76, 29, 149), rgb(79, 70, 229))'
              },
              {
                icon: Bell,
                title: 'Alertes intelligentes',
                description: 'Recevez des notifications pour les opportunités importantes',
                gradient: 'linear-gradient(to bottom right, rgb(76, 29, 149), rgb(79, 70, 229))'
              },
              {
                icon: BarChart3,
                title: 'Copilote IA',
                description: 'Assistant intelligent pour optimiser vos décisions',
                gradient: 'linear-gradient(to bottom right, rgb(76, 29, 149), rgb(79, 70, 229))'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="text-center group"
              >
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.15 }}
                  transition={{ duration: 0.6 }}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: feature.gradient, borderRadius: '16px', marginBottom: '24px', boxShadow: '0 10px 25px rgba(76, 29, 149, 0.3)' }}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </motion.div>
                <h3 className="text-lg font-medium text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 font-light leading-relaxed text-[15px]">
                      {feature.description}
                    </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Teaser */}
      <motion.section 
        id="tarifs"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ padding: '96px 24px', background: 'linear-gradient(to bottom right, rgba(79, 70, 229, 0.05), rgba(76, 29, 149, 0.05))' }}
      >
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-light text-slate-900 mb-4">
              Une offre pour chaque besoin
            </h2>
            <p className="text-lg text-slate-600 font-light">
              Commencez gratuitement, évoluez quand vous voulez
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: '29',
                features: ['10 recherches/jour', '5 rapports/mois', 'Support email'],
                popular: false
              },
              {
                name: 'Pro',
                price: '99',
                features: ['Recherches illimitées', 'Rapports illimités', 'Support prioritaire', 'API access'],
                popular: true
              },
              {
                name: 'Enterprise',
                price: '299',
                features: ['Tout de Pro', 'White label', 'Account manager', 'Formation'],
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <Card 
                  style={{ position: 'relative', border: plan.popular ? '2px solid rgb(76, 29, 149)' : '1px solid #e2e8f0', boxShadow: plan.popular ? '0 25px 50px rgba(76, 29, 149, 0.3)' : 'none' }}
                >
                  {plan.popular && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 + 0.3, type: "spring" }}
                      className="absolute -top-3 left-1/2 -translate-x-1/2"
                    >
                      <Badge style={{ background: 'linear-gradient(to right, rgb(76, 29, 149), rgb(79, 70, 229))', color: 'white', padding: '4px 12px', fontSize: '12px' }}>
                        Le plus populaire
                      </Badge>
                    </motion.div>
                  )}
                  <CardContent className="p-8">
                    <h3 className="text-xl font-medium mb-2">{plan.name}</h3>
                    <div className="mb-6">
                      <motion.span 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.15 + 0.2 }}
                        style={{ fontSize: '36px', fontWeight: '300', background: 'linear-gradient(to right, rgb(76, 29, 149), rgb(79, 70, 229))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                      >
                        {plan.price}€
                      </motion.span>
                      <span className="text-slate-600 text-sm">/mois</span>
                </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.15 + i * 0.1 }}
                          className="flex items-center gap-3 text-sm"
                        >
                          <Check style={{ width: '16px', height: '16px', color: 'rgb(76, 29, 149)' }} />
                          <span className="text-slate-600">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        style={{ width: '100%', background: plan.popular ? 'linear-gradient(to right, rgb(76, 29, 149), rgb(79, 70, 229))' : 'transparent', color: plan.popular ? 'white' : 'rgb(76, 29, 149)', border: plan.popular ? 'none' : '1px solid #e2e8f0', boxShadow: plan.popular ? '0 10px 25px rgba(76, 29, 149, 0.3)' : 'none' }}
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        Commencer
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 px-6 bg-white"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-light text-slate-900 mb-4">
              Ils racontent ce que nous faisons,{' '}
              <span className="text-slate-400">mieux que nous.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sophie Martin',
                role: 'Agent immobilier',
                company: 'Century 21 Paris',
                avatar: 'SM',
                rating: 5,
                text: 'SACIMO a transformé ma façon de travailler. Je gagne un temps précieux sur l\'analyse de marché et mes clients adorent les rapports générés.'
              },
              {
                name: 'Thomas Durand',
                role: 'Directeur d\'agence',
                company: 'Orpi Lyon',
                avatar: 'TD',
                rating: 5,
                text: 'Un outil indispensable pour rester compétitif. La veille concurrentielle est un vrai plus pour notre équipe.'
              },
              {
                name: 'Marie Dubois',
                role: 'Négociatrice',
                company: 'Laforêt Bordeaux',
                avatar: 'MD',
                rating: 5,
                text: 'L\'interface est intuitive et les alertes en temps réel me permettent de ne jamais rater une opportunité.'
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white border border-slate-100 rounded-2xl p-8 hover:shadow-xl transition-shadow"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + i * 0.1 }}
                    >
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </motion.div>
                  ))}
                </div>

                {/* Text */}
                <p className="text-slate-600 mb-8 leading-relaxed text-[15px] font-light">
                  {testimonial.text}
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    style={{ width: '48px', height: '48px', background: 'linear-gradient(to bottom right, rgb(76, 29, 149), rgb(79, 70, 229))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '500', fontSize: '14px', boxShadow: '0 10px 25px rgba(76, 29, 149, 0.3)' }}
                  >
                    {testimonial.avatar}
                  </motion.div>
                  <div>
                    <div className="font-medium text-slate-900 text-sm">{testimonial.name}</div>
                    <div className="text-xs text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ padding: '96px 24px', background: 'linear-gradient(to bottom right, #f8fafc, rgba(76, 29, 149, 0.02))' }}
      >
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-light text-slate-900 mb-4">
              Questions fréquentes
            </h2>
            <p className="text-lg text-slate-600 font-light">
              Tout ce que vous devez savoir sur SACIMO
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                question: 'Puis-je essayer SACIMO gratuitement ?',
                answer: 'Oui ! SACIMO propose un essai gratuit de 14 jours sans carte bancaire. Vous pouvez tester toutes les fonctionnalités avant de vous engager.'
              },
              {
                question: 'Comment fonctionne la veille concurrentielle ?',
                answer: 'Notre système analyse automatiquement les annonces de vos concurrents et vous alerte en temps réel des nouvelles publications, modifications de prix, etc.'
              },
              {
                question: 'Les rapports sont-ils personnalisables ?',
                answer: 'Absolument ! Vous pouvez personnaliser les rapports avec votre logo, vos couleurs et choisir les données à inclure.'
              },
              {
                question: 'Puis-je annuler mon abonnement à tout moment ?',
                answer: 'Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace client. Aucun engagement de durée.'
              },
              {
                question: 'SACIMO est-il compatible mobile ?',
                answer: 'Oui, SACIMO est 100% responsive et fonctionne parfaitement sur mobile, tablette et desktop.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card style={{ border: '1px solid #e2e8f0', transition: 'border-color 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgb(76, 29, 149)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}>
                  <CardContent className="p-6">
                    <details className="group">
                      <summary className="flex items-center justify-between cursor-pointer list-none">
                        <h3 style={{ fontSize: '18px', fontWeight: '500' }}>
                          {faq.question}
                      </h3>
                        <motion.div 
                          style={{ color: 'rgb(76, 29, 149)' }}
                          animate={{ rotate: 0 }}
                          whileHover={{ rotate: 90 }}
                        >
                          <svg className="h-6 w-6 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </motion.div>
                      </summary>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 text-slate-600 leading-relaxed font-light text-[15px]"
                      >
                        {faq.answer}
                      </motion.p>
                    </details>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-slate-600 mb-4 font-light">Vous avez d'autres questions ?</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" style={{ border: '2px solid rgba(76, 29, 149, 0.2)', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgb(76, 29, 149)'; e.currentTarget.style.backgroundColor = 'rgba(76, 29, 149, 0.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(76, 29, 149, 0.2)'; e.currentTarget.style.backgroundColor = 'transparent'; }} asChild>
                <Link href="/contact">
                  Contactez-nous
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Final */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
            transition={{ duration: 0.8 }}
        style={{ padding: '96px 24px', background: 'linear-gradient(to bottom right, rgb(46, 16, 101), rgb(76, 29, 149), rgb(79, 70, 229))', position: 'relative', overflow: 'hidden' }}
      >
        {/* Animated background */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-white/5"
        />
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-4xl font-light mb-4">
              Prêt à transformer votre activité ?
            </h2>
            <p className="text-lg mb-8 font-light text-white/90">
              Rejoignez des centaines d'agents immobiliers qui utilisent déjà SACIMO
            </p>
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(255, 255, 255, 0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                style={{ backgroundColor: 'white', color: 'rgb(76, 29, 149)', fontWeight: '500', padding: '24px 32px', borderRadius: '12px', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)' }}
                asChild
              >
                <Link href="/auth/signup">
                  Essayer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
            </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-16 px-6 bg-white border-t border-slate-100"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-2 mb-4"
              >
                <div style={{ width: '32px', height: '32px', background: 'linear-gradient(to bottom right, rgb(76, 29, 149), rgb(79, 70, 229))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="text-sm font-semibold text-white">S</span>
            </div>
                <span className="font-semibold text-slate-900">SACIMO</span>
          </motion.div>
              <p className="text-sm text-slate-600 font-light">
                L'immobilier intelligent
              </p>
        </div>
            {[
              { title: 'Produit', links: [
                { label: 'Fonctionnalités', href: '#fonctionnalites' },
                { label: 'Tarifs', href: '#tarifs' },
                { label: 'Démo', href: '#demo' }
              ]},
              { title: 'Entreprise', links: [
                { label: 'À propos', href: '#' },
                { label: 'Contact', href: '/contact' },
                { label: 'Blog', href: '#' }
              ]},
              { title: 'Légal', links: [
                { label: 'CGU', href: '#' },
                { label: 'Confidentialité', href: '#' },
                { label: 'Mentions légales', href: '#' }
              ]}
            ].map((section, i) => (
              <div key={i}>
                <h4 className="font-medium text-slate-900 mb-4 text-sm">{section.title}</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  {section.links.map((link, j) => (
                    <motion.li 
                      key={j}
                      whileHover={{ x: 5 }}
                    >
                      <Link href={link.href} style={{ transition: 'color 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(76, 29, 149)'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}>
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
    </div>
            ))}
          </div>
          <div className="pt-8 border-t border-slate-100 text-center text-sm text-slate-500">
            © 2025 SACIMO. Tous droits réservés.
          </div>
        </div>
      </motion.footer>
        </div>
      </div>
    </>
  );
}
