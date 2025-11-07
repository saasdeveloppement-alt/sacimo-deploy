'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Target, Heart, Award } from 'lucide-react';

export default function AboutPage() {
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
            À propos de <span style={{ color: 'rgb(76, 29, 149)' }}>SACIMO</span>
          </h1>
          <p style={{ fontSize: '20px', color: '#64748b', marginBottom: '48px', fontWeight: '300' }}>
            Nous transformons la façon dont les professionnels de l'immobilier travaillent
          </p>
        </div>

        {/* Story */}
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 80px' }}>
          <div style={{ marginBottom: '64px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '300', marginBottom: '24px' }}>Notre histoire</h2>
            <p style={{ fontSize: '18px', color: '#64748b', lineHeight: '1.8', marginBottom: '16px', fontWeight: '300' }}>
              SACIMO est né d'une constatation simple : les agents immobiliers passent trop de temps à surveiller manuellement les nouvelles annonces et à analyser le marché, au détriment de leur cœur de métier.
            </p>
            <p style={{ fontSize: '18px', color: '#64748b', lineHeight: '1.8', fontWeight: '300' }}>
              Nous avons créé une plateforme intelligente qui automatise la veille immobilière, l'analyse de marché et la génération de rapports, permettant aux professionnels de se concentrer sur ce qui compte vraiment : leurs clients.
            </p>
          </div>

          {/* Values */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px', marginBottom: '80px' }}>
            {[
              {
                icon: Target,
                title: 'Notre mission',
                description: 'Révolutionner l\'immobilier grâce à l\'intelligence artificielle et l\'automatisation.'
              },
              {
                icon: Heart,
                title: 'Nos valeurs',
                description: 'Transparence, innovation et engagement envers l\'excellence du service client.'
              },
              {
                icon: Award,
                title: 'Notre vision',
                description: 'Devenir la référence en matière de solutions intelligentes pour l\'immobilier.'
              }
            ].map((value, i) => (
              <div key={i} style={{
                padding: '32px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, rgb(76, 29, 149), rgb(79, 70, 229))',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <value.icon style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>{value.title}</h3>
                <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.6', fontWeight: '300' }}>{value.description}</p>
              </div>
            ))}
          </div>

          {/* Team */}
          <div style={{ marginBottom: '64px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '300', marginBottom: '32px', textAlign: 'center' }}>L'équipe</h2>
            <p style={{ fontSize: '18px', color: '#64748b', lineHeight: '1.8', textAlign: 'center', fontWeight: '300' }}>
              Une équipe passionnée d'experts en immobilier, technologie et intelligence artificielle, dédiée à votre succès.
            </p>
          </div>

          {/* CTA */}
          <div style={{ background: 'linear-gradient(to bottom right, rgb(46, 16, 101), rgb(76, 29, 149), rgb(79, 70, 229))', padding: '64px 32px', borderRadius: '16px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '300', color: 'white', marginBottom: '16px' }}>
              Rejoignez-nous
            </h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px', fontWeight: '300' }}>
              Vous cherchez à rejoindre une équipe innovante ? Consultez nos offres d'emploi.
            </p>
            <Link href="/careers" style={{ 
              display: 'inline-block',
              padding: '16px 32px',
              backgroundColor: 'white',
              color: 'rgb(76, 29, 149)',
              borderRadius: '12px',
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: '16px'
            }}>
              Voir les postes
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

