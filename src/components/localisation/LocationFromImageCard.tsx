"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Upload,
  Check,
  X,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Map,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { LocationFromImageResult, GeocodedCandidate } from "@/types/location"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface LocationFromImageCardProps {
  annonceId: string
  initialLocation?: {
    autoAddress?: string | null
    autoLatitude?: number | null
    autoLongitude?: number | null
    autoConfidence?: number | null
    autoSource?: string | null
    address?: string | null
    latitude?: number | null
    longitude?: number | null
  }
  onLocationValidated?: () => void
}

const DEPARTMENTS = [
  { code: "01", name: "Ain" }, { code: "02", name: "Aisne" }, { code: "03", name: "Allier" },
  { code: "04", name: "Alpes-de-Haute-Provence" }, { code: "05", name: "Hautes-Alpes" },
  { code: "06", name: "Alpes-Maritimes" }, { code: "07", name: "Ardèche" }, { code: "08", name: "Ardennes" },
  { code: "09", name: "Ariège" }, { code: "10", name: "Aube" }, { code: "11", name: "Aude" },
  { code: "12", name: "Aveyron" }, { code: "13", name: "Bouches-du-Rhône" }, { code: "14", name: "Calvados" },
  { code: "15", name: "Cantal" }, { code: "16", name: "Charente" }, { code: "17", name: "Charente-Maritime" },
  { code: "18", name: "Cher" }, { code: "19", name: "Corrèze" }, { code: "21", name: "Côte-d'Or" },
  { code: "22", name: "Côtes-d'Armor" }, { code: "23", name: "Creuse" }, { code: "24", name: "Dordogne" },
  { code: "25", name: "Doubs" }, { code: "26", name: "Drôme" }, { code: "27", name: "Eure" },
  { code: "28", name: "Eure-et-Loir" }, { code: "29", name: "Finistère" }, { code: "2A", name: "Corse-du-Sud" },
  { code: "2B", name: "Haute-Corse" }, { code: "30", name: "Gard" }, { code: "31", name: "Haute-Garonne" },
  { code: "32", name: "Gers" }, { code: "33", name: "Gironde" }, { code: "34", name: "Hérault" },
  { code: "35", name: "Ille-et-Vilaine" }, { code: "36", name: "Indre" }, { code: "37", name: "Indre-et-Loire" },
  { code: "38", name: "Isère" }, { code: "39", name: "Jura" }, { code: "40", name: "Landes" },
  { code: "41", name: "Loir-et-Cher" }, { code: "42", name: "Loire" }, { code: "43", name: "Haute-Loire" },
  { code: "44", name: "Loire-Atlantique" }, { code: "45", name: "Loiret" }, { code: "46", name: "Lot" },
  { code: "47", name: "Lot-et-Garonne" }, { code: "48", name: "Lozère" }, { code: "49", name: "Maine-et-Loire" },
  { code: "50", name: "Manche" }, { code: "51", name: "Marne" }, { code: "52", name: "Haute-Marne" },
  { code: "53", name: "Mayenne" }, { code: "54", name: "Meurthe-et-Moselle" }, { code: "55", name: "Meuse" },
  { code: "56", name: "Morbihan" }, { code: "57", name: "Moselle" }, { code: "58", name: "Nièvre" },
  { code: "59", name: "Nord" }, { code: "60", name: "Oise" }, { code: "61", name: "Orne" },
  { code: "62", name: "Pas-de-Calais" }, { code: "63", name: "Puy-de-Dôme" }, { code: "64", name: "Pyrénées-Atlantiques" },
  { code: "65", name: "Hautes-Pyrénées" }, { code: "66", name: "Pyrénées-Orientales" }, { code: "67", name: "Bas-Rhin" },
  { code: "68", name: "Haut-Rhin" }, { code: "69", name: "Rhône" }, { code: "70", name: "Haute-Saône" },
  { code: "71", name: "Saône-et-Loire" }, { code: "72", name: "Sarthe" }, { code: "73", name: "Savoie" },
  { code: "74", name: "Haute-Savoie" }, { code: "75", name: "Paris" }, { code: "76", name: "Seine-Maritime" },
  { code: "77", name: "Seine-et-Marne" }, { code: "78", name: "Yvelines" }, { code: "79", name: "Deux-Sèvres" },
  { code: "80", name: "Somme" }, { code: "81", name: "Tarn" }, { code: "82", name: "Tarn-et-Garonne" },
  { code: "83", name: "Var" }, { code: "84", name: "Vaucluse" }, { code: "85", name: "Vendée" },
  { code: "86", name: "Vienne" }, { code: "87", name: "Haute-Vienne" }, { code: "88", name: "Vosges" },
  { code: "89", name: "Yonne" }, { code: "90", name: "Territoire de Belfort" }, { code: "91", name: "Essonne" },
  { code: "92", name: "Hauts-de-Seine" }, { code: "93", name: "Seine-Saint-Denis" }, { code: "94", name: "Val-de-Marne" },
  { code: "95", name: "Val-d'Oise" }, { code: "971", name: "Guadeloupe" }, { code: "972", name: "Martinique" },
  { code: "973", name: "Guyane" }, { code: "974", name: "La Réunion" }, { code: "976", name: "Mayotte" },
]

export function LocationFromImageCard({
  annonceId,
  initialLocation,
  onLocationValidated,
}: LocationFromImageCardProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<LocationFromImageResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [showCandidates, setShowCandidates] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [multiImageMode, setMultiImageMode] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Utiliser les données initiales si disponibles
  const currentLocation = initialLocation?.autoAddress
    ? {
        address: initialLocation.autoAddress,
        latitude: initialLocation.autoLatitude,
        longitude: initialLocation.autoLongitude,
        confidence: initialLocation.autoConfidence || 0,
        source: initialLocation.autoSource || "VISION_GEOCODING",
      }
    : result?.autoLocation

  const isLocationValidated =
    initialLocation?.address && initialLocation?.latitude && initialLocation?.longitude

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Mode simple : une seule image, upload immédiat
    if (!multiImageMode) {
      const file = files[0]
      if (selectedDepartment) {
        await handleUpload(file)
      } else {
        // Stocker temporairement l'image en attendant le département
        setSelectedFiles([file])
        const preview = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })
        setImagePreviews([preview])
        toast.info("Sélectionnez un département pour analyser l'image")
      }
      return
    }

    // Mode multi-images : ajout incrémental
    const currentCount = selectedFiles.length
    const remainingSlots = 6 - currentCount
    const newFiles = files.slice(0, remainingSlots)
    
    if (newFiles.length === 0) {
      toast.error("Vous avez déjà sélectionné le maximum de 6 images")
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

  const handleRemoveImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return

    if (!selectedDepartment) {
      setError("Veuillez sélectionner un département avant d'analyser les images")
      toast.error("Département requis")
      return
    }

    if (selectedFiles.length === 1) {
      await handleUpload(selectedFiles[0])
      return
    }

    await handleMultiUpload(selectedFiles)
  }

  const handleUpload = async (file: File) => {
    if (!selectedDepartment) {
      setError("Veuillez sélectionner un département avant d'analyser l'image")
      toast.error("Département requis")
      return
    }

    setIsUploading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("department", selectedDepartment)

      const response = await fetch(
        `/api/annonces/${annonceId}/localisation/from-image`,
        {
          method: "POST",
          body: formData,
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data: LocationFromImageResult = await response.json()

      if (data.status === "error") {
        setError(data.error || "Erreur lors du traitement")
        toast.error(data.error || "Erreur lors du traitement de l'image")
      } else {
        setResult(data)
        toast.success(
          `Localisation détectée avec ${Math.round((data.autoLocation?.confidence || 0) * 100)}% de confiance`,
        )
      }
    } catch (err: any) {
      const errorMessage = err.message || "Erreur lors de l'upload"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleMultiUpload = async (files: File[]) => {
    if (!selectedDepartment) {
      setError("Veuillez sélectionner un département avant d'analyser les images")
      toast.error("Département requis")
      return
    }

    setIsUploading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append("files[]", file)
      })
      formData.append("department", selectedDepartment)

      const response = await fetch(
        `/api/annonces/${annonceId}/localisation/from-image`,
        {
          method: "POST",
          body: formData,
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data: LocationFromImageResult = await response.json()

      if (data.status === "error") {
        setError(data.error || "Erreur lors du traitement")
        toast.error(data.error || "Erreur lors du traitement des images")
      } else {
        setResult(data)
        const imageCount = files.length
        toast.success(
          `Localisation consolidée à partir de ${imageCount} image${imageCount > 1 ? "s" : ""} - ${Math.round((data.autoLocation?.confidence || 0) * 100)}% de confiance`,
        )
      }
    } catch (err: any) {
      const errorMessage = err.message || "Erreur lors de l'upload"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
      setSelectedFiles([])
      setImagePreviews([])
    }
  }

  const handleValidate = async () => {
    if (!currentLocation) return

    setIsValidating(true)

    try {
      const response = await fetch(
        `/api/annonces/${annonceId}/localisation/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: currentLocation.address,
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            precisionMeters:
              currentLocation.source === "EXIF" ? 10 : currentLocation.confidence > 0.8 ? 20 : 50,
          }),
        },
      )

      const data = await response.json()

      if (data.success) {
        toast.success("Localisation validée avec succès")
        onLocationValidated?.()
      } else {
        throw new Error(data.error || "Erreur lors de la validation")
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la validation")
    } finally {
      setIsValidating(false)
    }
  }

  const handleUseCandidate = async (candidate: GeocodedCandidate) => {
    setIsValidating(true)

    try {
      const response = await fetch(
        `/api/annonces/${annonceId}/localisation/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: candidate.address,
            latitude: candidate.latitude,
            longitude: candidate.longitude,
            precisionMeters: candidate.globalScore > 0.8 ? 20 : 50,
          }),
        },
      )

      const data = await response.json()

      if (data.success) {
        toast.success("Localisation alternative validée")
        onLocationValidated?.()
      } else {
        throw new Error(data.error || "Erreur lors de la validation")
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la validation")
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <Card className="border-2 border-purple-100">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-purple-600 rounded-lg">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          Localisation par image (IA)
        </CardTitle>
        <CardDescription>
          Upload une photo et on essaie de retrouver automatiquement l'adresse du bien
        </CardDescription>
        <p className="text-sm text-gray-600 mt-2">
          Vous pouvez ajouter plusieurs images. Plus vous en ajoutez, plus l'IA pourra affiner la précision de la localisation.
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Sélection du département */}
        {!currentLocation && (
          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium text-gray-700">
              Département ou secteur <span className="text-red-500">*</span>
            </Label>
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
              Cette information aide l'IA à orienter la recherche de localisation
            </p>
          </div>
        )}

        {/* Zone d'upload */}
        {!currentLocation && (
          <div className="space-y-4">
            {/* Checkbox pour activer le mode multi-images */}
            <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
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
            <p className="text-xs text-gray-500 -mt-2 ml-1">
              {multiImageMode
                ? "Vous pourrez ajouter jusqu'à 6 images. Plus vous en ajoutez, plus l'IA pourra affiner la localisation."
                : "Mode simple : une seule image sera analysée. Cochez la case ci-dessus pour activer le mode multi-images."}
            </p>

            {/* Dropzone - toujours visible */}
            {selectedFiles.length === 0 && (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer relative"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.add("border-purple-400", "bg-purple-50")
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove("border-purple-400", "bg-purple-50")
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove("border-purple-400", "bg-purple-50")
                  const files = Array.from(e.dataTransfer.files).filter((f) =>
                    f.type.startsWith("image/")
                  )
                  if (files.length > 0) {
                    if (multiImageMode) {
                      handleFileSelect({
                        target: { files: files.slice(0, 6) as any },
                      } as any)
                    } else {
                      handleFileSelect({
                        target: { files: [files[0]] as any },
                      } as any)
                    }
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  multiple={multiImageMode}
                  className="hidden"
                />
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {multiImageMode
                    ? "Glissez une ou plusieurs photos ici ou cliquez pour sélectionner"
                    : "Glissez une photo ici ou cliquez pour sélectionner"}
                </p>
                <p className="text-xs text-gray-400 mt-2 mb-3">
                  Photo de la façade, panneau de rue, plaque d'adresse, etc.
                </p>
                <Badge variant="outline" className="text-xs bg-white/80">
                  {multiImageMode
                    ? "Jusqu'à 6 images — JPG, PNG, WebP (max 10MB)"
                    : "JPG, PNG, WebP (max 10MB)"}
                </Badge>
              </div>
            )}

            {/* Miniatures des images sélectionnées */}
            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">
                    {selectedFiles.length} image{selectedFiles.length > 1 ? "s" : ""} sélectionnée{selectedFiles.length > 1 ? "s" : ""}
                    {!multiImageMode && selectedFiles.length === 1 && (
                      <span className="ml-2 text-xs text-gray-500">
                        (Mode simple)
                      </span>
                    )}
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
                    {selectedFiles.length > 1 ? "Tout supprimer" : "Supprimer"}
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
                          handleRemoveImage(index)
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
                {/* Bouton d'analyse - affiché selon le mode */}
                {multiImageMode ? (
                  // Mode multi-images : bouton pour analyser toutes les images
                  <>
                    {selectedFiles.length > 0 && (
                      <Button
                        onClick={handleUploadAll}
                        disabled={isUploading || !selectedDepartment}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50"
                      >
                        {isUploading ? (
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
                    {selectedFiles.length > 0 && !isUploading && !selectedDepartment && (
                      <p className="text-xs text-center text-amber-600 font-medium">
                        ⚠️ Sélectionnez un département pour démarrer l'analyse
                      </p>
                    )}
                    {selectedFiles.length < 6 && (
                      <div
                        className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.currentTarget.classList.add("border-purple-500", "bg-purple-100")
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault()
                          e.currentTarget.classList.remove("border-purple-500", "bg-purple-100")
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          e.currentTarget.classList.remove("border-purple-500", "bg-purple-100")
                          const files = Array.from(e.dataTransfer.files).filter((f) =>
                            f.type.startsWith("image/")
                          )
                          if (files.length > 0) {
                            const remainingSlots = 6 - selectedFiles.length
                            const newFiles = files.slice(0, remainingSlots)
                            if (newFiles.length > 0) {
                              handleFileSelect({
                                target: { files: newFiles as any },
                              } as any)
                            }
                          }
                        }}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleFileSelect}
                          multiple
                          className="hidden"
                        />
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
                  </>
                ) : (
                  // Mode simple : afficher un message si l'image est prête mais pas de département
                  selectedFiles.length === 1 && !isUploading && !selectedDepartment && (
                    <div className="space-y-2">
                      <p className="text-xs text-center text-amber-600 font-medium">
                        ⚠️ Sélectionnez un département pour analyser l'image
                      </p>
                      <Button
                        onClick={() => {
                          if (selectedDepartment && selectedFiles.length === 1) {
                            handleUpload(selectedFiles[0])
                          }
                        }}
                        disabled={!selectedDepartment}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Analyser l'image
                      </Button>
                    </div>
                  )
                )}
              </div>
            )}

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    {selectedFiles.length > 1
                      ? `Analyse IA multi-images en cours... (${selectedFiles.length} images)`
                      : "Analyse de l'image en cours..."}
                  </span>
                </div>
                <Progress value={undefined} className="h-2" />
              </div>
            )}
          </div>
        )}

        {/* Erreur */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Résultat de la localisation */}
        {currentLocation && (
          <div className="space-y-4">
            {/* Badge de statut */}
            <div className="flex items-center gap-2 flex-wrap">
              {isLocationValidated ? (
                <Badge className="bg-green-100 text-green-700 border-green-300">
                  <Check className="h-3 w-3 mr-1" />
                  Localisation validée
                </Badge>
              ) : (
                <Badge
                  className={
                    currentLocation.source === "EXIF"
                      ? "bg-blue-100 text-blue-700 border-blue-300"
                      : currentLocation.source === "MULTI_IMAGE_CONSOLIDATED"
                        ? "bg-gradient-to-r from-green-100 to-blue-100 text-green-700 border-green-300"
                        : currentLocation.source === "AI_GEOGUESSR"
                          ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-300"
                          : "bg-orange-100 text-orange-700 border-orange-300"
                  }
                >
                  {currentLocation.source === "EXIF"
                    ? "GPS EXIF (très fiable)"
                    : currentLocation.source === "MULTI_IMAGE_CONSOLIDATED"
                      ? "Localisation consolidée (multi-images)"
                      : currentLocation.source === "AI_GEOGUESSR"
                        ? "Prédiction IA globale (dernier recours)"
                        : "Proposition automatique"}
                </Badge>
              )}
              {currentLocation.confidence > 0 && (
                <Badge variant="outline">
                  Confiance : {Math.round(currentLocation.confidence * 100)}%
                </Badge>
              )}
            </div>

            {/* Message pour MULTI_IMAGE_CONSOLIDATED */}
            {currentLocation.source === "MULTI_IMAGE_CONSOLIDATED" && result?.individualResults && (
              <Alert className="bg-green-50 border-green-200">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Localisation consolidée via plusieurs images</AlertTitle>
                <AlertDescription className="text-green-700">
                  L'IA a analysé {result.individualResults.length} image{result.individualResults.length > 1 ? "s" : ""} et a comparé les façades, l'orientation, les perspectives et les éléments visuels pour produire une localisation plus précise.
                </AlertDescription>
              </Alert>
            )}

            {/* Message d'avertissement pour AI_GEOGUESSR */}
            {currentLocation.source === "AI_GEOGUESSR" && result?.warning && (
              <Alert className="bg-purple-50 border-purple-200">
                <AlertCircle className="h-4 w-4 text-purple-600" />
                <AlertTitle className="text-purple-800">Estimation approximative</AlertTitle>
                <AlertDescription className="text-purple-700">
                  {result.warning}
                </AlertDescription>
              </Alert>
            )}

            {/* Warning pour incohérence multi-images */}
            {currentLocation.source === "MULTI_IMAGE_CONSOLIDATED" && result?.warning && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Attention</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  {result.warning}
                </AlertDescription>
              </Alert>
            )}

            {/* Adresse proposée */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-1">Adresse proposée</p>
              <p className="text-base font-semibold text-gray-900">{currentLocation.address}</p>
              {currentLocation.latitude && currentLocation.longitude && (
                <p className="text-xs text-gray-500 mt-1">
                  {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </p>
              )}
            </div>

            {/* Street View Preview */}
            {currentLocation.streetViewUrl && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Aperçu Street View</p>
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={currentLocation.streetViewUrl}
                    alt="Street View"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                  <a
                    href={`https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 bg-white px-3 py-1.5 rounded-lg shadow-md text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                  >
                    <Map className="h-3 w-3" />
                    Voir dans Google Maps
                  </a>
                </div>
              </div>
            )}

            <Separator />

            {/* Actions */}
            {!isLocationValidated && (
              <div className="flex gap-3">
                <Button
                  onClick={handleValidate}
                  disabled={isValidating}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Validation...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Valider cette localisation
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            )}

            {/* Résultats individuels pour multi-images */}
            {result?.individualResults && result.individualResults.length > 0 && (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="text-sm">
                      Résultats par image ({result.individualResults.length})
                    </span>
                    <span className="text-xs text-gray-500">
                      Afficher les détails
                    </span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-2">
                  {result.individualResults.map((individual, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          Image {individual.imageIndex + 1}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {individual.source === "EXIF"
                            ? "EXIF"
                            : individual.source === "VISION_LANDMARK"
                              ? "Landmark"
                              : individual.source === "VISION_GEOCODING"
                                ? "OCR"
                                : individual.source === "AI_GEOGUESSR"
                                  ? "IA"
                                  : individual.source}
                        </Badge>
                      </div>
                      {individual.address && (
                        <p className="text-xs text-gray-700 mb-1">{individual.address}</p>
                      )}
                      {individual.latitude && individual.longitude ? (
                        <p className="text-xs text-gray-500">
                          {individual.latitude.toFixed(6)}, {individual.longitude.toFixed(6)}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">Aucune coordonnée</p>
                      )}
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Confiance:</span>
                          <Progress
                            value={individual.confidence * 100}
                            className="flex-1 h-2"
                          />
                          <span className="text-xs font-medium text-gray-700">
                            {Math.round(individual.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Candidats alternatifs */}
            {result?.candidates && result.candidates.length > 1 && (
              <Collapsible open={showCandidates} onOpenChange={setShowCandidates}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="text-sm">
                      Autres propositions ({result.candidates.length - 1})
                    </span>
                    <span className="text-xs text-gray-500">
                      {showCandidates ? "Masquer" : "Afficher"}
                    </span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-2">
                  {result.candidates.slice(1).map((candidate, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{candidate.address}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Score : {Math.round(candidate.globalScore * 100)}%
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUseCandidate(candidate)}
                        disabled={isValidating}
                      >
                        Utiliser
                      </Button>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}

        {/* État initial (aucune tentative) */}
        {!currentLocation && !isUploading && !error && (
          <div className="text-center py-4">
            <Badge variant="outline" className="bg-gray-50">
              Aucune tentative encore
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
