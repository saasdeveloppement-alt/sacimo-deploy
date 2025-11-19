"use client"

import { useState } from "react"
import { toast } from "sonner"
import type { LocationFromImageResult } from "@/types/location"

type GeoAIState = "idle" | "scanning" | "success" | "error"

/**
 * Compresse une image pour réduire sa taille avant l'upload
 * @param file Fichier image original
 * @param maxSizeMB Taille maximale en MB (défaut: 1MB)
 * @param maxWidth Largeur maximale (défaut: 1920px)
 * @param maxHeight Hauteur maximale (défaut: 1920px)
 * @returns Fichier compressé
 */
async function compressImage(
  file: File,
  maxSizeMB: number = 1,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Si le fichier est déjà assez petit, le retourner tel quel
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size <= maxSizeBytes) {
      resolve(file)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Calculer les nouvelles dimensions
        let width = img.width
        let height = img.height

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }

        // Créer un canvas avec les nouvelles dimensions
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Impossible de créer le contexte canvas"))
          return
        }

        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height)

        // Déterminer le type MIME et la qualité
        const mimeType = file.type || "image/jpeg"
        const isWebP = mimeType === "image/webp"
        const isPNG = mimeType === "image/png"
        
        // Qualité de compression (plus basse pour JPEG, plus haute pour PNG/WebP)
        let quality = isPNG ? 0.8 : isWebP ? 0.8 : 0.7

        // Fonction pour compresser avec itération si nécessaire
        const compress = (currentQuality: number): void => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Échec de la compression"))
                return
              }

              // Si la taille est acceptable ou si la qualité est déjà très basse, retourner
              if (blob.size <= maxSizeBytes || currentQuality <= 0.3) {
                const compressedFile = new File(
                  [blob],
                  file.name,
                  { type: mimeType },
                )
                resolve(compressedFile)
              } else {
                // Réduire la qualité et réessayer
                compress(Math.max(0.3, currentQuality - 0.1))
              }
            },
            mimeType,
            currentQuality,
          )
        }

        compress(quality)
      }
      img.onerror = () => {
        reject(new Error("Erreur lors du chargement de l'image"))
      }
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      reject(new Error("Erreur lors de la lecture du fichier"))
    }
    reader.readAsDataURL(file)
  })
}

interface UseGeoAIOptions {
  annonceId?: string
  onSuccess?: (result: LocationFromImageResult) => void
  onError?: (error: string) => void
}

export function useGeoAI(options: UseGeoAIOptions = {}) {
  const [state, setState] = useState<GeoAIState>("idle")
  const [result, setResult] = useState<LocationFromImageResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const uploadImage = async (
    file: File,
    department?: string,
    annonceId?: string,
    context?: {
      city?: string
      postalCode?: string
      categories?: string[]
      notes?: string
    },
  ) => {
    const targetAnnonceId = annonceId || options.annonceId

    if (!targetAnnonceId) {
      const err = "ID d'annonce requis"
      setError(err)
      setState("error")
      options.onError?.(err)
      toast.error(err)
      return
    }

    if (!department) {
      const err = "Département requis"
      setError(err)
      setState("error")
      options.onError?.(err)
      toast.error(err)
      return
    }

    // Validation du fichier
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      const err = "Type de fichier non supporté. Utilisez JPG, PNG ou WebP."
      setError(err)
      setState("error")
      options.onError?.(err)
      toast.error(err)
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      const err = "Fichier trop volumineux (max 10MB)"
      setError(err)
      setState("error")
      options.onError?.(err)
      toast.error(err)
      return
    }

    setState("scanning")
    setError(null)
    setResult(null)
    setProgress(0)

    try {
      // Compression de l'image avant l'envoi (max 1MB par image)
      setProgress(10)
      const compressedFile = await compressImage(file, 1, 1920, 1920)
      setProgress(20)

      // Simulation de progression
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const formData = new FormData()
      formData.append("file", compressedFile)
      formData.append("department", department)
      if (context?.city) formData.append("city", context.city)
      if (context?.postalCode) formData.append("postalCode", context.postalCode)
      if (context?.categories && context.categories.length > 0) {
        context.categories.forEach((cat) => formData.append("contextCategories[]", cat))
      }
      if (context?.notes) formData.append("contextNotes", context.notes)

      const response = await fetch(
        `/api/annonces/${targetAnnonceId}/localisation/from-image`,
        {
          method: "POST",
          body: formData,
        },
      )

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || `Erreur HTTP ${response.status}` }
        }
        const err = errorData.error || `Erreur ${response.status}: ${response.statusText}`
        console.error("❌ [useGeoAI] Erreur API:", err, errorData)
        setError(err)
        setState("error")
        options.onError?.(err)
        toast.error(err)
        return
      }

      const data: LocationFromImageResult = await response.json()

      if (data.status === "error") {
        const err = data.error || "Erreur lors du traitement"
        console.error("❌ [useGeoAI] Erreur dans la réponse:", err, data)
        setError(err)
        setState("error")
        options.onError?.(err)
        toast.error(err)
      } else {
        console.log("✅ [useGeoAI] Succès:", data)
        setResult(data)
        setState("success")
        options.onSuccess?.(data)
        if (data.warning) {
          toast.warning(data.warning, {
            description: `Confiance: ${Math.round((data.autoLocation?.confidence || 0) * 100)}%`,
          })
        } else {
          toast.success(
            `Localisation détectée avec ${Math.round((data.autoLocation?.confidence || 0) * 100)}% de confiance`,
          )
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || "Erreur lors de l'upload"
      setError(errorMessage)
      setState("error")
      options.onError?.(errorMessage)
      toast.error(errorMessage)
    } finally {
      setProgress(0)
    }
  }

  const validateLocation = async (
    address: string,
    latitude: number,
    longitude: number,
    annonceId?: string,
  ) => {
    const targetAnnonceId = annonceId || options.annonceId

    if (!targetAnnonceId) {
      const err = "ID d'annonce requis"
      toast.error(err)
      return false
    }

    try {
      const response = await fetch(
        `/api/annonces/${targetAnnonceId}/localisation/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address,
            latitude,
            longitude,
            precisionMeters: 20,
          }),
        },
      )

      const data = await response.json()

      if (data.success) {
        toast.success("Localisation validée avec succès")
        return true
      } else {
        toast.error(data.error || "Erreur lors de la validation")
        return false
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la validation")
      return false
    }
  }

  const uploadMultipleImages = async (
    files: File[],
    department?: string,
    annonceId?: string,
    context?: {
      city?: string
      postalCode?: string
      categories?: string[]
      notes?: string
    },
  ) => {
    const targetAnnonceId = annonceId || options.annonceId

    if (!targetAnnonceId) {
      const err = "ID d'annonce requis"
      setError(err)
      setState("error")
      options.onError?.(err)
      toast.error(err)
      return
    }

    if (!department) {
      const err = "Département requis"
      setError(err)
      setState("error")
      options.onError?.(err)
      toast.error(err)
      return
    }

    if (files.length === 0) {
      const err = "Aucun fichier fourni"
      setError(err)
      setState("error")
      options.onError?.(err)
      toast.error(err)
      return
    }

    // Si une seule image, utiliser le mode simple
    if (files.length === 1) {
      return await uploadImage(files[0], department, targetAnnonceId, context)
    }

    setState("scanning")
    setError(null)
    setResult(null)
    setProgress(0)

    try {
      // Compression de toutes les images avant l'envoi (max 1MB par image)
      setProgress(5)
      const compressedFiles: File[] = []
      const totalFiles = files.length
      
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImage(files[i], 1, 1920, 1920)
        compressedFiles.push(compressed)
        setProgress(5 + Math.floor((i + 1) / totalFiles * 15)) // 5-20% pour la compression
      }

      // Simulation de progression
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const formData = new FormData()
      compressedFiles.forEach((file) => {
        formData.append("files[]", file)
      })
      formData.append("department", department)
      if (context?.city) formData.append("city", context.city)
      if (context?.postalCode) formData.append("postalCode", context.postalCode)
      if (context?.categories && context.categories.length > 0) {
        context.categories.forEach((cat) => formData.append("contextCategories[]", cat))
      }
      if (context?.notes) formData.append("contextNotes", context.notes)

      const response = await fetch(
        `/api/annonces/${targetAnnonceId}/localisation/from-image`,
        {
          method: "POST",
          body: formData,
        },
      )

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || `Erreur HTTP ${response.status}` }
        }
        const err = errorData.error || `Erreur ${response.status}: ${response.statusText}`
        console.error("❌ [useGeoAI] Erreur API multi-images:", err, errorData)
        setError(err)
        setState("error")
        options.onError?.(err)
        toast.error(err)
        return
      }

      const data: LocationFromImageResult = await response.json()

      if (data.status === "error") {
        const err = data.error || "Erreur lors du traitement"
        console.error("❌ [useGeoAI] Erreur dans la réponse multi-images:", err, data)
        setError(err)
        setState("error")
        options.onError?.(err)
        toast.error(err)
      } else {
        console.log("✅ [useGeoAI] Succès multi-images:", data)
        setResult(data)
        setState("success")
        options.onSuccess?.(data)
        if (data.warning) {
          toast.warning(data.warning, {
            description: `Confiance: ${Math.round((data.autoLocation?.confidence || 0) * 100)}%`,
          })
        } else {
          toast.success(
            `Localisation consolidée à partir de ${files.length} image${files.length > 1 ? "s" : ""} - ${Math.round((data.autoLocation?.confidence || 0) * 100)}% de confiance`,
          )
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || "Erreur lors de l'upload"
      setError(errorMessage)
      setState("error")
      options.onError?.(errorMessage)
      toast.error(errorMessage)
    } finally {
      setProgress(0)
    }
  }

  const reset = () => {
    setState("idle")
    setResult(null)
    setError(null)
    setProgress(0)
  }

  return {
    state,
    result,
    error,
    progress,
    uploadImage,
    uploadMultipleImages,
    validateLocation,
    reset,
    isLoading: state === "scanning",
    isSuccess: state === "success",
    isError: state === "error",
    isIdle: state === "idle",
  }
}
