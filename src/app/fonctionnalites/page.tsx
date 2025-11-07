'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, TrendingUp, MapPin, Bell, FileText, BarChart3, Users, Zap, Shield, Clock } from 'lucide-react';

export default function FonctionnalitesPage() {
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

      {/* Contenu */}
      <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: 'white' }}>
        {/* Hero */}
        <div style={{ padding: '120px 24px 80px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '64px', fontWeight: '300', marginBottom: '24px', lineHeight: '1.2' }}>
            Des outils puissants pour <span style={{ color: 'rgb(76, 29, 149)' }}>transformer</span> votre activité
          </h1>
          <p style={{ fontSize: '20px', color: '#64748b', marginBottom: '48px', fontWeight: '300' }}>
            Découvrez toutes les fonctionnalités de SACIMO pour analyser, surveiller et optimiser votre activité immobilière
          </p>
        </div>

        {/* Features Grid */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 120px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
            {[
              {
                icon: Search,
                title: 'Recherches intelligentes',
                description: 'Algorithmes avancés pour trouver les meilleures opportunités immobilières selon vos critères personnalisés.'
              },
              {
                icon: TrendingUp,
                title: 'Analyse de marché',
                description: 'Suivez les tendances du marché en temps réel et anticipez les évolutions de prix dans votre secteur.'
              },
              {
                icon: Users,
                title: 'Suivi des concurrents',
                description: 'Surveillez l\'activité de vos concurrents : nouvelles annonces, prix, stratégies commerciales.'
              },
              {
                icon: FileText,
                title: 'Rapports automatisés',
                description: 'Générez des rapports professionnels détaillés en quelques clics avec votre branding.'
              },
              {
                icon: Bell,
                title: 'Alertes intelligentes',
                description: 'Recevez des notifications instantanées pour les opportunités qui correspondent à vos critères.'
              },
              {
                icon: BarChart3,
                title: 'Copilote IA',
                description: 'Assistant intelligent qui analyse vos données et vous aide à prendre les meilleures décisions.'
              },
              {
                icon: MapPin,
                title: 'Localisation & estimation',
                description: 'Estimations précises des biens immobiliers avec analyse géographique détaillée.'
              },
              {
                icon: Zap,
                title: 'Automatisation',
                description: 'Automatisez vos tâches répétitives et gagnez un temps précieux au quotidien.'
              },
              {
                icon: Shield,
                title: 'Sécurité & conformité',
                description: 'Vos données sont protégées avec un cryptage de niveau bancaire et conformité RGPD.'
              }
            ].map((feature, i) => (
              <div key={i} style={{
                padding: '40px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                transition: 'all 0.3s'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, rgb(76, 29, 149), rgb(79, 70, 229))',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px'
                }}>
                  <feature.icon style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>{feature.title}</h3>
                <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.6', fontWeight: '300' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(to bottom right, rgb(46, 16, 101), rgb(76, 29, 149), rgb(79, 70, 229))', padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '48px', fontWeight: '300', color: 'white', marginBottom: '24px' }}>
            Prêt à essayer SACIMO ?
          </h2>
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px', fontWeight: '300' }}>
            Commencez gratuitement dès aujourd'hui
          </p>
          <Link href="/auth/signup" style={{ 
            display: 'inline-block',
            padding: '16px 32px',
            backgroundColor: 'white',
            color: 'rgb(76, 29, 149)',
            borderRadius: '12px',
            fontWeight: '600',
            textDecoration: 'none',
            fontSize: '16px'
          }}>
            Essai gratuit 14 jours
          </Link>
        </div>
      </div>
    </>
  );
}

