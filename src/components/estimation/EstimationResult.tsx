"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { formatPrice, formatSurface } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import { ExternalLink, Database, FileText, Globe, Ruler, DoorOpen, MapPin } from "lucide-react"

export type EstimationResult = {
  priceMedian: number
  priceLow: number
  priceHigh: number
  pricePerSqmMedian: number
  pricePerSqmAverage: number
  sampleSize: number
  confidence: number // 0–1
  strategy: string
  adjustments?: string[] // Ajustements appliqués (état, équipements, etc.)
  explanation?: string | null // Explication IA optionnelle
  comparables: {
    id: string
    price: number
    surface: number
    pricePerSqm: number
    city: string
    postalCode: string
    rooms: number | null
    type: string | null
    url: string | null
  }[]
}

interface EstimationResultProps {
  result: EstimationResult
  className?: string
  photoUrl?: string
}

/**
 * Composant circulaire de progression pour le score de confiance
 */
function CircularProgress({ value, size = 80 }: { value: number; size?: number }) {
  const percentage = Math.round(value * 100)
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value * circumference)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Cercle de fond */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-gray-200"
        />
        {/* Cercle de progression */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-500",
            value >= 0.7 ? "text-green-500" : value >= 0.4 ? "text-yellow-500" : "text-orange-500"
          )}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold">{percentage}%</span>
      </div>
    </div>
  )
}

/**
 * Barre de fourchette de prix visuelle
 */
function PriceRangeBar({ low, median, high }: { low: number; median: number; high: number }) {
  const totalRange = high - low
  const medianPosition = totalRange > 0 ? ((median - low) / totalRange) * 100 : 50

  return (
    <div className="space-y-2">
      <div className="relative h-8 w-full rounded-lg bg-gray-100 overflow-hidden">
        {/* Barre de fond */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400" />
        
        {/* Indicateur médian */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
          style={{ left: `${medianPosition}%` }}
        />
        
        {/* Labels */}
        <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-semibold text-gray-700">
          <span>{formatPrice(low)}</span>
          <span className="bg-white/90 px-2 py-0.5 rounded">{formatPrice(median)}</span>
          <span>{formatPrice(high)}</span>
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Minimum</span>
        <span>Médian</span>
        <span>Maximum</span>
      </div>
    </div>
  )
}

/**
 * Badge de stratégie avec couleur selon le niveau
 */
function StrategyBadge({ strategy }: { strategy: string }) {
  const getStrategyInfo = (strategy: string) => {
    if (strategy === "meilleursagents_market_price") {
      return { label: "SACIMO (MeilleursAgents)", variant: "default" as const, color: "bg-purple-100 text-purple-700 border-purple-300" }
    }
    if (strategy === "dvf_market_price") {
      return { label: "SACIMO (DVF)", variant: "default" as const, color: "bg-blue-100 text-blue-700 border-blue-300" }
    }
    if (strategy.includes("strict")) {
      return { label: "Strict", variant: "default" as const, color: "bg-green-100 text-green-700 border-green-300" }
    }
    if (strategy.includes("cp_")) {
      return { label: "Code postal", variant: "secondary" as const, color: "bg-blue-100 text-blue-700 border-blue-300" }
    }
    if (strategy.includes("dept_")) {
      return { label: "Département", variant: "outline" as const, color: "bg-orange-100 text-orange-700 border-orange-300" }
    }
    return { label: strategy, variant: "outline" as const, color: "bg-gray-100 text-gray-700 border-gray-300" }
  }

  const info = getStrategyInfo(strategy)

  return (
    <Badge variant={info.variant} className={info.color}>
      {info.label}
    </Badge>
  )
}

export function EstimationResult({ result, className, photoUrl }: EstimationResultProps) {
  const {
    priceMedian,
    priceLow,
    priceHigh,
    pricePerSqmMedian,
    pricePerSqmAverage,
    sampleSize,
    confidence,
    strategy,
    adjustments,
    explanation,
    comparables = [],
  } = result

  // Préparer les données pour le graphique scatter
  const chartData = comparables.map((comp) => ({
    x: comp.surface,
    y: comp.pricePerSqm,
    price: comp.price,
    city: comp.city,
  }))

  // Couleur pour les points du graphique
  const getPointColor = (value: number, median: number) => {
    const diff = Math.abs(value - median) / median
    if (diff < 0.1) return "#3b82f6" // Bleu pour proche de la médiane
    if (diff < 0.2) return "#8b5cf6" // Violet pour moyen
    return "#ec4899" // Rose pour éloigné
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Carte principale : Estimation du bien */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Estimation du bien</CardTitle>
              <CardDescription>
                Estimation basée sur {sampleSize} biens comparables
              </CardDescription>
            </div>
            {photoUrl && (
              <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-purple-200 shadow-sm">
                <img
                  src={photoUrl}
                  alt="Photo du bien"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prix médian en grand */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Prix estimé</p>
            <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {formatPrice(priceMedian)}
            </p>
          </div>

          {/* Barre de fourchette */}
          <PriceRangeBar low={priceLow} median={priceMedian} high={priceHigh} />

          {/* Prix au m² et confiance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Prix m² moyen</p>
              <div className="space-y-1">
                <p className="text-2xl font-semibold text-gray-900">
                  {formatPrice(pricePerSqmAverage || pricePerSqmMedian)}
                </p>
                {strategy === "meilleursagents_market_price" && (
                  <p className="text-xs text-gray-500 italic">
                    Estimation SACIMO basée sur MeilleursAgents.com
                  </p>
                )}
                {strategy === "dvf_market_price" && (
                  <p className="text-xs text-gray-500 italic">
                    Estimation SACIMO basée sur les transactions DVF réelles
                  </p>
                )}
                {strategy !== "dvf_market_price" && strategy !== "meilleursagents_market_price" && (
                  <p className="text-sm text-gray-500">
                    Médiane : {formatPrice(pricePerSqmMedian)}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Score de confiance</p>
              <div className="flex items-center gap-4">
                <CircularProgress value={confidence} />
                <div className="flex-1">
                  <Progress value={confidence * 100} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {confidence >= 0.7
                      ? "Confiance élevée"
                      : confidence >= 0.4
                        ? "Confiance modérée"
                        : "Confiance faible"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Explication IA (si disponible) */}
      {explanation && (
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span>Explication de l'estimation</span>
            </CardTitle>
            <CardDescription>
              Analyse générée par intelligence artificielle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {explanation}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Carte secondaire : Informations avancées */}
      <Card>
        <CardHeader>
          <CardTitle>Informations avancées</CardTitle>
          <CardDescription>
            Détails sur la méthode d'estimation utilisée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Comparables analysés
              </p>
              <p className="text-3xl font-bold text-blue-600">{sampleSize}</p>
              <p className="text-xs text-gray-600">
                {sampleSize >= 20 ? "Échantillon large" : sampleSize >= 10 ? "Échantillon moyen" : "Échantillon réduit"}
              </p>
            </div>
            <div className="space-y-2 p-4 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Stratégie
              </p>
              <div className="mt-2">
                <StrategyBadge strategy={strategy} />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {strategy === "meilleursagents_market_price"
                  ? "Prix au m² moyen depuis MeilleursAgents.com"
                  : strategy === "dvf_market_price" 
                    ? "Prix au m² réel du marché (DVF)" 
                    : strategy.includes("strict") 
                      ? "Recherche précise" 
                      : strategy.includes("dept") 
                        ? "Recherche élargie" 
                        : "Recherche standard"}
              </p>
            </div>
            <div className="space-y-2 p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Source de données
              </p>
              <p className="text-lg font-semibold text-green-700">
                {strategy === "meilleursagents_market_price" 
                  ? "MeilleursAgents.com" 
                  : strategy === "dvf_market_price" 
                    ? "SACIMO (DVF)" 
                    : "Base DVF"}
              </p>
              <p className="text-xs text-gray-600">
                {strategy === "meilleursagents_market_price"
                  ? "Prix au m² moyen depuis MeilleursAgents.com"
                  : strategy === "dvf_market_price" 
                    ? "Transactions DVF réelles (12 derniers mois)" 
                    : "Données officielles DGFiP"}
              </p>
            </div>
          </div>
          
          {/* Ajustements appliqués */}
          {adjustments && adjustments.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💰</span>
                <p className="text-sm font-semibold text-gray-700">Ajustements appliqués au prix</p>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {adjustments.map((adj, idx) => {
                  const isPositive = adj.includes("+")
                  const isNegative = adj.includes("-")
                  return (
                    <Badge
                      key={idx}
                      variant="outline"
                      className={
                        isPositive
                          ? "bg-green-50 text-green-700 border-green-300 font-medium"
                          : isNegative
                            ? "bg-orange-50 text-orange-700 border-orange-300 font-medium"
                            : "bg-gray-50 text-gray-700 border-gray-300"
                      }
                    >
                      {adj}
                    </Badge>
                  )
                })}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 font-medium">
                  ℹ️ Ces ajustements modifient le prix estimé en fonction de l'état du bien, des équipements et des caractéristiques observées lors de la visite.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Graphique scatter */}
      <Card>
        <CardHeader>
          <CardTitle>Analyse des comparables</CardTitle>
          <CardDescription>
            Prix au m² en fonction de la surface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis
                type="number"
                dataKey="x"
                name="Surface"
                unit=" m²"
                domain={["dataMin - 10", "dataMax + 10"]}
                label={{ value: "Surface (m²)", position: "insideBottom", offset: -5 }}
                className="text-xs"
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Prix au m²"
                tickFormatter={(value) => `${Math.round(value)}€`}
                label={{ value: "Prix au m² (€)", angle: -90, position: "insideLeft" }}
                className="text-xs"
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                formatter={(value: number, name: string, props: any) => {
                  if (name === "y") {
                    return [`${Math.round(value)} €/m²`, "Prix au m²"]
                  }
                  return [value, name]
                }}
                labelFormatter={(label) => `Surface: ${label} m²`}
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-semibold mb-1">{data.city}</p>
                        <p className="text-sm text-gray-600">
                          Surface: {data.x} m²
                        </p>
                        <p className="text-sm text-gray-600">
                          Prix: {formatPrice(data.price)}
                        </p>
                        <p className="text-sm font-semibold text-blue-600">
                          {Math.round(data.y)} €/m²
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Scatter
                name="Comparables"
                data={chartData}
                fill="#3b82f6"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getPointColor(entry.y, pricePerSqmMedian)}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table des comparables */}
      <Card>
        <CardHeader>
          <CardTitle>Biens comparables</CardTitle>
          <CardDescription>
            Liste détaillée des {comparables.length} biens utilisés pour l'estimation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prix</TableHead>
                  <TableHead>Surface</TableHead>
                  <TableHead>Prix/m²</TableHead>
                  <TableHead>Pièces</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparables.map((comp, index) => {
                  // Générer une image placeholder basée sur le type et la surface
                  const getPlaceholderImage = () => {
                    const type = comp.type?.toLowerCase() || 'appartement'
                    const isAppartement = type.includes('appartement') || type.includes('studio')
                    const color = isAppartement ? '4f46e5' : '059669'
                    return `https://via.placeholder.com/150/${color}/ffffff?text=${comp.surface}m²`
                  }
                  
                  return (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                            <img
                              src={getPlaceholderImage()}
                              alt={`${comp.type || 'Bien'} ${comp.surface}m²`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%23e5e7eb' width='150' height='150'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='12' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3E${comp.surface}m²%3C/text%3E%3C/svg%3E`
                              }}
                            />
                          </div>
                          {comp.url ? (
                            <a
                              href={comp.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                              title="Voir l'annonce complète"
                            >
                              {comp.price && comp.price > 0 ? formatPrice(comp.price) : "Prix indisponible"}
                            </a>
                          ) : (
                            <span className="font-semibold">
                              {comp.price && comp.price > 0 ? formatPrice(comp.price) : "Prix indisponible"}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Ruler className="h-3 w-3 text-gray-400" />
                          {formatSurface(comp.surface)}
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-600 font-medium">
                        {comp.pricePerSqm && comp.pricePerSqm > 0 ? `${formatPrice(comp.pricePerSqm)}/m²` : "Prix indisponible/m²"}
                      </TableCell>
                      <TableCell>
                        {comp.rooms ? (
                          <div className="flex items-center gap-1">
                            <DoorOpen className="h-3 w-3 text-gray-400" />
                            {comp.rooms} pièces
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{comp.city} {comp.postalCode}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {comp.type || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {comp.url ? (
                          <a
                            href={comp.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                            title="Voir l'annonce complète"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>Voir</span>
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Sources de données et références */}
      <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Sources de données et références
          </CardTitle>
          <CardDescription>
            Cette estimation se base sur des données publiques officielles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  Base DVF (Demande de Valeurs Foncières)
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Données officielles des transactions immobilières en France publiées par la Direction Générale des Finances Publiques (DGFiP). 
                  Cette base recense toutes les ventes de biens fonciers réalisées au cours des 5 dernières années.
                </p>
                <a
                  href="https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Consulter sur data.gouv.fr
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
              <Globe className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  API Adresse (data.gouv.fr)
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Service de géocodage gratuit permettant de convertir une adresse en coordonnées géographiques. 
                  Utilisé pour localiser précisément les biens immobiliers.
                </p>
                <a
                  href="https://adresse.data.gouv.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Consulter l'API Adresse
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
              <Database className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  Statistiques DVF par département
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Prix médians au m² calculés à partir des données DVF agrégées par département pour l'année 2023-2024. 
                  Ces statistiques permettent d'estimer les biens même en l'absence de transactions récentes dans la zone exacte.
                </p>
                <a
                  href="https://www.economie.gouv.fr/cedef/estimer-prix-immobilier"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  En savoir plus sur le site du gouvernement
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-gray-500">
              <strong>Note importante :</strong> Cette estimation est indicative et basée sur des données publiques. 
              Elle ne remplace pas une expertise immobilière professionnelle. Les prix réels peuvent varier selon de nombreux facteurs 
              (état du bien, exposition, travaux, marché local, etc.). Pour une estimation précise, consultez un professionnel de l'immobilier.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

