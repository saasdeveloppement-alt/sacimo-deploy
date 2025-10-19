"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ReportsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirection automatique vers la page rapports modernisée
    router.replace("/app/rapports")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Redirection vers les rapports...</p>
      </div>
    </div>
  )
}