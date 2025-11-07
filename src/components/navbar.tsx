'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '80px',
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
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
        {/* Logo */}
        <div style={{ flexShrink: 0 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: 'white'
            }}>S</div>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#7c3aed' }}>SACIMO</span>
          </Link>
        </div>

        {/* Menu centré */}
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '32px'
        }}>
          <Link 
            href="/fonctionnalites" 
            style={{ 
              color: pathname === '/fonctionnalites' ? '#7c3aed' : '#64748b',
              fontSize: '15px', 
              textDecoration: 'none',
              fontWeight: pathname === '/fonctionnalites' ? '600' : '400'
            }}
          >
            Fonctionnalités
          </Link>
          <Link 
            href="/tarifs" 
            style={{ 
              color: pathname === '/tarifs' ? '#7c3aed' : '#64748b',
              fontSize: '15px', 
              textDecoration: 'none',
              fontWeight: pathname === '/tarifs' ? '600' : '400'
            }}
          >
            Tarifs
          </Link>
          <Link 
            href="/contact" 
            style={{ 
              color: pathname === '/contact' ? '#7c3aed' : '#64748b',
              fontSize: '15px', 
              textDecoration: 'none',
              fontWeight: pathname === '/contact' ? '600' : '400'
            }}
          >
            Contact
          </Link>
          <Link 
            href="/ressources" 
            style={{ 
              color: pathname === '/ressources' ? '#7c3aed' : '#64748b',
              fontSize: '15px', 
              textDecoration: 'none',
              fontWeight: pathname === '/ressources' ? '600' : '400'
            }}
          >
            Ressources
          </Link>
          <Link 
            href="/about" 
            style={{ 
              color: pathname === '/about' ? '#7c3aed' : '#64748b',
              fontSize: '15px', 
              textDecoration: 'none',
              fontWeight: pathname === '/about' ? '600' : '400'
            }}
          >
            À propos
          </Link>
        </div>

        {/* Boutons */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
          <Link href="/auth/signin" style={{ padding: '10px 20px', color: '#64748b', textDecoration: 'none' }}>
            Se connecter
          </Link>
          <Link href="/auth/signup" style={{ 
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
            color: 'white',
            borderRadius: '12px',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'inline-block'
          }}>
            Essai gratuit
          </Link>
        </div>
      </div>
    </nav>
  );
}
