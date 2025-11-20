"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  Scan,
  Loader2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Map,
  Eye,
  Building,
  MapPinned,
  Camera,
  FileText,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { useGeoAI } from "@/hooks/useGeoAI"
import type { LocationFromImageResult } from "@/types/location"
import { SimpleMap } from "@/components/localisation/SimpleMap"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"

interface GeoAIDropzoneProps {
  annonceId?: string
  onLocationValidated?: () => void
}

// Liste des départements français
const DEPARTMENTS = [
  { code: "01", name: "Ain" },
  { code: "02", name: "Aisne" },
  { code: "03", name: "Allier" },
  { code: "04", name: "Alpes-de-Haute-Provence" },
  { code: "05", name: "Hautes-Alpes" },
  { code: "06", name: "Alpes-Maritimes" },
  { code: "07", name: "Ardèche" },
  { code: "08", name: "Ardennes" },
  { code: "09", name: "Ariège" },
  { code: "10", name: "Aube" },
  { code: "11", name: "Aude" },
  { code: "12", name: "Aveyron" },
  { code: "13", name: "Bouches-du-Rhône" },
  { code: "14", name: "Calvados" },
  { code: "15", name: "Cantal" },
  { code: "16", name: "Charente" },
  { code: "17", name: "Charente-Maritime" },
  { code: "18", name: "Cher" },
  { code: "19", name: "Corrèze" },
  { code: "21", name: "Côte-d'Or" },
  { code: "22", name: "Côtes-d'Armor" },
  { code: "23", name: "Creuse" },
  { code: "24", name: "Dordogne" },
  { code: "25", name: "Doubs" },
  { code: "26", name: "Drôme" },
  { code: "27", name: "Eure" },
  { code: "28", name: "Eure-et-Loir" },
  { code: "29", name: "Finistère" },
  { code: "2A", name: "Corse-du-Sud" },
  { code: "2B", name: "Haute-Corse" },
  { code: "30", name: "Gard" },
  { code: "31", name: "Haute-Garonne" },
  { code: "32", name: "Gers" },
  { code: "33", name: "Gironde" },
  { code: "34", name: "Hérault" },
  { code: "35", name: "Ille-et-Vilaine" },
  { code: "36", name: "Indre" },
  { code: "37", name: "Indre-et-Loire" },
  { code: "38", name: "Isère" },
  { code: "39", name: "Jura" },
  { code: "40", name: "Landes" },
  { code: "41", name: "Loir-et-Cher" },
  { code: "42", name: "Loire" },
  { code: "43", name: "Haute-Loire" },
  { code: "44", name: "Loire-Atlantique" },
  { code: "45", name: "Loiret" },
  { code: "46", name: "Lot" },
  { code: "47", name: "Lot-et-Garonne" },
  { code: "48", name: "Lozère" },
  { code: "49", name: "Maine-et-Loire" },
  { code: "50", name: "Manche" },
  { code: "51", name: "Marne" },
  { code: "52", name: "Haute-Marne" },
  { code: "53", name: "Mayenne" },
  { code: "54", name: "Meurthe-et-Moselle" },
  { code: "55", name: "Meuse" },
  { code: "56", name: "Morbihan" },
  { code: "57", name: "Moselle" },
  { code: "58", name: "Nièvre" },
  { code: "59", name: "Nord" },
  { code: "60", name: "Oise" },
  { code: "61", name: "Orne" },
  { code: "62", name: "Pas-de-Calais" },
  { code: "63", name: "Puy-de-Dôme" },
  { code: "64", name: "Pyrénées-Atlantiques" },
  { code: "65", name: "Hautes-Pyrénées" },
  { code: "66", name: "Pyrénées-Orientales" },
  { code: "67", name: "Bas-Rhin" },
  { code: "68", name: "Haut-Rhin" },
  { code: "69", name: "Rhône" },
  { code: "70", name: "Haute-Saône" },
  { code: "71", name: "Saône-et-Loire" },
  { code: "72", name: "Sarthe" },
  { code: "73", name: "Savoie" },
  { code: "74", name: "Haute-Savoie" },
  { code: "75", name: "Paris" },
  { code: "76", name: "Seine-Maritime" },
  { code: "77", name: "Seine-et-Marne" },
  { code: "78", name: "Yvelines" },
  { code: "79", name: "Deux-Sèvres" },
  { code: "80", name: "Somme" },
  { code: "81", name: "Tarn" },
  { code: "82", name: "Tarn-et-Garonne" },
  { code: "83", name: "Var" },
  { code: "84", name: "Vaucluse" },
  { code: "85", name: "Vendée" },
  { code: "86", name: "Vienne" },
  { code: "87", name: "Haute-Vienne" },
  { code: "88", name: "Vosges" },
  { code: "89", name: "Yonne" },
  { code: "90", name: "Territoire de Belfort" },
  { code: "91", name: "Essonne" },
  { code: "92", name: "Hauts-de-Seine" },
  { code: "93", name: "Seine-Saint-Denis" },
  { code: "94", name: "Val-de-Marne" },
  { code: "95", name: "Val-d'Oise" },
  { code: "971", name: "Guadeloupe" },
  { code: "972", name: "Martinique" },
  { code: "973", name: "Guyane" },
  { code: "974", name: "La Réunion" },
  { code: "976", name: "Mayotte" },
]

export function GeoAIDropzone({ annonceId = "demo-annonce-id", onLocationValidated }: GeoAIDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [city, setCity] = useState<string>("")
  const [postalCode, setPostalCode] = useState<string>("")
  const [contextCategories, setContextCategories] = useState<string[]>([])
  const [contextNotes, setContextNotes] = useState<string>("")
  const [multiImageMode, setMultiImageMode] = useState<boolean>(false)
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [streetViewHeading, setStreetViewHeading] = useState<number>(0) // Angle de vue Street View (0-360)
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set()) // Champs auto-remplis
  const { state, result, error, progress, uploadImage, uploadMultipleImages, validateLocation, reset, isLoading } =
    useGeoAI({
      annonceId,
      onSuccess: () => {
        // Success handled by hook
        // Réinitialiser les fichiers sélectionnés après succès
        setSelectedFiles([])
        setImagePreviews([])
      },
    })

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return
    
    if (!selectedDepartment) {
      alert("Veuillez sélectionner un département pour aider à la localisation")
      return
    }

    // Mode simple : une seule image, upload immédiat
    if (!multiImageMode) {
      const file = files[0]
      const imageUrl = URL.createObjectURL(file)
      setUploadedImageUrl(imageUrl)
      await uploadImage(file, selectedDepartment, annonceId, {
        city: city || undefined,
        postalCode: postalCode || undefined,
        categories: contextCategories.length > 0 ? contextCategories : undefined,
        notes: contextNotes || undefined,
      })
      return
    }

    // Mode multi-images : ajout incrémental
    const currentCount = selectedFiles.length
    const remainingSlots = 6 - currentCount
    const newFiles = files.slice(0, remainingSlots)
    
    if (newFiles.length === 0) {
      alert("Vous avez déjà sélectionné le maximum de 6 images")
      return
    }

    // Ajouter les nouvelles images aux images déjà sélectionnées
    const updatedFiles = [...selectedFiles, ...newFiles]
    setSelectedFiles(updatedFiles)

    // Créer les previews pour les nouvelles images
    const newPreviews = await Promise.all(
      newFiles.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })
      }),
    )
    setImagePreviews([...imagePreviews, ...newPreviews])

    // Réinitialiser l'input pour permettre de sélectionner à nouveau
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"))
    if (files.length === 0) return
    
    if (!selectedDepartment) {
      alert("Veuillez sélectionner un département pour aider à la localisation")
      return
    }

    // Mode simple : une seule image, upload immédiat
    if (!multiImageMode) {
      const file = files[0]
      const imageUrl = URL.createObjectURL(file)
      setUploadedImageUrl(imageUrl)
      await uploadImage(file, selectedDepartment, annonceId, {
        city: city || undefined,
        postalCode: postalCode || undefined,
        categories: contextCategories.length > 0 ? contextCategories : undefined,
        notes: contextNotes || undefined,
      })
      return
    }

    // Mode multi-images : ajout incrémental
    const currentCount = selectedFiles.length
    const remainingSlots = 6 - currentCount
    const newFiles = files.slice(0, remainingSlots)
    
    if (newFiles.length === 0) {
      alert("Vous avez déjà sélectionné le maximum de 6 images")
      return
    }

    // Ajouter les nouvelles images aux images déjà sélectionnées
    const updatedFiles = [...selectedFiles, ...newFiles]
    setSelectedFiles(updatedFiles)

    // Créer les previews pour les nouvelles images
    const newPreviews = await Promise.all(
      newFiles.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })
      }),
    )
    setImagePreviews([...imagePreviews, ...newPreviews])
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleValidate = async () => {
    if (!result?.autoLocation) return

    const success = await validateLocation(
      result.autoLocation.address,
      result.autoLocation.latitude,
      result.autoLocation.longitude,
    )

    if (success) {
      onLocationValidated?.()
      // Ne pas réinitialiser l'image pour qu'elle reste visible
    }
  }

  const handleReset = () => {
    reset()
    setStreetViewHeading(0)
    setAutoFilledFields(new Set()) // Réinitialiser les champs auto-remplis
    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl)
      setUploadedImageUrl(null)
    }
  }

  // Initialiser le heading depuis le résultat
  useEffect(() => {
    if (result?.autoLocation?.heading !== undefined) {
      setStreetViewHeading(result.autoLocation.heading)
    }
  }, [result?.autoLocation?.heading])

  // Fonction pour parser l'adresse et extraire les composants
  const parseAddress = (address: string) => {
    const components: {
      street?: string
      postalCode?: string
      city?: string
      department?: string
    } = {}

    // Extraire le code postal (5 chiffres)
    const postalCodeMatch = address.match(/\b(\d{5})\b/)
    if (postalCodeMatch) {
      components.postalCode = postalCodeMatch[1]
      // Extraire le département (2 premiers chiffres)
      components.department = postalCodeMatch[1].substring(0, 2)
    }

    // Extraire la ville (après le code postal)
    // Patterns : "Rue, 75008 Paris" ou "75008 Paris" ou "Place de la République, 75003 Paris, France"
    const cityWithPostalPattern = /(\d{5})\s+([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s-]+?)(?:,|$)/i
    const cityMatch = address.match(cityWithPostalPattern)
    if (cityMatch && cityMatch[2]) {
      const cityCandidate = cityMatch[2].trim()
      if (cityCandidate && cityCandidate.toLowerCase() !== "france") {
        components.city = cityCandidate
      }
    } else {
      // Fallback : chercher une ville sans code postal (avant "France")
      const cityWithoutPostalPattern = /,\s*([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s-]+?)(?:,\s*France|$)/i
      const cityMatch2 = address.match(cityWithoutPostalPattern)
      if (cityMatch2 && cityMatch2[1]) {
        const cityCandidate = cityMatch2[1].trim()
        if (cityCandidate && cityCandidate.toLowerCase() !== "france") {
          components.city = cityCandidate
        }
      }
    }

    // Extraire la rue (tout avant le code postal ou la ville)
    // Patterns : "45 Rue de la Paix, 75001 Paris" ou "Place de la République, 75003 Paris"
    if (components.postalCode) {
      // Si on a un code postal, la rue est tout ce qui précède ", 750XX" ou " 750XX"
      const streetPattern = /^(.+?)(?:,\s*|\s+)(\d{5})/
      const streetMatch = address.match(streetPattern)
      if (streetMatch && streetMatch[1]) {
        const streetCandidate = streetMatch[1].trim()
        // Vérifier que ce n'est pas juste un numéro
        if (streetCandidate && !/^\d+$/.test(streetCandidate)) {
          components.street = streetCandidate
        }
      }
    } else if (components.city) {
      // Si pas de code postal mais une ville, la rue est avant la ville
      const streetPattern = new RegExp(`^(.+?)(?:,\\s*|\\s+)${components.city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i')
      const streetMatch = address.match(streetPattern)
      if (streetMatch && streetMatch[1]) {
        const streetCandidate = streetMatch[1].trim()
        if (streetCandidate && !/^\d+$/.test(streetCandidate)) {
          components.street = streetCandidate
        }
      }
    }

    // Fallback : si pas de rue trouvée, prendre la partie avant la première virgule
    if (!components.street && address.includes(",")) {
      const parts = address.split(",")
      const firstPart = parts[0].trim()
      // Vérifier que ce n'est pas un code postal ou une ville seule
      if (firstPart && !/^\d{5}$/.test(firstPart) && firstPart !== components.city) {
        components.street = firstPart
      }
    }

    return components
  }

  // Auto-remplir les champs du formulaire après détection réussie
  useEffect(() => {
    if (state === "success" && result?.autoLocation?.address) {
      const address = result.autoLocation.address
      const components = parseAddress(address)
      let hasAutoFilled = false

      const newAutoFilledFields = new Set<string>()

      // Auto-remplir uniquement si les champs sont vides (pour ne pas écraser une saisie manuelle)
      if (components.postalCode && !postalCode) {
        setPostalCode(components.postalCode)
        newAutoFilledFields.add("postalCode")
        hasAutoFilled = true
      }

      if (components.city && !city) {
        setCity(components.city)
        newAutoFilledFields.add("city")
        hasAutoFilled = true
      }

      // Mettre la rue dans les notes si elle existe et que les notes sont vides
      if (components.street && !contextNotes) {
        setContextNotes(components.street)
        newAutoFilledFields.add("notes")
        hasAutoFilled = true
      }

      if (hasAutoFilled) {
        setAutoFilledFields(newAutoFilledFields)
      }

      // Afficher une notification de confirmation seulement si on a auto-rempli quelque chose
      if (hasAutoFilled) {
        toast.success("📍 Formulaire auto-rempli", {
          description: `Ville: ${components.city || "N/A"}, Code postal: ${components.postalCode || "N/A"}`,
          duration: 5000,
        })
      } else {
        // Sinon, juste confirmer la détection
        toast.success("📍 Localisation détectée", {
          description: address,
          duration: 5000,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, result?.autoLocation?.address])

  // Cleanup des URLs d'objets lors du démontage
  useEffect(() => {
    return () => {
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl)
      }
    }
  }, [uploadedImageUrl])

  return (
    <Card className="border-2 border-purple-200/50 bg-gradient-to-br from-white to-purple-50/30 shadow-xl">
      <CardContent className="p-8 md:p-12">
        <AnimatePresence mode="wait">
          {/* Idle State - Dropzone */}
          {state === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* Sélection du département */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                    Département ou secteur <span className="text-red-500">*</span>
                  </Label>
                  {selectedDepartment && (
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      🔒 Département verrouillé ({selectedDepartment})
                    </Badge>
                  )}
                </div>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger
                    id="department"
                    className="w-full bg-white border-purple-200 focus:border-purple-400"
                  >
                    <SelectValue placeholder="Sélectionnez un département" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept.code} value={dept.code}>
                        {dept.code} - {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {selectedDepartment
                    ? "🔒 La localisation sera strictement limitée à ce département. Aucune sortie extérieure n'est possible."
                    : "Cette information aide l'IA à orienter la recherche de localisation"}
                </p>
              </div>

              {/* Filtres optionnels dans un menu déroulant */}
              <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                <CollapsibleTrigger className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Filtres optionnels pour améliorer la précision
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Optionnel
                    </Badge>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform ${
                      filtersOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  {/* Ville (optionnelle) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                        Ville <span className="text-gray-400 text-xs">(facultatif)</span>
                      </Label>
                      {autoFilledFields.has("city") && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                          Auto-détecté
                        </Badge>
                      )}
                    </div>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Ex: Paris, Lyon, Marseille..."
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value)
                        // Retirer du set si l'utilisateur modifie
                        if (autoFilledFields.has("city")) {
                          setAutoFilledFields((prev) => {
                            const newSet = new Set(prev)
                            newSet.delete("city")
                            return newSet
                          })
                        }
                      }}
                      className={`w-full bg-white border-purple-200 focus:border-purple-400 ${
                        autoFilledFields.has("city") ? "border-green-300 bg-green-50/30" : ""
                      }`}
                    />
                    <p className="text-xs text-gray-500">
                      Indiquez la ville pour améliorer la précision dans les zones urbaines
                    </p>
                  </div>

                  {/* Code postal (optionnel) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
                        Code postal <span className="text-gray-400 text-xs">(facultatif)</span>
                      </Label>
                      {autoFilledFields.has("postalCode") && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                          Auto-détecté
                        </Badge>
                      )}
                    </div>
                    <Input
                      id="postalCode"
                      type="text"
                      placeholder="Ex: 75001, 69001..."
                      value={postalCode}
                      onChange={(e) => {
                        // Ne garder que les chiffres
                        const value = e.target.value.replace(/\D/g, "").slice(0, 5)
                        setPostalCode(value)
                        // Retirer du set si l'utilisateur modifie
                        if (autoFilledFields.has("postalCode")) {
                          setAutoFilledFields((prev) => {
                            const newSet = new Set(prev)
                            newSet.delete("postalCode")
                            return newSet
                          })
                        }
                      }}
                      className={`w-full bg-white border-purple-200 focus:border-purple-400 ${
                        autoFilledFields.has("postalCode") ? "border-green-300 bg-green-50/30" : ""
                      }`}
                    />
                    <p className="text-xs text-gray-500">
                      Le code postal permet d'affiner la localisation dans les grandes villes
                    </p>
                  </div>

                  {/* Filtres contextuels */}
                  <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <Label className="text-sm font-medium text-gray-700">
                      Contexte supplémentaire <span className="text-gray-400 text-xs">(facultatif)</span>
                    </Label>
                    
                    {/* Type d'endroit */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">Type d'endroit</Label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Village",
                          "Petite ville",
                          "Zone rurale",
                          "Ruelle étroite",
                          "Place centrale",
                          "Zone pavillonnaire",
                          "Quartier résidentiel",
                          "Zone commerciale",
                          "Bord de route",
                          "Centre-ville",
                        ].map((category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => {
                              setContextCategories((prev) =>
                                prev.includes(category)
                                  ? prev.filter((c) => c !== category)
                                  : [...prev, category]
                              )
                            }}
                            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                              contextCategories.includes(category)
                                ? "bg-purple-100 border-purple-400 text-purple-700"
                                : "bg-white border-gray-300 text-gray-700 hover:border-purple-300"
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes utilisateur */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="contextNotes" className="text-xs font-medium text-gray-600">
                          Notes supplémentaires
                        </Label>
                        {autoFilledFields.has("notes") && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                            Auto-détecté
                          </Badge>
                        )}
                      </div>
                      <Textarea
                        id="contextNotes"
                        placeholder="Ex: Près d'une église, en haut d'une colline, près d'une rivière..."
                        value={contextNotes}
                        onChange={(e) => {
                          setContextNotes(e.target.value)
                          // Retirer du set si l'utilisateur modifie
                          if (autoFilledFields.has("notes")) {
                            setAutoFilledFields((prev) => {
                              const newSet = new Set(prev)
                              newSet.delete("notes")
                              return newSet
                            })
                          }
                        }}
                        className={`w-full bg-white border-gray-300 focus:border-purple-400 min-h-[80px] text-sm ${
                          autoFilledFields.has("notes") ? "border-green-300 bg-green-50/30" : ""
                        }`}
                        rows={3}
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Checkbox pour activer le mode multi-images */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="multi-image-mode"
                    checked={multiImageMode}
                    onCheckedChange={(checked) => {
                      setMultiImageMode(checked === true)
                      // Si on désactive le mode multi, réinitialiser les images
                      if (!checked && selectedFiles.length > 1) {
                        setSelectedFiles([])
                        setImagePreviews([])
                      }
                    }}
                  />
                  <Label
                    htmlFor="multi-image-mode"
                    className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
                  >
                    Activer le mode multi-images pour améliorer la précision
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    Optionnel
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-2 ml-6">
                  {multiImageMode
                    ? "Vous pourrez ajouter jusqu'à 6 images. Plus vous en ajoutez, plus l'IA pourra affiner la localisation."
                    : "Mode simple : une seule image sera analysée. Cochez la case ci-dessus pour activer le mode multi-images."}
                </p>
              </div>

              <div
                className="relative cursor-pointer rounded-2xl border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-12 transition-all hover:border-purple-400 hover:bg-purple-50/70"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  multiple={multiImageMode}
                  className="hidden"
                />

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mb-6 flex justify-center"
                >
                  <div className="rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-6">
                    <Scan className="h-12 w-12 text-white" />
                  </div>
                </motion.div>

                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                  Déposez une photo de façade, rue ou entrée
                </h3>
                <p className="mb-6 text-gray-600">
                  Notre IA analysera l'image et tentera de localiser automatiquement le bien.
                </p>

                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={!selectedDepartment}
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Sélectionner une image
                </Button>

                <p className="mt-4 text-xs text-gray-500">
                  {multiImageMode
                    ? "Jusqu'à 6 images — JPG, PNG, WebP (max 10MB)"
                    : "Formats supportés : JPG, PNG, WebP (max 10MB)"}
                </p>
              </div>

              {/* Miniatures des images sélectionnées (mode multi-images) */}
              {multiImageMode && selectedFiles.length > 0 && (
                <div className="space-y-3 rounded-xl border border-purple-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">
                      {selectedFiles.length} image{selectedFiles.length > 1 ? "s" : ""} sélectionnée{selectedFiles.length > 1 ? "s" : ""}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFiles([])
                        setImagePreviews([])
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Tout supprimer
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-purple-400 transition-colors">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
                            setImagePreviews((prev) => prev.filter((_, i) => i !== index))
                          }}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Supprimer cette image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedFiles.length > 0 && (
                    <Button
                      onClick={async () => {
                        if (!selectedDepartment) {
                          alert("Veuillez sélectionner un département")
                          return
                        }

                        // Toujours utiliser uploadImage pour une seule image, même en mode multi-images
                        const contextData = {
                          city: city || undefined,
                          postalCode: postalCode || undefined,
                          categories: contextCategories.length > 0 ? contextCategories : undefined,
                          notes: contextNotes || undefined,
                        }

                        if (selectedFiles.length === 1) {
                          const file = selectedFiles[0]
                          const imageUrl = URL.createObjectURL(file)
                          setUploadedImageUrl(imageUrl)
                          await uploadImage(file, selectedDepartment, annonceId, contextData)
                        } else if (selectedFiles.length > 1) {
                          // Utiliser la première image pour l'affichage
                          if (selectedFiles.length > 0) {
                            const imageUrl = URL.createObjectURL(selectedFiles[0])
                            setUploadedImageUrl(imageUrl)
                          }
                          // Upload multi-images via le hook
                          await uploadMultipleImages(selectedFiles, selectedDepartment, annonceId, contextData)
                        }
                      }}
                      disabled={isLoading || !selectedDepartment}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {selectedFiles.length > 1
                            ? `Analyse IA multi-images en cours... (${selectedFiles.length} images)`
                            : "Analyse de l'image en cours..."}
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          {selectedFiles.length > 1
                            ? `Analyser toutes les images (${selectedFiles.length})`
                            : "Analyser l'image"}
                        </>
                      )}
                    </Button>
                  )}
                  {selectedFiles.length < 6 && (
                    <div
                      className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex items-center justify-center gap-2 text-purple-600">
                        <Upload className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Ajouter d'autres images ({selectedFiles.length}/6)
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Glissez-déposez ou cliquez pour ajouter jusqu'à {6 - selectedFiles.length} image{6 - selectedFiles.length > 1 ? "s" : ""} supplémentaire{6 - selectedFiles.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Scanning State */}
          {state === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-6 flex justify-center"
              >
                <div className="rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-6">
                  <Loader2 className="h-12 w-12 text-white" />
                </div>
              </motion.div>

              <h3 className="mb-4 text-2xl font-bold text-gray-900">Analyse en cours...</h3>
              <p className="mb-6 text-gray-600">
                Notre IA scanne l'image et recherche des indices de localisation.
              </p>

              <div className="mx-auto max-w-md">
                <Progress value={progress} className="mb-2 h-2" />
                <p className="text-sm text-gray-500">{progress}%</p>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {state === "success" && result?.autoLocation && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full p-3 ${
                      result.source === "VISION_CONTEXT_FALLBACK"
                        ? "bg-orange-100"
                        : result.source === "EXIF"
                          ? "bg-green-100"
                          : "bg-blue-100"
                    }`}
                  >
                    <CheckCircle2
                      className={`h-6 w-6 ${
                        result.source === "VISION_CONTEXT_FALLBACK"
                          ? "text-orange-600"
                          : result.source === "EXIF"
                            ? "text-green-600"
                            : "text-blue-600"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-gray-900">Localisation détectée</h3>
                      {selectedDepartment && (
                        <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                          🔒 {selectedDepartment}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Source :{" "}
                      {result.source === "EXIF"
                        ? "GPS EXIF"
                        : result.source === "MAPS_SCREENSHOT"
                          ? "Screenshot Google Maps"
                          : result.source === "VISION_LANDMARK"
                            ? "Landmark détecté"
                            : result.source === "STREETVIEW_VISUAL_MATCH"
                              ? "StreetView Visual Match"
                              : result.source === "AI_GEOGUESSR"
                                ? "IA GPT-4o-mini"
                                : result.source === "VISION_CONTEXT_FALLBACK"
                                  ? "Contexte de l'annonce"
                                  : "Vision + Géocodage"}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Image d'origine + Comparaison */}
              {uploadedImageUrl && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-4 md:grid-cols-2">
                    {/* Image analysée */}
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-700">Image analysée</p>
                      <div className="relative overflow-hidden rounded-lg border border-gray-200">
                        <img
                          src={uploadedImageUrl}
                          alt="Image analysée"
                          className="h-64 w-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Street View - Iframe interactive */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">Vue Street View</p>
                        {result.autoLocation.streetViewEmbedUrl && (
                          <span className="text-xs text-gray-500">
                            {streetViewHeading}° {streetViewHeading === 0 ? "(Nord)" : streetViewHeading === 90 ? "(Est)" : streetViewHeading === 180 ? "(Sud)" : streetViewHeading === 270 ? "(Ouest)" : ""}
                          </span>
                        )}
                      </div>
                      {result.autoLocation.streetViewEmbedUrl ? (
                        <div className="space-y-2">
                          <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                            <iframe
                              src={result.autoLocation.streetViewEmbedUrl.replace(/heading=\d+/, `heading=${streetViewHeading}`)}
                              width="100%"
                              height="300"
                              style={{ border: 0 }}
                              allowFullScreen
                              className="h-64 w-full"
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            />
                          </div>
                          {/* Slider pour ajuster l'angle */}
                          <div className="space-y-1">
                            <Label htmlFor="heading-slider" className="text-xs text-gray-600">
                              Ajuster l'angle de vue (0° = Nord, 90° = Est, 180° = Sud, 270° = Ouest)
                            </Label>
                            <Slider
                              id="heading-slider"
                              min={0}
                              max={360}
                              step={15}
                              value={[streetViewHeading]}
                              onValueChange={(value) => setStreetViewHeading(value[0])}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>0° (N)</span>
                              <span>90° (E)</span>
                              <span>180° (S)</span>
                              <span>270° (O)</span>
                              <span>360°</span>
                            </div>
                          </div>
                        </div>
                      ) : result.autoLocation.streetViewUrl ? (
                        <div className="relative overflow-hidden rounded-lg border border-gray-200">
                          <img
                            src={result.autoLocation.streetViewUrl}
                            alt="Street View"
                            className="h-64 w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                          <p className="text-sm text-gray-500">Aperçu non disponible</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Légende */}
                  <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3">
                    <p className="text-xs text-gray-600">
                      <strong>Vue globale :</strong> Comparez l'image analysée avec la vue Street View pour valider la précision de la localisation détectée.
                    </p>
                  </div>
                </div>
              )}

              {/* Address - Pleine largeur, juste après les images */}
              <div className="w-full rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Adresse détectée</span>
                    </div>
                    <p className="mb-2 text-lg font-semibold text-gray-900">
                      {result.autoLocation.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      {result.autoLocation.latitude.toFixed(6)}, {result.autoLocation.longitude.toFixed(6)}
                    </p>
                  </div>
                  
                  {/* Score de confiance - Design circulaire amélioré */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      {/* Cercle de progression SVG */}
                      <svg className="h-24 w-24 -rotate-90 transform" viewBox="0 0 100 100">
                        {/* Cercle de fond */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-gray-200"
                        />
                        {/* Cercle de progression */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 45}`}
                          strokeDashoffset={`${2 * Math.PI * 45 * (1 - result.autoLocation.confidence)}`}
                          className={
                            result.autoLocation.confidence > 0.8
                              ? "text-green-500"
                              : result.autoLocation.confidence > 0.6
                                ? "text-yellow-500"
                                : "text-orange-500"
                          }
                        />
                      </svg>
                      {/* Contenu au centre */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className={`text-3xl font-bold leading-none ${
                            result.autoLocation.confidence > 0.8
                              ? "text-green-600"
                              : result.autoLocation.confidence > 0.6
                                ? "text-yellow-600"
                                : "text-orange-600"
                          }`}
                        >
                          {Math.round(result.autoLocation.confidence * 100)}
                          <span
                            className={`ml-1 text-lg font-semibold ${
                              result.autoLocation.confidence > 0.8
                                ? "text-green-600"
                                : result.autoLocation.confidence > 0.6
                                  ? "text-yellow-600"
                                  : "text-orange-600"
                            }`}
                          >
                            %
                          </span>
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-gray-600">Score de confiance</p>
                  </div>
                </div>
              </div>

              {/* Bloc d'explication */}
              {result.explanation && (
                <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-600" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      Comment l'IA a trouvé cette localisation ?
                    </h4>
                  </div>
                  
                  {/* Résumé */}
                  <p className="mb-4 text-sm text-gray-700 leading-relaxed">
                    {result.explanation.summary}
                  </p>
                  
                  {/* Liste des evidences */}
                  {result.explanation.evidences && result.explanation.evidences.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3">
                        Indices utilisés
                      </p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {result.explanation.evidences.map((evidence, index) => {
                          // Icône selon le type
                          const getIcon = () => {
                            switch (evidence.type) {
                              case "SHOP_SIGN":
                                return <Building className="h-4 w-4" />
                              case "ROAD_MARKING":
                              case "OCR_TEXT":
                                return <FileText className="h-4 w-4" />
                              case "LANDMARK":
                                return <MapPinned className="h-4 w-4" />
                              case "STREETVIEW_MATCH":
                                return <Camera className="h-4 w-4" />
                              case "GOOGLE_MAPS_SCREENSHOT":
                                return <Map className="h-4 w-4" />
                              case "EXIF_GPS":
                                return <MapPin className="h-4 w-4" />
                              case "DEPARTMENT_LOCK":
                                return <Lock className="h-4 w-4" />
                              case "ARCHITECTURE_STYLE":
                                return <Building className="h-4 w-4" />
                              case "LLM_REASONING":
                                return <Eye className="h-4 w-4" />
                              default:
                                return <MapPin className="h-4 w-4" />
                            }
                          }
                          
                          // Couleur selon le type
                          const getColorClasses = () => {
                            switch (evidence.type) {
                              case "SHOP_SIGN":
                                return "bg-blue-50 border-blue-200 text-blue-700"
                              case "ROAD_MARKING":
                              case "OCR_TEXT":
                                return "bg-purple-50 border-purple-200 text-purple-700"
                              case "LANDMARK":
                                return "bg-green-50 border-green-200 text-green-700"
                              case "STREETVIEW_MATCH":
                                return "bg-orange-50 border-orange-200 text-orange-700"
                              case "GOOGLE_MAPS_SCREENSHOT":
                                return "bg-indigo-50 border-indigo-200 text-indigo-700"
                              case "EXIF_GPS":
                                return "bg-emerald-50 border-emerald-200 text-emerald-700"
                              case "DEPARTMENT_LOCK":
                                return "bg-red-50 border-red-200 text-red-700"
                              case "ARCHITECTURE_STYLE":
                                return "bg-amber-50 border-amber-200 text-amber-700"
                              case "LLM_REASONING":
                                return "bg-violet-50 border-violet-200 text-violet-700"
                              default:
                                return "bg-gray-50 border-gray-200 text-gray-700"
                            }
                          }
                          
                          return (
                            <div
                              key={index}
                              className={`flex items-start gap-2 rounded-lg border p-3 ${getColorClasses()}`}
                            >
                              <div className="mt-0.5 flex-shrink-0">
                                {getIcon()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-tight">
                                  {evidence.label}
                                </p>
                                {evidence.detail && (
                                  <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                                    {evidence.detail}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Warning si fallback */}
              {result.warning && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <p className="text-sm text-orange-800">{result.warning}</p>
                </div>
              )}

              {/* Correction manuelle si score < 70% */}
              {result.needsManualCorrection && (
                <div className="rounded-lg border border-orange-300 bg-orange-50/80 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold text-orange-900">
                      Localisation imprécise ({Math.round((result.autoLocation?.confidence || 0) * 100)}%)
                    </h4>
                  </div>
                  <p className="mb-3 text-sm text-orange-800">
                    Adresse détectée : <strong>{result.autoLocation?.address}</strong>
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox id="accept-location" defaultChecked />
                      <Label htmlFor="accept-location" className="text-sm text-orange-900 cursor-pointer">
                        Accepter cette localisation
                      </Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manual-address" className="text-sm font-medium text-orange-900">
                        Corriger manuellement
                      </Label>
                      <Input
                        id="manual-address"
                        type="text"
                        placeholder="Ex: 45 Bd Raspail, 75006 Paris"
                        className="w-full bg-white border-orange-300 focus:border-orange-500"
                      />
                      <p className="text-xs text-orange-700">
                        Saisissez l'adresse complète pour améliorer la précision
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Carte interactive - Format horizontal */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Position GPS</p>
                <SimpleMap
                  latitude={result.autoLocation.latitude}
                  longitude={result.autoLocation.longitude}
                  address={result.autoLocation.address}
                  height="300px"
                  zoom={17}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleValidate}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Valider cette localisation
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleReset}>
                  Réessayer
                </Button>
              </div>

              {/* Texte explicatif - Déplacé sous les boutons */}
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                <p className="text-sm text-gray-700">
                  <strong>Comment ça fonctionne ?</strong> Notre IA a analysé votre image en utilisant{" "}
                  {result.source === "EXIF"
                    ? "les données GPS intégrées à la photo"
                    : result.source === "VISION_CONTEXT_FALLBACK"
                      ? "le contexte de l'annonce (ville, code postal)"
                      : "la reconnaissance optique de caractères (OCR) et la détection de repères visuels"}{" "}
                  pour identifier cette localisation. La précision dépend de la qualité de l'image et des informations visibles.
                </p>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {state === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-red-100 p-6">
                  <AlertCircle className="h-12 w-12 text-red-600" />
                </div>
              </div>

              <h3 className="mb-2 text-2xl font-bold text-gray-900">Erreur d'analyse</h3>
              <p className="mb-6 text-gray-600">{error || "Une erreur est survenue"}</p>

              <Button onClick={handleReset} variant="outline">
                Réessayer
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}