"use client"

import { useState } from "react"
import { EstimationResult } from "@/components/estimation/EstimationResult"
import type { EstimationResult as EstimationResultType } from "@/components/estimation/EstimationResult"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calculator, MapPin, Home, Ruler, DoorOpen, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"

export default function EstimationPage() {
  const [city, setCity] = useState("Bordeaux")
  const [postalCode, setPostalCode] = useState("33000")
  const [surface, setSurface] = useState("")
  const [rooms, setRooms] = useState("")
  const [type, setType] = useState("Appartement")
  const [photoUrl, setPhotoUrl] = useState("")
  
  // États pour les filtres avancés
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [keywords, setKeywords] = useState("")
  const [condition, setCondition] = useState<string>("")
  const [floor, setFloor] = useState("")
  // Équipements
  const [hasBalcon, setHasBalcon] = useState(false)
  const [hasTerrasse, setHasTerrasse] = useState(false)
  const [hasParking, setHasParking] = useState(false)
  const [hasGarden, setHasGarden] = useState(false)
  const [hasElevator, setHasElevator] = useState(false)
  const [hasPool, setHasPool] = useState(false)
  const [hasFireplace, setHasFireplace] = useState(false)
  const [hasCellar, setHasCellar] = useState(false)
  const [hasAttic, setHasAttic] = useState(false)
  // Caractéristiques
  const [hasView, setHasView] = useState(false)
  const [hasDoubleGlazing, setHasDoubleGlazing] = useState(false)
  const [hasAlarm, setHasAlarm] = useState(false)
  const [hasIntercom, setHasIntercom] = useState(false)

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

      // Construire le payload avec les filtres optionnels
      const payload: any = {
        city,
        postalCode,
        surface: surfaceNum,
        rooms: roomsNum,
        type,
      }

      // Ajouter les filtres optionnels s'ils sont renseignés
      if (keywords.trim()) payload.keywords = keywords.trim()
      if (condition) payload.condition = condition
      if (floor) payload.floor = Number(floor)
      
      // Équipements - TOUJOURS envoyer, même si false (pour debug)
      payload.hasBalcon = hasBalcon
      payload.hasTerrasse = hasTerrasse
      payload.hasParking = hasParking
      payload.hasGarden = hasGarden
      payload.hasElevator = hasElevator
      payload.hasPool = hasPool
      payload.hasFireplace = hasFireplace
      payload.hasCellar = hasCellar
      payload.hasAttic = hasAttic
      
      // Caractéristiques
      payload.hasView = hasView
      payload.hasDoubleGlazing = hasDoubleGlazing
      payload.hasAlarm = hasAlarm
      payload.hasIntercom = hasIntercom

      console.log("📤 Payload envoyé à l'API:", payload)

      const response = await fetch("/api/estimation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await response.json()

      console.log("📊 Réponse API estimation complète:", json) // Debug

      if (!json.success) {
        setError(json.error || "Une erreur est survenue")
        setLoading(false)
        return
      }

      // 👇 IMPORTANT : c'est ici que ça bloquait !
      console.log("✅ Données estimation reçues:", json.estimation) // Debug
      console.log("🔍 Ajustements reçus:", json.estimation?.adjustments) // Debug des ajustements
      console.log("🔍 Type ajustements:", typeof json.estimation?.adjustments, Array.isArray(json.estimation?.adjustments))
      console.log("🔍 Nombre d'ajustements:", json.estimation?.adjustments?.length || 0)
      console.log("💰 Prix médian reçu:", json.estimation?.priceMedian) // Debug du prix
      
      // Vérifier que les ajustements sont bien présents
      if (!json.estimation?.adjustments || (Array.isArray(json.estimation.adjustments) && json.estimation.adjustments.length === 0)) {
        console.warn("⚠️ ATTENTION: Aucun ajustement reçu ou array vide!")
      } else {
        console.log("✅ Ajustements présents:", json.estimation.adjustments)
      }
      
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

                {/* Filtres avancés */}
                <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                  <CollapsibleTrigger className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Filter className="h-4 w-4" />
                      Filtres avancés
                    </div>
                    {showAdvancedFilters ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    {/* État du bien */}
                    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                      <Label className="text-sm font-semibold text-gray-700">État du bien</Label>
                      <Select value={condition} onValueChange={setCondition}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Sélectionner l'état du bien" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="neuf">Neuf</SelectItem>
                          <SelectItem value="rénové">Rénové</SelectItem>
                          <SelectItem value="bon_état">Bon état</SelectItem>
                          <SelectItem value="à_rafraîchir">À rafraîchir</SelectItem>
                          <SelectItem value="à_rénover">À rénover</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        État observé lors de la visite
                      </p>
                    </div>

                    {/* Étage (pour appartement) */}
                    {type === "Appartement" && (
                      <div className="space-y-2">
                        <Label htmlFor="floor" className="text-sm font-semibold text-gray-700">
                          Étage
                        </Label>
                        <Input
                          id="floor"
                          type="number"
                          placeholder="Ex: 3"
                          min="0"
                          value={floor}
                          onChange={(e) => setFloor(e.target.value)}
                          className="h-9 text-sm"
                        />
                        <p className="text-xs text-gray-500">
                          Étage du bien (0 = rez-de-chaussée)
                        </p>
                      </div>
                    )}

                    {/* Filtres par équipements */}
                    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                      <Label className="text-sm font-semibold text-gray-700">Équipements</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasBalcon"
                            checked={hasBalcon}
                            onCheckedChange={(checked) => setHasBalcon(checked === true)}
                          />
                          <Label htmlFor="hasBalcon" className="text-xs cursor-pointer">
                            Balcon
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasTerrasse"
                            checked={hasTerrasse}
                            onCheckedChange={(checked) => setHasTerrasse(checked === true)}
                          />
                          <Label htmlFor="hasTerrasse" className="text-xs cursor-pointer">
                            Terrasse
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasParking"
                            checked={hasParking}
                            onCheckedChange={(checked) => setHasParking(checked === true)}
                          />
                          <Label htmlFor="hasParking" className="text-xs cursor-pointer">
                            Parking / Garage
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasGarden"
                            checked={hasGarden}
                            onCheckedChange={(checked) => setHasGarden(checked === true)}
                          />
                          <Label htmlFor="hasGarden" className="text-xs cursor-pointer">
                            Jardin
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasElevator"
                            checked={hasElevator}
                            onCheckedChange={(checked) => setHasElevator(checked === true)}
                          />
                          <Label htmlFor="hasElevator" className="text-xs cursor-pointer">
                            Ascenseur
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasPool"
                            checked={hasPool}
                            onCheckedChange={(checked) => setHasPool(checked === true)}
                          />
                          <Label htmlFor="hasPool" className="text-xs cursor-pointer">
                            Piscine
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasFireplace"
                            checked={hasFireplace}
                            onCheckedChange={(checked) => setHasFireplace(checked === true)}
                          />
                          <Label htmlFor="hasFireplace" className="text-xs cursor-pointer">
                            Cheminée
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasCellar"
                            checked={hasCellar}
                            onCheckedChange={(checked) => setHasCellar(checked === true)}
                          />
                          <Label htmlFor="hasCellar" className="text-xs cursor-pointer">
                            Cave / Cellier
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasAttic"
                            checked={hasAttic}
                            onCheckedChange={(checked) => setHasAttic(checked === true)}
                          />
                          <Label htmlFor="hasAttic" className="text-xs cursor-pointer">
                            Grenier / Combles
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Caractéristiques */}
                    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                      <Label className="text-sm font-semibold text-gray-700">Caractéristiques</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasView"
                            checked={hasView}
                            onCheckedChange={(checked) => setHasView(checked === true)}
                          />
                          <Label htmlFor="hasView" className="text-xs cursor-pointer">
                            Vue
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasDoubleGlazing"
                            checked={hasDoubleGlazing}
                            onCheckedChange={(checked) => setHasDoubleGlazing(checked === true)}
                          />
                          <Label htmlFor="hasDoubleGlazing" className="text-xs cursor-pointer">
                            Double vitrage
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasAlarm"
                            checked={hasAlarm}
                            onCheckedChange={(checked) => setHasAlarm(checked === true)}
                          />
                          <Label htmlFor="hasAlarm" className="text-xs cursor-pointer">
                            Alarme
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasIntercom"
                            checked={hasIntercom}
                            onCheckedChange={(checked) => setHasIntercom(checked === true)}
                          />
                          <Label htmlFor="hasIntercom" className="text-xs cursor-pointer">
                            Digicode / Interphone
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Mots-clés */}
                    <div className="space-y-2">
                      <Label htmlFor="keywords" className="text-sm font-semibold text-gray-700">
                        Mots-clés (description)
                      </Label>
                      <Input
                        id="keywords"
                        placeholder="Ex: rénové, neuf, vue mer..."
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        className="h-9 text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        Recherche dans la description et le titre
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

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

