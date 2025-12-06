"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Search, Loader2, AlertTriangle, ExternalLink, Sparkles, MapPin, Bell, Mail, TrendingUp, Heart, Zap, ChevronDown, ChevronUp, Save, Bookmark, Trash2, X, Clock, Navigation, Calculator, Phone, User, Copy, Check, Brain } from "lucide-react"
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
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
import { QuickAnalysisPanel } from "@/components/analysis/QuickAnalysisPanel"
import { filterByState } from "@/lib/piges/filterByState"

interface PigeFilters {
  city?: string
  postalCode?: string // Conservé pour compatibilité
  postalCodes?: string[] // Nouveau: liste de codes postaux
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
  dateRange?: "5d" | "10d" | "15d" | "30d" | "all" // Filtre par date (moins de X jours)
  agency?: string // Nom d'agence à filtrer (filtrage LOCAL uniquement, jamais envoyé à l'API)
  // Filtres optionnels
  criteria?: string[] // balcon, terrasse, jardin, parking, etc.
  minPricePerM2?: number
  maxPricePerM2?: number
  condition?: string[] // bon état, à rénover, neuf, etc. (ancien filtre, conservé pour compatibilité)
  state?: string[] // État du bien: neuf, ancien, recent, vefa, travaux
  minBedrooms?: number
  maxBedrooms?: number
  minFloor?: number
  maxFloor?: number
  propertyType?: string[] // appartement, maison, studio, etc.
  bienType?: "appartement" | "maison" | "terrain" | "all" // Nouveau filtre simple Type de bien
  furnished?: "all" | "furnished" | "unfurnished"
  orientation?: string[] // nord, sud, est, ouest
}

interface SavedFilter {
  id: string
  name: string
  filters: PigeFilters
  createdAt: string
}

interface SearchHistory {
  id: string
  filters: PigeFilters
  resultsCount: number
  searchedAt: string
  city?: string
  postalCode?: string
}

interface SearchHistory {
  id: string
  filters: PigeFilters
  resultsCount: number
  searchedAt: string
  postalCode?: string
  city?: string
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
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<PigeFilters>({
    type: "all",
    types: [], // Pour les cases à cocher vente/location
    sellerType: "all",
    dateRange: "all", // Par défaut, toutes les dates
    criteria: [],
    condition: [],
    bienType: "all", // Par défaut, tous les types de biens
  })
  const [openFilters, setOpenFilters] = useState<{ [key: string]: boolean }>({
    bienType: false,
    criteria: false,
    priceM2: false,
    condition: false,
    state: false,
    bedrooms: false,
    floor: false,
    propertyType: false,
    furnished: false,
    orientation: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<NormalizedListing[]>([])
  const [meta, setMeta] = useState<{ total: number; pages: number; hasMore: boolean } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 30 // 30 annonces par page côté UI
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [filterName, setFilterName] = useState("")
  const [showSavedFilters, setShowSavedFilters] = useState(false)
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  const [historyPage, setHistoryPage] = useState(1)
  const historyItemsPerPage = 5
  const [selectedListingForLocation, setSelectedListingForLocation] = useState<NormalizedListing | null>(null)
  const [selectedListingForEstimation, setSelectedListingForEstimation] = useState<NormalizedListing | null>(null)
  const [selectedListingForContact, setSelectedListingForContact] = useState<NormalizedListing | null>(null)
  const [selectedListingForAnalysis, setSelectedListingForAnalysis] = useState<NormalizedListing | null>(null)
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [postalCodes, setPostalCodes] = useState<string[]>([])
  const [postalInput, setPostalInput] = useState("")
  const [agencyFilter, setAgencyFilter] = useState<string | null>(null)
  const [cityQuery, setCityQuery] = useState("")
  const [citySuggestions, setCitySuggestions] = useState<Array<{ city: string; postalCode: string }>>([])
  const [autoSearchTriggered, setAutoSearchTriggered] = useState(false)
  const handleSearchRef = useRef<((overridePostalCodes?: string[]) => Promise<void>) | null>(null)
  const lastSearchParamsRef = useRef<string>("") // Pour éviter les déclenchements multiples pour les mêmes paramètres

  // Lire les paramètres de l'URL (agency et postalCodes) et lancer la recherche automatiquement
  useEffect(() => {
    const agencyParam = searchParams.get('agency')
    const postalCodesParam = searchParams.get('postalCodes')
    
    // Si on a les deux paramètres, c'est qu'on vient de la page concurrentiel
    if (agencyParam && postalCodesParam) {
      // Créer une clé unique pour ces paramètres
      const searchKey = `${agencyParam}|${postalCodesParam}`
      
      // Vérifier si on a déjà lancé la recherche pour ces paramètres
      if (lastSearchParamsRef.current === searchKey) {
        console.log("⏸️ [Annonces] Recherche déjà lancée pour ces paramètres, on skip", { searchKey })
        return
      }
      
      // Mettre à jour les états
      setAgencyFilter(agencyParam)
      const codes = postalCodesParam.split(',').filter(c => c.trim().length > 0)
      if (codes.length > 0) {
        setPostalCodes(codes)
        console.log("✅ [Annonces] Codes postaux mis à jour depuis l'URL", { codes })
      }
      
      // Marquer ces paramètres comme traités
      lastSearchParamsRef.current = searchKey
      
      // Lancer la recherche automatiquement UNE SEULE FOIS
      // Fonction pour tenter la recherche (appelée une seule fois)
      const attemptSearch = () => {
        // Vérifier que tout est prêt
        if (session?.user && !loading && handleSearchRef.current && codes.length > 0) {
          console.log("🚀 [Annonces] Lancement automatique depuis les paramètres URL", { 
            agency: agencyParam, 
            postalCodesFromURL: codes,
            sessionUser: !!session?.user,
            loading,
            hasHandleSearch: !!handleSearchRef.current
          })
          setAutoSearchTriggered(true) // Marquer comme déclenché AVANT l'appel
          
          // Appeler handleSearch avec les codes postaux directement (évite le problème de timing)
          if (handleSearchRef.current) {
            console.log("🔍 [Annonces] Appel immédiat de handleSearch avec codes postaux depuis URL", { codes })
            handleSearchRef.current(codes)
          }
          return true
        } else {
          console.log("⏳ [Annonces] Conditions non remplies", {
            hasSession: !!session?.user,
            loading,
            hasHandleSearch: !!handleSearchRef.current,
            codesLength: codes.length
          })
        }
        return false
      }
      
      // Essayer immédiatement, puis après un délai si ça n'a pas fonctionné
      if (!attemptSearch()) {
        const timer = setTimeout(() => {
          if (!attemptSearch()) {
            console.log("⏳ [Annonces] Échec après délai, réessai...")
            // Dernier essai après un délai plus long
            setTimeout(() => {
              attemptSearch()
            }, 1000)
          }
        }, 800)
        
        return () => clearTimeout(timer)
      }
    } else {
      // Pas de paramètres URL, comportement normal
      if (agencyParam) {
        setAgencyFilter(agencyParam)
      } else {
        setAgencyFilter(null)
      }
      
      if (postalCodesParam) {
        // Exclure 75008 des paramètres URL
        const codes = postalCodesParam.split(',').filter(c => {
          const trimmed = c.trim()
          return trimmed.length > 0 && trimmed !== "75008"
        })
        if (codes.length > 0) {
          setPostalCodes(codes)
        }
      }
    }
  }, [searchParams, session?.user, loading, autoSearchTriggered]) // eslint-disable-line react-hooks/exhaustive-deps

  // Nettoyer 75008 des filtres au montage (si présent par erreur dans l'état initial ou localStorage)
  useEffect(() => {
    let needsUpdate = false
    const updatedFilters = { ...filters }
    
    // Supprimer 75008 des filtres s'il est présent
    if (filters.postalCode === "75008") {
      updatedFilters.postalCode = undefined
      needsUpdate = true
    }
    if (filters.postalCodes && Array.isArray(filters.postalCodes) && filters.postalCodes.includes("75008")) {
      const cleanedCodes = filters.postalCodes.filter(code => code !== "75008")
      updatedFilters.postalCodes = cleanedCodes.length > 0 ? cleanedCodes : undefined
      needsUpdate = true
    }
    
    if (needsUpdate) {
      setFilters(updatedFilters)
    }
    
    // Initialiser postalCodes depuis filters.postalCode si présent (pour compatibilité)
    // MAIS NE PAS FORCER 75008 ou toute autre valeur par défaut
    // IMPORTANT: Ne charger que si postalCodes est vraiment vide (pas déjà initialisé)
    // ET seulement au montage initial (pas après une saisie utilisateur)
    if (postalCodes.length === 0) {
      if (updatedFilters.postalCode && !updatedFilters.postalCodes) {
        // Ne pas charger si c'est 75008 (probablement une valeur par défaut indésirable)
        if (updatedFilters.postalCode !== "75008") {
          setPostalCodes([updatedFilters.postalCode])
          console.log("[DEBUG FILTERS] postalCodes initialisés depuis filters.postalCode:", [updatedFilters.postalCode])
        }
      } else if (updatedFilters.postalCodes && Array.isArray(updatedFilters.postalCodes)) {
        // Filtrer 75008 des codes postaux chargés
        const filteredCodes = updatedFilters.postalCodes.filter(code => code !== "75008")
        if (filteredCodes.length > 0) {
          setPostalCodes(filteredCodes)
          console.log("[DEBUG FILTERS] postalCodes initialisés depuis filters.postalCodes:", filteredCodes)
        }
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps


  const canSearch = postalCodes.length > 0 || !!(filters.postalCode && filters.postalCode.trim() !== "")

  // Charger les filtres sauvegardés depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sacimo_saved_filters")
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved))
      } catch (e) {
        console.error("Erreur lors du chargement des filtres sauvegardés:", e)
      }
    }
  }, [])

  // Charger l'historique des recherches depuis localStorage
  useEffect(() => {
    const history = localStorage.getItem("sacimo_search_history")
    if (history) {
      try {
        const parsed = JSON.parse(history)
        // Garder seulement les 10 dernières recherches
        setSearchHistory(parsed.slice(0, 10))
      } catch (e) {
        console.error("Erreur lors du chargement de l'historique:", e)
      }
    }
  }, [])

  // Charger l'historique des recherches depuis localStorage
  useEffect(() => {
    const history = localStorage.getItem("sacimo_search_history")
    if (history) {
      try {
        setSearchHistory(JSON.parse(history))
      } catch (e) {
        console.error("Erreur lors du chargement de l'historique:", e)
      }
    }
  }, [])

  // Sauvegarder un filtre
  const saveFilter = () => {
    if (!filterName.trim()) return

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName.trim(),
      filters: { 
        ...filters,
        // Inclure les sources sélectionnées dans le filtre sauvegardé
        sources: selectedSources.length > 0 ? selectedSources : undefined
      },
      createdAt: new Date().toISOString(),
    }

    const updated = [...savedFilters, newFilter]
    setSavedFilters(updated)
    localStorage.setItem("sacimo_saved_filters", JSON.stringify(updated))
    setFilterName("")
    setShowSaveDialog(false)
  }

  // Charger un filtre sauvegardé
  const loadFilter = (savedFilter: SavedFilter) => {
    // Ne pas charger la ville depuis les filtres sauvegardés si elle est "Paris" (valeur par défaut indésirable)
    const filtersToLoad = { ...savedFilter.filters }
    if (filtersToLoad.city === "Paris" || filtersToLoad.city === "paris") {
      delete filtersToLoad.city // Supprimer la ville si c'est "Paris"
    }
    // Ne pas charger 75008 depuis les filtres sauvegardés (valeur par défaut indésirable)
    if (filtersToLoad.postalCode === "75008") {
      delete filtersToLoad.postalCode
    }
    if (filtersToLoad.postalCodes && Array.isArray(filtersToLoad.postalCodes)) {
      filtersToLoad.postalCodes = filtersToLoad.postalCodes.filter(code => code !== "75008")
      if (filtersToLoad.postalCodes.length === 0) {
        delete filtersToLoad.postalCodes
      }
    }
    setFilters(filtersToLoad)
    // Initialiser postalCodes si présent dans les filtres (en excluant 75008)
    if (savedFilter.filters.postalCodes && Array.isArray(savedFilter.filters.postalCodes)) {
      const filteredCodes = savedFilter.filters.postalCodes.filter(code => code !== "75008")
      setPostalCodes(filteredCodes)
    } else if (savedFilter.filters.postalCode && savedFilter.filters.postalCode !== "75008") {
      setPostalCodes([savedFilter.filters.postalCode])
    } else {
      setPostalCodes([])
    }
    // Restaurer les sources sélectionnées si présentes dans le filtre sauvegardé
    if (savedFilter.filters.sources && Array.isArray(savedFilter.filters.sources)) {
      setSelectedSources(savedFilter.filters.sources)
    } else {
      setSelectedSources([]) // Réinitialiser si pas de sources dans le filtre sauvegardé
    }
    setShowSavedFilters(false)
  }

  // Supprimer un filtre sauvegardé
  const deleteFilter = (id: string) => {
    const updated = savedFilters.filter(f => f.id !== id)
    setSavedFilters(updated)
    localStorage.setItem("sacimo_saved_filters", JSON.stringify(updated))
  }

  // Réappliquer une recherche depuis l'historique
  const replaySearch = (historyEntry: SearchHistory) => {
    // Ne pas charger la ville depuis l'historique si elle est "Paris" (valeur par défaut indésirable)
    const filtersToLoad = { ...historyEntry.filters }
    if (filtersToLoad.city === "Paris" || filtersToLoad.city === "paris") {
      delete filtersToLoad.city // Supprimer la ville si c'est "Paris"
    }
    // Ne pas charger 75008 depuis l'historique (valeur par défaut indésirable)
    if (filtersToLoad.postalCode === "75008") {
      delete filtersToLoad.postalCode
    }
    if (filtersToLoad.postalCodes && Array.isArray(filtersToLoad.postalCodes)) {
      filtersToLoad.postalCodes = filtersToLoad.postalCodes.filter(code => code !== "75008")
      if (filtersToLoad.postalCodes.length === 0) {
        delete filtersToLoad.postalCodes
      }
    }
    setFilters(filtersToLoad)
    // Mettre à jour postalCodes aussi (en excluant 75008)
    if (historyEntry.filters.postalCodes && Array.isArray(historyEntry.filters.postalCodes)) {
      const filteredCodes = historyEntry.filters.postalCodes.filter(code => code !== "75008")
      setPostalCodes(filteredCodes)
    } else if (historyEntry.filters.postalCode && historyEntry.filters.postalCode !== "75008") {
      setPostalCodes([historyEntry.filters.postalCode])
    } else {
      setPostalCodes([])
    }
    // Déclencher automatiquement la recherche
    setTimeout(() => {
      handleSearch()
    }, 100)
  }

  // Supprimer une entrée de l'historique
  const deleteHistoryEntry = (id: string) => {
    const updated = searchHistory.filter(h => h.id !== id)
    setSearchHistory(updated)
    localStorage.setItem("sacimo_search_history", JSON.stringify(updated))
    // Réinitialiser la page si nécessaire
    const newTotalPages = Math.ceil(updated.length / historyItemsPerPage)
    if (historyPage > newTotalPages && newTotalPages > 0) {
      setHistoryPage(newTotalPages)
    }
  }

  // Vider l'historique
  const clearHistory = () => {
    setSearchHistory([])
    setHistoryPage(1)
    localStorage.removeItem("sacimo_search_history")
  }

  // Appliquer le filtre par état EN LOCAL (ne jamais envoyer à l'API)
  let listingsAfterStateFilter = results
  if (filters.state && filters.state.length > 0) {
    listingsAfterStateFilter = filterByState(results, filters.state)
  }

  // Filtrer les résultats côté client selon sellerType (dateRange géré par adsEngine)
  // NOTE: Le filtre agence est maintenant appliqué côté serveur dans runPigeSearch
  // APRÈS la pagination complète (1-10 pages) et APRÈS le tri
  const allFilteredListings = listingsAfterStateFilter.filter((listing) => {

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

    // Filtre par date (géré par adsEngine, pas besoin de filtrer ici côté client)
    // Le filtrage par dateRange est maintenant géré dans adsEngine.ts

    // Filtre par critères (balcon, terrasse, etc.) - recherche dans la description
    if (filters.criteria && filters.criteria.length > 0 && listing.description) {
      const descriptionLower = listing.description.toLowerCase()
      const hasAllCriteria = filters.criteria.every(criterion => {
        const criterionLower = criterion.toLowerCase()
        return descriptionLower.includes(criterionLower)
      })
      if (!hasAllCriteria) return false
    }

    // Filtre par prix au m²
    if (listing.price && listing.surface && listing.surface > 0) {
      const pricePerM2 = listing.price / listing.surface
      if (filters.minPricePerM2 && pricePerM2 < filters.minPricePerM2) return false
      if (filters.maxPricePerM2 && pricePerM2 > filters.maxPricePerM2) return false
    }

    // Filtre par état (bon état, à rénover, neuf) - recherche dans la description
    if (filters.condition && filters.condition.length > 0 && listing.description) {
      const descriptionLower = listing.description.toLowerCase()
      const hasAnyCondition = filters.condition.some(cond => {
        const condLower = cond.toLowerCase()
        return descriptionLower.includes(condLower)
      })
      if (!hasAnyCondition) return false
    }

    // Filtre par chambres (utilise rooms comme approximation)
    if (filters.minBedrooms && listing.rooms && listing.rooms < filters.minBedrooms) return false
    if (filters.maxBedrooms && listing.rooms && listing.rooms > filters.maxBedrooms) return false

    // Filtre par étage - recherche dans la description
    if ((filters.minFloor !== undefined || filters.maxFloor !== undefined) && listing.description) {
      const descriptionLower = listing.description.toLowerCase()
      // Chercher des patterns comme "1er étage", "2ème étage", "rez-de-chaussée", etc.
      const floorMatch = descriptionLower.match(/(\d+)(?:er|ème|e)\s*étage|rez[- ]de[- ]chaussée|rdc/i)
      if (floorMatch) {
        let floor: number | null = null
        if (descriptionLower.includes("rez-de-chaussée") || descriptionLower.includes("rdc")) {
          floor = 0
        } else {
          const floorNum = parseInt(floorMatch[1])
          if (!isNaN(floorNum)) floor = floorNum
        }
        if (floor !== null) {
          if (filters.minFloor !== undefined && floor < filters.minFloor) return false
          if (filters.maxFloor !== undefined && floor > filters.maxFloor) return false
        }
      } else {
        // Si on cherche un étage spécifique et qu'on ne le trouve pas, on exclut
        // (optionnel : on peut aussi garder les annonces sans info d'étage)
      }
    }

    // Filtre par type de bien (nouveau filtre simple)
    if (filters.bienType && filters.bienType !== "all" && (listing.title || listing.description)) {
      const text = `${listing.title || ""} ${listing.description || ""}`.toLowerCase()
      const bienTypeLower = filters.bienType.toLowerCase()
      if (!text.includes(bienTypeLower)) return false
    }

    // Filtre par type de bien (ancien filtre multi-sélection) - recherche dans le titre et la description
    if (filters.propertyType && filters.propertyType.length > 0 && (listing.title || listing.description)) {
      const text = `${listing.title || ""} ${listing.description || ""}`.toLowerCase()
      const hasAnyType = filters.propertyType.some(type => {
        const typeLower = type.toLowerCase()
        return text.includes(typeLower)
      })
      if (!hasAnyType) return false
    }

    // Filtre meublé/non meublé - recherche dans la description
    if (filters.furnished && filters.furnished !== "all" && listing.description) {
      const descriptionLower = listing.description.toLowerCase()
      const isFurnished = descriptionLower.includes("meublé") || descriptionLower.includes("meuble") || descriptionLower.includes("furnished")
      if (filters.furnished === "furnished" && !isFurnished) return false
      if (filters.furnished === "unfurnished" && isFurnished) return false
    }

    // Filtre par orientation - recherche dans la description
    if (filters.orientation && filters.orientation.length > 0 && listing.description) {
      const descriptionLower = listing.description.toLowerCase()
      const hasAnyOrientation = filters.orientation.some(orient => {
        const orientLower = orient.toLowerCase()
        return descriptionLower.includes(orientLower)
      })
      if (!hasAnyOrientation) return false
    }

    return true
  })

  // Pagination locale : calculer les annonces à afficher pour la page actuelle
  const totalPages = Math.ceil(allFilteredListings.length / PAGE_SIZE)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE
  const filteredListings = allFilteredListings.slice(startIndex, endIndex)

  // Fonctions de navigation de pagination
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

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

  const handleSearchInternal = async (overridePostalCodes?: string[]) => {
    const userId = (session?.user as { id?: string })?.id
    
    // Utiliser les codes postaux passés en paramètre ou ceux de l'état
    const codesToUse = overridePostalCodes || postalCodes
    
    // Vérifier directement les codes postaux (plus fiable que canSearch qui peut être obsolète)
    const hasPostalCodes = codesToUse.length > 0 || !!(filters.postalCode && filters.postalCode.trim() !== "")
    
    console.log("🔍 [Annonces] handleSearch appelé", { 
      hasPostalCodes, 
      postalCodes: codesToUse, 
      postalCode: filters.postalCode,
      overridePostalCodes,
      userId, 
      filters, 
      selectedSources 
    })
    
    if (!hasPostalCodes) {
      console.warn("⚠️ [Annonces] Recherche impossible: pas de code postal", { postalCodes: codesToUse, postalCode: filters.postalCode })
      setError("Veuillez renseigner au moins un code postal pour lancer la recherche")
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
    setCurrentPage(1) // Réinitialiser à la page 1 lors d'une nouvelle recherche

    try {
      const cleanFilters: PigeFilters = {}
      // Ne pas envoyer la ville si elle est vide ou si elle n'est pas nécessaire
      // La ville n'est pas utilisée par l'API, seul le code postal compte
      // if (filters.city && filters.city.trim() !== "") cleanFilters.city = filters.city
      // Priorité à postalCodes (nouveau système) - utiliser les codes passés en paramètre ou ceux de l'état
      // IMPORTANT: postalCodes state est la source de vérité
      if (codesToUse.length > 0) {
        cleanFilters.postalCodes = codesToUse
        cleanFilters.postalCode = undefined // Nettoyer l'ancien champ pour éviter les conflits
      } else if (filters.postalCode) {
        // Fallback pour compatibilité
        cleanFilters.postalCode = filters.postalCode
      }
      console.log("[DEBUG FILTERS] postalCodes envoyés à l'API:", cleanFilters.postalCodes || cleanFilters.postalCode)
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
        console.log("🔍 [Annonces] Filtre de sources actif:", selectedSources)
      } else {
        console.log("✅ [Annonces] Aucun filtre de sources - toutes les sources seront affichées")
      }
      
      // Passer le filtre agence à l'API (sera appliqué APRÈS pagination complète dans runPigeSearch)
      if (agencyFilter && agencyFilter.trim().length > 0) {
        cleanFilters.agency = agencyFilter.trim()
        console.log("🔍 [Annonces] Filtre agence actif:", agencyFilter)
      }
      
      // Passer le filtre dateRange à l'API
      if (filters.dateRange && filters.dateRange !== "all") {
        cleanFilters.dateRange = filters.dateRange
        console.log("[DEBUG FRONT] dateRange envoyé à l'API :", filters.dateRange)
      }

      console.log("📤 [Annonces] Envoi requête à /api/piges/fetch", { 
        filters: cleanFilters,
        selectedSources,
        hasSourceFilter: selectedSources.length > 0,
        hasAgencyFilter: !!(agencyFilter && agencyFilter.trim().length > 0),
        dateRange: cleanFilters.dateRange
      })

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
        const listings = data.data || []
        // Analyser les sources des annonces retournées
        const sourcesCount: Record<string, number> = {}
        listings.forEach((listing: NormalizedListing) => {
          const origin = listing.origin || "inconnu"
          sourcesCount[origin] = (sourcesCount[origin] || 0) + 1
        })
        
        console.log("✅ [Annonces] Recherche réussie", { 
          total: data.meta?.total, 
          results: listings.length,
          agencyFilter: agencyFilter || "aucun",
          selectedSources,
          selectedSourcesLength: selectedSources.length,
          sourcesBreakdown: sourcesCount,
          uniqueSources: Object.keys(sourcesCount),
          samplePublishers: listings.slice(0, 5).map((l: NormalizedListing) => l.publisher).filter(Boolean),
          sampleOrigins: listings.slice(0, 10).map((l: NormalizedListing) => l.origin).filter(Boolean)
        })
        
        // Avertir si un filtre de sources est actif mais qu'on ne voit qu'une seule source
        if (selectedSources.length > 0) {
          console.warn("⚠️ [Annonces] Filtre de sources actif:", selectedSources)
        } else if (Object.keys(sourcesCount).length === 1) {
          const onlySource = Object.keys(sourcesCount)[0]
          console.warn(`⚠️ [Annonces] PROBLÈME: Aucun filtre de sources actif mais une seule source détectée: "${onlySource}" (${sourcesCount[onlySource]} annonces)`)
          console.warn("⚠️ [Annonces] Cela peut indiquer que Hubimo ne retourne que cette source pour cette recherche, ou qu'un filtre est appliqué ailleurs.")
        }
        
        // NOTE: Le filtre agence est maintenant appliqué côté serveur dans runPigeSearch
        // APRÈS la pagination complète (1-10 pages) et APRÈS le tri
        // Les résultats retournés sont déjà filtrés par agence si agencyFilter est défini
        setResults(listings)
        setMeta(data.meta || { total: listings.length || 0, pages: 1, hasMore: false })
        
        // Enregistrer dans l'historique
        const historyEntry: SearchHistory = {
          id: Date.now().toString(),
          filters: { ...filters, postalCodes: postalCodes.length > 0 ? postalCodes : undefined },
          resultsCount: data.meta?.total || data.data?.length || 0,
          searchedAt: new Date().toISOString(),
          postalCode: postalCodes.length > 0 ? postalCodes.join(", ") : filters.postalCode,
          city: filters.city,
        }
        
        const updatedHistory = [historyEntry, ...searchHistory].slice(0, 10) // Garder seulement les 10 dernières
        setSearchHistory(updatedHistory)
        localStorage.setItem("sacimo_search_history", JSON.stringify(updatedHistory))
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
  
  // Wrapper pour les appels depuis les boutons (sans paramètre)
  const handleSearch = () => {
    return handleSearchInternal()
  }
  
  // Mettre à jour la ref quand handleSearch change
  useEffect(() => {
    handleSearchRef.current = handleSearchInternal
  }, [handleSearchInternal])

  // Lancer automatiquement la recherche si agency et postalCodes sont présents (fallback pour autres cas)
  useEffect(() => {
    // Vérifier que la session est chargée
    if (!session?.user) {
      return
    }
    
    // Ne pas lancer si déjà en cours de chargement
    if (loading) {
      return
    }
    
    // Ne pas relancer si déjà déclenché
    if (autoSearchTriggered) {
      return
    }
    
    // Vérifier si les paramètres viennent de l'URL (déjà géré dans le useEffect précédent)
    const agencyParam = searchParams.get('agency')
    const postalCodesParam = searchParams.get('postalCodes')
    
    // Si les paramètres viennent de l'URL, ne pas relancer ici (déjà géré)
    if (agencyParam && postalCodesParam) {
      return
    }
    
    // Sinon, lancer si les conditions sont remplies (pour les autres cas, sans paramètres URL)
    const hasAgency = agencyFilter && agencyFilter.trim().length > 0
    const hasPostalCodes = postalCodes.length > 0
    
    if (hasAgency && hasPostalCodes) {
      console.log("🚀 [Annonces] Conditions remplies (sans paramètres URL), lancement de la recherche automatique", { 
        agencyFilter, 
        postalCodes,
        sessionUser: !!session?.user 
      })
      setAutoSearchTriggered(true)
      
      const timer = setTimeout(() => {
        console.log("🔍 [Annonces] Recherche automatique déclenchée (sans paramètres URL)", { agencyFilter, postalCodes })
        handleSearch()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [agencyFilter, postalCodes.length, session?.user, autoSearchTriggered, loading, searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  // Autocomplete pour les villes avec debounce
  useEffect(() => {
    if (!cityQuery || cityQuery.trim().length < 2) {
      setCitySuggestions([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geo/autocomplete?q=${encodeURIComponent(cityQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setCitySuggestions(data);
        } else {
          setCitySuggestions([]);
        }
      } catch (error) {
        console.error("[AUTOCOMPLETE] Erreur lors de la récupération des suggestions:", error);
        setCitySuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [cityQuery]);

  // Fonction pour gérer la sélection d'une ville
  const handleCitySelect = (item: { city: string; postalCode: string }) => {
    setFilters({ ...filters, city: item.city });
    setCityQuery(item.city);
    setCitySuggestions([]); // Fermer les suggestions

    // Ajouter automatiquement le CP en tag
    setPostalCodes([item.postalCode]);
    setFilters({ 
      ...filters, 
      city: item.city,
      postalCodes: [item.postalCode],
      postalCode: undefined 
    });

    console.log("[DEBUG] Ville sélectionnée :", item);
    console.log("[DEBUG] CP ajouté :", item.postalCode);
  };

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

  // Extraire le téléphone depuis la description
  const extractPhone = (text: string | undefined): string | null => {
    if (!text) return null
    // Formats français : 06 12 34 56 78, 0612345678, 01 23 45 67 89, +33 6 12 34 56 78, etc.
    const phoneRegex = /(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4}/g
    const matches = text.match(phoneRegex)
    if (matches && matches.length > 0) {
      // Prendre le premier numéro trouvé et le formater
      let phone = matches[0].replace(/[\s.-]/g, '')
      if (phone.startsWith('+33')) {
        phone = '0' + phone.substring(3)
      }
      // Formater en 06 12 34 56 78
      if (phone.length === 10) {
        return `${phone.substring(0, 2)} ${phone.substring(2, 4)} ${phone.substring(4, 6)} ${phone.substring(6, 8)} ${phone.substring(8, 10)}`
      }
      return phone
    }
            return null
          }

  // Extraire l'email depuis la description
  const extractEmail = (text: string | undefined): string | null => {
    if (!text) return null
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const matches = text.match(emailRegex)
    if (matches && matches.length > 0) {
      return matches[0]
    }
            return null
          }

  // Extraire le nom du vendeur/agence depuis la description
  const extractSellerName = (listing: NormalizedListing): string | null => {
    // D'abord utiliser le publisher si disponible
    if (listing.publisher) return listing.publisher
    
    // Sinon, chercher dans la description
    if (listing.description) {
      // Chercher des patterns comme "EXCLUSIVITE [NOM]", "Agence [NOM]", etc.
      const exclusivityMatch = listing.description.match(/EXCLUSIVIT[ÉE]\s+([A-Z][A-Za-z\s]+)/i)
      if (exclusivityMatch) return exclusivityMatch[1].trim()
      
      const agenceMatch = listing.description.match(/[Aa]gence\s+([A-Z][A-Za-z\s]+)/i)
      if (agenceMatch) return agenceMatch[1].trim()
      
      const contactMatch = listing.description.match(/Contact[:\s]+([A-Z][A-Za-z\s]+)/i)
      if (contactMatch) return contactMatch[1].trim()
    }
    
    return null
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
                <span>Recherche en temps réel via Hubimo</span>
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
            <div className="flex items-center gap-3">
              {/* Bouton pour afficher les filtres sauvegardés */}
              {savedFilters.length > 0 && (
                <Dialog open={showSavedFilters} onOpenChange={setShowSavedFilters}>
                  <DialogTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-primary-200 rounded-lg text-sm font-medium text-primary-700 hover:bg-primary-50 transition-all"
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>Filtres sauvegardés ({savedFilters.length})</span>
                    </motion.button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Filtres sauvegardés</DialogTitle>
                      <DialogDescription>
                        Cliquez sur un filtre pour l'appliquer en 1 clic
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
                      {savedFilters.map((savedFilter) => (
                        <motion.div
                          key={savedFilter.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">{savedFilter.name}</h4>
                              <span className="text-xs text-gray-500">
                                {new Date(savedFilter.createdAt).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {savedFilter.filters.city && (
                                <Badge variant="outline" className="text-xs">{savedFilter.filters.city}</Badge>
                              )}
                              {savedFilter.filters.postalCodes && savedFilter.filters.postalCodes.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {savedFilter.filters.postalCodes.length > 1 
                                    ? `${savedFilter.filters.postalCodes.length} CP` 
                                    : savedFilter.filters.postalCodes[0]}
                                </Badge>
                              )}
                              {!savedFilter.filters.postalCodes && savedFilter.filters.postalCode && (
                                <Badge variant="outline" className="text-xs">{savedFilter.filters.postalCode}</Badge>
                              )}
                              {savedFilter.filters.minPrice && (
                                <Badge variant="outline" className="text-xs">Prix min: {savedFilter.filters.minPrice}€</Badge>
                              )}
                              {savedFilter.filters.maxPrice && (
                                <Badge variant="outline" className="text-xs">Prix max: {savedFilter.filters.maxPrice}€</Badge>
                              )}
                              {savedFilter.filters.sellerType && savedFilter.filters.sellerType !== "all" && (
                                <Badge variant="outline" className="text-xs">
                                  {savedFilter.filters.sellerType === "pro" ? "Pro" : "Particulier"}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
            <Button 
              size="sm"
                              onClick={() => loadFilter(savedFilter)}
                              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
                              <Zap className="w-4 h-4 mr-1" />
                              Appliquer
            </Button>
            <Button 
              size="sm"
                              variant="outline"
                              onClick={() => deleteFilter(savedFilter.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              {/* Bouton pour sauvegarder les filtres actuels */}
              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Sauvegarder</span>
                  </motion.button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sauvegarder les critères de recherche</DialogTitle>
                    <DialogDescription>
                      Donnez un nom à ces critères pour les réutiliser facilement
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor="filterName">Nom du filtre</Label>
                      <Input
                        id="filterName"
                        placeholder="Ex: Appartements Paris 2P < 500k€"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && filterName.trim()) {
                            saveFilter()
                          }
                        }}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                        Annuler
            </Button>
            <Button 
                        onClick={saveFilter}
                        disabled={!filterName.trim()}
                        className="bg-primary-600 hover:bg-primary-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Sauvegarder
            </Button>
          </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Badge className="px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100 rounded-full border border-primary-200">
                <Sparkles className="w-4 h-4 text-primary-600 mr-2" strokeWidth={1.5} />
                <span className="text-sm font-medium text-primary-700">Powered by Hubimo</span>
                </Badge>
            </div>
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
          <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 shadow-xl rounded-3xl overflow-visible">
            <CardContent className="p-6 overflow-visible">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* City */}
                <div>
                  <Label htmlFor="city" className="block text-xs font-semibold text-gray-700 mb-2">
                    Ville
                  </Label>
                  <div className="relative">
                    <Input
                      id="city"
                      placeholder="Ville (optionnel)"
                      value={cityQuery || filters.city || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCityQuery(value);
                        // Mettre à jour aussi filters.city pour la synchronisation
                        setFilters({ ...filters, city: value.trim() === "" ? undefined : value });
                      }}
                      onBlur={() => {
                        // Fermer les suggestions après un court délai pour permettre le clic
                        setTimeout(() => setCitySuggestions([]), 200);
                      }}
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm"
                    />
                    <MapPin className="absolute right-2 top-2.5 w-4 h-4 text-gray-400" strokeWidth={1.5} />
                    {/* Dropdown autocomplete */}
                    {citySuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {citySuggestions.map((item, index) => (
                          <div
                            key={`${item.city}-${item.postalCode}-${index}`}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                            onClick={() => handleCitySelect(item)}
                            onMouseDown={(e) => e.preventDefault()} // Empêcher le onBlur de fermer avant le onClick
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{item.city}</span>
                              <span className="text-xs text-gray-500 ml-2">({item.postalCode})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Postal Code - Multi-sélection */}
                <div>
                  <Label htmlFor="postalCode" className="block text-xs font-semibold text-gray-700 mb-2">
                    Code postal
                  </Label>
                  <Input
                    id="postalCode"
                    type="text"
                    placeholder="Ex: 33360"
                    value={postalInput}
                    onChange={(e) => setPostalInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        const code = postalInput.trim()
                        
                        // Validation: uniquement 5 chiffres
                        if (/^\d{5}$/.test(code)) {
                          // Mode single-CP : remplacer le tableau au lieu d'ajouter
                          // Si multi-CP est souhaité, l'utilisateur peut ajouter manuellement
                          const newCodes = [code] // Reset : un seul CP à la fois
                          setPostalCodes(newCodes)
                          // Synchronisation stricte : postalCodes state = source de vérité
                          setFilters({ ...filters, postalCodes: newCodes, postalCode: undefined })
                          console.log("[DEBUG FILTERS] postalCodes mis à jour:", newCodes)
                          setPostalInput("")
                        }
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm"
                  />
                  {/* Tags des codes postaux - Afficher uniquement ceux dans postalCodes state (source de vérité) */}
                  {postalCodes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {postalCodes.map((code) => (
                        <div
                          key={code}
                          className="flex items-center bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium border border-primary-200"
                        >
                          {code}
                  <button 
                            type="button"
                    onClick={() => {
                              const newCodes = postalCodes.filter((c) => c !== code)
                              setPostalCodes(newCodes)
                              setFilters({ 
                                ...filters, 
                                postalCodes: newCodes.length > 0 ? newCodes : undefined,
                                postalCode: undefined 
                              })
                              console.log("[DEBUG FILTERS] postalCodes après suppression:", newCodes)
                            }}
                            className="ml-2 text-primary-600 hover:text-primary-800 font-bold text-base leading-none"
                            aria-label={`Supprimer ${code}`}
                          >
                            ×
                  </button>
              </div>
                      ))}
                    </div>
                  )}
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
                
                {/* Date Filter et Filtres optionnels - Sur la même ligne */}
                <div className="mt-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Date Filter */}
                  <div className="flex-1">
                    <Label className="block text-xs font-semibold text-gray-700 mb-2">Date de publication</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "all", label: "Toutes" },
                        { id: "5d", label: "< 5 jours" },
                        { id: "10d", label: "< 10 jours" },
                        { id: "15d", label: "< 15 jours" },
                        { id: "30d", label: "< 30 jours" },
                      ].map((option) => (
                        <motion.button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            const newDateRange = option.id as "5d" | "10d" | "15d" | "30d" | "all";
                            setFilters({ ...filters, dateRange: newDateRange });
                            console.log("[DEBUG FRONT] dateRange sélectionné :", newDateRange);
                          }}
                          className={`px-3 py-1.5 rounded-lg border-2 transition-all duration-300 text-xs font-medium ${
                            filters.dateRange === option.id
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
              
                  {/* Filtre Agence */}
                  <div className="flex-1">
                    <Label className="block text-xs font-semibold text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Agence immobilière
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Filtrer par nom d'agence..."
                        value={agencyFilter || ""}
                        onChange={(e) => {
                          const value = e.target.value.trim()
                          setAgencyFilter(value || null)
                          // Mettre à jour l'URL
                          const params = new URLSearchParams(window.location.search)
                          if (value) {
                            params.set('agency', value)
                          } else {
                            params.delete('agency')
                          }
                          window.history.replaceState({}, '', `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`)
                        }}
                        className="w-full border-gray-200 focus:border-primary-500 focus:ring-primary-500"
                      />
                      {agencyFilter && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                          onClick={() => {
                            setAgencyFilter(null)
                            const params = new URLSearchParams(window.location.search)
                            params.delete('agency')
                            window.history.replaceState({}, '', `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`)
                          }}
                        >
                          <X className="w-3 h-3 text-gray-500" />
                  </Button>
                      )}
                </div>
              </div>
                </div>
                
                {/* Filtres optionnels - Menus déroulants compacts */}
                <div className="mt-4">
                  <div className="flex-1">
                    <Label className="block text-xs font-semibold text-gray-700 mb-2">Filtres optionnels</Label>
                    <div className="grid grid-cols-5 gap-y-1 gap-x-0 relative">
                    {/* Type de bien - Premier filtre */}
                    <Collapsible
                      open={openFilters.bienType}
                      onOpenChange={(open) => setOpenFilters({ ...openFilters, bienType: open })}
                    >
                      <div className="relative z-10">
                        <CollapsibleTrigger className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-sm font-medium text-gray-700 min-w-[100px]">
                          <span>Bien</span>
                          {filters.bienType && filters.bienType !== "all" && (
                            <span className="px-1.5 py-0.5 bg-primary-600 text-white rounded-full text-xs font-semibold">
                              1
                            </span>
                          )}
                          {openFilters.bienType ? (
                            <ChevronUp className="w-4 h-4 text-gray-500 ml-auto" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="absolute z-50 mt-1 left-0 p-4 bg-white rounded-lg border-2 border-gray-200 shadow-xl min-w-[200px] max-h-[300px] overflow-y-auto">
                          <div className="flex flex-col gap-2">
                            {[
                              { id: "all", label: "Tous" },
                              { id: "appartement", label: "Appartement" },
                              { id: "maison", label: "Maison" },
                              { id: "terrain", label: "Terrain" },
                            ].map((option) => (
                              <motion.label
                                key={option.id}
                                className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <input
                                  type="radio"
                                  name="bienType"
                                  checked={filters.bienType === option.id || (!filters.bienType && option.id === "all")}
                                  onChange={() => setFilters({ ...filters, bienType: option.id as "appartement" | "maison" | "terrain" | "all" })}
                                  className="w-4 h-4 border-2 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 mr-2"
                                />
                                <span className="text-sm text-gray-700">{option.label}</span>
                              </motion.label>
                            ))}
              </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>

                    {/* Critères (balcon, terrasse, etc.) */}
                    <Collapsible
                      open={openFilters.criteria}
                      onOpenChange={(open) => setOpenFilters({ ...openFilters, criteria: open })}
                    >
                      <div className="relative">
                        <CollapsibleTrigger className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-sm font-medium text-gray-700 min-w-[100px]">
                          <span>Critères</span>
                          {filters.criteria && filters.criteria.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-primary-600 text-white rounded-full text-xs font-semibold">
                              {filters.criteria.length}
                            </span>
                          )}
                          {openFilters.criteria ? (
                            <ChevronUp className="w-4 h-4 text-gray-500 ml-auto" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="absolute z-50 mt-1 right-0 p-4 bg-white rounded-lg border-2 border-gray-200 shadow-xl max-w-md min-w-[280px]">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                            {[
                              { id: "balcon", label: "Balcon" },
                              { id: "terrasse", label: "Terrasse" },
                              { id: "jardin", label: "Jardin" },
                              { id: "parking", label: "Parking" },
                              { id: "cave", label: "Cave" },
                              { id: "ascenseur", label: "Ascenseur" },
                              { id: "piscine", label: "Piscine" },
                              { id: "cheminee", label: "Cheminée" },
                              { id: "alarme", label: "Alarme" },
                            ].map((criterion) => (
                              <motion.label
                                key={criterion.id}
                                className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <input
                                  type="checkbox"
                                  checked={filters.criteria?.includes(criterion.id) || false}
                                  onChange={(e) => {
                                    const currentCriteria = filters.criteria || []
                                    if (e.target.checked) {
                                      setFilters({ ...filters, criteria: [...currentCriteria, criterion.id] })
                                    } else {
                                      setFilters({ ...filters, criteria: currentCriteria.filter(c => c !== criterion.id) })
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-2 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 mr-2"
                                />
                                <span className="text-sm text-gray-700">{criterion.label}</span>
                              </motion.label>
                            ))}
                </div>
                        </CollapsibleContent>
              </div>
                    </Collapsible>

                    {/* Prix au m² */}
                    <Collapsible
                      open={openFilters.priceM2}
                      onOpenChange={(open) => setOpenFilters({ ...openFilters, priceM2: open })}
                    >
                      <div className="relative">
                        <CollapsibleTrigger className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-sm font-medium text-gray-700 min-w-[100px]">
                          <span>Prix/m²</span>
                          {openFilters.priceM2 ? (
                            <ChevronUp className="w-4 h-4 text-gray-500 ml-auto" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="absolute z-50 mt-1 right-0 p-4 bg-white rounded-lg border-2 border-gray-200 shadow-xl min-w-[280px]">
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Min €/m²"
                              value={filters.minPricePerM2 || ""}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  minPricePerM2: e.target.value ? Number(e.target.value) : undefined,
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm"
                            />
                            <Input
                              type="number"
                              placeholder="Max €/m²"
                              value={filters.maxPricePerM2 || ""}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  maxPricePerM2: e.target.value ? Number(e.target.value) : undefined,
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm"
                            />
              </div>
                        </CollapsibleContent>
              </div>
                    </Collapsible>

                    {/* État du bien */}
                    <Collapsible
                      open={openFilters.state}
                      onOpenChange={(open) => setOpenFilters({ ...openFilters, state: open })}
                    >
                      <div className="relative">
                        <CollapsibleTrigger className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-sm font-medium text-gray-700 min-w-[100px]">
                          <span>État</span>
                          {filters.state && filters.state.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-primary-600 text-white rounded-full text-xs font-semibold">
                              {filters.state.length}
                            </span>
                          )}
                          {openFilters.state ? (
                            <ChevronUp className="w-4 h-4 text-gray-500 ml-auto" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="absolute z-50 mt-1 right-0 p-4 bg-white rounded-lg border-2 border-gray-200 shadow-xl max-w-md min-w-[280px]">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                            {[
                              { id: "neuf", label: "Neuf" },
                              { id: "ancien", label: "Ancien" },
                              { id: "recent", label: "Récent" },
                              { id: "vefa", label: "VEFA" },
                              { id: "travaux", label: "Travaux" },
                            ].map((state) => (
                              <motion.label
                                key={state.id}
                                className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <input
                                  type="checkbox"
                                  checked={filters.state?.includes(state.id) || false}
                                  onChange={(e) => {
                                    const currentState = filters.state || []
                                    if (e.target.checked) {
                                      setFilters({ ...filters, state: [...currentState, state.id] })
                                    } else {
                                      setFilters({ ...filters, state: currentState.filter(s => s !== state.id) })
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-2 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 mr-2"
                                />
                                <span className="text-sm text-gray-700">{state.label}</span>
                              </motion.label>
                            ))}
                </div>
                        </CollapsibleContent>
              </div>
                    </Collapsible>

                    {/* Chambres */}
                    <Collapsible
                      open={openFilters.bedrooms}
                      onOpenChange={(open) => setOpenFilters({ ...openFilters, bedrooms: open })}
                    >
                      <div className="relative">
                        <CollapsibleTrigger className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-sm font-medium text-gray-700 min-w-[100px]">
                          <span>Chambres</span>
                          {openFilters.bedrooms ? (
                            <ChevronUp className="w-4 h-4 text-gray-500 ml-auto" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="absolute z-50 mt-1 right-0 p-4 bg-white rounded-lg border-2 border-gray-200 shadow-xl min-w-[280px]">
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Min"
                              value={filters.minBedrooms || ""}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  minBedrooms: e.target.value ? Number(e.target.value) : undefined,
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm"
                            />
                            <Input
                              type="number"
                              placeholder="Max"
                              value={filters.maxBedrooms || ""}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  maxBedrooms: e.target.value ? Number(e.target.value) : undefined,
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm"
                            />
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>

                    {/* Étage */}
                    <Collapsible
                      open={openFilters.floor}
                      onOpenChange={(open) => setOpenFilters({ ...openFilters, floor: open })}
                    >
                      <div className="relative">
                        <CollapsibleTrigger className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-sm font-medium text-gray-700 min-w-[100px]">
                          <span>Étage</span>
                          {openFilters.floor ? (
                            <ChevronUp className="w-4 h-4 text-gray-500 ml-auto" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="absolute z-50 mt-1 right-0 p-4 bg-white rounded-lg border-2 border-gray-200 shadow-xl min-w-[280px]">
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Min"
                              value={filters.minFloor || ""}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  minFloor: e.target.value ? Number(e.target.value) : undefined,
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm"
                            />
                            <Input
                              type="number"
                              placeholder="Max"
                              value={filters.maxFloor || ""}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  maxFloor: e.target.value ? Number(e.target.value) : undefined,
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm"
                            />
                      </div>
                        </CollapsibleContent>
                    </div>
                    </Collapsible>

                    {/* Type de bien */}
                    <Collapsible
                      open={openFilters.propertyType}
                      onOpenChange={(open) => setOpenFilters({ ...openFilters, propertyType: open })}
                    >
                      <div className="relative">
                        <CollapsibleTrigger className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-sm font-medium text-gray-700 min-w-[100px]">
                          <span>Type</span>
                          {filters.propertyType && filters.propertyType.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-primary-600 text-white rounded-full text-xs font-semibold">
                              {filters.propertyType.length}
                            </span>
                          )}
                          {openFilters.propertyType ? (
                            <ChevronUp className="w-4 h-4 text-gray-500 ml-auto" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="absolute z-50 mt-1 right-0 p-4 bg-white rounded-lg border-2 border-gray-200 shadow-xl max-w-md min-w-[280px]">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                            {[
                              { id: "appartement", label: "Appartement" },
                              { id: "maison", label: "Maison" },
                              { id: "studio", label: "Studio" },
                              { id: "loft", label: "Loft" },
                              { id: "duplex", label: "Duplex" },
                              { id: "villa", label: "Villa" },
                            ].map((propType) => (
                              <motion.label
                                key={propType.id}
                                className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <input
                                  type="checkbox"
                                  checked={filters.propertyType?.includes(propType.id) || false}
                                  onChange={(e) => {
                                    const currentTypes = filters.propertyType || []
                                    if (e.target.checked) {
                                      setFilters({ ...filters, propertyType: [...currentTypes, propType.id] })
                                    } else {
                                      setFilters({ ...filters, propertyType: currentTypes.filter(t => t !== propType.id) })
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-2 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 mr-2"
                                />
                                <span className="text-sm text-gray-700">{propType.label}</span>
                              </motion.label>
                            ))}
                      </div>
                        </CollapsibleContent>
                    </div>
                    </Collapsible>

                    {/* Meublé/Non meublé */}
                    <Collapsible
                      open={openFilters.furnished}
                      onOpenChange={(open) => setOpenFilters({ ...openFilters, furnished: open })}
                    >
                      <div className="relative">
                        <CollapsibleTrigger className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-sm font-medium text-gray-700 min-w-[100px]">
                          <span>Meublé</span>
                          {filters.furnished && filters.furnished !== "all" && (
                            <span className="px-1.5 py-0.5 bg-primary-600 text-white rounded-full text-xs font-semibold">
                              {filters.furnished === "furnished" ? "Oui" : "Non"}
                            </span>
                          )}
                          {openFilters.furnished ? (
                            <ChevronUp className="w-4 h-4 text-gray-500 ml-auto" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="absolute z-50 mt-1 right-0 p-4 bg-white rounded-lg border-2 border-gray-200 shadow-xl min-w-[200px]">
                          <div className="flex flex-col gap-2">
                            {[
                              { id: "all", label: "Tous" },
                              { id: "furnished", label: "Meublé" },
                              { id: "unfurnished", label: "Non meublé" },
                            ].map((option) => (
                              <motion.label
                                key={option.id}
                                className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <input
                                  type="radio"
                                  name="furnished"
                                  checked={filters.furnished === option.id || (!filters.furnished && option.id === "all")}
                                  onChange={() => setFilters({ ...filters, furnished: option.id as "all" | "furnished" | "unfurnished" })}
                                  className="w-4 h-4 border-2 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 mr-2"
                                />
                                <span className="text-sm text-gray-700">{option.label}</span>
                              </motion.label>
                ))}
                      </div>
                        </CollapsibleContent>
                    </div>
                    </Collapsible>

                    {/* Orientation */}
                    <Collapsible
                      open={openFilters.orientation}
                      onOpenChange={(open) => setOpenFilters({ ...openFilters, orientation: open })}
                    >
                      <div className="relative">
                        <CollapsibleTrigger className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-sm font-medium text-gray-700 min-w-[100px]">
                          <span>Orientation</span>
                          {filters.orientation && filters.orientation.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-primary-600 text-white rounded-full text-xs font-semibold">
                              {filters.orientation.length}
                            </span>
                          )}
                          {openFilters.orientation ? (
                            <ChevronUp className="w-4 h-4 text-gray-500 ml-auto" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="absolute z-50 mt-1 right-0 p-4 bg-white rounded-lg border-2 border-gray-200 shadow-xl max-w-md min-w-[280px]">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                            {[
                              { id: "nord", label: "Nord" },
                              { id: "sud", label: "Sud" },
                              { id: "est", label: "Est" },
                              { id: "ouest", label: "Ouest" },
                            ].map((orient) => (
                              <motion.label
                                key={orient.id}
                                className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <input
                                  type="checkbox"
                                  checked={filters.orientation?.includes(orient.id) || false}
                                  onChange={(e) => {
                                    const currentOrientations = filters.orientation || []
                                    if (e.target.checked) {
                                      setFilters({ ...filters, orientation: [...currentOrientations, orient.id] })
                                    } else {
                                      setFilters({ ...filters, orientation: currentOrientations.filter(o => o !== orient.id) })
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-2 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 mr-2"
                                />
                                <span className="text-sm text-gray-700">{orient.label}</span>
                              </motion.label>
                            ))}
                      </div>
                        </CollapsibleContent>
                    </div>
                    </Collapsible>
                    
                    {/* Case vide pour compléter la 5e colonne de la ligne 2 */}
                    <div></div>
                    </div>
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
              </CardContent>
            </Card>
          </motion.div>

        {/* Results Area - Grid 3 columns */}
        <div className="space-y-6">
          {/* Results count */}
          {results.length > 0 && (
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                {allFilteredListings.length} annonce{allFilteredListings.length > 1 ? "s" : ""} trouvée{allFilteredListings.length > 1 ? "s" : ""}
              </h2>
              {(() => {
                // Analyser les sources uniques dans les résultats
                const uniqueSources = new Set<string>()
                results.forEach((listing: NormalizedListing) => {
                  if (listing.origin) uniqueSources.add(listing.origin)
                })
                const sourcesArray = Array.from(uniqueSources)
                
                // Avertir si une seule source est présente et qu'aucun filtre n'est actif
                if (sourcesArray.length === 1 && selectedSources.length === 0) {
                  return (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">Note :</span> Hubimo ne retourne que des annonces de <span className="font-semibold">"{sourcesArray[0]}"</span> pour cette recherche. 
                        {results.length > 0 && ` Aucun filtre de source n'est actif.`}
                        <br />
                        <span className="text-xs text-blue-700 mt-1 block">
                          💡 Hubimo est un agrégateur qui ne couvre pas nécessairement 100% des annonces disponibles directement sur chaque plateforme (LeBonCoin, SeLoger, etc.).
                        </span>
                      </p>
                    </div>
                  )
                }
                
                return null
              })()}
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
          {/* Badge filtre sources actif */}
          {selectedSources.length > 0 && (
                        <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-4 py-2 text-sm">
                <MapPin className="w-4 h-4 mr-2" />
                Filtre actif : Sources {selectedSources.join(", ")}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-auto p-0 text-blue-700 hover:text-blue-900"
                  onClick={() => setSelectedSources([])}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            </motion.div>
          )}
          {/* Badge filtre agence actif */}
          {agencyFilter && (
                        <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 px-4 py-2 text-sm">
                <User className="w-4 h-4 mr-2" />
                Filtre actif : Agence "{agencyFilter}"
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-auto p-0 text-indigo-700 hover:text-indigo-900"
                  onClick={() => {
                    setAgencyFilter(null)
                    // Nettoyer l'URL
                    const params = new URLSearchParams(window.location.search)
                    params.delete('agency')
                    window.history.replaceState({}, '', `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`)
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
                  </motion.div>
          )}

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
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-base font-semibold text-gray-900 leading-tight flex-1 line-clamp-2">
                          {listing.title}
                  </h3>
                        {listing.url && (
                          <Button 
                            variant="outline"
                            size="sm"
                            asChild
                            className="border-gray-300 hover:border-primary-500 hover:text-primary-700 text-xs h-7 flex-shrink-0"
                          >
                            <a
                              href={listing.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                              onError={(e) => console.log("Lien potentiellement non accessible depuis le navigateur")}
                            >
                              Voir
                              <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                            </a>
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2 flex-wrap">
                        <span className="font-semibold text-gray-900">
                          {formatPrice(listing.price)}
                        </span>
                        {listing.surface && <span>{listing.surface} m²</span>}
                        {listing.rooms && (
                          <span>{listing.rooms} pièce{listing.rooms > 1 ? "s" : ""}</span>
                        )}
                        {listing.bedrooms && listing.bedrooms > 0 && (
                          <span className="text-xs">{listing.bedrooms} chambre{listing.bedrooms > 1 ? "s" : ""}</span>
                        )}
                        {/* Suppression du badge category (flat/house) – affichage non souhaité */}
                        {/* {listing.category && (
                          <Badge variant="outline" className="text-xs">
                            {listing.category}
                          </Badge>
                        )} */}
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

                      <div className="pt-3 border-t border-gray-200 mt-auto space-y-2">
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500">
                            {formatDate(listing.publishedAt)}
                          </span>
                </div>
                        
                        {/* Boutons d'action */}
                        <div className="grid grid-cols-3 gap-1.5">
                      <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedListingForLocation(listing)}
                            className="text-xs h-8 border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                          >
                            <Navigation className="w-3 h-3 mr-1" />
                            Localiser
                      </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedListingForEstimation(listing)}
                            className="text-xs h-8 border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                          >
                            <Calculator className="w-3 h-3 mr-1" />
                            Estimer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedListingForContact(listing)}
                            className="text-xs h-8 border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            Contact
                          </Button>
                        </div>
                        
                        {/* Bouton Analyse rapide - Full width */}
                  <Button 
                        onClick={() => {
                            setSelectedListingForAnalysis(listing)
                            setIsAnalysisOpen(true)
                          }}
                          variant="outline"
                          className="w-full mt-2 border-2 border-primary-200 bg-primary-50 hover:bg-primary-100 text-primary-700 hover:text-primary-800 text-sm font-semibold py-2 rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                          <Brain className="w-4 h-4" />
                          Analyse rapide
                  </Button>
                      </div>
                    </CardContent>
                  </Card>
                  </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && allFilteredListings.length > 0 && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Précédent
            </Button>

            {/* Numéros de page */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 10) {
                  // Si moins de 10 pages, afficher toutes
                  pageNum = i + 1
                } else if (currentPage <= 5) {
                  // Si on est au début, afficher les 8 premières + ... + dernière
                  if (i < 8) {
                    pageNum = i + 1
                  } else if (i === 8) {
                    return <span key="ellipsis1" className="px-2 text-gray-500">...</span>
                  } else {
                    pageNum = totalPages
                  }
                } else if (currentPage >= totalPages - 4) {
                  // Si on est à la fin, afficher première + ... + 8 dernières
                  if (i === 0) {
                    pageNum = 1
                  } else if (i === 1) {
                    return <span key="ellipsis2" className="px-2 text-gray-500">...</span>
                  } else {
                    pageNum = totalPages - (9 - i)
                  }
                } else {
                  // Si on est au milieu, afficher première + ... + 5 autour de current + ... + dernière
                  if (i === 0) {
                    pageNum = 1
                  } else if (i === 1) {
                    return <span key="ellipsis3" className="px-2 text-gray-500">...</span>
                  } else if (i < 7) {
                    pageNum = currentPage - 3 + (i - 2)
                  } else if (i === 7) {
                    return <span key="ellipsis4" className="px-2 text-gray-500">...</span>
                  } else {
                    pageNum = totalPages
                  }
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className={currentPage === pageNum 
                      ? "bg-primary-600 text-white hover:bg-primary-700" 
                      : ""}
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
              disabled={currentPage === totalPages || totalPages === 0}
              className="disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivant
            </Button>

            <span className="text-sm text-gray-600 ml-4">
              Page {currentPage} / {totalPages || 1} • {allFilteredListings.length} annonce{allFilteredListings.length > 1 ? "s" : ""}
            </span>
          </div>
        )}

          {/* Aucun résultat */}
          {!loading && !error && allFilteredListings.length === 0 && (results.length === 0 || meta) && (
            <Card className="rounded-2xl border border-gray-200">
              <CardContent className="p-12 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {results.length > 0 && agencyFilter ? "Aucune annonce trouvée pour cette agence" : "Aucune annonce trouvée"}
                  </h3>
                <p className="text-sm text-gray-600">
                  {results.length > 0 && agencyFilter 
                    ? `${results.length} annonce(s) trouvée(s) mais aucune ne correspond au filtre d'agence "${agencyFilter}". Essayez de modifier le nom de l'agence.`
                    : "Aucune annonce ne correspond à tes critères de recherche."}
                </p>
                {results.length > 0 && agencyFilter && (
                      <Button 
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setAgencyFilter(null)
                      const params = new URLSearchParams(window.location.search)
                      params.delete('agency')
                      window.history.replaceState({}, '', `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`)
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Retirer le filtre d'agence
                      </Button>
                )}
              </CardContent>
            </Card>
                    )}
                  </div>

        {/* Historique des dernières recherches */}
        {searchHistory.length > 0 && (
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">Historique des recherches</CardTitle>
                    <CardDescription className="mt-1">
                      {searchHistory.length} recherche{searchHistory.length > 1 ? "s" : ""} effectuée{searchHistory.length > 1 ? "s" : ""} • {historyItemsPerPage} par page
                    </CardDescription>
                </div>
                  <Button 
                    variant="outline"
                    size="sm"
                        onClick={() => {
                      setSearchHistory([])
                      localStorage.removeItem("sacimo_search_history")
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Effacer
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Calculer la pagination
                  const totalPages = Math.ceil(searchHistory.length / historyItemsPerPage)
                  const startIndex = (historyPage - 1) * historyItemsPerPage
                  const endIndex = startIndex + historyItemsPerPage
                  const paginatedHistory = searchHistory.slice(startIndex, endIndex)
                  
                  return (
                    <div>
                      <div className="space-y-2">
                        {paginatedHistory.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all cursor-pointer group"
                      onClick={() => {
                        setFilters(entry.filters)
                        // Initialiser postalCodes si présent dans les filtres
                        // Exclure 75008 lors du chargement depuis l'historique
                        if (entry.filters.postalCodes && Array.isArray(entry.filters.postalCodes)) {
                          const filteredCodes = entry.filters.postalCodes.filter(code => code !== "75008")
                          setPostalCodes(filteredCodes)
                        } else if (entry.filters.postalCode && entry.filters.postalCode !== "75008") {
                          setPostalCodes([entry.filters.postalCode])
                        } else {
                          setPostalCodes([])
                        }
                        // Optionnel : lancer automatiquement la recherche
                        // handleSearch()
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-900">
                              {entry.city || entry.postalCode || "Recherche"}
                            </span>
                            {entry.postalCode && entry.city && (
                              <span className="text-sm text-gray-500">({entry.postalCode})</span>
                    )}
                  </div>
                          <Badge variant="outline" className="text-xs">
                            {entry.resultsCount} résultat{entry.resultsCount > 1 ? "s" : ""}
                          </Badge>
                </div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {entry.filters.types && entry.filters.types.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {entry.filters.types.join(", ")}
                            </Badge>
                          )}
                          {entry.filters.sellerType && entry.filters.sellerType !== "all" && (
                            <Badge variant="outline" className="text-xs">
                              {entry.filters.sellerType === "pro" ? "Professionnel" : "Particulier"}
                            </Badge>
                          )}
                          {entry.filters.minPrice && (
                            <Badge variant="outline" className="text-xs">
                              Min: {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(entry.filters.minPrice)}
                            </Badge>
                          )}
                          {entry.filters.maxPrice && (
                            <Badge variant="outline" className="text-xs">
                              Max: {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(entry.filters.maxPrice)}
                            </Badge>
                          )}
                          {entry.filters.minSurface && (
                            <Badge variant="outline" className="text-xs">
                              {entry.filters.minSurface}m² min
                            </Badge>
                          )}
                          {entry.filters.dateRange && entry.filters.dateRange !== "all" && (
                            <Badge variant="outline" className="text-xs">
                              {entry.filters.dateRange === "5d" ? "< 5 jours" : entry.filters.dateRange === "10d" ? "< 10 jours" : entry.filters.dateRange === "15d" ? "< 15 jours" : "< 30 jours"}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {new Date(entry.searchedAt).toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Exclure 75008 lors du chargement depuis l'historique
                            const filtersToLoad = { ...entry.filters }
                            if (filtersToLoad.postalCode === "75008") {
                              delete filtersToLoad.postalCode
                            }
                            if (filtersToLoad.postalCodes && Array.isArray(filtersToLoad.postalCodes)) {
                              filtersToLoad.postalCodes = filtersToLoad.postalCodes.filter(code => code !== "75008")
                              if (filtersToLoad.postalCodes.length === 0) {
                                delete filtersToLoad.postalCodes
                              }
                            }
                            setFilters(filtersToLoad)
                            // Initialiser postalCodes si présent dans les filtres (en excluant 75008)
                            if (entry.filters.postalCodes && Array.isArray(entry.filters.postalCodes)) {
                              const filteredCodes = entry.filters.postalCodes.filter(code => code !== "75008")
                              setPostalCodes(filteredCodes)
                            } else if (entry.filters.postalCode && entry.filters.postalCode !== "75008") {
                              setPostalCodes([entry.filters.postalCode])
                            } else {
                              setPostalCodes([])
                            }
                            handleSearch()
                          }}
                          className="bg-primary-50 hover:bg-primary-100 text-primary-700 border-primary-200"
                        >
                          <Zap className="w-4 h-4 mr-1" />
                          Relancer
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            const updated = searchHistory.filter(h => h.id !== entry.id)
                            setSearchHistory(updated)
                            localStorage.setItem("sacimo_search_history", JSON.stringify(updated))
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                        ))}
                      </div>
                      
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                          <div className="text-sm text-gray-600">
                            Page {historyPage} sur {totalPages}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                              disabled={historyPage === 1}
                              className="disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Précédent
                            </Button>
                            
                            {/* Numéros de page */}
                            <div className="flex items-center gap-1">
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <Button
                                  key={pageNum}
                                  variant={historyPage === pageNum ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setHistoryPage(pageNum)}
                                  className={historyPage === pageNum 
                                    ? "bg-primary-600 text-white hover:bg-primary-700" 
                                    : ""}
                                >
                                  {pageNum}
                                </Button>
                              ))}
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setHistoryPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={historyPage === totalPages}
                              className="disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Suivant
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Dialog Localiser */}
        <Dialog open={!!selectedListingForLocation} onOpenChange={(open) => !open && setSelectedListingForLocation(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Localiser le bien</DialogTitle>
              <DialogDescription>
                {selectedListingForLocation?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  <span className="font-semibold">Adresse</span>
                </div>
                <p className="text-sm text-gray-700">
                  {selectedListingForLocation?.city}
                  {selectedListingForLocation?.postalCode && ` (${selectedListingForLocation.postalCode})`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const address = `${selectedListingForLocation?.city} ${selectedListingForLocation?.postalCode || ""}`.trim()
                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank")
                  }}
                  className="flex-1 bg-primary-600 hover:bg-primary-700"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Ouvrir dans Google Maps
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.location.href = `/app/localisation?address=${encodeURIComponent(`${selectedListingForLocation?.city} ${selectedListingForLocation?.postalCode || ""}`.trim())}`
                  }}
                  className="flex-1"
                >
                  Localisation IA
                </Button>
                  </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog Estimer */}
        <Dialog open={!!selectedListingForEstimation} onOpenChange={(open) => !open && setSelectedListingForEstimation(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Estimer le bien</DialogTitle>
              <DialogDescription>
                Obtenez une estimation précise basée sur les données du marché
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  <span className="font-semibold">Localisation</span>
                </div>
                <p className="text-sm text-gray-700">
                  {selectedListingForEstimation?.city}
                  {selectedListingForEstimation?.postalCode && ` (${selectedListingForEstimation.postalCode})`}
                </p>
                {selectedListingForEstimation?.surface && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Surface:</span>
                    <span className="text-sm text-gray-700">{selectedListingForEstimation.surface} m²</span>
                  </div>
                )}
                {selectedListingForEstimation?.rooms && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Pièces:</span>
                    <span className="text-sm text-gray-700">{selectedListingForEstimation.rooms}</span>
        </div>
                )}
                {selectedListingForEstimation?.price && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Prix annoncé:</span>
                    <span className="text-sm text-gray-700">{formatPrice(selectedListingForEstimation.price)}</span>
                  </div>
                )}
              </div>
              <Button
                onClick={() => {
                  const params = new URLSearchParams()
                  if (selectedListingForEstimation?.city) params.set("city", selectedListingForEstimation.city)
                  if (selectedListingForEstimation?.postalCode) params.set("postalCode", selectedListingForEstimation.postalCode)
                  if (selectedListingForEstimation?.surface) params.set("surface", selectedListingForEstimation.surface.toString())
                  if (selectedListingForEstimation?.rooms) params.set("rooms", selectedListingForEstimation.rooms.toString())
                  window.location.href = `/app/estimation?${params.toString()}`
                }}
                className="w-full bg-primary-600 hover:bg-primary-700"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Aller à la page d'estimation
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog Coordonnées */}
        <Dialog open={!!selectedListingForContact} onOpenChange={(open) => !open && setSelectedListingForContact(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Coordonnées {selectedListingForContact?.isPro ? "de l'agence" : "du propriétaire"}</DialogTitle>
              <DialogDescription>
                {selectedListingForContact?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              {selectedListingForContact && (() => {
                const sellerName = extractSellerName(selectedListingForContact)
                const phone = extractPhone(selectedListingForContact.description)
                const email = extractEmail(selectedListingForContact.description)
                
  return (
                  <>
                    {/* Nom du vendeur/agence */}
                    {sellerName && (
                      <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary-600" />
                          <span className="font-semibold">{sellerName}</span>
                          {selectedListingForContact?.isPro && (
                            <Badge className="bg-primary-100 text-primary-700 text-xs">Professionnel</Badge>
                          )}
                          {!selectedListingForContact?.isPro && (
                            <Badge variant="outline" className="text-xs">Particulier</Badge>
                          )}
            </div>
                        <div className="text-sm text-gray-600">
                          {selectedListingForContact?.isPro ? "Agence immobilière" : "Vendeur particulier"}
          </div>
        </div>
                    )}

                    {/* Téléphone */}
                    {phone ? (
                      <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary-600" />
                          <span className="font-semibold text-sm">Téléphone</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${phone.replace(/\s/g, '')}`}
                            className="text-primary-700 hover:text-primary-800 font-medium hover:underline"
                          >
                            {phone}
                          </a>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              await navigator.clipboard.writeText(phone.replace(/\s/g, ''))
                              setCopiedField('phone')
                              setTimeout(() => setCopiedField(null), 2000)
                            }}
                            className="h-7 text-xs"
                          >
                            {copiedField === 'phone' ? (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                Copié
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 mr-1" />
                                Copier
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">Téléphone non disponible dans l'annonce</span>
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    {email ? (
                      <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary-600" />
                          <span className="font-semibold text-sm">Email</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`mailto:${email}`}
                            className="text-primary-700 hover:text-primary-800 font-medium hover:underline break-all"
                          >
                            {email}
                          </a>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              await navigator.clipboard.writeText(email)
                              setCopiedField('email')
                              setTimeout(() => setCopiedField(null), 2000)
                            }}
                            className="h-7 text-xs"
                          >
                            {copiedField === 'email' ? (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                Copié
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 mr-1" />
                                Copier
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">Email non disponible dans l'annonce</span>
                        </div>
                      </div>
                    )}

                    {/* Annonce originale */}
                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">Annonce originale</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a
                            href={selectedListingForContact?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onError={(e) => console.log("Lien potentiellement non accessible depuis le navigateur")}
                          >
                            Voir l'annonce
                          </a>
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500">
                        {!phone && !email && "Les coordonnées complètes sont généralement disponibles sur la page de l'annonce originale."}
                        {(phone || email) && "Consultez l'annonce originale pour d'autres informations de contact."}
                      </div>
                    </div>

                    {/* Source */}
                    {selectedListingForContact?.origin && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-primary-600" />
                          <span className="font-semibold text-sm">Source</span>
                        </div>
                        <OriginBadge origin={selectedListingForContact.origin} />
                      </div>
                    )}
                  </>
                )
              })()}
              {!selectedListingForContact && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    Aucune information disponible.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog Analyse rapide */}
        <QuickAnalysisPanel
          listing={selectedListingForAnalysis}
          open={isAnalysisOpen}
          onOpenChange={(open) => {
            setIsAnalysisOpen(open)
            if (!open) {
              setSelectedListingForAnalysis(null)
            }
          }}
        />
      </div>
    </div>
  )
}
