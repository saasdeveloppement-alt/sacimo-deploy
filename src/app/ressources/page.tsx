'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, FileText, HelpCircle, Video, Download } from 'lucide-react';

export default function RessourcesPage() {
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
            Ressources et <span style={{ color: 'rgb(76, 29, 149)' }}>documentation</span>
          </h1>
          <p style={{ fontSize: '20px', color: '#64748b', marginBottom: '48px', fontWeight: '300' }}>
            Guides, tutoriels et ressources pour tirer le meilleur parti de SACIMO
          </p>
        </div>

        {/* Resources Grid */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 120px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {[
              {
                icon: BookOpen,
                title: 'Guides pratiques',
                description: 'Apprenez à utiliser toutes les fonctionnalités de SACIMO avec nos guides détaillés.',
                link: '/ressources/guides'
              },
              {
                icon: FileText,
                title: 'Documentation',
                description: 'Documentation complète de l\'API et des fonctionnalités avancées.',
                link: '/ressources/docs'
              },
              {
                icon: HelpCircle,
                title: 'FAQ',
                description: 'Réponses aux questions les plus fréquentes sur SACIMO et son utilisation.',
                link: '/ressources/faq'
              },
              {
                icon: Video,
                title: 'Tutoriels vidéo',
                description: 'Vidéos explicatives pour maîtriser rapidement toutes les fonctionnalités.',
                link: '/ressources/videos'
              },
              {
                icon: Download,
                title: 'Ressources téléchargeables',
                description: 'Modèles de rapports, templates et ressources utiles à télécharger.',
                link: '/ressources/downloads'
              }
            ].map((resource, i) => (
              <Link key={i} href={resource.link} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '40px',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '16px',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
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
                    <resource.icon style={{ width: '28px', height: '28px', color: 'white' }} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#1e293b' }}>{resource.title}</h3>
                  <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.6', fontWeight: '300' }}>{resource.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

