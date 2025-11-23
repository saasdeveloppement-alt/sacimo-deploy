"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Search, Loader2, AlertTriangle, ExternalLink, Sparkles, MapPin, Bell, Mail, TrendingUp, Heart, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from "recharts"
import type { NormalizedListing } from "@/lib/piges/normalize"
import OriginBadge from "@/components/piges/OriginBadge"

interface PigeFilters {
  city?: string
  postalCode?: string
  type?: "vente" | "location" | "all"
  types?: ("vente" | "location")[] // Pour gérer les cases à cocher
  sellerType?: "all" | "pro" | "particulier"
  minPrice?: number
  maxPrice?: number
  minSurface?: number
  maxSurface?: number
  minRooms?: number
  maxRooms?: number
  sources?: string[]
  dateFilter?: "24h" | "48h" | "7j" | "30j" | "all" // Filtre par date
}

// Animations
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const slideIn = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function AnnoncesPage() {
  const { data: session } = useSession()
  const [filters, setFilters] = useState<PigeFilters>({
    type: "all",
    types: [], // Pour les cases à cocher vente/location
    sellerType: "all",
    dateFilter: "all", // Par défaut, toutes les dates
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<NormalizedListing[]>([])
  const [meta, setMeta] = useState<{ total: number; pages: number; hasMore: boolean } | null>(null)
  const [selectedSources, setSelectedSources] = useState<string[]>([])

  const canSearch = !!(filters.postalCode && filters.postalCode.trim() !== "")

  // Filtrer les résultats côté client selon sellerType et dateFilter
  const filteredListings = results.filter((listing) => {
    // Filtre par type de vendeur
    if (filters.sellerType === "all" || !filters.sellerType) {
      // Pas de filtre sur le type de vendeur
    } else if (filters.sellerType === "pro") {
      // Uniquement les professionnels (isPro === true)
      if (listing.isPro !== true) return false
    } else if (filters.sellerType === "particulier") {
      // Uniquement les particuliers (isPro === false ou undefined)
      if (listing.isPro !== false && listing.isPro !== undefined) return false
    }

    // Filtre par date
    if (filters.dateFilter && filters.dateFilter !== "all" && listing.publishedAt) {
      const now = new Date()
      const publishedDate = new Date(listing.publishedAt)
      const diffHours = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60)
      
      switch (filters.dateFilter) {
        case "24h":
          if (diffHours > 24) return false
          break
        case "48h":
          if (diffHours > 48) return false
          break
        case "7j":
          if (diffHours > 168) return false // 7 jours = 168 heures
          break
        case "30j":
          if (diffHours > 720) return false // 30 jours = 720 heures
          break
      }
    }

    return true
  })

  function handleSourceToggle(src: string) {
    setSelectedSources(prev =>
      prev.includes(src)
        ? prev.filter(s => s !== src)
        : [...prev, src]
    )
  }

  function handleTypeToggle(type: "vente" | "location") {
    const currentTypes = filters.types || []
    if (currentTypes.includes(type)) {
      // Désactiver le type
      const newTypes = currentTypes.filter(t => t !== type)
      setFilters({ 
        ...filters, 
        types: newTypes,
        type: newTypes.length === 0 ? "all" : (newTypes.length === 1 ? newTypes[0] : "all")
      })
    } else {
      // Activer le type
      const newTypes = [...currentTypes, type]
      setFilters({ 
        ...filters, 
        types: newTypes,
        type: newTypes.length === 1 ? newTypes[0] : "all"
      })
    }
  }

  function handleSellerTypeToggle(type: "pro" | "particulier") {
    // Si on clique sur le type déjà sélectionné, on le désactive (retour à "all")
    if (filters.sellerType === type) {
      setFilters({ ...filters, sellerType: "all" })
    } else {
      // Sinon, on active le type sélectionné
      setFilters({ ...filters, sellerType: type })
    }
  }

  const handleSearch = async () => {
    const userId = (session?.user as { id?: string })?.id
    
    console.log("🔍 [Annonces] handleSearch appelé", { canSearch, userId, filters, selectedSources })
    
    if (!canSearch) {
      console.warn("⚠️ [Annonces] Recherche impossible: canSearch = false", { postalCode: filters.postalCode })
      setError("Veuillez renseigner un code postal pour lancer la recherche")
          return
        }

    if (!userId) {
      console.warn("⚠️ [Annonces] Recherche impossible: userId manquant")
      setError("Vous devez être connecté pour effectuer une recherche")
          return
        }

    setLoading(true)
    setError(null)
    setResults([])
    setMeta(null)

    try {
      const cleanFilters: PigeFilters = {}
      if (filters.city) cleanFilters.city = filters.city
      if (filters.postalCode) cleanFilters.postalCode = filters.postalCode
      // Gérer les types (cases à cocher)
      if (filters.types && filters.types.length > 0) {
        if (filters.types.length === 1) {
          cleanFilters.type = filters.types[0]
        } else if (filters.types.length === 2) {
          // Si les deux sont sélectionnés, on envoie "all" ou on ne filtre pas
          // cleanFilters.type reste undefined pour afficher tous les types
        }
      } else if (filters.type && filters.type !== "all") {
        cleanFilters.type = filters.type as "vente" | "location"
      }
      if (filters.sellerType && filters.sellerType !== "all") {
        cleanFilters.sellerType = filters.sellerType as "pro" | "particulier"
      }
      if (filters.minPrice) cleanFilters.minPrice = Number(filters.minPrice)
      if (filters.maxPrice) cleanFilters.maxPrice = Number(filters.maxPrice)
      if (filters.minSurface) cleanFilters.minSurface = Number(filters.minSurface)
      if (filters.maxSurface) cleanFilters.maxSurface = Number(filters.maxSurface)
      if (filters.minRooms) cleanFilters.minRooms = Number(filters.minRooms)
      if (filters.maxRooms) cleanFilters.maxRooms = Number(filters.maxRooms)
      if (selectedSources.length > 0) {
        cleanFilters.sources = selectedSources
      }

      console.log("📤 [Annonces] Envoi requête à /api/piges/fetch", { filters: cleanFilters })

      const response = await fetch("/api/piges/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filters: cleanFilters,
        }),
      })

      console.log("📥 [Annonces] Réponse reçue", { status: response.status, ok: response.ok })

      const data = await response.json()
      
      console.log("📊 [Annonces] Données reçues", { status: data.status, dataLength: data.data?.length, meta: data.meta })

      if (!response.ok) {
        console.error("❌ [Annonces] Erreur API", { status: response.status, data })
        if (data.message?.includes("limite") || data.message?.includes("quota")) {
          setError("quota_exceeded")
        } else if (data.message?.includes("trop large")) {
          setError("too_large")
        } else {
          setError(data.message || "Erreur lors de la recherche")
        }
        return
      }

      if (data.status === "ok") {
        console.log("✅ [Annonces] Recherche réussie", { total: data.meta?.total, results: data.data?.length })
        setResults(data.data || [])
        setMeta(data.meta || { total: data.data?.length || 0, pages: 1, hasMore: false })
        } else {
        console.error("❌ [Annonces] Statut non-ok", { status: data.status, message: data.message })
        setError(data.message || "Erreur lors de la recherche")
      }
    } catch (err: any) {
      console.error("❌ [Annonces] Erreur recherche:", err)
      setError(err.message || "Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number | null) => {
    if (!price) return "Prix non communiqué"
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "Date inconnue"
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const isRecent = (date: Date | null) => {
    if (!date) return false
    const now = new Date()
    const published = new Date(date)
    const diffHours = (now.getTime() - published.getTime()) / (1000 * 60 * 60)
    return diffHours < 24
  }

  // Mock data for charts (à remplacer par des vraies données)
  const priceEvolutionData = [
    { month: "Juin", price: 10200 },
    { month: "Juillet", price: 10450 },
    { month: "Août", price: 10350 },
    { month: "Sept", price: 10600 },
    { month: "Oct", price: 10800 },
    { month: "Nov", price: 11000 },
  ]

  const propertyTypesData = [
    { name: "Appartements", value: 45, color: "#7C5CDB" },
    { name: "Maisons", value: 30, color: "#5E3A9B" },
    { name: "Studios", value: 15, color: "#A590F0" },
    { name: "Autres", value: 10, color: "#8B72E7" },
  ]

  const activityData = [
    { day: "Lun", searches: 35 },
    { day: "Mar", searches: 42 },
    { day: "Mer", searches: 38 },
    { day: "Jeu", searches: 50 },
    { day: "Ven", searches: 45 },
    { day: "Sam", searches: 28 },
    { day: "Dim", searches: 20 },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Floating orbs background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">
                Annonces immobilières
              </h1>
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <span>Recherche en temps réel via MoteurImmo</span>
                <span className="text-gray-300">—</span>
                <span className="flex items-center space-x-1">
                  <motion.span
                    className="w-2 h-2 bg-green-400 rounded-full"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span>Pige IA instantanée</span>
                </span>
              </div>
            </div>
            <Badge className="px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100 rounded-full border border-primary-200">
              <Sparkles className="w-4 h-4 text-primary-600 mr-2" strokeWidth={1.5} />
              <span className="text-sm font-medium text-primary-700">Powered by Moteurimmo</span>
                </Badge>
              </div>
            </motion.div>

        {/* Filters Horizontal */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* City */}
                <div>
                  <Label htmlFor="city" className="block text-xs font-semibold text-gray-700 mb-2">
                    Ville
                  </Label>
                  <div className="relative">
                    <Input
                      id="city"
                      placeholder="Paris"
                      value={filters.city || ""}
                      onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm"
                    />
                    <MapPin className="absolute right-2 top-2.5 w-4 h-4 text-gray-400" strokeWidth={1.5} />
                  </div>
                </div>
                
                {/* Postal Code */}
                <div>
                  <Label htmlFor="postalCode" className="block text-xs font-semibold text-gray-700 mb-2">
                    Code postal
                  </Label>
                  <Input
                    id="postalCode"
                    placeholder="75001"
                    value={filters.postalCode || ""}
                    onChange={(e) => setFilters({ ...filters, postalCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm"
                  />
                </div>

                {/* Type */}
                <div>
                  <Label className="block text-xs font-semibold text-gray-700 mb-2">
                    Type
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      type="button"
                      onClick={() => handleTypeToggle("vente")}
                      className={`px-4 py-2.5 rounded-lg border-2 transition-all duration-300 text-sm font-medium ${
                        filters.types?.includes("vente")
                          ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white border-primary-600 shadow-lg"
                          : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${filters.types?.includes("vente") ? "bg-white" : "bg-gray-400"}`} style={{ minWidth: '10px', minHeight: '10px' }}></div>
                        <span>Vente</span>
                      </div>
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => handleTypeToggle("location")}
                      className={`px-4 py-2.5 rounded-lg border-2 transition-all duration-300 text-sm font-medium ${
                        filters.types?.includes("location")
                          ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white border-primary-600 shadow-lg"
                          : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${filters.types?.includes("location") ? "bg-white" : "bg-gray-400"}`} style={{ minWidth: '10px', minHeight: '10px' }}></div>
                        <span>Location</span>
                      </div>
                    </motion.button>
                  </div>
                  {(!filters.types || filters.types.length === 0) && (
                    <p className="text-xs text-gray-500 mt-2 text-center">Tous les types</p>
                  )}
                </div>
                
                {/* Seller Type */}
                <div>
                  <Label className="block text-xs font-semibold text-gray-700 mb-2">
                    Type de vendeur
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      type="button"
                      onClick={() => handleSellerTypeToggle("pro")}
                      className={`px-4 py-2.5 rounded-lg border-2 transition-all duration-300 text-sm font-medium ${
                        filters.sellerType === "pro"
                          ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white border-primary-600 shadow-lg"
                          : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${filters.sellerType === "pro" ? "bg-white" : "bg-gray-400"}`} style={{ minWidth: '10px', minHeight: '10px' }}></div>
                        <span>Professionnel</span>
                      </div>
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => handleSellerTypeToggle("particulier")}
                      className={`px-4 py-2.5 rounded-lg border-2 transition-all duration-300 text-sm font-medium ${
                        filters.sellerType === "particulier"
                          ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white border-primary-600 shadow-lg"
                          : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${filters.sellerType === "particulier" ? "bg-white" : "bg-gray-400"}`} style={{ minWidth: '10px', minHeight: '10px' }}></div>
                        <span>Particulier</span>
                      </div>
                    </motion.button>
                  </div>
                  {(!filters.sellerType || filters.sellerType === "all") && (
                    <p className="text-xs text-gray-500 mt-2 text-center">Tous les vendeurs</p>
                  )}
                </div>
              </div>
              
              {/* Additional Filters (Collapsible) */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Surface */}
                  <div>
                    <Label className="block text-xs font-semibold text-gray-700 mb-2">Surface (m²)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minSurface || ""}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            minSurface: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxSurface || ""}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            maxSurface: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm"
                      />
                </div>
              </div>

                  {/* Price Range */}
                  <div>
                    <Label className="block text-xs font-semibold text-gray-700 mb-2">Prix</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice || ""}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            minPrice: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice || ""}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            maxPrice: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm"
                      />
                    </div>
                  </div>

                  {/* Rooms */}
                  <div>
                    <Label className="block text-xs font-semibold text-gray-700 mb-2">Pièces</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minRooms || ""}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            minRooms: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxRooms || ""}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            maxRooms: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Origin - Multi-column layout */}
                <div className="mt-4">
                  <Label className="block text-xs font-semibold text-gray-700 mb-2">Origine des annonces</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {[
                      { id: "leboncoin", label: "Leboncoin", popular: true },
                      { id: "seloger", label: "SeLoger" },
                      { id: "bienici", label: "Bien'ici" },
                      { id: "pap", label: "PAP" },
                      { id: "logicimmo", label: "Logic-Immo" },
                    ].map((src) => (
                      <motion.label
                        key={src.id}
                        className="flex items-center p-2 rounded-lg hover:bg-primary-50 transition-all cursor-pointer group border border-gray-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <input
                          type="checkbox"
                          value={src.id}
                          checked={selectedSources.includes(src.id)}
                          onChange={(e) => handleSourceToggle(e.target.value)}
                          className="w-4 h-4 rounded border-2 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 mr-2"
                        />
                        <span className="text-xs text-gray-700 group-hover:text-primary-700 transition-colors flex-1">
                          {src.label}
                        </span>
                        {src.popular && (
                          <span className="px-1.5 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full font-medium ml-1">
                            Popular
                          </span>
                        )}
                      </motion.label>
                    ))}
                  </div>
                </div>

                {/* Date Filter */}
                <div className="mt-4">
                  <Label className="block text-xs font-semibold text-gray-700 mb-2">Date de publication</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "all", label: "Toutes" },
                      { id: "24h", label: "24h" },
                      { id: "48h", label: "48h" },
                      { id: "7j", label: "7 jours" },
                      { id: "30j", label: "30 jours" },
                    ].map((option) => (
                      <motion.button
                        key={option.id}
                        type="button"
                        onClick={() => setFilters({ ...filters, dateFilter: option.id as "24h" | "48h" | "7j" | "30j" | "all" })}
                        className={`px-3 py-1.5 rounded-lg border-2 transition-all duration-300 text-xs font-medium ${
                          filters.dateFilter === option.id
                            ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white border-primary-600 shadow-lg"
                            : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Search Button - Full Width at Bottom */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full"
                  >
                    <Button 
                      onClick={handleSearch}
                      disabled={!canSearch || loading}
                      className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Recherche en cours...
                        </>
                      ) : (
                        <>
                          <Search className="w-5 h-5 mr-2" strokeWidth={1.5} />
                          Lancer la recherche
                        </>
                      )}
                    </Button>
            </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
          </motion.div>

        {/* Results Area - Grid 3 columns */}
        <div className="space-y-6">
          {/* Results count */}
          {meta && (
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                {meta.total} résultat{meta.total > 1 ? "s" : ""}
              </h2>
              {meta.total >= 140 && (
                <p className="text-sm text-amber-600 mt-1">
                  Limitée automatiquement pour protéger l'API
                </p>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && results.length === 0 && !meta && (
            <Card className="rounded-2xl border border-gray-200">
              <CardContent className="p-12 text-center">
                  <motion.div 
                  className="inline-block p-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl mb-6 relative overflow-hidden"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    backgroundSize: "200% 200%",
                    backgroundImage: "linear-gradient(-45deg, #F0EBFF, #E4D9FF, #F0EBFF)",
                  }}
                >
                  <Search className="w-24 h-24 text-primary-500 relative z-10" strokeWidth={1.5} />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-700 mb-3">Prêt à trouver ton bien idéal ?</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Configure tes critères de recherche et lance une recherche pour découvrir les meilleures annonces du marché.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="rounded-2xl border border-gray-200">
                  <CardContent className="p-0">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-4" />
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-4 w-1/3" />
                      </div>
                  </CardContent>
                </Card>
              ))}
                    </div>
          )}

          {/* Error */}
          {error && !loading && (
            <Card className="rounded-2xl border border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">Erreur de recherche</h3>
                    <p className="text-sm text-red-700">
                      {error === "quota_exceeded"
                        ? "Tu as atteint la limite de recherche pour cette heure. Réessaie plus tard."
                        : error === "too_large"
                          ? "Ta recherche est trop large. Réduis la zone (ville/CP) ou ajoute des filtres."
                          : error}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Grid */}
          {!loading && !error && filteredListings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing, index) => (
                        <motion.div 
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full flex flex-col">
                    {/* Image */}
                    {listing.images && listing.images.length > 0 ? (
                      <div className="relative w-full h-48 flex-shrink-0">
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        {isRecent(listing.publishedAt) && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-green-100 text-green-700 text-xs">Nouveau</Badge>
                      </div>
                        )}
                        {listing.origin && (
                          <div className="absolute top-2 left-2">
                            <OriginBadge origin={listing.origin} />
                    </div>
                        )}
              </div>
                    ) : (
                      <div className="relative w-full h-48 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <div className="text-center p-4">
                          <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-gray-500" strokeWidth={1.5} />
                          </div>
                          <p className="text-xs text-gray-500">Aucune image</p>
                        </div>
                        {isRecent(listing.publishedAt) && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-green-100 text-green-700 text-xs">Nouveau</Badge>
                          </div>
                        )}
                        {listing.origin && (
                          <div className="absolute top-2 left-2">
                            <OriginBadge origin={listing.origin} />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Content */}
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2 flex-wrap">
                        <span className="font-semibold text-gray-900">
                          {formatPrice(listing.price)}
                        </span>
                        {listing.surface && <span>{listing.surface} m²</span>}
                        {listing.rooms && (
                          <span>{listing.rooms} pièce{listing.rooms > 1 ? "s" : ""}</span>
                        )}
                        {/* Badge Pro/Particulier - toujours affiché */}
                        <Badge 
                          className="text-xs px-1.5 py-0.5 font-medium bg-gradient-to-r from-primary-600 to-primary-700 text-white border-primary-600 shadow-sm"
                        >
                          {(listing.isPro ?? false) ? "Pro" : "Part."}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                        <MapPin className="h-3 w-3" strokeWidth={1.5} />
                        <span className="line-clamp-1">
                          {listing.city}
                          {listing.postalCode && ` (${listing.postalCode})`}
                        </span>
                      </div>
                      
                      {listing.description && (
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2 flex-1">
                          {listing.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-auto">
                        <span className="text-xs text-gray-500">
                          {formatDate(listing.publishedAt)}
                        </span>
                      <Button 
                          variant="outline"
                          size="sm"
                          asChild
                          className="border-gray-300 hover:border-primary-500 hover:text-primary-700 text-xs h-7"
                        >
                          <a
                            href={listing.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            Voir
                            <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                          </a>
                  </Button>
                  </div>
                    </CardContent>
                  </Card>
          </motion.div>
              ))}
        </div>
          )}

          {/* Aucun résultat */}
          {!loading && !error && filteredListings.length === 0 && (results.length === 0 || meta) && (
            <Card className="rounded-2xl border border-gray-200">
              <CardContent className="p-12 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune annonce trouvée
                </h3>
                <p className="text-sm text-gray-600">
                  Aucune annonce ne correspond à tes critères de recherche.
                </p>
              </CardContent>
            </Card>
          )}
            </div>
          </div>
        </div>
  )
}
