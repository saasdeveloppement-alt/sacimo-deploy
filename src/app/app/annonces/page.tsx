"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Search, Loader2, AlertTriangle, ExternalLink, Sparkles, MapPin, Bell, Mail, Share2, TrendingUp, Heart, Zap } from "lucide-react"
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
  minPrice?: number
  maxPrice?: number
  minSurface?: number
  maxSurface?: number
  minRooms?: number
  maxRooms?: number
  sources?: string[]
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
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<NormalizedListing[]>([])
  const [meta, setMeta] = useState<{ total: number; pages: number; hasMore: boolean } | null>(null)
  const [selectedSources, setSelectedSources] = useState<string[]>([])

  const canSearch = !!(filters.postalCode && filters.postalCode.trim() !== "")

  function handleSourceToggle(src: string) {
    setSelectedSources(prev =>
      prev.includes(src)
        ? prev.filter(s => s !== src)
        : [...prev, src]
    )
  }

  const handleSearch = async () => {
    const userId = (session?.user as { id?: string })?.id
    if (!canSearch || !userId) return

    setLoading(true)
    setError(null)
    setResults([])
    setMeta(null)

    try {
      const cleanFilters: PigeFilters = {}
      if (filters.city) cleanFilters.city = filters.city
      if (filters.postalCode) cleanFilters.postalCode = filters.postalCode
      if (filters.type && filters.type !== "all") {
        cleanFilters.type = filters.type as "vente" | "location"
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

      const response = await fetch("/api/piges/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filters: cleanFilters,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
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
        setResults(data.data || [])
        setMeta(data.meta || { total: data.data?.length || 0, pages: 1, hasMore: false })
      } else {
        setError(data.message || "Erreur lors de la recherche")
      }
    } catch (err: any) {
      console.error("Erreur recherche Annonces:", err)
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial="initial"
              animate="animate"
              variants={slideIn}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl">
                      <Search className="w-6 h-6 text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                        Filtres de recherche
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500 mt-1">
                        Configure ta recherche immobilière
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* City Input */}
                  <div>
                    <Label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                      Ville
                    </Label>
                    <div className="relative">
                      <Input
                        id="city"
                        placeholder="Ex: Paris"
                        value={filters.city || ""}
                        onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all duration-300 hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                      />
                      <MapPin className="absolute right-3 top-3 w-5 h-5 text-gray-400" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Postal Code */}
                  <div>
                    <Label htmlFor="postalCode" className="block text-sm font-semibold text-gray-700 mb-2">
                      Code postal
                    </Label>
                    <Input
                      id="postalCode"
                      placeholder="75001"
                      value={filters.postalCode || ""}
                      onChange={(e) => setFilters({ ...filters, postalCode: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all duration-300 hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                    />
                    {!canSearch && (
                      <p className="text-xs text-amber-500 mt-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" strokeWidth={1.5} />
                        Veuillez entrer un code postal.
                      </p>
                    )}
                  </div>

                  {/* Type */}
                  <div>
                    <Label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
                      Type
                    </Label>
                    <Select
                      value={filters.type || "all"}
                      onValueChange={(value) =>
                        setFilters({ ...filters, type: value as "vente" | "location" | "all" })
                      }
                    >
                      <SelectTrigger id="type" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all duration-300 hover:border-primary-300">
                        <SelectValue placeholder="Tous" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="vente">Vente</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Origin */}
                  <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-3">
                      Origine des annonces
                    </Label>
                    <div className="space-y-3">
                      {[
                        { id: "leboncoin", label: "Leboncoin", popular: true },
                        { id: "seloger", label: "SeLoger" },
                        { id: "bienici", label: "Bien'ici" },
                        { id: "pap", label: "PAP" },
                        { id: "logicimmo", label: "Logic-Immo" },
                      ].map((src) => (
                        <motion.label
                          key={src.id}
                          className="flex items-center p-3 rounded-xl hover:bg-primary-50 transition-all cursor-pointer group"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <input
                            type="checkbox"
                            value={src.id}
                            checked={selectedSources.includes(src.id)}
                            onChange={(e) => handleSourceToggle(e.target.value)}
                            className="w-5 h-5 rounded border-2 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                          />
                          <span className="ml-3 text-gray-700 group-hover:text-primary-700 transition-colors flex-1">
                            {src.label}
                          </span>
                          {src.popular && (
                            <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full font-medium">
                              Popular
                            </span>
                          )}
                        </motion.label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-3">Prix</Label>
                    <div className="grid grid-cols-2 gap-3">
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
                        className="px-4 py-3 rounded-xl border-2 border-gray-200 transition-all duration-300 hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
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
                        className="px-4 py-3 rounded-xl border-2 border-gray-200 transition-all duration-300 hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                      />
                    </div>
                  </div>

                  {/* Surface */}
                  <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-3">Surface (m²)</Label>
                    <div className="grid grid-cols-2 gap-3">
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
                        className="px-4 py-3 rounded-xl border-2 border-gray-200 transition-all duration-300 hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
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
                        className="px-4 py-3 rounded-xl border-2 border-gray-200 transition-all duration-300 hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                      />
                    </div>
                  </div>

                  {/* Rooms */}
                  <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-3">Pièces</Label>
                    <div className="grid grid-cols-2 gap-3">
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
                        className="px-4 py-3 rounded-xl border-2 border-gray-200 transition-all duration-300 hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
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
                        className="px-4 py-3 rounded-xl border-2 border-gray-200 transition-all duration-300 hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                      />
                    </div>
                  </div>

                  {/* Search Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleSearch}
                      disabled={!canSearch || loading}
                      className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Card */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">
                        Annonces immobilières
                      </CardTitle>
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
                </CardHeader>
                <CardContent>
                  {/* Empty State */}
                  {!loading && !error && results.length === 0 && !meta && (
                    <div className="text-center py-12">
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
                      <div className="flex items-center justify-center space-x-4">
                        <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                          <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                          <span className="text-sm text-gray-600">Multi-sources</span>
                        </div>
                        <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Temps réel</span>
                        </div>
                        <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                          <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                          <span className="text-sm text-gray-600">IA intégrée</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Loading skeletons */}
                  {loading && (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Card key={i} className="rounded-2xl border border-gray-200">
                          <CardContent className="p-6">
                            <Skeleton className="h-6 w-3/4 mb-4" />
                            <Skeleton className="h-4 w-1/2 mb-2" />
                            <Skeleton className="h-4 w-1/3" />
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

                  {/* Results count */}
                  {meta && (
                    <div className="mb-6">
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

                  {/* Results */}
                  {!loading && !error && results.length > 0 && (
                    <div className="space-y-4">
                      {results.map((listing, index) => (
                        <motion.div
                          key={listing.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {listing.title}
                                  </h3>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                    <span className="font-semibold text-gray-900">
                                      {formatPrice(listing.price)}
                                    </span>
                                    {listing.surface && <span>{listing.surface} m²</span>}
                                    {listing.rooms && (
                                      <span>{listing.rooms} pièce{listing.rooms > 1 ? "s" : ""}</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="h-4 w-4" strokeWidth={1.5} />
                                    <span>
                                      {listing.city}
                                      {listing.postalCode && ` (${listing.postalCode})`}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  {listing.origin && <OriginBadge origin={listing.origin} />}
                                  {isRecent(listing.publishedAt) && (
                                    <Badge className="bg-green-100 text-green-700">Nouveau</Badge>
                                  )}
                                </div>
                              </div>

                              {listing.description && (
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                  {listing.description}
                                </p>
                              )}

                              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <span className="text-xs text-gray-500">
                                  Publiée le {formatDate(listing.publishedAt)}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  className="border-gray-300 hover:border-primary-500 hover:text-primary-700"
                                >
                                  <a
                                    href={listing.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2"
                                  >
                                    Voir l'annonce
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
                  {!loading && !error && results.length === 0 && meta && (
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
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats Cards */}
            {meta && results.length > 0 && (
              <motion.div
                className="grid grid-cols-3 gap-4"
                initial="initial"
                animate="animate"
                variants={staggerChildren}
              >
                {[
                  { label: "Recherches", value: "247", change: "+12%", changeLabel: "vs hier", icon: Search, bgColor: "bg-primary-100", iconColor: "text-primary-600" },
                  { label: "Favoris", value: "38", change: "+5", changeLabel: "cette semaine", icon: Heart, bgColor: "bg-pink-100", iconColor: "text-pink-600" },
                  { label: "Alertes", value: "12", change: "Actives", changeLabel: "", icon: Bell, bgColor: "bg-blue-100", iconColor: "text-blue-600" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    variants={fadeInUp}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
                          <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                            <stat.icon className={`w-4 h-4 ${stat.iconColor}`} strokeWidth={1.5} />
                          </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-green-600 font-semibold">{stat.change}</span>
                          {stat.changeLabel && <span className="text-xs text-gray-400">{stat.changeLabel}</span>}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Analytics Charts */}
            {meta && results.length > 0 && (
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                initial="initial"
                animate="animate"
                variants={staggerChildren}
              >
                {/* Price Evolution Chart */}
                <motion.div variants={fadeInUp} transition={{ delay: 0.8 }}>
                  <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 shadow-lg rounded-3xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-bold text-gray-800">Évolution des prix</CardTitle>
                          <CardDescription className="text-sm text-gray-500">Derniers 6 mois</CardDescription>
                        </div>
                        <Badge className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                          Paris
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={priceEvolutionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                          <YAxis
                            stroke="#64748B"
                            fontSize={11}
                            tickFormatter={(value) => `${value / 1000}k`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #E2E8F0",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                            formatter={(value: number) => [`${value.toLocaleString()} €/m²`, "Prix moyen"]}
                          />
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke="#7C5CDB"
                            strokeWidth={3}
                            dot={{ fill: "#7C5CDB", r: 5 }}
                            activeDot={{ r: 7 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Property Types Chart */}
                <motion.div variants={fadeInUp} transition={{ delay: 0.9 }}>
                  <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 shadow-lg rounded-3xl">
                    <CardHeader>
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-800">Types de biens</CardTitle>
                        <CardDescription className="text-sm text-gray-500">Distribution actuelle</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={propertyTypesData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                            outerRadius={70}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {propertyTypesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #E2E8F0",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                            formatter={(value: number) => [`${value}%`, ""]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}

            {/* Activity Chart */}
            {meta && results.length > 0 && (
              <motion.div
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                transition={{ delay: 1 }}
              >
                <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 shadow-lg rounded-3xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-800">Activité de recherche</CardTitle>
                        <CardDescription className="text-sm text-gray-500">Nombre de recherches par jour</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="px-3 py-1 bg-primary-100 text-primary-700 border-primary-200">
                          7J
                        </Button>
                        <Button variant="outline" size="sm" className="px-3 py-1 text-gray-500 border-gray-200">
                          30J
                        </Button>
                        <Button variant="outline" size="sm" className="px-3 py-1 text-gray-500 border-gray-200">
                          90J
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                        <YAxis stroke="#64748B" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #E2E8F0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                          formatter={(value: number) => [`${value} recherches`, ""]}
                        />
                        <Bar dataKey="searches" radius={[8, 8, 0, 0]}>
                          {activityData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                index % 2 === 0
                                  ? "url(#primaryGradient)"
                                  : "url(#primaryGradientDark)"
                              }
                            />
                          ))}
                        </Bar>
                        <defs>
                          <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7C5CDB" />
                            <stop offset="100%" stopColor="#5E3A9B" />
                          </linearGradient>
                          <linearGradient id="primaryGradientDark" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8B72E7" />
                            <stop offset="100%" stopColor="#7C5CDB" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Performance Metrics */}
            {meta && results.length > 0 && (
              <motion.div
                className="grid grid-cols-4 gap-4"
                initial="initial"
                animate="animate"
                variants={staggerChildren}
              >
                {[
                  { label: "Taux de réponse", value: "70%", sublabel: "Moy. 24h", icon: TrendingUp, progress: 70 },
                  { label: "Visites", value: "+24%", sublabel: "vs mois dernier", icon: Zap, iconColor: "text-blue-500" },
                  { label: "Temps moy.", value: "2.3m", sublabel: "par session", icon: Search, iconColor: "text-green-500" },
                  { label: "Contacts", value: "156", sublabel: "ce mois", icon: Mail, iconColor: "text-pink-500" },
                ].map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    variants={fadeInUp}
                    transition={{ delay: 1.1 + index * 0.1 }}
                  >
                    <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
                      <CardContent className="p-6">
                        {metric.progress ? (
                          <div className="relative inline-block mb-3">
                            <svg className="w-20 h-20 transform -rotate-90">
                              <circle
                                cx="40"
                                cy="40"
                                r="35"
                                stroke="#E5E7EB"
                                strokeWidth="8"
                                fill="none"
                              />
                              <motion.circle
                                cx="40"
                                cy="40"
                                r="35"
                                stroke="#7C5CDB"
                                strokeWidth="8"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={220}
                                initial={{ strokeDashoffset: 220 }}
                                animate={{ strokeDashoffset: 220 - (220 * metric.progress) / 100 }}
                                transition={{ duration: 2, ease: "easeOut" }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-bold text-gray-800">{metric.value}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center mb-3">
                            <metric.icon
                              className={`w-8 h-8 ${metric.iconColor || "text-primary-500"}`}
                              strokeWidth={1.5}
                            />
                          </div>
                        )}
                        <p className="text-2xl font-bold text-gray-800 mb-1">{metric.value}</p>
                        <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                        <p className="text-xs text-gray-400 mt-1">{metric.sublabel}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-8 right-8 p-4 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-full shadow-2xl z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            "0 0 20px rgba(124, 92, 219, 0.4)",
            "0 0 30px rgba(124, 92, 219, 0.6)",
            "0 0 20px rgba(124, 92, 219, 0.4)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Share2 className="w-6 h-6" strokeWidth={1.5} />
      </motion.button>
    </div>
  )
}
