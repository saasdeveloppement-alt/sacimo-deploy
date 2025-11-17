"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"

import { DashboardSidebar } from "@/components/DashboardSidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Attendre que la session soit chargée pour éviter les erreurs
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={session?.user}
      />

      {/* Navbar - commence APRÈS la sidebar */}
      <nav className="hidden lg:block fixed top-0 left-[260px] right-0 h-20 bg-gradient-to-r from-violet-950 via-violet-900 to-indigo-900 border-b border-white/10 z-50">
        <div className="h-full flex items-center justify-between px-8">
          {/* Menu */}
          <div className="flex items-center gap-8">
            <Link
              href="/fonctionnalites"
              className="text-[15px] font-normal text-white/70 transition-colors hover:text-white"
            >
              Fonctionnalités
            </Link>
            <Link
              href="/tarifs"
              className="text-[15px] font-normal text-white/70 transition-colors hover:text-white"
            >
              Tarifs
            </Link>
            <Link
              href="/contact"
              className="text-[15px] font-normal text-white/70 transition-colors hover:text-white"
            >
              Contact
            </Link>
            <Link
              href="/ressources"
              className="text-[15px] font-normal text-white/70 transition-colors hover:text-white"
            >
              Ressources
            </Link>
            <Link
              href="/about"
              className="text-[15px] font-normal text-white/70 transition-colors hover:text-white"
            >
              À propos
            </Link>
          </div>

          {/* Boutons */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/signin"
              className="px-4 py-2 text-[15px] font-normal text-white/80 transition-colors hover:text-white"
            >
              Connexion
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-xl bg-white px-5 py-2.5 text-[15px] font-medium text-violet-900 transition-all hover:bg-white/90"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 lg:ml-[260px] lg:pt-20">
        <div className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">{children}</div>
        </div>
      </main>
    </div>
  )
}

