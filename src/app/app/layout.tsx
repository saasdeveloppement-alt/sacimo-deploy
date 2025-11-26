"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import { DashboardSidebar } from "@/components/DashboardSidebar"
import { DashboardHeader } from "@/components/DashboardHeader"
import { Loader2 } from "lucide-react"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fermer le menu mobile si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && window.innerWidth < 1024) {
        const target = event.target as HTMLElement
        if (!target.closest('.sidebar') && !target.closest('[aria-label="Ouvrir le menu"]')) {
          setSidebarOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [sidebarOpen])

  // Rediriger vers la page de connexion si non authentifié (seulement après un délai pour éviter les redirections trop rapides)
  useEffect(() => {
    if (mounted && status === "unauthenticated") {
      // Attendre un peu pour éviter les redirections pendant le chargement initial
      const timer = setTimeout(() => {
        router.push("/auth/signin")
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [mounted, status, router])

  // Afficher un loader uniquement pendant le chargement initial très court (max 1 seconde)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          <div className="text-gray-600 text-sm">Chargement...</div>
        </div>
      </div>
    )
  }

  // Si pas de session, afficher quand même le layout (la redirection se fera en arrière-plan)
  // Cela évite l'écran grisé bloquant
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={session?.user}
      />

      <DashboardHeader user={session?.user} />

      {/* Main content */}
      <main className="flex-1 lg:ml-[280px] lg:pt-16">
        <div className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">{children}</div>
        </div>
      </main>
    </div>
  )
}
