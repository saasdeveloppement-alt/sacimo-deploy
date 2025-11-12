"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import PageContainer, { fadeInUp, staggerChildren } from "@/components/ui/PageContainer"
import SectionHeader from "@/components/ui/SectionHeader"
import ModernCard from "@/components/ui/ModernCard"
import MetricCard from "@/components/ui/MetricCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import AdvancedFilters from "@/components/filters/AdvancedFilters"
import { AdvancedFilters as AdvancedFiltersType, initialFilters } from "@/hooks/useAdvancedFilters"
import ListingCard from "@/components/ListingCard"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { 
  RefreshCw, 
  Building2, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Image as ImageIcon, 
  List, 
  Grid3X3,
  Target,
  TrendingUp,
  Users,
  Home,
  Zap,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { motion } from "framer-motion"
import { showSuccess, showError, showInfo } from "@/lib/toast"

interface Listing {
  title: string;
  price: number;
  surface?: number;
  rooms?: number;
  city: string;
  postalCode: string;
  type: string;
  source: string;
  url: string;
  publishedAt: string;
  isPrivateSeller: boolean;
  description?: string;
  photos: string[];
}

interface Stats {
  total: number
  avgPrice: number
  minPrice: number
  maxPrice: number
  cities: Array<{
    city: string
    count: number
    avgPrice: number
    minPrice: number
    maxPrice: number
  }>
  sellers: {
    private: number
    professional: number
  }
}

function AnnoncesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const agencyFromUrl = searchParams.get('agency')
  
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState<Stats | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersType>(initialFilters)
  const [sortBy, setSortBy] = useState<"price" | "publishedAt">("publishedAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 30

  const loadScrapingData = async (shouldSync: boolean = true) => {
    setIsLoading(true)
    try {
      let syncResult = null
      
      // 1. Synchronisation Melo.io si demandée
      if (shouldSync && advancedFilters.cities.length > 0) {
        setLoadingMessage("🔍 Recherche sur Melo.io...")
        
        // Construire le format ville avec code postal si présent
        const villeFilter = advancedFilters.cities[0]
        let villeFormatted = villeFilter
        
        // Détecter si c'est un code postal (5 chiffres) ou une ville
        const isPostalCode = /^\d{5}$/.test(villeFilter)
        
        // Si c'est un code postal, on l'utilise tel quel
        // Sinon, on cherche s'il y a un code postal dans les autres villes
        if (!isPostalCode) {
          const postalCodeInCities = advancedFilters.cities.find(c => /^\d{5}$/.test(c))
          if (postalCodeInCities) {
            villeFormatted = `${villeFilter} (${postalCodeInCities})`
          }
        } else {
          villeFormatted = villeFilter
        }
        
        // Convertir le type (APARTMENT -> appartement, HOUSE -> maison, etc.)
        const typeMap: Record<string, string> = {
          'APARTMENT': 'appartement',
          'HOUSE': 'maison',
          'STUDIO': 'appartement',
          'LOFT': 'appartement',
          'PENTHOUSE': 'appartement',
          'VILLA': 'maison',
          'TOWNHOUSE': 'maison',
        }
        
        const syncBody: any = {
          filters: {
            ville: villeFormatted,
          },
          limit: 100,
          transformToListing: true,
        }
        
        // Ajouter les autres filtres
        if (advancedFilters.types.length > 0) {
          syncBody.filters.typeBien = typeMap[advancedFilters.types[0]] || 'appartement'
        }
        if (advancedFilters.minPrice) {
          syncBody.filters.minPrix = parseInt(advancedFilters.minPrice) || undefined
        }
        if (advancedFilters.maxPrice) {
          syncBody.filters.maxPrix = parseInt(advancedFilters.maxPrice) || undefined
        }
        if (advancedFilters.rooms) {
          syncBody.filters.pieces = parseInt(advancedFilters.rooms) || undefined
        }
        
        // Ajouter le code postal si c'est un code postal seul
        if (isPostalCode) {
          syncBody.filters.codePostal = villeFilter
        } else if (advancedFilters.cities.some(c => /^\d{5}$/.test(c))) {
          const postalCode = advancedFilters.cities.find(c => /^\d{5}$/.test(c))
          if (postalCode) {
            syncBody.filters.codePostal = postalCode
          }
        }
        
        try {
          const syncRes = await fetch('/api/melo/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(syncBody),
          })
          syncResult = await syncRes.json()
          
          if (syncResult.success && syncResult.result?.newAnnonces > 0) {
            showSuccess(`✅ ${syncResult.result.newAnnonces} nouvelles annonces trouvées sur Melo.io !`)
          }
        } catch (syncError: any) {
          console.error("❌ Erreur synchronisation Melo.io:", syncError)
          showError(`⚠️ Erreur synchronisation: ${syncError.message || 'Erreur inconnue'}`)
          // Continuer quand même pour charger depuis la BDD
        }
      }
      
      setLoadingMessage("📥 Chargement des annonces...")
      
      console.log("🔍 Chargement des annonces depuis la base de données...")
      
      // 2. Construire les paramètres de recherche pour la BDD
      const params = new URLSearchParams()
      
      // Recherche texte (legacy)
      if (searchTerm) params.append('search', searchTerm)
      
      // Filtres avancés
      if (advancedFilters.cities.length > 0) {
        advancedFilters.cities.forEach(city => params.append('cities', city))
      }
      
      if (advancedFilters.types.length > 0) {
        advancedFilters.types.forEach(type => params.append('types', type))
      }
      
      if (advancedFilters.minPrice) params.append('minPrice', advancedFilters.minPrice)
      if (advancedFilters.maxPrice) params.append('maxPrice', advancedFilters.maxPrice)
      if (advancedFilters.minSurface) params.append('minSurface', advancedFilters.minSurface)
      if (advancedFilters.maxSurface) params.append('maxSurface', advancedFilters.maxSurface)
      if (advancedFilters.rooms) params.append('rooms', advancedFilters.rooms)
      if (advancedFilters.sellerType !== 'all') params.append('sellerType', advancedFilters.sellerType)
      if (advancedFilters.dateFrom) params.append('dateFrom', advancedFilters.dateFrom)
      
      // Filtre par agence depuis l'URL
      if (agencyFromUrl) {
        params.append('agency', agencyFromUrl)
      }
      
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)
      // Augmenter la limite pour récupérer plus d'annonces
      params.append('limit', '100')
      
      const response = await fetch(`/api/annonces/list?${params.toString()}`)
      const data = await response.json()
      console.log("📦 Données reçues:", data)
      console.log("📦 Structure des données:", {
        status: data.status,
        hasData: !!data.data,
        dataLength: data.data?.length,
        dataType: Array.isArray(data.data) ? 'array' : typeof data.data,
        pagination: data.pagination,
        stats: data.stats
      })

      if (data.status === 'success') {
        // Vérifier que data.data existe et est un tableau
        if (!data.data || !Array.isArray(data.data)) {
          console.error("❌ data.data n'est pas un tableau:", data.data)
          setListings([])
          setTotalCount(0)
          setStats(null)
          showError("❌ Format de données invalide: data.data n'est pas un tableau")
          return
        }

        console.log(`📋 Conversion de ${data.data.length} annonces...`)
        
        // Convertir les données Prisma au format attendu avec conversions sécurisées
        const convertedListings = data.data.map((annonce: any, index: number) => {
          try {
            const converted = {
              title: String(annonce?.title || 'Annonce sans titre'),
              price: Number(annonce?.price || 0),
              surface: annonce?.surface != null ? Number(annonce.surface) : undefined,
              rooms: annonce?.rooms != null ? Number(annonce.rooms) : undefined,
              city: String(annonce?.city || 'Ville non précisée'),
              postalCode: String(annonce?.postalCode || ''),
              type: inferTypeFromTitle(annonce?.title, annonce?.url),
              source: annonce?.source || 'LeBonCoin',
              url: String(annonce?.url || ''),
              publishedAt: annonce?.publishedAt 
                ? (typeof annonce.publishedAt === 'string' 
                    ? annonce.publishedAt 
                    : new Date(annonce.publishedAt).toISOString())
                : new Date().toISOString(),
              isPrivateSeller: true,
              description: String(annonce?.description || ''),
              photos: Array.isArray(annonce?.images) ? annonce.images.map((img: any) => String(img || '')) : []
            }
            
            // Log les 3 premières conversions pour debug
            if (index < 3) {
              console.log(`  [${index + 1}] Converti:`, {
                title: converted.title.substring(0, 50),
                price: converted.price,
                city: converted.city,
                url: converted.url.substring(0, 50)
              })
            }
            
            return converted
          } catch (err) {
            console.error(`❌ Erreur conversion annonce ${index}:`, err, annonce)
            return null
          }
        }).filter((listing: any) => listing !== null) // Filtrer les conversions échouées
        
        console.log(`✅ ${convertedListings.length} annonces converties avec succès`)
        console.log(`📊 Échantillon de listings:`, convertedListings.slice(0, 2))
        
        setListings(convertedListings)
        setTotalCount(data.pagination?.total || convertedListings.length)
        setStats(data.stats || null)
        
        console.log(`✅ ${convertedListings.length} annonces chargées dans le state`)
        console.log(`📊 totalCount: ${data.pagination?.total || convertedListings.length}`)
        
        if (data.stats) {
          console.log(`📊 Statistiques: ${data.stats.total} total, prix moyen: ${data.stats.avgPrice}€`)
        }
        
        if (convertedListings.length > 0) {
          showSuccess(`✅ ${convertedListings.length} annonce${convertedListings.length > 1 ? 's' : ''} chargée${convertedListings.length > 1 ? 's' : ''}`)
        } else {
          showInfo("ℹ️ Aucune annonce trouvée avec ces critères")
        }
      } else {
        console.error("❌ Erreur chargement:", data.message)
        showError(`❌ Erreur: ${data.message || 'Impossible de charger les annonces'}`)
      }
    } catch (err: any) {
      console.error("❌ Erreur chargement:", err)
      showError(`❌ Erreur: ${err.message || 'Erreur lors du chargement'}`)
    } finally {
      setIsLoading(false)
      setLoadingMessage("")
    }
  }
  
  // Helper pour extraire le type depuis le titre/URL
  const inferTypeFromTitle = (title: string | undefined | null, url: string | undefined | null): string => {
    if (!title && !url) return 'APARTMENT';
    
    const lowerTitle = String(title || '').toLowerCase();
    const lowerUrl = String(url || '').toLowerCase();
    
    if (lowerTitle.includes('maison') || lowerTitle.includes('villa') || lowerUrl.includes('maison')) return 'HOUSE';
    if (lowerTitle.includes('studio') || lowerUrl.includes('studio')) return 'STUDIO';
    if (lowerTitle.includes('loft') || lowerUrl.includes('loft')) return 'LOFT';
    return 'APARTMENT';
  }

  // Charger les données au montage initial et quand les paramètres changent
  useEffect(() => {
    // Charger depuis la BDD (sans synchronisation automatique)
    loadScrapingData(false)
  }, [sortBy, sortOrder, searchTerm, agencyFromUrl]) // eslint-disable-line react-hooks/exhaustive-deps
  
  // Fonction pour recharger avec synchronisation (appelée depuis le bouton Appliquer)
  const handleApplyFilters = () => {
    loadScrapingData(true)
  }

  // 🎯 FONCTION NOUVELLE : Synchronisation COMPLÈTE de toutes les annonces Melo.io
  const handleSyncAll = async () => {
    try {
      setIsLoading(true)
      setLoadingMessage("🔄 Synchronisation complète de toutes les annonces Melo.io...")
      
      console.log("🔄 ===== SYNCHRONISATION COMPLÈTE MELO.IO =====")
      
      const syncResponse = await fetch('/api/melo/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          limit: 1000,
          transformToListing: true,
          updateExisting: true,
        })
      })
      
      const syncResult = await syncResponse.json()
      console.log("✅ Résultat synchronisation complète:", JSON.stringify(syncResult, null, 2))
      
      if (!syncResponse.ok || !syncResult.success) {
        throw new Error(syncResult.message || 'Erreur lors de la synchronisation complète')
      }
      
      setLoadingMessage("📥 Chargement de toutes les annonces depuis la base de données...")
      
      // Recharger toutes les annonces depuis la BDD (sans filtre)
      const params = new URLSearchParams()
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)
      params.append('limit', '1000') // Augmenter la limite pour afficher toutes les annonces
      
      const response = await fetch(`/api/annonces/list?${params.toString()}`)
      const data = await response.json()
      
      if (data.status === 'success' && data.data && Array.isArray(data.data)) {
        const convertedListings = data.data.map((annonce: any) => {
          try {
            return {
              title: String(annonce?.title || 'Annonce sans titre'),
              price: Number(annonce?.price || 0),
              surface: annonce?.surface != null ? Number(annonce.surface) : undefined,
              rooms: annonce?.rooms != null ? Number(annonce.rooms) : undefined,
              city: String(annonce?.city || 'Ville non précisée'),
              postalCode: String(annonce?.postalCode || ''),
              type: inferTypeFromTitle(annonce?.title, annonce?.url),
              source: annonce?.source || 'LeBonCoin',
              url: String(annonce?.url || ''),
              publishedAt: annonce?.publishedAt 
                ? (typeof annonce.publishedAt === 'string' 
                    ? annonce.publishedAt 
                    : new Date(annonce.publishedAt).toISOString())
                : new Date().toISOString(),
              isPrivateSeller: true,
              description: String(annonce?.description || ''),
              photos: Array.isArray(annonce?.images) ? annonce.images.map((img: any) => String(img || '')) : []
            }
          } catch (err) {
            console.error('❌ Erreur conversion annonce:', err, annonce)
            return null
          }
        }).filter((listing: any) => listing !== null)
        
        setListings(convertedListings)
        setTotalCount(data.pagination?.total || convertedListings.length)
        setStats(data.stats || null)
        
        if (syncResult.result?.newAnnonces > 0) {
          showSuccess(`✅ Synchronisation complète réussie ! ${syncResult.result.newAnnonces} nouvelles annonces ajoutées (${syncResult.result.duplicates} doublons ignorés). ${convertedListings.length} annonces disponibles.`)
        } else {
          showInfo(`ℹ️ ${convertedListings.length} annonces disponibles dans la base de données.`)
        }
      } else {
        throw new Error(data.message || 'Impossible de charger les annonces')
      }
      
      console.log("✅ ===== SYNCHRONISATION COMPLÈTE TERMINÉE =====")
      
    } catch (error: any) {
      console.error('❌ Erreur handleSyncAll:', error)
      showError(`❌ Erreur lors de la synchronisation complète: ${error.message || 'Erreur inconnue'}`)
    } finally {
      setIsLoading(false)
      setLoadingMessage("")
    }
  }

  // 🎯 FONCTION CRITIQUE : Synchronisation temps réel Melo.io (avec filtres)
  const handleActualiser = async () => {
    try {
      setIsLoading(true)
      setLoadingMessage("🔍 Recherche sur Melo.io...")
      
      console.log("🔄 ===== DÉBUT SYNCHRONISATION MELO.IO =====")
      console.log("📋 Filtres actuels:", JSON.stringify(advancedFilters, null, 2))
      
      // ÉTAPE 1 : Construire les filtres Melo.io
      const meloFilters: any = {}
      
      // Villes / Codes postaux
      if (advancedFilters.cities && advancedFilters.cities.length > 0) {
        const city = advancedFilters.cities[0]
        const isPostalCode = /^\d{5}$/.test(city)
        
        if (isPostalCode) {
          // Code postal seul
          if (city.startsWith('75')) {
            meloFilters.ville = `Paris (${city})`
          } else {
            meloFilters.ville = city
          }
          meloFilters.codePostal = city
        } else {
          // Nom de ville
          meloFilters.ville = city
          const postalCodeInCities = advancedFilters.cities.find(c => /^\d{5}$/.test(c))
          if (postalCodeInCities) {
            meloFilters.ville = `${city} (${postalCodeInCities})`
            meloFilters.codePostal = postalCodeInCities
          }
        }
      }
      
      // Types de biens
      if (advancedFilters.types && advancedFilters.types.length > 0) {
        const typeMap: Record<string, string> = {
          'APARTMENT': 'appartement',
          'HOUSE': 'maison',
          'STUDIO': 'appartement',
          'LOFT': 'appartement',
          'PENTHOUSE': 'appartement',
          'VILLA': 'maison',
          'TOWNHOUSE': 'maison',
        }
        const uiType = advancedFilters.types[0]
        meloFilters.typeBien = typeMap[uiType] || uiType.toLowerCase()
      }
      
      // Prix
      if (advancedFilters.minPrice) meloFilters.minPrix = parseInt(advancedFilters.minPrice) || undefined
      if (advancedFilters.maxPrice) meloFilters.maxPrix = parseInt(advancedFilters.maxPrice) || undefined
      
      // Surface
      if (advancedFilters.minSurface) meloFilters.minSurface = parseInt(advancedFilters.minSurface) || undefined
      if (advancedFilters.maxSurface) meloFilters.maxSurface = parseInt(advancedFilters.maxSurface) || undefined
      
      // Pièces
      if (advancedFilters.rooms) meloFilters.pieces = parseInt(advancedFilters.rooms) || undefined
      
      console.log("🔄 Filtres envoyés à Melo.io:", JSON.stringify(meloFilters, null, 2))
      
      // ÉTAPE 2 : Synchroniser avec Melo.io
      const syncResponse = await fetch('/api/melo/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: meloFilters,
          limit: 2000, // Augmenter à 2000 (20 pages × 100 annonces)
          transformToListing: true
        })
      })
      
      const syncResult = await syncResponse.json()
      console.log("✅ Résultat Melo.io:", JSON.stringify(syncResult, null, 2))
      
      if (!syncResponse.ok || !syncResult.success) {
        throw new Error(syncResult.message || 'Erreur lors de la synchronisation Melo.io')
      }
      
      setLoadingMessage("📥 Chargement des annonces...")
      
      // ÉTAPE 3 : Charger depuis la BDD avec les MÊMES filtres + TRI PAR DATE
      const params = new URLSearchParams()
      
      // Filtres
      if (advancedFilters.cities && advancedFilters.cities.length > 0) {
        advancedFilters.cities.forEach(city => params.append('cities', city))
      }
      if (advancedFilters.types && advancedFilters.types.length > 0) {
        advancedFilters.types.forEach(type => params.append('types', type))
      }
      if (advancedFilters.minPrice) params.append('minPrice', String(advancedFilters.minPrice))
      if (advancedFilters.maxPrice) params.append('maxPrice', String(advancedFilters.maxPrice))
      if (advancedFilters.minSurface) params.append('minSurface', String(advancedFilters.minSurface))
      if (advancedFilters.maxSurface) params.append('maxSurface', String(advancedFilters.maxSurface))
      if (advancedFilters.rooms) params.append('rooms', String(advancedFilters.rooms))
      
      // TRI PAR DATE (plus récent en premier)
      params.append('sortBy', 'date')
      params.append('sortOrder', 'desc')
      params.append('limit', '10000') // ← Limite très élevée pour charger toutes les annonces
      
      console.log("🔍 Chargement depuis BDD avec params:", params.toString())
      
      const response = await fetch(`/api/annonces/list?${params.toString()}`)
      const data = await response.json()
      
      console.log("📦 Données BDD reçues:", {
        status: data.status,
        total: data.pagination?.total || 0,
        dataLength: data.data?.length || 0,
        limitEnvoye: params.get('limit'),
        pageEnvoyee: params.get('page')
      })
      
      if (data.data?.length < (data.pagination?.total || 0)) {
        console.warn(`⚠️ ATTENTION: Seulement ${data.data.length} annonces reçues sur ${data.pagination?.total} totales !`)
        console.warn(`   Vérifiez que limit >= 10000 pour charger toutes les annonces`)
      }
      
      if (data.status === 'success' && data.data && Array.isArray(data.data)) {
        console.log("🔍 DÉBOGAGE FILTRES:")
        console.log("📊 Annonces reçues de l'API:", data.data.length)
        console.log("🎯 Filtres actifs (advancedFilters):", JSON.stringify(advancedFilters, null, 2))
        console.log("📋 Paramètres URL envoyés:", params.toString())
        console.log("📦 Échantillon des annonces reçues:", data.data.slice(0, 5).map((a: any) => ({
          title: a.title?.substring(0, 50),
          city: a.city,
          postalCode: a.postalCode,
          price: a.price
        })))
        
        // Convertir les données Prisma au format attendu
        const convertedListings = data.data.map((annonce: any) => {
          try {
            const inferredType = inferTypeFromTitle(annonce?.title, annonce?.url)
            return {
              title: String(annonce?.title || 'Annonce sans titre'),
              price: Number(annonce?.price || 0),
              surface: annonce?.surface != null ? Number(annonce.surface) : undefined,
              rooms: annonce?.rooms != null ? Number(annonce.rooms) : undefined,
              city: String(annonce?.city || 'Ville non précisée'),
              postalCode: String(annonce?.postalCode || ''),
              type: inferredType,
              source: annonce?.source || 'LeBonCoin',
              url: String(annonce?.url || ''),
              publishedAt: annonce?.publishedAt 
                ? (typeof annonce.publishedAt === 'string' 
                    ? annonce.publishedAt 
                    : new Date(annonce.publishedAt).toISOString())
                : new Date().toISOString(),
              isPrivateSeller: true,
              description: String(annonce?.description || ''),
              photos: Array.isArray(annonce?.images) ? annonce.images.map((img: any) => String(img || '')) : []
            }
          } catch (err) {
            console.error('❌ Erreur conversion annonce:', err, annonce)
            return null
          }
        }).filter((listing: any) => listing !== null)
        
        console.log("📊 Types inférés des annonces:", {
          APARTMENT: convertedListings.filter((l: any) => l.type === 'APARTMENT').length,
          HOUSE: convertedListings.filter((l: any) => l.type === 'HOUSE').length,
          STUDIO: convertedListings.filter((l: any) => l.type === 'STUDIO').length,
          LOFT: convertedListings.filter((l: any) => l.type === 'LOFT').length,
          OTHER: convertedListings.filter((l: any) => !['APARTMENT', 'HOUSE', 'STUDIO', 'LOFT'].includes(l.type)).length
        })
        console.log("🎯 Types attendus dans les filtres:", advancedFilters.types)
        console.log("🔍 Correspondance:", {
          avecFiltre: convertedListings.filter((l: any) => 
            advancedFilters.types.length === 0 || advancedFilters.types.includes(l.type)
          ).length,
          sansFiltre: convertedListings.length
        })
        
        // Analyser les villes récupérées
        const cityDistribution = convertedListings.reduce((acc: Record<string, number>, listing: any) => {
          const city = listing.city || 'Ville non précisée'
          acc[city] = (acc[city] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        const cityEntries = Object.entries(cityDistribution) as [string, number][]
        console.log("🏙️ Répartition des villes récupérées:", cityEntries
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([city, count]) => `${city}: ${count}`)
          .join(', ')
        )
        
        // Analyser les codes postaux
        const postalCodeDistribution = convertedListings.reduce((acc: Record<string, number>, listing: any) => {
          const cp = listing.postalCode || 'N/A'
          acc[cp] = (acc[cp] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        const postalCodeEntries = Object.entries(postalCodeDistribution) as [string, number][]
        console.log("📮 Répartition des codes postaux:", postalCodeEntries
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([cp, count]) => `${cp}: ${count}`)
          .join(', ')
        )
        
        setListings(convertedListings)
        setTotalCount(data.pagination?.total || convertedListings.length)
        setStats(data.stats || null)
        
        console.log(`✅ ${convertedListings.length} annonces chargées dans le state`)
        console.log(`🔍 VÉRIFICATION: Est-ce que toutes les annonces sont bien dans convertedListings?`)
        console.log(`  - Longueur convertedListings: ${convertedListings.length}`)
        console.log(`  - Longueur data.data: ${data.data.length}`)
        console.log(`  - Total pagination: ${data.pagination?.total || 0}`)
        if (convertedListings.length !== data.data.length) {
          console.warn(`⚠️ ATTENTION: ${data.data.length - convertedListings.length} annonces ont été perdues lors de la conversion!`)
        }
        if (data.pagination?.total && convertedListings.length < data.pagination.total) {
          console.error(`❌ PROBLÈME CRITIQUE: Seulement ${convertedListings.length} annonces chargées sur ${data.pagination.total} totales en BDD!`)
          console.error(`   Vérifiez que l'API charge bien toutes les annonces (limit >= 10000)`)
        }
        
        // ÉTAPE 4 : Notification
        if (syncResult.result?.newAnnonces > 0) {
          showSuccess(`✅ ${syncResult.result.newAnnonces} nouvelles annonces trouvées !`)
        } else if (convertedListings.length > 0) {
          showInfo(`ℹ️ ${convertedListings.length} annonces affichées (déjà à jour)`)
        } else {
          showInfo("⚠️ Aucune annonce trouvée avec ces critères")
        }
      } else {
        console.error("❌ Erreur chargement BDD:", data.message)
        showError(`❌ Erreur: ${data.message || 'Impossible de charger les annonces'}`)
      }
      
      console.log("✅ ===== FIN SYNCHRONISATION MELO.IO =====")
      
    } catch (error: any) {
      console.error('❌ Erreur handleActualiser:', error)
      showError(`❌ Erreur lors de la recherche: ${error.message || 'Erreur inconnue'}`)
    } finally {
      setIsLoading(false)
      setLoadingMessage("")
    }
  }

  // Mode normal : filtrage activé
  const SHOW_ALL_ANNOUNCEMENTS = false
  
  // Mapping ville → codes postaux (pour filtrage par ville)
  const CITY_POSTAL_CODES: Record<string, string[]> = {
    'Nice': ['06000', '06100', '06200', '06300', '06400', '06500'],
    'Paris': Array.from({ length: 20 }, (_, i) => `750${String(i + 1).padStart(2, '0')}`),
    'Marseille': ['13001', '13002', '13003', '13004', '13005', '13006', '13007', '13008',
                  '13009', '13010', '13011', '13012', '13013', '13014', '13015', '13016'],
    'Lyon': ['69001', '69002', '69003', '69004', '69005', '69006', '69007', '69008', '69009'],
    'Bordeaux': ['33000', '33100', '33200', '33300'],
    'Toulouse': ['31000', '31100', '31200', '31300', '31400', '31500'],
  }
  
  // Fonction helper pour vérifier si une annonce correspond à la ville
  const matchesCity = (listing: any, cityFilter: string): boolean => {
    if (!cityFilter) return true
    
    const filterLower = cityFilter.toLowerCase().trim()
    const listingCityLower = (listing.city || '').toLowerCase().trim()
    const listingPostalCode = listing.postalCode || ''
    
    // 1. Si le filtre est un code postal exact (5 chiffres)
    if (/^\d{5}$/.test(cityFilter)) {
      return listingPostalCode === cityFilter
    }
    
    // 2. Correspondance exacte du nom de ville (normalisée)
    const normalizeCity = (str: string) => {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Enlever accents
        .replace(/[^a-z0-9]/g, '') // Enlever tout sauf lettres et chiffres
    }
    
    const normalizedFilter = normalizeCity(cityFilter)
    const normalizedCity = normalizeCity(listingCityLower)
    
    // Correspondance exacte normalisée
    if (normalizedCity === normalizedFilter) return true
    
    // Correspondance partielle (ex: "nice" dans "nice centre")
    if (normalizedCity.includes(normalizedFilter) || normalizedFilter.includes(normalizedCity)) {
      return true
    }
    
    // 3. Si le filtre est une ville connue, vérifier tous ses codes postaux
    const cityName = filterLower.charAt(0).toUpperCase() + filterLower.slice(1)
    const postalCodes = CITY_POSTAL_CODES[cityName]
    
    if (postalCodes && listingPostalCode) {
      // Si le code postal de l'annonce est dans la liste des codes postaux de la ville
      if (postalCodes.includes(listingPostalCode)) {
        return true
      }
      
      // Pour Nice spécifiquement, accepter TOUS les codes postaux 06xxx si la ville contient "nice"
      // OU si le code postal commence par 06 et qu'on filtre par Nice
      if (filterLower === 'nice') {
        // Si le code postal commence par 06, c'est probablement Nice ou une ville proche
        // On accepte si la ville contient "nice" ou si le code postal est dans la liste
        if (listingPostalCode.startsWith('06')) {
          // Accepter si la ville contient "nice" (même partiellement)
          if (normalizedCity.includes('nice') || listingCityLower.includes('nice')) {
            return true
          }
          // Ou si le code postal est dans la liste officielle de Nice
          if (postalCodes.includes(listingPostalCode)) {
            return true
          }
        }
      }
    }
    
    // 4. Correspondance par code postal si le filtre contient un code postal
    if (listingPostalCode && cityFilter.includes(listingPostalCode)) {
      return true
    }
    
    // 5. Si la ville est vide mais qu'on a un code postal correspondant
    if ((!listingCityLower || listingCityLower === 'ville non précisée' || listingCityLower === 'inconnu') && listingPostalCode) {
      if (postalCodes && postalCodes.includes(listingPostalCode)) {
        return true
      }
    }
    
    return false
  }
  
  // Logique de filtrage côté client (filtrage local après récupération complète)
  const filteredListings = SHOW_ALL_ANNOUNCEMENTS 
    ? listings // ← AFFICHER TOUTES LES ANNONCES
    : listings.filter(listing => {
    let passed = true
    const reasons: string[] = []
    
    // Filtre par type
    if (advancedFilters.types.length > 0) {
      const matches = advancedFilters.types.includes(listing.type)
      if (!matches) {
        passed = false
        reasons.push(`Type: ${listing.type} ne correspond pas à ${advancedFilters.types.join(', ')}`)
      }
    }
    
    // Filtre par ville/code postal (filtrage local) - VERSION AMÉLIORÉE AVEC TOUS LES CODES POSTAUX
    if (advancedFilters.cities.length > 0) {
      const matches = advancedFilters.cities.some(filterCity => matchesCity(listing, filterCity))
      
      if (!matches) {
        passed = false
        reasons.push(`Ville: "${listing.city}" (${listing.postalCode || 'N/A'}) ne correspond pas à ${advancedFilters.cities.join(', ')}`)
      }
    }
    
    // Filtre par prix
    if (advancedFilters.minPrice) {
      const minPrice = parseInt(advancedFilters.minPrice) || 0
      if (listing.price < minPrice) {
        passed = false
        reasons.push(`Prix: ${listing.price} < ${minPrice}`)
      }
    }
    if (advancedFilters.maxPrice) {
      const maxPrice = parseInt(advancedFilters.maxPrice) || Infinity
      if (listing.price > maxPrice) {
        passed = false
        reasons.push(`Prix: ${listing.price} > ${maxPrice}`)
      }
    }
    
    // Filtre par surface
    if (advancedFilters.minSurface && listing.surface) {
      const minSurface = parseInt(advancedFilters.minSurface) || 0
      if (listing.surface < minSurface) {
        passed = false
        reasons.push(`Surface: ${listing.surface} < ${minSurface}`)
      }
    }
    if (advancedFilters.maxSurface && listing.surface) {
      const maxSurface = parseInt(advancedFilters.maxSurface) || Infinity
      if (listing.surface > maxSurface) {
        passed = false
        reasons.push(`Surface: ${listing.surface} > ${maxSurface}`)
      }
    }
    
    // Filtre par nombre de pièces
    if (advancedFilters.rooms && listing.rooms) {
      const rooms = parseInt(advancedFilters.rooms) || 0
      if (listing.rooms < rooms) {
        passed = false
        reasons.push(`Pièces: ${listing.rooms} < ${rooms}`)
      }
    }
    
    // Filtre par recherche texte
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesTitle = listing.title?.toLowerCase().includes(searchLower)
      const matchesCity = listing.city?.toLowerCase().includes(searchLower)
      const matchesDescription = listing.description?.toLowerCase().includes(searchLower)
      if (!matchesTitle && !matchesCity && !matchesDescription) {
        passed = false
        reasons.push(`Recherche texte: "${searchTerm}" non trouvé`)
      }
    }
    
    // Log les annonces filtrées (seulement les 5 premières pour ne pas surcharger)
    if (!passed && reasons.length > 0) {
      const filteredCount = listings.filter(l => {
        // Même logique de filtrage mais juste pour compter
        if (advancedFilters.types.length > 0 && !advancedFilters.types.includes(l.type)) return true
        return false
      }).length
      
      if (filteredCount <= 5) {
        console.log(`🚫 Annonce filtrée: "${listing.title?.substring(0, 50)}" - Raisons:`, reasons)
      }
    }
    
    return passed
  })
  
  // Log pour debug détaillé
  useEffect(() => {
    console.log("🔍 État des listings:", {
      totalListings: listings.length,
      filteredListings: filteredListings.length,
      totalCount,
      advancedFiltersTypes: advancedFilters.types,
      advancedFiltersCities: advancedFilters.cities,
      advancedFiltersMinPrice: advancedFilters.minPrice,
      advancedFiltersMaxPrice: advancedFilters.maxPrice,
      searchTerm: searchTerm
    })
    
    // Analyse détaillée du filtrage
    if (listings.length > 0 && filteredListings.length < listings.length) {
      const filteredOut = listings.length - filteredListings.length
      console.log(`📊 COMPARAISON:`)
      console.log(`Total en BDD: ${listings.length}`)
      console.log(`Affichées: ${filteredListings.length}`)
      console.log(`Différence: ${filteredOut} annonces masquées`)
      
      // Analyser pourquoi les annonces sont filtrées
      const typeFiltered = listings.filter(l => 
        advancedFilters.types.length > 0 && !advancedFilters.types.includes(l.type)
      ).length
      
      // Analyser le filtrage par ville avec la fonction matchesCity
      const cityFiltered = listings.filter(l => {
        if (advancedFilters.cities.length === 0) return false
        return !advancedFilters.cities.some(filterCity => matchesCity(l, filterCity))
      }).length
      
      // Analyser les villes des annonces filtrées
      const villesFiltrees = listings.filter(l => {
        if (advancedFilters.cities.length === 0) return false
        return !advancedFilters.cities.some(filterCity => matchesCity(l, filterCity))
      }).slice(0, 10).map(l => ({ city: l.city, postalCode: l.postalCode }))
      
      console.log(`🚫 Filtrées par type: ${typeFiltered}`)
      console.log(`🚫 Filtrées par ville: ${cityFiltered}`)
      console.log(`📋 Exemples de villes filtrées:`, villesFiltrees)
      
      // Afficher quelques exemples d'annonces masquées
      const hidden = listings.filter(l => !filteredListings.includes(l)).slice(0, 3)
      console.log(`📋 Exemples d'annonces masquées:`, hidden.map(h => ({
        title: h.title?.substring(0, 50),
        type: h.type,
        city: h.city,
        postalCode: h.postalCode
      })))
    }
  }, [listings, filteredListings, totalCount, advancedFilters, searchTerm])

  // Calcul de la pagination
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedListings = filteredListings.slice(startIndex, endIndex)
  
  // Logs détaillés pour débogage
  console.log(`📊 DÉBOGAGE AFFICHAGE:`)
  console.log(`  - Total listings en state: ${listings.length}`)
  console.log(`  - Annonces filtrées: ${filteredListings.length}`)
  console.log(`  - Page actuelle: ${currentPage}/${totalPages}`)
  console.log(`  - Items par page: ${itemsPerPage}`)
  console.log(`  - Annonces à afficher (paginatedListings): ${paginatedListings.length} (${startIndex + 1}-${Math.min(endIndex, filteredListings.length)})`)
  console.log(`  - Pagination visible: ${filteredListings.length > 0 ? 'OUI' : 'NON'} (totalPages: ${totalPages})`)
  
  // Avertissement si peu d'annonces
  if (listings.length > 0 && filteredListings.length < listings.length) {
    console.warn(`⚠️ ATTENTION: ${listings.length - filteredListings.length} annonces sont masquées par les filtres actifs`)
    console.warn(`   Filtres actifs:`, {
      cities: advancedFilters.cities,
      types: advancedFilters.types,
      minPrice: advancedFilters.minPrice,
      maxPrice: advancedFilters.maxPrice,
      minSurface: advancedFilters.minSurface,
      maxSurface: advancedFilters.maxSurface,
      rooms: advancedFilters.rooms,
      searchTerm: searchTerm
    })
  }

  // Réinitialiser à la page 1 quand les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [advancedFilters, searchTerm, listings.length])

  // Fonctions de navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }

  // Données pour les graphiques
  const priceDistribution = [
    { range: "< 300k€", count: filteredListings.filter(l => l.price < 300000).length, color: "#8B5CF6" },
    { range: "300k-600k€", count: filteredListings.filter(l => l.price >= 300000 && l.price < 600000).length, color: "#3B82F6" },
    { range: "> 600k€", count: filteredListings.filter(l => l.price >= 600000).length, color: "#06B6D4" }
  ]

  const typeDistribution = [
    { name: "Appartements", value: filteredListings.filter(l => l.type === 'APARTMENT').length, color: "#8B5CF6" },
    { name: "Maisons", value: filteredListings.filter(l => l.type === 'HOUSE').length, color: "#3B82F6" },
    { name: "Studios", value: filteredListings.filter(l => l.type === 'STUDIO').length, color: "#06B6D4" },
    { name: "Autres", value: filteredListings.filter(l => !['APARTMENT', 'HOUSE', 'STUDIO'].includes(l.type)).length, color: "#10B981" }
  ].filter(item => item.value > 0)

  // Utiliser les statistiques de villes depuis l'API si disponibles, sinon calculer depuis filteredListings
  const cityData = stats?.cities 
    ? stats.cities.slice(0, 5).map(c => ({ city: c.city, count: c.count }))
    : (() => {
  const cityDistribution = filteredListings.reduce((acc, listing) => {
    const city = listing.city
    acc[city] = (acc[city] || 0) + 1
    return acc
  }, {} as Record<string, number>)
        return Object.entries(cityDistribution).map(([city, count]) => ({
    city,
    count
  })).sort((a, b) => b.count - a.count).slice(0, 5)
      })()

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="Piges"
        subtitle="Suivez les dernières annonces des particuliers et professionnels"
        icon={<Target className="h-8 w-8 text-violet-600" />}
        action={
          <div className="flex gap-2">
            <Button 
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white" : "border-slate-200 hover:border-violet-300"}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white" : "border-slate-200 hover:border-violet-300"}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button 
              onClick={handleSyncAll} 
              disabled={isLoading}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              title="Synchroniser toutes les annonces Melo.io (tous codes postaux)"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {isLoading ? (loadingMessage || 'Synchronisation...') : '🌐 Sync Complète'}
            </Button>
            <Button 
              onClick={handleActualiser} 
              disabled={isLoading}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              title="Synchroniser avec les filtres actuels"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  {loadingMessage || 'Actualisation...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Actualiser
                </span>
              )}
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Badge filtre agence */}
          {agencyFromUrl && (
            <motion.div variants={fadeInUp}>
              <div className="mb-4">
                <Badge variant="secondary" className="text-sm p-2 bg-purple-100 text-purple-700 border-purple-200">
                  🏢 Filtre actif : {agencyFromUrl}
                  <button 
                    onClick={() => {
                      router.push('/app/annonces')
                      showInfo('Filtre agence retiré')
                    }} 
                    className="ml-2 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </Badge>
              </div>
            </motion.div>
          )}

          {/* Filtres avancés et recherche */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Filtres et Recherche"
              icon={<Filter className="h-5 w-5 text-purple-600" />}
            >
              <div className="space-y-6">
                {/* Recherche texte */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Recherche texte</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Rechercher par titre, ville ou description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200"
                    />
                  </div>
                </div>
                
                <Separator />
                
                {/* Filtres avancés */}
                <AdvancedFilters
                  onFilterChange={(filters) => {
                    setAdvancedFilters(filters)
                    // Ne pas recharger automatiquement, attendre le bouton "Appliquer"
                  }}
                  onApply={handleApplyFilters}
                  initialFilters={advancedFilters}
                  availableCities={stats?.cities?.map(c => c.city) || []}
                />
                
                <Separator />
                
                {/* Tri et actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Trier par</label>
                      <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                        const [by, order] = value.split('-')
                        setSortBy(by as "price" | "publishedAt")
                        setSortOrder(order as "asc" | "desc")
                      }}>
                        <SelectTrigger className="w-48 bg-white/80 border-slate-200 focus:border-purple-300 focus:ring-purple-200">
                          <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                          <SelectItem value="publishedAt-desc">Plus récentes</SelectItem>
                          <SelectItem value="publishedAt-asc">Plus anciennes</SelectItem>
                          <SelectItem value="price-asc">Prix croissant</SelectItem>
                          <SelectItem value="price-desc">Prix décroissant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                      {filteredListings.length > 0 
                        ? `${filteredListings.length} annonce${filteredListings.length > 1 ? 's' : ''} (Page ${currentPage}/${totalPages})` 
                        : 'Aucune annonce'}
                    </Badge>
              </div>
              
                  <Button variant="outline" size="sm" className="border-slate-200 hover:border-purple-300 hover:text-purple-600">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                </div>
              </div>
            </ModernCard>
          </motion.div>

          {/* KPIs */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerChildren}
          >
            <MetricCard
              title="Total Annonces"
              value={stats?.total || totalCount || 0}
              icon={Home}
              color="from-purple-500 to-purple-600"
              bgColor="bg-purple-50"
              textColor="text-purple-700"
            />
            <MetricCard
              title="Prix Moyen"
              value={stats?.avgPrice 
                ? stats.avgPrice.toLocaleString('fr-FR') + '€'
                : filteredListings.length > 0 
                ? Math.round(filteredListings.reduce((sum, l) => sum + l.price, 0) / filteredListings.length).toLocaleString('fr-FR') + '€'
                : '0€'
              }
              icon={TrendingUp}
              color="from-blue-500 to-blue-600"
              bgColor="bg-blue-50"
              textColor="text-blue-700"
            />
            <MetricCard
              title="Particuliers"
              value={stats?.sellers?.private || filteredListings.filter(l => l.isPrivateSeller).length}
              icon={Users}
              color="from-cyan-500 to-cyan-600"
              bgColor="bg-cyan-50"
              textColor="text-cyan-700"
            />
            <MetricCard
              title="Professionnels"
              value={stats?.sellers?.professional || filteredListings.filter(l => !l.isPrivateSeller).length}
              icon={Building2}
              color="from-emerald-500 to-emerald-600"
              bgColor="bg-emerald-50"
              textColor="text-emerald-700"
            />
          </motion.div>

          {/* Graphiques */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            variants={staggerChildren}
          >
            <motion.div variants={fadeInUp}>
              <ModernCard
                title="Répartition par Prix"
                icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priceDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="range" stroke="#64748B" />
                    <YAxis stroke="#64748B" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </ModernCard>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <ModernCard
                title="Répartition par Type"
                icon={<Building2 className="h-5 w-5 text-blue-600" />}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ModernCard>
            </motion.div>
          </motion.div>

          {/* Top Villes */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Top 5 Villes"
              icon={<MapPin className="h-5 w-5 text-cyan-600" />}
            >
              <div className="space-y-4">
                {cityData.map((item, index) => (
                  <motion.div 
                    key={item.city} 
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-slate-800">{item.city}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-600">{item.count} annonce{item.count > 1 ? 's' : ''}</span>
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <motion.div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" 
                          style={{ width: `${(item.count / Math.max(...cityData.map(c => c.count))) * 100}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.count / Math.max(...cityData.map(c => c.count))) * 100}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ModernCard>
          </motion.div>

          {/* Liste des annonces */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Annonces Immobilières"
              icon={<Target className="h-5 w-5 text-emerald-600" />}
            >
              {isLoading ? (
                <div className="text-center py-16">
                  <RefreshCw className="h-16 w-16 animate-spin text-purple-600 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-slate-700 mb-2">
                    {loadingMessage || "Chargement des annonces..."}
                  </p>
                  {loadingMessage && (
                    <p className="text-sm text-slate-500">
                      Veuillez patienter...
                    </p>
                  )}
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-lg font-semibold text-slate-700 mb-2">
                    Aucune annonce trouvée
                  </p>
                  {listings.length > 0 && (
                    <p className="text-sm text-slate-500 mb-4">
                      {listings.length} annonce{listings.length > 1 ? 's' : ''} en BDD mais masquée{listings.length > 1 ? 's' : ''} par les filtres actifs
                    </p>
                  )}
                  <Button
                    onClick={() => {
                      setAdvancedFilters(initialFilters)
                      setSearchTerm("")
                    }}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : (
                <>
                  <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {(() => {
                      console.log(`🎨 RENDU: Affichage de ${paginatedListings.length} annonces`)
                      return null
                    })()}
                    {paginatedListings.map((listing, index) => {
                      if (index < 5 || index === paginatedListings.length - 1) {
                        console.log(`🎨 Rendu annonce ${index + 1}/${paginatedListings.length}:`, listing.title?.substring(0, 50))
                      }
                      return (
                        <ListingCard
                          key={listing.url || `listing-${startIndex + index}`}
                          listing={listing}
                          viewMode={viewMode}
                          onSave={(listing) => {
                            console.log("💾 Sauvegarder:", listing.title)
                            // TODO: Implémenter la sauvegarde en base
                          }}
                          onAnalyze={(listing) => {
                            console.log("📊 Analyser:", listing.title)
                            showInfo(`📊 Analyse de "${listing.title.substring(0, 30)}..." en cours`)
                            // TODO: Implémenter l'analyse
                          }}
                          onEstimate={(listing) => {
                            console.log("💰 Estimer:", listing.title)
                            showInfo(`💰 Estimation de "${listing.title.substring(0, 30)}..." en cours`)
                            // TODO: Implémenter l'estimation IA
                          }}
                          onLocate={(listing) => {
                            console.log("📍 Localiser:", listing.title)
                            showInfo(`📍 Localisation de "${listing.city}" sur la carte`)
                            // TODO: Ouvrir modal carte
                          }}
                        />
                      )
                    })}
                  </div>

                  {/* Pagination - Toujours afficher si on a des annonces */}
                  {filteredListings.length > 0 && (
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                      <div className="flex items-center gap-2">
                        {totalPages > 1 && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={goToPreviousPage}
                              disabled={currentPage === 1}
                              className="border-slate-200 hover:border-violet-300 hover:text-violet-600"
                            >
                              <ChevronLeft className="h-4 w-4 mr-1" />
                              Précédent
                            </Button>
                            
                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                let pageNum: number
                                if (totalPages <= 7) {
                                  pageNum = i + 1
                                } else if (currentPage <= 4) {
                                  pageNum = i + 1
                                } else if (currentPage >= totalPages - 3) {
                                  pageNum = totalPages - 6 + i
                                } else {
                                  pageNum = currentPage - 3 + i
                                }
                                
                                return (
                                  <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => goToPage(pageNum)}
                                    className={
                                      currentPage === pageNum
                                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
                                        : "border-slate-200 hover:border-violet-300 hover:text-violet-600"
                                    }
                                  >
                                    {pageNum}
                                  </Button>
                                )
                              })}
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={goToNextPage}
                              disabled={currentPage === totalPages}
                              className="border-slate-200 hover:border-violet-300 hover:text-violet-600"
                            >
                              Suivant
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </>
                        )}
                      </div>
                      
                      <div className="text-sm text-slate-600">
                        Affichage de <span className="font-semibold text-slate-900">{startIndex + 1}</span> à{' '}
                        <span className="font-semibold text-slate-900">
                          {Math.min(endIndex, filteredListings.length)}
                        </span>{' '}
                        sur <span className="font-semibold text-slate-900">{filteredListings.length}</span> annonces
                        {listings.length !== filteredListings.length && (
                          <span className="ml-2 text-slate-500">
                            (Total en BDD: {listings.length})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                </>
              )}
            </ModernCard>
          </motion.div>
        </div>
      </main>
    </PageContainer>
  )
}

export default function AnnoncesPage() {
  return (
    <Suspense fallback={
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center animate-pulse">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-slate-600">Chargement...</p>
          </div>
        </div>
      </PageContainer>
    }>
      <AnnoncesContent />
    </Suspense>
  )
}