'use client'

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Mail,
  Bell,
  Share2,
  Search,
} from "lucide-react"

type DashboardHeaderProps = {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Extraire le nom de la page actuelle depuis le pathname
  const getCurrentPage = () => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 1) {
      const page = segments[segments.length - 1]
      return page.charAt(0).toUpperCase() + page.slice(1)
    }
    return "Dashboard"
  }

  const userName = user?.name ?? "Utilisateur"
  const userImage = user?.image ?? undefined

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 fixed top-0 left-[280px] right-0 z-30">
      <div className="flex items-center justify-between h-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href="/app/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
          <span className="text-sm font-medium text-gray-900">{getCurrentPage()}</span>
        </div>

        {/* Actions à droite */}
        <div className="flex items-center gap-3">
          {/* Search Button (mobile) */}
          <button className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </button>

          {/* Bouton Help */}
          <button
            className="hidden lg:flex p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            title="Help"
          >
            <HelpCircle className="w-5 h-5" strokeWidth={1.5} />
          </button>

          {/* Bouton Email/Messages */}
          <button
            className="hidden lg:flex p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors relative"
            title="Messages"
          >
            <Mail className="w-5 h-5" strokeWidth={1.5} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Bouton Notifications */}
          <button
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" strokeWidth={1.5} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-600 rounded-full"></span>
          </button>

          {/* User Avatar avec dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {userImage ? (
                <img
                  src={userImage}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    // Fallback si l'image ne charge pas
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const fallback = target.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />
              )}
              <ChevronDown className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <Link
                  href="/app/parametres"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Paramètres
                </Link>
                <Link
                  href="/app/help"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Aide
                </Link>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    // Handle logout
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>

          {/* Bouton Share */}
          <button className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Share2 className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm font-medium">Partager</span>
          </button>
        </div>
      </div>
    </header>
  )
}



