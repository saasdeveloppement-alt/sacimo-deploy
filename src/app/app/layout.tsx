"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  Search, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  Home,
  Building2,
  MapPin,
  Target,
  Brain,
  CreditCard,
  MessageCircle
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/app/dashboard", icon: Home },
  { name: "Mes recherches", href: "/app/recherches", icon: Search },
  { name: "Piges", href: "/app/annonces", icon: Target },
  { name: "Suivi concurrents", href: "/app/concurrents", icon: Building2 },
  { name: "Localisation & estimation", href: "/app/localisation", icon: MapPin },
  { name: "Rapports", href: "/app/rapports", icon: BarChart3 },
  { name: "Notifications & alertes", href: "/app/notifications", icon: Bell },
  { name: "Copilote IA", href: "/app/copilote", icon: Brain },
  { name: "Paramètres", href: "/app/parametres", icon: Settings },
  { name: "Facturation", href: "/app/facturation", icon: CreditCard },
  { name: "Contact & Support", href: "/app/contact", icon: MessageCircle },
]

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-0 z-50 lg:hidden"
      >
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-violet-950 via-violet-900 to-indigo-950">
          <div className="flex-1 h-0 overflow-y-auto">
            {/* Logo - Header qui touche le haut */}
            <div className="h-16 flex items-center p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                {/* Logo */}
                <div className="w-11 h-11 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 shadow-lg shadow-black/20">
                  <span className="text-xl font-bold text-white">S</span>
                </div>
                
                {/* Nom + Slogan */}
                <div className="flex-1">
                  <div className="text-lg font-bold text-white tracking-tight">SACIMO</div>
                  <div className="text-xs text-white/50 font-medium">L'immobilier intelligent</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-white/15 text-white border border-white/20 backdrop-blur-sm shadow-lg shadow-black/10'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Footer Utilisateur */}
          <div className="flex-shrink-0 p-4 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-indigo-400 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">U</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-violet-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">Utilisateur</p>
                  <p className="text-xs text-white/50 truncate">user@sacimo.com</p>
                </div>
              </div>
              
              <Button 
                size="sm"
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                onClick={() => setSidebarOpen(false)}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-[260px] lg:flex-col lg:fixed lg:top-0 lg:bottom-0 lg:left-0 z-40">
        <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-violet-950 via-violet-900 to-indigo-950 overflow-y-auto">
          {/* Logo - Header qui touche le haut */}
          <div className="h-16 flex items-center p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="w-11 h-11 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 shadow-lg shadow-black/20">
                <span className="text-xl font-bold text-white">S</span>
              </div>
              
              {/* Nom + Slogan */}
              <div className="flex-1">
                <div className="text-lg font-bold text-white tracking-tight">SACIMO</div>
                <div className="text-xs text-white/50 font-medium">L'immobilier intelligent</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white/15 text-white border border-white/20 backdrop-blur-sm shadow-lg shadow-black/10'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  data-magnetic
                  data-cursor="Voir"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer Utilisateur */}
          <div className="flex-shrink-0 p-4 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-indigo-400 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">U</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-violet-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">Utilisateur</p>
                  <p className="text-xs text-white/50 truncate">user@sacimo.com</p>
                </div>
              </div>
              
              <Button 
                size="sm"
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar dashboard - style cohérent avec page d'accueil */}
      <nav className="hidden lg:block fixed top-0 left-[260px] right-0 h-20 bg-gradient-to-r from-violet-950 via-violet-900 to-indigo-900 border-b border-white/10 z-50">
        <div className="h-full flex items-center justify-between px-8">
          {/* Menu - même style que page d'accueil */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8">
            <Link 
              href="/#fonctionnalites" 
              className="text-[15px] text-white/70 hover:text-white transition-colors font-normal"
            >
              Fonctionnalités
            </Link>
            <Link 
              href="/#tarifs" 
              className="text-[15px] text-white/70 hover:text-white transition-colors font-normal"
            >
              Tarifs
            </Link>
            <Link 
              href="/contact" 
              className="text-[15px] text-white/70 hover:text-white transition-colors font-normal"
            >
              Contact
            </Link>
            <Link 
              href="/#ressources" 
              className="text-[15px] text-white/70 hover:text-white transition-colors font-normal"
            >
              Ressources
            </Link>
            <Link 
              href="/about" 
              className="text-[15px] text-white/70 hover:text-white transition-colors font-normal"
            >
              À propos
            </Link>
          </div>

          {/* Boutons CTA - même style */}
          <div className="flex items-center gap-3 ml-auto">
            <Link 
              href="/auth/signin"
              className="text-[15px] text-white/80 hover:text-white transition-colors font-normal px-4 py-2"
            >
              Connexion
            </Link>
            <Link 
              href="/auth/signup"
              className="bg-white text-violet-900 hover:bg-white/90 px-5 py-2.5 rounded-xl text-[15px] font-medium transition-all"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="lg:ml-[260px] lg:pt-20 flex-1">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
