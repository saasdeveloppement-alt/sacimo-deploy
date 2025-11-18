"use client"

import { useState } from "react"
import { toast } from "sonner"
import type { LocationFromImageResult } from "@/types/location"

type GeoAIState = "idle" | "scanning" | "success" | "error"

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

  const uploadImage = async (file: File, department?: string, annonceId?: string) => {
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
      formData.append("file", file)
      formData.append("department", department)

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
    validateLocation,
    reset,
    isLoading: state === "scanning",
    isSuccess: state === "success",
    isError: state === "error",
    isIdle: state === "idle",
  }
}
