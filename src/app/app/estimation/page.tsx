"use client"

import { useState } from "react"
import { EstimationResult } from "@/components/estimation/EstimationResult"
import type { EstimationResult as EstimationResultType } from "@/components/estimation/EstimationResult"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calculator, MapPin, Home, Ruler, DoorOpen } from "lucide-react"

export default function EstimationPage() {
  const [city, setCity] = useState("Bordeaux")
  const [postalCode, setPostalCode] = useState("33000")
  const [surface, setSurface] = useState("")
  const [rooms, setRooms] = useState("")
  const [type, setType] = useState("Appartement")
  const [photoUrl, setPhotoUrl] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EstimationResultType | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setResult(null)

    try {
      // Convertir surface et rooms en nombres
      const surfaceNum = Number(surface)
      const roomsNum = Number(rooms)

      // Validation basique côté client
      if (!surfaceNum || surfaceNum <= 0) {
        setError("La surface doit être un nombre positif")
        setLoading(false)
        return
      }

      if (!roomsNum || roomsNum <= 0) {
        setError("Le nombre de pièces doit être un nombre positif")
        setLoading(false)
        return
      }

      const response = await fetch("/api/estimation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          postalCode,
          surface: surfaceNum,
          rooms: roomsNum,
          type,
        }),
      })

      const json = await response.json()

      console.log("📊 Réponse API estimation:", json) // Debug

      if (!json.success) {
        setError(json.error || "Une erreur est survenue")
        setLoading(false)
        return
      }

      // 👇 IMPORTANT : c'est ici que ça bloquait !
      console.log("✅ Données estimation reçues:", json.estimation) // Debug
      setResult(json.estimation)

    } catch (err) {
      console.error("❌ Erreur estimation:", err) // Debug
      setError("Erreur interne")
    }

    setLoading(false)
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="h-8 w-8 text-purple-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Estimation immobilière
          </h1>
        </div>
        <p className="text-gray-600 text-lg">
          Obtenez une estimation précise de votre bien immobilier basée sur les données DVF officielles
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Formulaire - Colonne gauche */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-purple-600" />
                Caractéristiques du bien
              </CardTitle>
              <CardDescription>
                Renseignez les informations de votre bien
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-5">
                {/* Localisation */}
                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Ville
                  </Label>
                  <Input
                    id="city"
                    placeholder="Ex: Bordeaux"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input
                    id="postalCode"
                    placeholder="Ex: 33000"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                {/* Caractéristiques */}
                <div className="space-y-2">
                  <Label htmlFor="surface" className="flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    Surface (m²)
                  </Label>
                  <Input
                    id="surface"
                    type="number"
                    placeholder="Ex: 65"
                    value={surface}
                    onChange={(e) => setSurface(e.target.value)}
                    required
                    min="1"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rooms" className="flex items-center gap-2">
                    <DoorOpen className="h-4 w-4" />
                    Nombre de pièces
                  </Label>
                  <Input
                    id="rooms"
                    type="number"
                    placeholder="Ex: 3"
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                    required
                    min="1"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type de bien</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type" className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Appartement">Appartement</SelectItem>
                      <SelectItem value="Maison">Maison</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Photo optionnelle */}
                <div className="space-y-2">
                  <Label htmlFor="photo">Photo du bien (optionnel)</Label>
                  <Input
                    id="photo"
                    type="url"
                    placeholder="https://exemple.com/photo.jpg"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="h-11"
                  />
                  <p className="text-xs text-gray-500">
                    Ajoutez une URL d'image pour illustrer votre bien
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Calcul en cours…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Estimer le bien
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Résultats - Colonne droite */}
        <div className="lg:col-span-2 space-y-6">

          {/* Photo du bien si fournie */}
          {photoUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Photo du bien</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={photoUrl}
                    alt="Photo du bien"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EPhoto indisponible%3C/text%3E%3C/svg%3E"
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message d'erreur */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-red-700">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="font-semibold">Erreur</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Résultat */}
          {result ? (
            <div className="animate-fade-in">
              <EstimationResult result={result} photoUrl={photoUrl} />
            </div>
          ) : result === null && !loading && !error ? (
            <Card className="border-dashed">
              <CardContent className="pt-12 pb-12">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calculator className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Prêt à estimer votre bien ?
                    </h3>
                    <p className="text-gray-600">
                      Remplissez le formulaire à gauche et cliquez sur "Estimer le bien" pour obtenir une estimation précise basée sur les données DVF officielles.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}

