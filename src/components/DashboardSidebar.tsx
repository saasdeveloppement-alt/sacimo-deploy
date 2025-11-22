'use client'

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import {
  Home,
  Target,
  Building2,
  MapPin,
  Calculator,
  BarChart3,
  Brain,
  Bell,
  Settings,
  CreditCard,
  MessageCircle,
  HelpCircle,
  LogOut,
  Search,
  Crown,
  Zap,
  Menu,
  X,
  Users,
  Gift,
} from "lucide-react"
import { SacimoLogo } from "./SacimoLogo"

// Navigation SACIMO organisée par sections
const pilotage = [
  { name: "Dashboard", href: "/app/dashboard", icon: Home },
  { name: "Annonces", href: "/app/annonces", icon: Target },
  { name: "Suivi concurrents", href: "/app/concurrents", icon: Building2 },
  { name: "Localisation", href: "/app/localisation", icon: MapPin },
]

const analyseIA = [
  { name: "Estimation", href: "/app/estimation", icon: Calculator },
  { name: "Rapports", href: "/app/rapports", icon: BarChart3 },
  { name: "Copilote IA", href: "/app/copilote", icon: Brain },
]

const compteCommunication = [
  { name: "Notifications", href: "/app/notifications", icon: Bell, badge: 3 },
  { name: "Paramètres", href: "/app/parametres", icon: Settings },
  { name: "Facturation", href: "/app/facturation", icon: CreditCard },
  { name: "Contact & Support", href: "/app/contact", icon: MessageCircle },
]

type DashboardSidebarProps = {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
}

export function DashboardSidebar({ sidebarOpen, setSidebarOpen, user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const userName = user?.name ?? "Utilisateur"
  const userEmail = user?.email ?? "utilisateur@sacimo.com"
  const userImage = user?.image ?? undefined

  const handleSignOut = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const callbackUrl = baseUrl ? `${baseUrl}/auth/signin` : "/auth/signin"
    signOut({ callbackUrl })
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* HEADER SIDEBAR */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
              <SacimoLogo size={40} />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-base">SACIMO</h1>
              <p className="text-xs text-gray-500">L'immobilier intelligent</p>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Rechercher"
            className="w-full pl-10 pr-16 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          <kbd className="absolute right-2 top-1/2 transform -translate-y-1/2 px-1.5 py-0.5 text-xs bg-white border border-gray-200 rounded text-gray-500 font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* PILOTAGE */}
      <div className="px-3 py-2">
        <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          PILOTAGE
        </p>

        <nav className="space-y-1">
          {pilotage.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg group transition-all ${
                  active
                    ? "bg-primary-600 text-white shadow-sm shadow-primary-600/20"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-5 h-5 ${active ? "text-white" : "text-gray-500"}`}
                    strokeWidth={1.5}
                  />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                    active
                      ? "bg-white/20 text-white"
                      : typeof item.badge === 'number' 
                      ? "bg-gray-100 text-gray-600"
                      : item.badgeColor === "blue"
                      ? "bg-blue-100 text-blue-600"
                      : item.badgeColor === "orange"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* ANALYSE & IA */}
      <div className="px-3 py-2 mt-4">
        <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          ANALYSE & IA
        </p>

        <nav className="space-y-1">
          {analyseIA.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg group transition-all ${
                  active
                    ? "bg-primary-600 text-white shadow-sm shadow-primary-600/20"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-5 h-5 ${active ? "text-white" : "text-gray-500"}`}
                    strokeWidth={1.5}
                  />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                    active
                      ? "bg-white/20 text-white"
                      : typeof item.badge === 'number' 
                      ? "bg-gray-100 text-gray-600"
                      : item.badgeColor === "blue"
                      ? "bg-blue-100 text-blue-600"
                      : item.badgeColor === "orange"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* COMPTE & COMMUNICATION */}
      <div className="px-3 py-2 mt-4">
        <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          COMPTE & COMMUNICATION
        </p>

        <nav className="space-y-1">
          {compteCommunication.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg group transition-all ${
                  active
                    ? "bg-primary-600 text-white shadow-sm shadow-primary-600/20"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-5 h-5 ${active ? "text-white" : "text-gray-500"}`}
                    strokeWidth={1.5}
                  />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                    active
                      ? "bg-white/20 text-white"
                      : typeof item.badge === 'number' 
                      ? "bg-gray-100 text-gray-600"
                      : item.badgeColor === "blue"
                      ? "bg-blue-100 text-blue-600"
                      : item.badgeColor === "orange"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-start px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg group transition-all"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
              <span className="font-medium text-sm">Déconnexion</span>
            </div>
          </button>
        </nav>
      </div>

      {/* PROGRAMME DE PARRAINAGE CARD */}
      <div className="px-4 py-3 mt-4">
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-4 shadow-lg relative overflow-hidden">
          {/* Cercle violet décoratif animé en haut à droite */}
          <motion.div
            className="absolute -top-8 -right-8 w-24 h-24 bg-white/20 rounded-full blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-2 right-2 w-16 h-16 bg-white/30 rounded-full"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Éléments décoratifs */}
          <div className="relative z-10">
            <h3 className="text-white font-semibold mb-1 text-sm mb-3">Programme de Parrainage</h3>
            <p className="text-white/80 text-xs mb-4">
              Invitez vos amis et gagnez des avantages exclusifs
            </p>

            <motion.button
              className="w-full bg-white font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2 shadow-md"
              style={{ color: '#5E3A9B' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users className="w-4 h-4" strokeWidth={1.5} style={{ color: '#5E3A9B' }} />
              Parrainer un ami
            </motion.button>

            <button className="w-full mt-2 text-white/80 text-xs hover:text-white transition-colors text-center">
              En savoir plus
            </button>
          </div>

          {/* Particules animées */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                initial={{
                  x: Math.random() * 100 + "%",
                  y: Math.random() * 100 + "%",
                  opacity: 0,
                }}
                animate={{
                  y: [null, (Math.random() - 0.5) * 50 + "%"],
                  x: [null, (Math.random() - 0.5) * 50 + "%"],
                  opacity: [0, 0.6, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: Math.random() * 2 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* USER PROFILE */}
      <div className="px-4 py-4 border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-3">
          <div className="relative">
            {userImage ? (
              <img
                src={userImage}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                alt={userName}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                onError={(e) => {
                  // Fallback si l'image ne charge pas
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const fallback = document.createElement('div')
                  fallback.className = 'w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-sm'
                  fallback.textContent = userName.charAt(0).toUpperCase()
                  target.parentNode?.appendChild(fallback)
                }}
              />
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full status-online"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* BOUTON MOBILE */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 inline-flex items-center justify-center rounded-xl bg-white border border-gray-200 p-2.5 text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {/* MOBILE SIDEBAR */}
      {sidebarOpen && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-50 lg:hidden"
        >
          {/* BACKDROP */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />

          {/* PANEL */}
          <div className="relative flex h-full w-[280px] flex-col bg-white border-r border-gray-200 shadow-xl overflow-hidden">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5 text-gray-600" strokeWidth={1.5} />
              </button>
            </div>
            <SidebarContent />
          </div>
        </motion.div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:fixed lg:bottom-0 lg:left-0 lg:top-0 lg:flex lg:w-[280px] lg:flex-col lg:overflow-y-auto lg:bg-white lg:border-r lg:border-gray-200 lg:shadow-sm sidebar">
        <SidebarContent />
      </aside>
    </>
  )
}
