"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Brain, Loader2, AlertTriangle, TrendingUp, TrendingDown, Minus, X, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { analyzeListing, type ListingAnalysis } from "@/app/actions/analyzeListing"
import type { NormalizedListing } from "@/lib/piges/normalize"

interface QuickAnalysisPanelProps {
  listing: NormalizedListing | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickAnalysisPanel({ listing, open, onOpenChange }: QuickAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<ListingAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Lancer l'analyse dès que la modal s'ouvre avec une nouvelle annonce
  useEffect(() => {
    if (open && listing) {
      runAnalysis()
    } else {
      // Reset quand on ferme
      setAnalysis(null)
      setError(null)
    }
  }, [open, listing?.id]) // Dépend de l'ID pour relancer si on change d'annonce

  async function runAnalysis() {
    if (!listing) return

    setLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      const result = await analyzeListing(listing)
      if (result) {
        setAnalysis(result)
      } else {
        setError("Impossible d'analyser cette annonce. Veuillez réessayer.")
      }
    } catch (err: any) {
      console.error("Erreur analyse:", err)
      setError(err.message || "Une erreur est survenue lors de l'analyse.")
    } finally {
      setLoading(false)
    }
  }

  if (!listing) return null

  // Fonction pour obtenir la couleur du score
  const getScoreColor = (score: number) => {
    if (score >= 75) return "from-green-500 to-emerald-600"
    if (score >= 50) return "from-yellow-500 to-amber-600"
    return "from-red-500 to-rose-600"
  }

  // Fonction pour obtenir la couleur du badge prix
  const getPriceBadgeColor = (position: string) => {
    switch (position) {
      case "sous-évalué":
        return "bg-green-100 text-green-800 border-green-200"
      case "surévalué":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  // Fonction pour obtenir l'icône du delta prix
  const getDeltaIcon = (delta: number) => {
    if (delta < 0) return <TrendingDown className="w-4 h-4" />
    if (delta > 0) return <TrendingUp className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Brain className="w-6 h-6 text-indigo-600" />
            Analyse rapide
          </DialogTitle>
        </DialogHeader>

        {/* Informations de l'annonce */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">{listing.title}</h3>
          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            {listing.price && (
              <span className="font-semibold text-gray-900">
                {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(listing.price)}
              </span>
            )}
            {listing.surface && <span>{listing.surface} m²</span>}
            {listing.rooms && <span>{listing.rooms} pièce{listing.rooms > 1 ? "s" : ""}</span>}
            {listing.city && <span>{listing.city} {listing.postalCode || ""}</span>}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Analyse en cours...</p>
                <p className="text-sm text-gray-500 mt-2">L'IA examine l'annonce...</p>
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Erreur d'analyse</h3>
                  <p className="text-sm text-red-700">{error}</p>
                  <Button
                    onClick={runAnalysis}
                    className="mt-4 bg-red-600 hover:bg-red-700"
                    size="sm"
                  >
                    Réessayer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysis && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Score d'opportunité - Cercle gradient */}
            <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Score d'opportunité</h3>
                    <p className="text-xs text-gray-600">
                      Évaluation globale de la qualité de cette opportunité
                    </p>
                  </div>
                  <div className="relative flex flex-col items-center">
                    <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${getScoreColor(analysis.score_opportunite)} flex flex-col items-center justify-center shadow-lg`}>
                      <span className="text-4xl font-bold text-white leading-none">
                        {analysis.score_opportunite}
                      </span>
                      <span className="text-xs font-semibold text-white/80 mt-0.5">/100</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Positionnement prix */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Positionnement prix</h3>
                    <Badge className={`${getPriceBadgeColor(analysis.prix_position)} border font-semibold px-3 py-1`}>
                      {analysis.prix_position}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-lg font-bold">
                      {getDeltaIcon(analysis.delta_prix)}
                      <span className={analysis.delta_prix < 0 ? "text-green-600" : analysis.delta_prix > 0 ? "text-red-600" : "text-gray-600"}>
                        {analysis.delta_prix > 0 ? "+" : ""}{analysis.delta_prix.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">vs marché moyen</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Résumé */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Résumé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{analysis.resume}</p>
              </CardContent>
            </Card>

            {/* Historique */}
            {analysis.historique && analysis.historique !== "Aucun historique disponible" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Historique
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative pl-6 border-l-2 border-indigo-200">
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-indigo-600 rounded-full"></div>
                    <p className="text-gray-700">{analysis.historique}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Red Flags */}
            {analysis.red_flags && analysis.red_flags.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-red-900">
                    <AlertCircle className="w-5 h-5" />
                    Signaux d'alerte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.red_flags.map((flag, index) => (
                      <li key={index} className="flex items-start gap-2 text-red-800">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{flag}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommandation agent */}
            <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  Recommandation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 font-medium leading-relaxed">
                  {analysis.recommandation_agent}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}

