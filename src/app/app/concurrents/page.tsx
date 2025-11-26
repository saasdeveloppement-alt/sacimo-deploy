"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { 
  Building2, 
  TrendingUp, 
  TrendingDown,
  MapPin, 
  BarChart3,
  Loader2,
  Sparkles,
  Award,
  Target,
  DollarSign,
  Percent,
  Download,
  RefreshCw,
  Eye,
  ChevronRight,
  Activity
} from "lucide-react"
import { motion, useInView } from "framer-motion"
import { showSuccess, showError, showLoading, dismissToast } from "@/lib/toast"
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  CartesianGrid, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Legend
} from "recharts"
import { getTopAgencies, type TopAgency } from "@/app/actions/getTopAgencies"
import { 
  saveAnalysis, 
  getSavedAnalyses, 
  loadSavedAnalysis,
  deleteSavedAnalysis,
  type SavedAnalysis,
  type SavedAnalysisData
} from "@/app/actions/savedAnalyses"
import { getAgencyListings, type AgencyListing } from "@/app/actions/getAgencyListings"
import { useSession } from "next-auth/react"
import { Save, Trash2, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Competitor {
  id: string
  name: string
  location: string
  listingsCount: number
  avgPrice: number
  lastUpdate: Date
  status: 'active' | 'inactive' | 'monitoring'
  website: string
  specialties: string[]
  marketShare: number
  zone?: string
  listings?: number
  rank?: number
  isGrowing?: boolean
  lastSeen?: string
  trend?: number
}

// Composant Counter animé
const AnimatedCounter = ({ value, duration = 2 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      let startTime: number | null = null
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
        setCount(Math.floor(progress * value))
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setCount(value)
        }
      }
      requestAnimationFrame(animate)
    }
  }, [isInView, value, duration])

  return <span ref={ref}>{count.toLocaleString('fr-FR')}</span>
}

export default function ConcurrentsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [postalCodes, setPostalCodes] = useState<string[]>([])
  const [postalInput, setPostalInput] = useState("")
  const [topAgenciesData, setTopAgenciesData] = useState<TopAgency[]>([])
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [analysisLabel, setAnalysisLabel] = useState("")
  const [agencyListings, setAgencyListings] = useState<AgencyListing[]>([])
  const [selectedAgencyName, setSelectedAgencyName] = useState<string>("")
  const [isLoadingListings, setIsLoadingListings] = useState(false)

  // Charger les analyses sauvegardées au montage
  useEffect(() => {
    if (session?.user) {
      loadSavedAnalysesList()
    }
  }, [session])

  // Données de démonstration
  useEffect(() => {
    const mockCompetitors: Competitor[] = [
      {
        id: '1',
        name: 'Century 21 Paris 1er',
        location: 'Paris 1er, 2e, 3e',
        listingsCount: 45,
        avgPrice: 520000,
        lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'active',
        website: 'https://century21.fr',
        specialties: ['Luxe', 'Centre-ville'],
        marketShare: 18.2,
        zone: 'Paris 1er, 2e, 3e',
        listings: 45,
        rank: 1,
        isGrowing: true,
        lastSeen: 'Il y a 2h',
        trend: 12.5
      },
      {
        id: '2',
        name: 'Orpi Centre Paris',
        location: 'Paris 4e, 5e, 6e',
        listingsCount: 38,
        avgPrice: 485000,
        lastUpdate: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'active',
        website: 'https://orpi.fr',
        specialties: ['Familial', 'Rénovation'],
        marketShare: 15.4,
        zone: 'Paris 4e, 5e, 6e',
        listings: 38,
        rank: 2,
        isGrowing: true,
        lastSeen: 'Il y a 4h',
        trend: 8.3
      },
      {
        id: '3',
        name: 'Guy Hoquet',
        location: 'Paris 7e, 8e, 9e',
        listingsCount: 32,
        avgPrice: 510000,
        lastUpdate: new Date(Date.now() - 6 * 60 * 60 * 1000),
        status: 'active',
        website: 'https://guyhoquet.fr',
        specialties: ['Commercial', 'Bureaux'],
        marketShare: 13.0,
        zone: 'Paris 7e, 8e, 9e',
        listings: 32,
        rank: 3,
        isGrowing: false,
        lastSeen: 'Il y a 6h',
        trend: -2.1
      },
      {
        id: '4',
        name: 'Foncia',
        location: 'Paris 10e, 11e',
        listingsCount: 28,
        avgPrice: 495000,
        lastUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'active',
        website: 'https://foncia.fr',
        specialties: ['Appartements', 'Studios'],
        marketShare: 11.3,
        zone: 'Paris 10e, 11e',
        listings: 28,
        rank: 4,
        isGrowing: false,
        lastSeen: 'Il y a 1j',
        trend: -5.2
      },
      {
        id: '5',
        name: 'Laforêt',
        location: 'Paris 12e, 13e',
        listingsCount: 24,
        avgPrice: 505000,
        lastUpdate: new Date(Date.now() - 12 * 60 * 60 * 1000),
        status: 'active',
        website: 'https://laforet.fr',
        specialties: ['Appartements', 'Maisons'],
        marketShare: 9.7,
        zone: 'Paris 12e, 13e',
        listings: 24,
        rank: 5,
        isGrowing: true,
        lastSeen: 'Il y a 12h',
        trend: 4.7
      }
    ]
    setCompetitors(mockCompetitors)
  }, [])

  const loadSavedAnalysesList = async () => {
    try {
      const analyses = await getSavedAnalyses()
      setSavedAnalyses(analyses)
    } catch (error) {
      console.error("Error loading saved analyses:", error)
    }
  }

  const handleSaveAnalysis = async () => {
    if (!analysisLabel.trim()) {
      showError("Veuillez entrer un nom pour l'analyse")
      return
    }

    if (postalCodes.length === 0 || topAgenciesData.length === 0) {
      showError("Aucune analyse à sauvegarder. Lancez d'abord une analyse.")
      return
    }

    // Utiliser topAgenciesData si disponible, sinon construire depuis competitors
    const agenciesToSave = topAgenciesData.length > 0 
      ? topAgenciesData.map(a => ({
          rank: a.rank || 0,
          name: a.name,
          annonces: a.count,
          prixMoyen: a.avgPrice,
          partMarche: parseFloat(a.marketShare)
        }))
      : competitors.slice(0, 10).map((c, index) => ({
          rank: c.rank || (index + 1),
          name: c.name,
          annonces: c.listingsCount,
          prixMoyen: c.avgPrice,
          partMarche: c.marketShare
        }));

    const analysisData: SavedAnalysisData = {
      postalCodes,
      topAgencies: agenciesToSave,
      statistics: {
        totalListings,
        avgMarketPrice,
        activeCompetitors,
        totalMarketShare
      },
      competitors: competitors.map(c => ({
        id: c.id,
        name: c.name,
        location: c.location,
        listingsCount: c.listingsCount,
        avgPrice: c.avgPrice,
        marketShare: c.marketShare,
        rank: c.rank,
        isGrowing: c.isGrowing,
        trend: c.trend
      }))
    }

    const result = await saveAnalysis(analysisLabel.trim(), postalCodes, analysisData)
    
    if (result.success) {
      showSuccess("✅ Analyse sauvegardée avec succès")
      setShowSaveDialog(false)
      setAnalysisLabel("")
      await loadSavedAnalysesList()
    } else {
      showError(result.error || "Erreur lors de la sauvegarde")
    }
  }

  const handleLoadAnalysis = async (id: string) => {
    const loadingToast = showLoading("Chargement de l'analyse...")
    
    try {
      const analysis = await loadSavedAnalysis(id)
      if (!analysis) {
        showError("Analyse introuvable")
        return
      }

      // Restaurer les codes postaux
      setPostalCodes(analysis.data.postalCodes)

      // Restaurer les agences
      const agencies: TopAgency[] = analysis.data.topAgencies.map(a => ({
        name: a.name,
        count: a.annonces,
        avgPrice: a.prixMoyen,
        marketShare: a.partMarche.toString(),
        rank: a.rank
      }))
      setTopAgenciesData(agencies)

      // Restaurer les concurrents
      const restoredCompetitors: Competitor[] = analysis.data.competitors.map(c => ({
        id: c.id,
        name: c.name,
        location: c.location,
        listingsCount: c.listingsCount,
        avgPrice: c.avgPrice,
        lastUpdate: new Date(),
        status: 'active' as const,
        website: '',
        specialties: [],
        marketShare: c.marketShare,
        zone: analysis.data.postalCodes.join(", "),
        listings: c.listingsCount,
        rank: c.rank,
        isGrowing: c.isGrowing,
        lastSeen: 'Chargé',
        trend: c.trend
      }))
      setCompetitors(restoredCompetitors)

      dismissToast(loadingToast)
      showSuccess(`✅ Analyse "${analysis.label}" chargée avec succès`)
    } catch (error) {
      dismissToast(loadingToast)
      showError(`Erreur lors du chargement: ${(error as Error).message}`)
    }
  }

  const handleDeleteAnalysis = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette analyse ?")) {
      return
    }

    const result = await deleteSavedAnalysis(id)
    if (result.success) {
      showSuccess("✅ Analyse supprimée")
      await loadSavedAnalysesList()
    } else {
      showError(result.error || "Erreur lors de la suppression")
    }
  }

  const handleLoadAgencyListings = async (agencyName: string) => {
    if (postalCodes.length === 0) {
      showError("Veuillez d'abord lancer une analyse avec des codes postaux")
      return
    }

    setIsLoadingListings(true)
    setSelectedAgencyName(agencyName)
    const loadingToast = showLoading(`Chargement des annonces de ${agencyName}...`)

    try {
      const listings = await getAgencyListings(agencyName, postalCodes)
      setAgencyListings(listings)
      dismissToast(loadingToast)
      showSuccess(`✅ ${listings.length} annonce(s) trouvée(s) pour ${agencyName}`)
      
      // Scroll vers la section des listings
    setTimeout(() => {
        const element = document.getElementById("agency-listings")
        element?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    } catch (error) {
      dismissToast(loadingToast)
      showError(`Erreur lors du chargement: ${(error as Error).message}`)
    } finally {
      setIsLoadingListings(false)
    }
  }

  const handleAnalyze = async () => {
    if (postalCodes.length === 0) {
      showError("Veuillez ajouter au moins un code postal")
      return
    }

    setIsAnalyzing(true)
    const loadingToast = showLoading("Analyse en cours...")

    try {
      const agencies = await getTopAgencies(postalCodes)
      setTopAgenciesData(agencies)
      
      // Mapper les agences en garantissant que le rang 1 est présent
      const updatedCompetitors = agencies
        .sort((a, b) => (a.rank || 999) - (b.rank || 999)) // Trier par rang
        .map((agency, index) => ({
          id: `agency-${index}`,
          name: agency.name,
          location: postalCodes.join(", "),
          listingsCount: agency.count,
          avgPrice: agency.avgPrice,
          lastUpdate: new Date(),
          status: 'active' as const,
          website: '',
          specialties: [],
          marketShare: parseFloat(agency.marketShare),
          zone: postalCodes.join(", "),
          listings: agency.count,
          rank: agency.rank && agency.rank > 0 ? agency.rank : index + 1, // Garantir rang >= 1
          isGrowing: index < 3,
          lastSeen: 'À l\'instant',
          trend: Math.random() * 20 - 10
        }))
      
      setCompetitors(updatedCompetitors)
      setAgencyListings([]) // Réinitialiser les listings
      setSelectedAgencyName("")
      dismissToast(loadingToast)
      showSuccess(`✅ Analyse terminée : ${agencies.length} agences trouvées`)
    } catch (error) {
      dismissToast(loadingToast)
      showError(`Erreur lors de l'analyse : ${(error as Error).message}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const totalListings = competitors.reduce((sum, c) => sum + c.listingsCount, 0)
  const avgMarketPrice = competitors.length > 0 
    ? Math.round(competitors.reduce((sum, c) => sum + c.avgPrice, 0) / competitors.length)
    : 0
  const activeCompetitors = competitors.filter(c => c.status === 'active').length
  const totalMarketShare = competitors.reduce((sum, c) => sum + c.marketShare, 0)

  // Construire topAgencies en garantissant que les rangs commencent à 1
  const topAgencies = topAgenciesData.length > 0 
    ? topAgenciesData
        .sort((a, b) => (a.rank || 999) - (b.rank || 999)) // Trier par rang
        .map((a, index) => ({
          rank: a.rank && a.rank > 0 ? a.rank : index + 1, // Garantir rang >= 1
          name: a.name,
          annonces: a.count,
          prixMoyen: a.avgPrice,
          partMarche: parseFloat(a.marketShare)
        }))
    : competitors
        .slice(0, 10)
        .sort((a, b) => (a.rank || 999) - (b.rank || 999)) // Trier par rang
        .map((c, index) => ({
          rank: c.rank && c.rank > 0 ? c.rank : index + 1, // Garantir rang >= 1
          name: c.name,
          annonces: c.listingsCount,
          prixMoyen: c.avgPrice,
          partMarche: c.marketShare
        }))

  const marketShareData = topAgencies.slice(0, 5).map((agency, index) => {
    const colors = ["#8B5CF6", "#3B82F6", "#06B6D4", "#10B981", "#F59E0B"]
    return {
      name: agency.name.split(" ")[0],
      value: agency.partMarche,
      color: colors[index % colors.length],
      fullName: agency.name
    }
  })

  const annoncesBarData = topAgencies.slice(0, 5).map(agency => ({
    name: agency.name.split(" ")[0],
    annonces: agency.annonces,
    prixMoyen: agency.prixMoyen
  }))

  // Générer les données d'évolution mensuelle basées sur le Top 10 actuel
  // Prendre les top 5 agences pour le graphique
  const top5Agencies = topAgencies.slice(0, 5)
  
  // Générer les couleurs futuristes avec gradients
  const evolutionColors = [
    { main: "#8B5CF6", gradient: "url(#gradient1)" }, // Violet
    { main: "#3B82F6", gradient: "url(#gradient2)" }, // Bleu
    { main: "#06B6D4", gradient: "url(#gradient3)" }, // Cyan
    { main: "#10B981", gradient: "url(#gradient4)" }, // Vert
    { main: "#F59E0B", gradient: "url(#gradient5)" }, // Orange
  ]
  
  const evolutionKeys = top5Agencies.map((agency, index) => {
    const key = agency.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15)
    return {
      key,
      name: agency.name.length > 25 ? agency.name.substring(0, 25) + '...' : agency.name,
      fullName: agency.name, // Nom complet pour le tooltip
      color: evolutionColors[index % evolutionColors.length].main,
      gradient: evolutionColors[index % evolutionColors.length].gradient,
      currentValue: agency.annonces,
      currentMonth: new Date().getMonth() // Mois actuel (0-11)
    }
  })
  
  // Générer une évolution sur l'année en cours (12 mois)
  const generateEvolutionData = () => {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    const currentMonth = new Date().getMonth()
    const evolutionData: any[] = []
    
    monthNames.forEach((month, monthIndex) => {
      const dataPoint: any = { month, monthIndex }
      
      evolutionKeys.forEach((agencyInfo) => {
        // Calculer une valeur simulée pour ce mois
        const currentValue = agencyInfo.currentValue
        
        if (monthIndex === currentMonth) {
          // Mois actuel : utiliser la valeur réelle
          dataPoint[agencyInfo.key] = currentValue
        } else if (monthIndex < currentMonth) {
          // Mois passés : simuler une évolution progressive
          const monthsAgo = currentMonth - monthIndex
          const variation = monthsAgo * 0.03 // 3% de variation par mois
          const simulatedValue = Math.max(1, Math.round(currentValue * (1 - variation)))
          dataPoint[agencyInfo.key] = simulatedValue
        } else {
          // Mois futurs : projection basée sur la tendance
          const monthsAhead = monthIndex - currentMonth
          // Simuler une croissance légère pour les mois futurs
          const growth = monthsAhead * 0.02 // 2% de croissance par mois
          const projectedValue = Math.round(currentValue * (1 + growth))
          dataPoint[agencyInfo.key] = projectedValue
        }
      })
      
      evolutionData.push(dataPoint)
    })
    
    return evolutionData
  }

  const evolutionData = top5Agencies.length > 0 
    ? generateEvolutionData()
    : Array.from({ length: 12 }, (_, i) => {
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
        return { month: monthNames[i], agency1: 0, agency2: 0, agency3: 0, agency4: 0, agency5: 0 }
      })

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <Building2 
                  className="w-10 h-10 text-indigo-600" 
                />
                <div>
                  <h1 className="text-4xl font-semibold text-gray-900">
                    Suivi Concurrentiel
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Analysez le marché et identifiez les opportunités en temps réel
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline"
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || postalCodes.length === 0}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyse...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualiser
                      </>
                    )}
            </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
            </Button>
                </motion.div>
          </div>
          </div>
          </motion.div>

          {/* Zone d'analyse */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-gray-900 text-xl font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  Zone d'analyse
                </h2>
                {topAgenciesData.length > 0 && (
                  <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                        onClick={() => setShowSaveDialog(true)}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer cette analyse
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Enregistrer l'analyse</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Nom de l'analyse
                          </label>
                          <Input
                            value={analysisLabel}
                            onChange={(e) => setAnalysisLabel(e.target.value)}
                            placeholder="Ex: Analyse Paris 75001"
                            className="w-full"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowSaveDialog(false)
                              setAnalysisLabel("")
                            }}
                          >
                            Annuler
                          </Button>
                          <Button
                            onClick={handleSaveAnalysis}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            Enregistrer
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <div className="relative">
                <Input
                  type="text"
                  value={postalInput}
                  onChange={(e) => setPostalInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      const code = postalInput.trim()
                      if (code.length === 5 && /^\d{5}$/.test(code) && !postalCodes.includes(code)) {
                        setPostalCodes([...postalCodes, code])
                        setPostalInput("")
                      }
                    }
                  }}
                  placeholder="Saisissez un code postal (ex: 75001)"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 rounded-xl"
                />
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {postalCodes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {postalCodes.map((code) => (
                    <motion.div
                      key={code}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-200"
                    >
                      {code}
                      <button
                        type="button"
                        onClick={() => setPostalCodes(postalCodes.filter((c) => c !== code))}
                        className="ml-2 text-indigo-600 hover:text-indigo-800 font-bold"
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || postalCodes.length === 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-4 rounded-xl font-semibold text-lg shadow-sm transition"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Lancer l'analyse
                    </>
                  )}
              </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Analyses sauvegardées */}
          {savedAnalyses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-gray-900 font-semibold mb-4">Analyses sauvegardées</h3>
              <div className="flex flex-col gap-3">
                {savedAnalyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                  >
                    <button
                      onClick={() => handleLoadAnalysis(analysis.id)}
                      className="flex-1 text-left group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="h-4 w-4 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
                        <span className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                          Suivi Concurrentiel - Secteur {analysis.postalCodes.join(", ")}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span>{new Date(analysis.createdAt).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}</span>
                        <span>•</span>
                        <span>{analysis.postalCodes.length} code{analysis.postalCodes.length > 1 ? 's' : ''} postal{analysis.postalCodes.length > 1 ? 'aux' : ''}</span>
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoadAnalysis(analysis.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Charger
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAnalysis(analysis.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
          )}

          {/* Cartes statistiques */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              {
                icon: Target,
                label: "Total Annonces",
                value: totalListings,
                variation: "+12%",
                color: "indigo"
              },
              {
                icon: DollarSign,
                label: "Prix Moyen Marché",
                value: `${avgMarketPrice.toLocaleString('fr-FR')}€`,
                variation: "+5.2%",
                color: "blue"
              },
              {
                icon: Building2,
                label: "Agences Actives",
                value: activeCompetitors,
                variation: "Actif",
                color: "indigo"
              },
              {
                icon: Percent,
                label: "Part de Marché",
                value: `${totalMarketShare.toFixed(1)}%`,
                variation: "Top 10",
                color: "teal"
              },
            ].map((metric, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={metric.color === 'indigo' ? 'bg-indigo-100 rounded-xl p-3' : metric.color === 'blue' ? 'bg-blue-100 rounded-xl p-3' : 'bg-teal-100 rounded-xl p-3'}>
                    <metric.icon className={metric.color === 'indigo' ? 'h-6 w-6 text-indigo-600' : metric.color === 'blue' ? 'h-6 w-6 text-blue-600' : 'h-6 w-6 text-teal-600'} />
                  </div>
                  <span className="text-green-600 text-sm font-medium">{metric.variation}</span>
                </div>
                <div>
                  <p className="text-gray-700 text-sm uppercase mb-2">{metric.label}</p>
                  {typeof metric.value === 'number' ? (
                    <p className="text-4xl font-bold text-gray-900">
                      <AnimatedCounter value={metric.value} />
                    </p>
                  ) : (
                    <p className="text-4xl font-bold text-gray-900">{metric.value}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 font-semibold text-lg">Répartition du marché</h3>
                <Badge className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
                  Top 5
                </Badge>
              </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={marketShareData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                    label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                    outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                    {marketShareData.map((entry, index) => {
                      const colors = ["#4F46E5", "#3B82F6", "#06B6D4", "#10B981", "#F59E0B"]
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    })}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ 
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                      color: '#111827'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 font-semibold text-lg">Volume d'annonces</h3>
                <Badge className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                  Comparaison
                </Badge>
              </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={annoncesBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                      <RechartsTooltip 
                        contentStyle={{ 
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                      color: '#111827'
                        }}
                      />
                  <Bar dataKey="annonces" radius={[8, 8, 0, 0]} fill="#4F46E5" />
                    </BarChart>
                  </ResponsiveContainer>
          </motion.div>
                  </div>
                  
          {/* Tableau TOP 10 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 font-semibold text-xl flex items-center gap-2">
                <Award className="h-6 w-6 text-yellow-500" />
                Top 10 des Agences
                {postalCodes.length > 0 && (
                  <Badge className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200">
                    {postalCodes.join(", ")}
                  </Badge>
                )}
                  </h3>
              <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-50">
                <Eye className="h-4 w-4 mr-2" />
                Voir tout
              </Button>
                    </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200 hover:bg-transparent">
                    <TableHead className="text-gray-700 font-semibold">Rang</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Agence</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Annonces</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Prix moyen</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Part de marché</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Tendance</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topAgencies.map((agency, index) => {
                    const competitor = competitors.find(c => c.name === agency.name)
                    const trend = competitor?.trend || 0
                    return (
                      <motion.tr
                        key={agency.rank}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: "#F9FAFB" }}
                        className="border-b border-gray-100 transition-all duration-300 cursor-pointer"
                        onClick={() => router.push(`/app/annonces?agency=${encodeURIComponent(agency.name)}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {agency.rank === 1 && (
                              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                                🥇
                            </Badge>
                            )}
                            {agency.rank === 2 && (
                              <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                                🥈
                              </Badge>
                            )}
                            {agency.rank === 3 && (
                              <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                                🥉
                              </Badge>
                            )}
                            {agency.rank > 3 && (
                              <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                                #{agency.rank}
                            </Badge>
                            )}
                  </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-gray-900">{agency.name}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-700">{agency.annonces}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-700 font-semibold">
                            {agency.prixMoyen.toLocaleString('fr-FR')}€
                          </span>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-indigo-600 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${agency.partMarche}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                              />
                    </div>
                            <span className="text-gray-700 font-semibold">{agency.partMarche}%</span>
                  </div>
                        </TableCell>
                        <TableCell>
                          {trend > 0 ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              <TrendingUp className="h-3 w-3 mr-1 inline" />
                              +{trend.toFixed(1)}%
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 border-red-200">
                              <TrendingDown className="h-3 w-3 mr-1 inline" />
                              {trend.toFixed(1)}%
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                  <Button 
                            variant="ghost"
                    size="sm"
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-sm font-medium"
                            onClick={() => handleLoadAgencyListings(agency.name)}
                            disabled={isLoadingListings}
                          >
                            {isLoadingListings && selectedAgencyName === agency.name ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                Chargement...
                              </>
                            ) : (
                              <>
                                Voir les annonces
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </>
                            )}
                  </Button>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </TableBody>
              </Table>
                </div>
          </motion.div>

          {/* Graphique évolution futuriste */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="relative bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 rounded-2xl p-6 shadow-2xl border border-indigo-500/20 overflow-hidden"
          >
            {/* Effet de brillance animé */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            
            <div className="relative z-10 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg backdrop-blur-sm border border-indigo-400/30">
                  <Activity className="h-6 w-6 text-indigo-300" />
                  </div>
                <div>
                  <h3 className="text-white font-bold text-xl flex items-center gap-2">
                    Analyse Mensuelle {new Date().getFullYear()}
                  </h3>
                  <p className="text-indigo-300 text-sm">Évolution des Top 5 Agences</p>
                </div>
              </div>
              <Badge className="bg-indigo-500/30 text-indigo-200 px-4 py-1.5 rounded-full border border-indigo-400/50 backdrop-blur-sm font-semibold">
                {new Date().getFullYear()}
                            </Badge>
                          </div>
            
            <div className="relative z-10">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart 
                  data={evolutionData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    {/* Gradients pour les lignes */}
                    <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="gradient2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="gradient3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="gradient4" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="gradient5" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.1} />
                    </linearGradient>
                    {/* Filtre de brillance */}
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#4F46E5" 
                    strokeOpacity={0.2}
                    vertical={false}
                  />
                  
                  <XAxis 
                    dataKey="month" 
                    stroke="#A5B4FC" 
                    fontSize={11}
                    tick={{ fill: '#C7D2FE' }}
                    axisLine={{ stroke: '#6366F1', strokeWidth: 1 }}
                  />
                  
                  <YAxis 
                    stroke="#A5B4FC" 
                    fontSize={11}
                    tick={{ fill: '#C7D2FE' }}
                    axisLine={{ stroke: '#6366F1', strokeWidth: 1 }}
                  />
                  
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(99, 102, 241, 0.5)',
                      borderRadius: '12px',
                      color: '#E0E7FF',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                      padding: '12px'
                    }}
                    labelFormatter={(label: string) => {
                      // Convertir l'abréviation du mois en nom complet
                      const monthMap: Record<string, string> = {
                        'Jan': 'Janvier',
                        'Fév': 'Février',
                        'Mar': 'Mars',
                        'Avr': 'Avril',
                        'Mai': 'Mai',
                        'Jun': 'Juin',
                        'Jul': 'Juillet',
                        'Aoû': 'Août',
                        'Sep': 'Septembre',
                        'Oct': 'Octobre',
                        'Nov': 'Novembre',
                        'Déc': 'Décembre'
                      }
                      return monthMap[label] || label
                    }}
                    formatter={(value: any, name: string, props: any) => {
                      const keyInfo = evolutionKeys.find(k => k.key === name)
                      const agencyName = keyInfo?.fullName || keyInfo?.name || name
                      return [
                        <span key="value" className="text-indigo-300 font-bold">{value} annonces - {agencyName}</span>,
                        <span key="name" className="text-indigo-200">{agencyName}</span>
                      ]
                    }}
                    content={(props: any) => {
                      if (!props.active || !props.payload) {
                        return null
                      }
                      
                      // Trier les payloads par valeur décroissante (plus d'annonces en haut)
                      const sortedPayload = [...props.payload].sort((a: any, b: any) => {
                        const valueA = Number(a.value) || 0
                        const valueB = Number(b.value) || 0
                        return valueB - valueA // Décroissant
                      })
                      
                      // Convertir l'abréviation du mois en nom complet
                      const monthMap: Record<string, string> = {
                        'Jan': 'Janvier',
                        'Fév': 'Février',
                        'Mar': 'Mars',
                        'Avr': 'Avril',
                        'Mai': 'Mai',
                        'Jun': 'Juin',
                        'Jul': 'Juillet',
                        'Aoû': 'Août',
                        'Sep': 'Septembre',
                        'Oct': 'Octobre',
                        'Nov': 'Novembre',
                        'Déc': 'Décembre'
                      }
                      
                      const fullMonthName = monthMap[props.label] || props.label
                      
                      return (
                        <div style={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          border: '1px solid rgba(99, 102, 241, 0.5)',
                          borderRadius: '12px',
                          color: '#E0E7FF',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                          padding: '12px'
                        }}>
                          <p style={{ 
                            color: '#A5B4FC', 
                            fontWeight: 'bold',
                            marginBottom: '8px',
                            fontSize: '14px'
                          }}>
                            {fullMonthName}
                          </p>
                          {sortedPayload.map((entry: any, index: number) => {
                            const keyInfo = evolutionKeys.find(k => k.key === entry.dataKey)
                            const agencyName = keyInfo?.fullName || keyInfo?.name || entry.dataKey
                            return (
                              <p key={index} style={{ 
                                color: '#C7D2FE',
                                fontSize: '13px',
                                margin: '4px 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <span style={{ 
                                  display: 'inline-block',
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '50%',
                                  backgroundColor: entry.color
                                }} />
                                <span style={{ color: '#A5B4FC', fontWeight: '600' }}>
                                  {entry.value} annonces - {agencyName}
                                </span>
                              </p>
                            )
                          })}
                            </div>
                      )
                    }}
                  />
                  
                  <Legend 
                    wrapperStyle={{ color: '#C7D2FE', paddingTop: '20px' }}
                    iconType="line"
                    formatter={(value: string) => {
                      const keyInfo = evolutionKeys.find(k => k.key === value)
                      return <span className="text-indigo-200">{keyInfo?.name || value}</span>
                    }}
                  />
                  
                  {evolutionKeys.map((agencyInfo, index) => {
                    const currentMonth = new Date().getMonth()
                    return (
                      <Line 
                        key={agencyInfo.key}
                        type="monotone" 
                        dataKey={agencyInfo.key} 
                        stroke={agencyInfo.color} 
                        strokeWidth={3}
                        strokeOpacity={0.9}
                        dot={{ 
                          r: 5, 
                          fill: agencyInfo.color,
                          strokeWidth: 2,
                          stroke: '#fff',
                          filter: 'url(#glow)'
                        }}
                        activeDot={{ 
                          r: 7, 
                          fill: agencyInfo.color,
                          stroke: '#fff',
                          strokeWidth: 2,
                          filter: 'url(#glow)'
                        }}
                        name={agencyInfo.name}
                        animationDuration={1000}
                        animationBegin={index * 200}
                        isAnimationActive={true}
                      />
                    )
                  })}
                  
                  {evolutionKeys.length === 0 && (
                    <>
                      <Line type="monotone" dataKey="agency1" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 5, fill: '#8B5CF6' }} />
                      <Line type="monotone" dataKey="agency2" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5, fill: '#3B82F6' }} />
                      <Line type="monotone" dataKey="agency3" stroke="#06B6D4" strokeWidth={3} dot={{ r: 5, fill: '#06B6D4' }} />
                      <Line type="monotone" dataKey="agency4" stroke="#10B981" strokeWidth={3} dot={{ r: 5, fill: '#10B981' }} />
                      <Line type="monotone" dataKey="agency5" stroke="#F59E0B" strokeWidth={3} dot={{ r: 5, fill: '#F59E0B' }} />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
                            </div>
            
            {/* Indicateur du mois actuel */}
            <div className="relative z-10 mt-4 flex items-center justify-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 rounded-full border border-indigo-400/30 backdrop-blur-sm">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                <span className="text-indigo-200 text-sm font-medium">
                  Mois actuel: {['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][new Date().getMonth()]}
                </span>
                            </div>
                            </div>
          </motion.div>

          {/* Listing des annonces d'agence */}
          {agencyListings.length > 0 && (
                    <motion.div
              id="agency-listings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 font-semibold text-lg">
                  Annonces de l'agence {selectedAgencyName}
                  </h3>
                            <Button 
                  variant="ghost"
                              size="sm" 
                  onClick={() => {
                    setAgencyListings([])
                    setSelectedAgencyName("")
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="h-4 w-4 mr-1" />
                  Fermer
                            </Button>
                          </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agencyListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {listing.pictureUrl && (
                      <img
                        src={listing.pictureUrl}
                        alt={listing.title}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    )}
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {listing.title}
                    </h4>
                    <p className="text-gray-900 font-bold text-lg mb-1">
                      {listing.price.toLocaleString('fr-FR')} €
                    </p>
                    {listing.surface && (
                      <p className="text-gray-600 text-sm mb-1">
                        {listing.surface} m²
                        {listing.rooms && ` • ${listing.rooms} pièce${listing.rooms > 1 ? 's' : ''}`}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm mb-3">
                      {listing.city} {listing.postalCode}
                    </p>
                    <a
                      href={listing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 text-sm font-medium hover:underline inline-flex items-center gap-1"
                    >
                      Voir l'annonce
                      <ChevronRight className="h-3 w-3" />
                    </a>
                          </div>
                  ))}
                </div>
          </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
