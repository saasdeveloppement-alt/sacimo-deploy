'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
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
        <div style={{ padding: '120px 24px', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '64px', fontWeight: '300', marginBottom: '24px', textAlign: 'center', lineHeight: '1.2' }}>
            Contactez-nous
          </h1>
          <p style={{ fontSize: '20px', color: '#64748b', textAlign: 'center', marginBottom: '64px', fontWeight: '300' }}>
            Une question ? Notre équipe vous répond sous 24h
          </p>

          {/* Contact Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '64px' }}>
            <div style={{ textAlign: 'center', padding: '32px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
              <Mail style={{ width: '32px', height: '32px', color: 'rgb(76, 29, 149)', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Email</h3>
              <a href="mailto:contact@sacimo.fr" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>contact@sacimo.fr</a>
                    </div>
            <div style={{ textAlign: 'center', padding: '32px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
              <Phone style={{ width: '32px', height: '32px', color: 'rgb(76, 29, 149)', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Téléphone</h3>
              <a href="tel:+33123456789" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>+33 1 23 45 67 89</a>
                  </div>
            <div style={{ textAlign: 'center', padding: '32px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
              <MapPin style={{ width: '32px', height: '32px', color: 'rgb(76, 29, 149)', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Adresse</h3>
              <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '300' }}>Paris, France</p>
                    </div>
                  </div>

          {/* Form */}
          <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '48px' }}>
            <form>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Nom complet</label>
                <input type="text" style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Email</label>
                <input type="email" style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Message</label>
                <textarea rows={6} style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', fontFamily: 'inherit' }}></textarea>
              </div>
              <button type="submit" style={{ 
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, rgb(76, 29, 149), rgb(79, 70, 229))',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                Envoyer le message
              </button>
            </form>
          </div>
        </div>
    </div>
    </>
  );
}

