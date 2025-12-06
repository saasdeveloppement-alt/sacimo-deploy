/**
 * 🎯 COMPOSANT DE LOCALISATION AVANCÉ
 * 
 * Interface pour le nouveau système de localisation multi-sources
 * Supporte : URL, texte, images
 */

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Upload,
  Link as LinkIcon,
  FileText,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SimpleMap } from "@/components/localisation/SimpleMap"
import { LocalisationWizard } from "@/components/localisation/LocalisationWizard"
import { CandidateCarousel, type Candidate } from "@/components/localisation/CandidateCarousel"
import { CandidateHeatmap } from "@/components/localisation/CandidateHeatmap"
import type { LocalizationUserHints } from "@/types/localisation"
import { toast } from "sonner"

interface LocalisationResult {
  requestId: string
  status: "PENDING" | "RUNNING" | "DONE" | "FAILED" | "low-confidence" | "failed"
  bestCandidate?: {
    address: string
    latitude: number
    longitude: number
    confidence: number
    confidenceBreakdown: Record<string, number>
    sources: Record<string, any>
  }
  candidates?: Array<{
    address: string
    latitude: number
    longitude: number
    confidence: number
    best: boolean
    postalCode?: string
    parcelId?: string
    confidenceBreakdown?: Record<string, number>
    satelliteImageUrl?: string
    streetViewUrl?: string
    scoreImage?: number
    scorePiscine?: number
    scoreToiture?: number
    scoreTerrain?: number
    scoreHints?: number
    scoreDVF?: number
    reasons?: string[]
  }>
  explanation?: string
  fallbackSuggestions?: {
    expandRadius?: boolean
    message?: string
  }
}

export function LocalisationAdvanced() {
  const [activeTab, setActiveTab] = useState<"url" | "text" | "images">("url")
  const [url, setUrl] = useState("")
  const [text, setText] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [hintCity, setHintCity] = useState("")
  const [hintPostalCode, setHintPostalCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<LocalisationResult | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [showWizard, setShowWizard] = useState(false)
  const [userHints, setUserHints] = useState<LocalizationUserHints | null>(null)

  const handleSubmit = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // Préparer les données selon le mode actif
      const body: any = {
        hintCity: hintCity || undefined,
        hintPostalCode: hintPostalCode || undefined,
        userHints: userHints || undefined, // Ajouter les hints du wizard
        multiCandidates: true, // Activer le mode multi-candidats
      }

      if (activeTab === "url") {
        if (!url) {
          toast.error("Veuillez fournir une URL d'annonce")
          setIsLoading(false)
          return
        }
        body.url = url
      } else if (activeTab === "text") {
        if (!text) {
          toast.error("Veuillez fournir un texte de description")
          setIsLoading(false)
          return
        }
        body.text = text
      } else if (activeTab === "images") {
        if (images.length === 0) {
          toast.error("Veuillez fournir au moins une image")
          setIsLoading(false)
          return
        }
        // Convertir les images en base64
        const imagePromises = images.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
        })
        body.images = await Promise.all(imagePromises)
      }

      // Appeler l'API
      const response = await fetch("/api/localisation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de la localisation")
      }

      setRequestId(data.requestId)
      toast.success("Localisation lancée", {
        description: "Analyse en cours...",
      })

      // Polling pour récupérer le résultat
      pollResult(data.requestId)
    } catch (error: any) {
      console.error("Erreur localisation:", error)
      toast.error("Erreur", {
        description: error.message || "Impossible de lancer la localisation",
      })
      setIsLoading(false)
    }
  }

  const pollResult = async (id: string) => {
    const maxAttempts = 60 // 5 minutes max
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/localisation?requestId=${id}`)
        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || "Erreur lors de la récupération")
        }

        setResult({
          requestId: data.request.id,
          status: data.request.status,
          bestCandidate: data.bestCandidate,
          candidates: data.candidates,
          explanation: data.explanation,
        })

        if (data.request.status === "DONE" || data.request.status === "FAILED") {
          setIsLoading(false)
          if (data.request.status === "DONE") {
            toast.success("Localisation terminée", {
              description: data.bestCandidate
                ? `${data.bestCandidate.address} (${Math.round(data.bestCandidate.confidence)}%)`
                : "Aucune localisation fiable trouvée",
            })
          } else {
            toast.error("Localisation échouée")
          }
          return
        }

        // Continuer le polling
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000) // Poll toutes les 5 secondes
        } else {
          setIsLoading(false)
          toast.error("Timeout", {
            description: "La localisation prend trop de temps",
          })
        }
      } catch (error: any) {
        console.error("Erreur polling:", error)
        setIsLoading(false)
        toast.error("Erreur", {
          description: "Impossible de récupérer le résultat",
        })
      }
    }

    poll()
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages((prev) => [...prev, ...files].slice(0, 6)) // Max 6 images
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Wizard d'enrichissement */}
      {showWizard && (
        <LocalisationWizard
          initialHints={{
            city: hintCity || undefined,
            postalCode: hintPostalCode || undefined,
            ...userHints,
          }}
          onComplete={(hints) => {
            setUserHints(hints)
            setShowWizard(false)
            toast.success("Hints enregistrés", {
              description: "Les informations ont été sauvegardées et amélioreront la précision",
            })
          }}
          onCancel={() => setShowWizard(false)}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Localisation avancée
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hints communs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hintCity">Ville (optionnel)</Label>
              <Input
                id="hintCity"
                placeholder="Ex: Paris"
                value={hintCity}
                onChange={(e) => setHintCity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hintPostalCode">Code postal (optionnel)</Label>
              <Input
                id="hintPostalCode"
                placeholder="Ex: 75001"
                value={hintPostalCode}
                onChange={(e) => setHintPostalCode(e.target.value)}
              />
            </div>
          </div>

          {/* Tabs pour les différents modes */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="url">
                <LinkIcon className="h-4 w-4 mr-2" />
                URL
              </TabsTrigger>
              <TabsTrigger value="text">
                <FileText className="h-4 w-4 mr-2" />
                Texte
              </TabsTrigger>
              <TabsTrigger value="images">
                <Upload className="h-4 w-4 mr-2" />
                Images
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL de l'annonce</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://www.leboncoin.fr/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text">Description / Notes</Label>
                <Textarea
                  id="text"
                  placeholder="Coller ici la description de l'annonce, vos notes, ou tout texte contenant des indices de localisation..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                />
              </div>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <div className="space-y-2">
                <Label>Images (jusqu'à 6)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Cliquez pour sélectionner des images
                    </span>
                  </label>
                </div>
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {images.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Bouton d'enrichissement */}
          {!showWizard && (
            <Button
              onClick={() => setShowWizard(true)}
              variant="outline"
              className="w-full mb-4"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Enrichir avec plus d'informations (recommandé)
            </Button>
          )}

          {/* Bouton de soumission */}
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Localisation en cours...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Lancer la localisation
              </>
            )}
          </Button>

          {/* Progress bar si en cours */}
          {isLoading && result?.status === "RUNNING" && (
            <div className="space-y-2">
              <Progress value={50} className="w-full" />
              <p className="text-sm text-gray-600 text-center">
                Analyse en cours... Cela peut prendre quelques minutes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Résultats - Mode multi-candidats */}
      {result &&
        result.status === "DONE" &&
        result.candidates &&
        result.candidates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Carrousel de candidats */}
            <CandidateCarousel
              candidates={result.candidates.map((c) => ({
                id: c.address,
                address: c.address,
                latitude: c.latitude,
                longitude: c.longitude,
                confidence: c.confidence,
                confidenceBreakdown: c.confidenceBreakdown,
                satelliteImageUrl: c.satelliteImageUrl,
                streetViewUrl: c.streetViewUrl,
                annonceImageUrl: images.length > 0 ? URL.createObjectURL(images[0]) : undefined, // Première image uploadée
                postalCode: c.postalCode || hintPostalCode || undefined,
                parcelId: c.parcelId || undefined,
                reasons: c.reasons,
                scoreImage: c.scoreImage,
                scorePiscine: c.scorePiscine,
                scoreToiture: c.scoreToiture,
                scoreTerrain: c.scoreTerrain,
                scoreHints: c.scoreHints,
                scoreDVF: c.scoreDVF,
              }))}
              onValidate={(candidate) => {
                toast.success("Localisation validée", {
                  description: candidate.address,
                })
              }}
            />

            {/* Heatmap */}
            <CandidateHeatmap
              candidates={result.candidates.map((c) => ({
                id: c.address,
                address: c.address,
                latitude: c.latitude,
                longitude: c.longitude,
                confidence: c.confidence,
              }))}
            />

            {/* Explication */}
            {result.explanation && (
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-700">{result.explanation}</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

      {/* Résultats - Mode classique (fallback) */}
      {result && result.status === "DONE" && result.bestCandidate && !result.candidates && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Localisation trouvée
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Meilleur candidat */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Adresse proposée</Label>
                  <Badge
                    className={
                      result.bestCandidate.confidence >= 80
                        ? "bg-green-100 text-green-800"
                        : result.bestCandidate.confidence >= 60
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-orange-100 text-orange-800"
                    }
                  >
                    {Math.round(result.bestCandidate.confidence)}% de confiance
                  </Badge>
                </div>
                <p className="text-lg font-semibold">
                  {result.bestCandidate.address}
                </p>
                <p className="text-sm text-gray-600">
                  {result.bestCandidate.latitude.toFixed(6)},{" "}
                  {result.bestCandidate.longitude.toFixed(6)}
                </p>
              </div>

              {/* Breakdown de confiance */}
              {Object.keys(result.bestCandidate.confidenceBreakdown).length > 0 && (
                <div className="space-y-2">
                  <Label>Détails du score</Label>
                  <div className="space-y-1">
                    {Object.entries(result.bestCandidate.confidenceBreakdown).map(
                      ([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">
                            {key.replace("_", " ")}
                          </span>
                          <span className="text-sm font-medium">
                            {Math.round(value)}%
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Explication */}
              {result.explanation && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">{result.explanation}</p>
                </div>
              )}

              {/* Carte */}
              <div className="space-y-2">
                <Label>Position sur la carte</Label>
                <SimpleMap
                  latitude={result.bestCandidate.latitude}
                  longitude={result.bestCandidate.longitude}
                  address={result.bestCandidate.address}
                  height="300px"
                  zoom={17}
                />
              </div>

              {/* Bouton validation */}
              <Button className="w-full" variant="default">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Valider cette localisation
              </Button>
            </CardContent>
          </Card>

          {/* Autres candidats */}
          {result.candidates && result.candidates.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Autres candidats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.candidates.slice(1, 6).map((candidate, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{candidate.address}</p>
                        <p className="text-sm text-gray-600">
                          {Math.round(candidate.confidence)}% de confiance
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Voir
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Low-confidence ou failed */}
      {(result?.status === "low-confidence" || result?.status === "failed") && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                <p className="font-semibold">
                  {result.status === "low-confidence"
                    ? "Confiance faible"
                    : "Localisation échouée"}
                </p>
              </div>
              {result.fallbackSuggestions?.message && (
                <p className="text-sm text-orange-700">
                  {result.fallbackSuggestions.message}
                </p>
              )}
              {result.fallbackSuggestions?.expandRadius && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // Relancer avec rayon élargi
                    toast.info("Élargissement de la zone de recherche...")
                    // TODO: Implémenter le relancement avec rayon x2
                  }}
                >
                  Élargir la zone de recherche
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Erreur */}
      {result && result.status === "FAILED" && !result.fallbackSuggestions && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p>La localisation a échoué. Veuillez réessayer avec d'autres informations.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

