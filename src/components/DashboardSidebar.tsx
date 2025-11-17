'use client'

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  BarChart3,
  Bell,
  Brain,
  Building2,
  Calculator,
  CreditCard,
  Home,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Settings,
  Target,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/app/dashboard", icon: Home },
  { name: "Piges", href: "/app/annonces", icon: Target },
  { name: "Suivi concurrents", href: "/app/concurrents", icon: Building2 },
  { name: "Localisation", href: "/app/localisation", icon: MapPin },
  { name: "Estimation", href: "/app/estimation", icon: Calculator },
  { name: "Rapports", href: "/app/rapports", icon: BarChart3 },
  { name: "Copilote IA", href: "/app/copilote", icon: Brain },
  { name: "Notifications", href: "/app/notifications", icon: Bell },
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
  const userEmail = user?.email ?? "user@sacimo.com"
  const userInitial = (user?.name ?? user?.email ?? "U").charAt(0).toUpperCase()
  const userImage = user?.image ?? undefined

  const handleSignOut = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const callbackUrl = baseUrl ? `${baseUrl}/auth/signin` : "/auth/signin"
    signOut({ callbackUrl })
  }

  return (
    <>
      {/* BOUTON MOBILE */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 inline-flex items-center justify-center rounded-xl border border-white/20 bg-gradient-to-r from-violet-600 to-indigo-600 p-2 text-white shadow-lg transition hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-white/60 lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* MOBILE SIDEBAR */}
      {sidebarOpen && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-50 lg:hidden"
        >
          {/* BACKDROP */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />

          {/* PANEL */}
          <div className="relative flex h-full max-w-xs flex-col bg-gradient-to-b from-violet-950 via-violet-900 to-indigo-950">
            <div className="flex-1 overflow-y-auto">
              <div className="flex h-16 items-center p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm shadow-lg shadow-black/20">
                    <span className="text-xl font-bold text-white">S</span>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white tracking-tight">SACIMO</div>
                    <div className="text-xs font-medium text-white/50">L'immobilier intelligent</div>
                  </div>
                </div>
              </div>

              <nav className="space-y-1 p-4">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                        isActive
                          ? "border border-white/20 bg-white/15 text-white backdrop-blur-sm shadow-lg shadow-black/10"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* USER CARD (mobile) */}
            <div className="p-4 border-t border-white/10">
              <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="relative">
                    {userImage ? (
                      <img
                        src={userImage}
                        alt={userName}
                        className="h-10 w-10 rounded-full border-2 border-white/30 object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-400 text-sm font-bold text-white">
                        {userInitial}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-violet-900 bg-green-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{userName}</p>
                    <p className="truncate text-xs text-white/50">{userEmail}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSidebarOpen(false)
                    handleSignOut()
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:fixed lg:bottom-0 lg:left-0 lg:top-0 lg:flex lg:w-[260px] lg:flex-col lg:overflow-y-auto lg:bg-gradient-to-b lg:from-violet-950 lg:via-violet-900 lg:to-indigo-950 lg:pb-6 lg:pt-6 lg:text-white">
        <div className="flex flex-1 flex-col">
          <div className="flex h-16 items-center px-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm shadow-lg shadow-black/20">
                <span className="text-xl font-bold text-white">S</span>
              </div>
              <div>
                <div className="text-lg font-bold text-white tracking-tight">SACIMO</div>
                <div className="text-xs font-medium text-white/50">L'immobilier intelligent</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                    isActive
                      ? "border border-white/20 bg-white/15 text-white backdrop-blur-sm shadow-lg shadow-black/10"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
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

          {/* USER CARD (desktop) */}
          <div className="px-4">
            <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="relative">
                  {userImage ? (
                    <img
                      src={userImage}
                      alt={userName}
                      className="h-10 w-10 rounded-full border-2 border-white/30 object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-400 text-sm font-bold text-white">
                      {userInitial}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-violet-900 bg-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{userName}</p>
                  <p className="truncate text-xs text-white/50">{userEmail}</p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
