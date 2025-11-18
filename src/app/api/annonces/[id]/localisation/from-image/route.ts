/**
 * Route API pour localiser un bien à partir d'une image
 * POST /api/annonces/[id]/localisation/from-image
 * 
 * Pipeline :
 * 1. Lecture EXIF (si disponible)
 * 2. Google Vision API (OCR)
 * 3. Extraction d'adresses candidates
 * 4. Google Geocoding API
 * 5. Street View (validation)
 * 6. Sauvegarde dans AnnonceLocation
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PrismaClient } from "@prisma/client"
import {
  callVisionForImage,
  extractAddressCandidatesFromVision,
  geocodeAddressCandidates,
  readExifFromImage,
  fetchStreetViewPreview,
  reverseGeocode,
} from "@/lib/google/locationClient"
import type { LocationFromImageResult, GeocodedCandidate } from "@/types/location"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Auth & validation (optionnel pour les tests locaux)
    // En production, décommenter cette section
    // const session = await getServerSession(authOptions)
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { status: "error", error: "Non authentifié" },
    //     { status: 401 },
    //   )
    // }

    // Vérifier que prisma est bien initialisé
    if (!prisma) {
      console.error("❌ [Localisation] Prisma n'est pas initialisé")
      return NextResponse.json(
        { status: "error", error: "Erreur de configuration serveur" },
        { status: 500 },
      )
    }

    const { id } = await params

    // 2. Récupération du listing (ou création si demo)
    let annonce = await prisma.annonceScrape.findUnique({
      where: { id },
      select: {
        id: true,
        city: true,
        postalCode: true,
        title: true,
      },
    })

    // Si l'annonce n'existe pas et que c'est un ID demo, créer une annonce temporaire
    if (!annonce && id === "demo-annonce-id") {
      annonce = await prisma.annonceScrape.create({
        data: {
          id: "demo-annonce-id",
          title: "Bien de démonstration - Localisation IA",
          price: 0,
          city: "Paris",
          postalCode: "75001",
          url: "https://demo.sacimo.local",
          publishedAt: new Date(),
          source: "DEMO",
        },
        select: {
          id: true,
          city: true,
          postalCode: true,
          title: true,
        },
      })
    }

    if (!annonce) {
      return NextResponse.json(
        { status: "error", error: "Annonce non trouvée" },
        { status: 404 },
      )
    }

    // 3. Récupération du FormData
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { status: "error", error: "Aucun fichier fourni" },
        { status: 400 },
      )
    }

    // Validation du type de fichier
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          status: "error",
          error: "Type de fichier non supporté. Utilisez JPG, PNG ou WebP.",
        },
        { status: 400 },
      )
    }

    // Validation de la taille (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { status: "error", error: "Fichier trop volumineux (max 10MB)" },
        { status: 400 },
      )
    }

    // 4. Conversion en Buffer
    const arrayBuffer = await file.arrayBuffer()
    const imageBuffer = Buffer.from(arrayBuffer)

    // 5. Lecture EXIF (priorité)
    console.log("📸 [Localisation] Lecture EXIF...")
    const exifData = await readExifFromImage(imageBuffer)

    if (exifData.lat && exifData.lng) {
      console.log(
        `✅ [Localisation] Coordonnées GPS trouvées dans EXIF: ${exifData.lat}, ${exifData.lng}`,
      )

      // Récupérer ou créer AnnonceLocation
      let location = await prisma.annonceLocation.findUnique({
        where: { annonceScrapeId: id },
      })

      if (!location) {
        location = await prisma.annonceLocation.create({
          data: {
            annonceScrapeId: id,
            autoLatitude: exifData.lat,
            autoLongitude: exifData.lng,
            autoConfidence: 0.98,
            autoSource: "EXIF",
          },
        })
      } else {
        location = await prisma.annonceLocation.update({
          where: { id: location.id },
          data: {
            autoLatitude: exifData.lat,
            autoLongitude: exifData.lng,
            autoConfidence: 0.98,
            autoSource: "EXIF",
          },
        })
      }

      // Mettre à jour aussi latitude/longitude directement sur AnnonceScrape
      await prisma.annonceScrape.update({
        where: { id },
        data: {
          latitude: exifData.lat,
          longitude: exifData.lng,
        },
      })

      // Utiliser le reverse geocoding pour obtenir l'adresse réelle
      const reverseGeocodeResult = await reverseGeocode(exifData.lat, exifData.lng)
      const address = reverseGeocodeResult?.address || `${exifData.lat}, ${exifData.lng}`
      
      // Mettre à jour l'adresse dans la location
      if (reverseGeocodeResult) {
        await prisma.annonceLocation.update({
          where: { id: location.id },
          data: {
            autoAddress: reverseGeocodeResult.address,
          },
        })
      }

      const streetViewUrl = fetchStreetViewPreview(exifData.lat, exifData.lng)

      return NextResponse.json({
        status: "ok",
        source: "EXIF",
        autoLocation: {
          address,
          latitude: exifData.lat,
          longitude: exifData.lng,
          confidence: 0.98,
          streetViewUrl,
        },
      } as LocationFromImageResult)
    }

    // 6. Appel Google Vision (si pas d'EXIF)
    console.log("🔍 [Localisation] Appel Google Vision API...")
    const visionResult = await callVisionForImage(imageBuffer)

    // 7. Vérifier d'abord si on a des landmarks avec coordonnées GPS directes
    const landmarks = visionResult.landmarkAnnotations || []
    if (landmarks.length > 0) {
      for (const landmark of landmarks) {
        if (landmark.locations && landmark.locations.length > 0) {
          const location = landmark.locations[0]
          if (location.latLng) {
            console.log(
              `🎯 [Localisation] Landmark détecté: ${landmark.description} à ${location.latLng.latitude}, ${location.latLng.longitude}`,
            )

            // Utiliser le reverse geocoding pour obtenir l'adresse réelle depuis les coordonnées du landmark
            // C'est plus fiable que le forward geocoding car on a déjà les coordonnées exactes
            const reverseGeocodeResult = await reverseGeocode(
              location.latLng.latitude,
              location.latLng.longitude,
            )
            
            // Utiliser l'adresse du reverse geocoding si disponible, sinon fallback sur la description du landmark
            const landmarkAddress = reverseGeocodeResult?.address || `${landmark.description}, France`

            if (reverseGeocodeResult) {
              // Utiliser les coordonnées du landmark (plus précises)
              const landmarkLat = location.latLng.latitude
              const landmarkLng = location.latLng.longitude

              // Sauvegarder
              let locationRecord = await prisma.annonceLocation.findUnique({
                where: { annonceScrapeId: id },
              })

              const locationData = {
                autoAddress: landmarkAddress,
                autoLatitude: landmarkLat,
                autoLongitude: landmarkLng,
                autoConfidence: 0.95,
                autoSource: "VISION_LANDMARK",
                visionRaw: visionResult as any,
                geocodingCandidates: [{ address: landmarkAddress, latitude: landmarkLat, longitude: landmarkLng, globalScore: 0.95 }] as any,
              }

              if (!locationRecord) {
                locationRecord = await prisma.annonceLocation.create({
                  data: {
                    annonceScrapeId: id,
                    ...locationData,
                  },
                })
              } else {
                locationRecord = await prisma.annonceLocation.update({
                  where: { id: locationRecord.id },
                  data: locationData,
                })
              }

              await prisma.annonceScrape.update({
                where: { id },
                data: {
                  latitude: landmarkLat,
                  longitude: landmarkLng,
                },
              })

              const streetViewUrl = fetchStreetViewPreview(landmarkLat, landmarkLng)

              return NextResponse.json({
                status: "ok",
                source: "VISION_LANDMARK",
                autoLocation: {
                  address: landmarkAddress,
                  latitude: landmarkLat,
                  longitude: landmarkLng,
                  confidence: 0.95,
                  streetViewUrl,
                },
                candidates: [{ address: landmarkAddress, latitude: landmarkLat, longitude: landmarkLng, globalScore: 0.95 }],
              } as LocationFromImageResult)
            } else {
              // Si le reverse geocoding échoue, continuer avec le pipeline normal
              console.log("⚠️ [Localisation] Reverse geocoding échoué pour landmark, continuation avec pipeline normal")
            }
          }
        }
      }
    }

    // 8. Extraction des candidats d'adresse depuis le texte
    console.log("📝 [Localisation] Extraction des adresses candidates...")
    const addressCandidates = extractAddressCandidatesFromVision(visionResult, {
      city: annonce.city,
      postalCode: annonce.postalCode || undefined,
      country: "France",
    })

    if (addressCandidates.length === 0) {
      // Essayer d'utiliser le contexte de l'annonce comme fallback
      const fallbackAddress = `${annonce.city}${annonce.postalCode ? ` ${annonce.postalCode}` : ""}, France`
      
      console.log(`⚠️ [Localisation] Aucune adresse détectée, utilisation du contexte: ${fallbackAddress}`)
      
      // Géocoder l'adresse de contexte
      const fallbackCandidates = await geocodeAddressCandidates(
        [
          {
            rawText: fallbackAddress,
            score: 0.2,
          },
        ],
        {
          city: annonce.city,
          postalCode: annonce.postalCode || undefined,
          country: "France",
        },
      )

      if (fallbackCandidates.length > 0) {
        const bestCandidate = fallbackCandidates[0]
        
        // Sauvegarder avec un score de confiance bas
        let location = await prisma.annonceLocation.findUnique({
          where: { annonceScrapeId: id },
        })

        const locationData = {
          autoAddress: bestCandidate.address,
          autoLatitude: bestCandidate.latitude,
          autoLongitude: bestCandidate.longitude,
          autoConfidence: 0.3, // Confiance basse car basée sur le contexte
          autoSource: "VISION_CONTEXT_FALLBACK",
          visionRaw: visionResult as any,
          geocodingCandidates: fallbackCandidates as any,
        }

        if (!location) {
          location = await prisma.annonceLocation.create({
            data: {
              annonceScrapeId: id,
              ...locationData,
            },
          })
        } else {
          location = await prisma.annonceLocation.update({
            where: { id: location.id },
            data: locationData,
          })
        }

        // Mettre à jour aussi latitude/longitude directement sur AnnonceScrape
        await prisma.annonceScrape.update({
          where: { id },
          data: {
            latitude: bestCandidate.latitude,
            longitude: bestCandidate.longitude,
          },
        })

        return NextResponse.json({
          status: "ok",
          source: "VISION_CONTEXT_FALLBACK",
          autoLocation: {
            address: bestCandidate.address,
            latitude: bestCandidate.latitude,
            longitude: bestCandidate.longitude,
            confidence: 0.3,
            streetViewUrl: bestCandidate.streetViewUrl,
          },
          candidates: fallbackCandidates,
          warning: "Aucune adresse détectée dans l'image. Localisation basée sur le contexte de l'annonce.",
        } as LocationFromImageResult)
      }

      // Si même le fallback échoue, retourner une erreur
      return NextResponse.json({
        status: "error",
        error: "Aucune adresse détectée dans l'image et impossible de géocoder le contexte",
      } as LocationFromImageResult)
    }

    console.log(
      `✅ [Localisation] ${addressCandidates.length} adresse(s) candidate(s) trouvée(s)`,
    )

    // 9. Géocoding
    console.log("🗺️ [Localisation] Géocodage des adresses...")
    // Ne pas passer le contexte de l'annonce si les adresses détectées contiennent déjà des villes ou codes postaux
    // Cela évite de forcer une mauvaise ville (ex: forcer Paris alors que c'est Bordeaux)
    const hasCityInCandidates = addressCandidates.some((candidate) => {
      const text = candidate.rawText
      // Détecter un code postal français (5 chiffres)
      const hasPostalCode = /\d{5}/.test(text)
      // Détecter un pattern de ville (mot avec majuscule suivi de lettres minuscules, typique des noms de villes françaises)
      const hasCityPattern = /[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+(?:\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+)*/.test(text)
      return hasPostalCode || hasCityPattern
    })
    
    const geocodedCandidates = await geocodeAddressCandidates(
      addressCandidates,
      hasCityInCandidates
        ? { country: "France" } // Ne passer que le pays si une ville est déjà détectée
        : {
            city: annonce.city,
            postalCode: annonce.postalCode || undefined,
            country: "France",
          },
    )

    if (geocodedCandidates.length === 0) {
      return NextResponse.json({
        status: "error",
        error: "Aucune adresse n'a pu être géocodée",
      } as LocationFromImageResult)
    }

    console.log(
      `✅ [Localisation] ${geocodedCandidates.length} adresse(s) géocodée(s)`,
    )

    // 10. Sélection du meilleur candidat
    const bestCandidate = geocodedCandidates[0]

    console.log(
      `🏆 [Localisation] Meilleur candidat: ${bestCandidate.address} (score: ${bestCandidate.globalScore.toFixed(2)})`,
    )

    // 11. Sauvegarde dans AnnonceLocation
    let location = await prisma.annonceLocation.findUnique({
      where: { annonceScrapeId: id },
    })

    const locationData = {
      autoAddress: bestCandidate.address,
      autoLatitude: bestCandidate.latitude,
      autoLongitude: bestCandidate.longitude,
      autoConfidence: bestCandidate.globalScore,
      autoSource: "VISION_GEOCODING",
      visionRaw: visionResult as any,
      geocodingCandidates: geocodedCandidates as any,
    }

    if (!location) {
      location = await prisma.annonceLocation.create({
        data: {
          annonceScrapeId: id,
          ...locationData,
        },
      })
    } else {
      location = await prisma.annonceLocation.update({
        where: { id: location.id },
        data: locationData,
      })
    }

    // Mettre à jour aussi latitude/longitude directement sur AnnonceScrape
    await prisma.annonceScrape.update({
      where: { id },
      data: {
        latitude: bestCandidate.latitude,
        longitude: bestCandidate.longitude,
      },
    })

    // 11. Réponse JSON
    return NextResponse.json({
      status: "ok",
      source: "VISION_GEOCODING",
      autoLocation: {
        address: bestCandidate.address,
        latitude: bestCandidate.latitude,
        longitude: bestCandidate.longitude,
        confidence: bestCandidate.globalScore,
        streetViewUrl: bestCandidate.streetViewUrl,
      },
      candidates: geocodedCandidates,
    } as LocationFromImageResult)
  } catch (error: any) {
    console.error("❌ [Localisation] Erreur complète:", error)
    console.error("❌ [Localisation] Stack:", error.stack)
    console.error("❌ [Localisation] Message:", error.message)
    
    // Vérifier si c'est une erreur de clé API manquante
    if (error.message?.includes("non configurée")) {
      return NextResponse.json(
        {
          status: "error",
          error: `Configuration manquante: ${error.message}. Vérifiez vos variables d'environnement (.env.local).`,
        },
        { status: 500 },
      )
    }
    
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Erreur lors du traitement de l'image",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

