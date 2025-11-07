'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check } from 'lucide-react';

export default function TarifsPage() {
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
        <div style={{ padding: '120px 24px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '64px', fontWeight: '300', marginBottom: '24px', lineHeight: '1.2' }}>
            Des tarifs <span style={{ color: 'rgb(76, 29, 149)' }}>transparents</span> et adaptés
          </h1>
          <p style={{ fontSize: '20px', color: '#64748b', fontWeight: '300' }}>
            Choisissez le plan qui correspond à vos besoins
          </p>
        </div>

        {/* Pricing cards */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 120px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            {[
              {
                name: 'Starter',
                price: '29',
                features: ['10 recherches/jour', '5 rapports/mois', 'Support email', '1 utilisateur']
              },
              {
                name: 'Pro',
                price: '99',
                popular: true,
                features: ['Recherches illimitées', 'Rapports illimités', 'Support prioritaire', '5 utilisateurs', 'API access']
              },
              {
                name: 'Enterprise',
                price: '299',
                features: ['Tout de Pro', 'White label', 'Account manager', 'Utilisateurs illimités', 'Formation sur-mesure']
              }
            ].map((plan, i) => (
              <div key={i} style={{
                padding: '48px',
                backgroundColor: 'white',
                border: plan.popular ? '2px solid rgb(76, 29, 149)' : '1px solid #e5e7eb',
                borderRadius: '16px',
                position: 'relative',
                boxShadow: plan.popular ? '0 20px 60px rgba(124, 58, 237, 0.15)' : 'none'
              }}>
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgb(76, 29, 149)',
                    color: 'white',
                    padding: '4px 16px',
                    borderRadius: '999px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>Le plus populaire</div>
                )}
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>{plan.name}</h3>
                <div style={{ marginBottom: '32px' }}>
                  <span style={{ fontSize: '48px', fontWeight: '700', color: 'rgb(76, 29, 149)' }}>{plan.price}€</span>
                  <span style={{ fontSize: '18px', color: '#64748b' }}>/mois</span>
                </div>
                <div style={{ marginBottom: '32px' }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '20px', height: '20px', backgroundColor: 'rgb(76, 29, 149)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>
                        <Check style={{ width: '12px', height: '12px' }} />
                      </div>
                      <span style={{ fontSize: '16px', color: '#64748b', fontWeight: '300' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/auth/signup" style={{ 
                  display: 'block',
                  textAlign: 'center',
                  padding: '16px',
                  backgroundColor: plan.popular ? 'rgb(76, 29, 149)' : 'white',
                  color: plan.popular ? 'white' : 'rgb(76, 29, 149)',
                  border: plan.popular ? 'none' : '2px solid rgb(76, 29, 149)',
                  borderRadius: '12px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.3s'
                }}>
                  Commencer
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Pricing */}
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 120px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '300', textAlign: 'center', marginBottom: '48px' }}>
            Questions fréquentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { q: 'Puis-je changer de plan à tout moment ?', a: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment depuis votre espace client.' },
              { q: 'Y a-t-il un engagement ?', a: 'Non, tous nos plans sont sans engagement. Vous pouvez annuler à tout moment.' },
              { q: 'Les prix incluent-ils la TVA ?', a: 'Oui, tous les prix affichés sont TTC pour les clients français.' }
            ].map((faq, i) => (
              <div key={i} style={{ padding: '24px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{faq.q}</h3>
                <p style={{ fontSize: '16px', color: '#64748b', fontWeight: '300' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

