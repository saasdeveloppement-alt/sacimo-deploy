/**
 * Classifieur robuste de screenshot Google Maps/Street View utilisant OpenAI Vision
 * Détecte les captures d'écran Google Maps même sans UI visible, en analysant les caractéristiques visuelles Street View
 */

export interface MapsScreenshotDetection {
  isMaps: boolean
  confidence: number
}

/**
 * Détecte si une image est une capture d'écran Google Maps/Street View
 * Analyse les caractéristiques visuelles Street View plutôt que seulement l'UI
 * 
 * @param imageBase64 Image encodée en base64
 * @returns Résultat de détection avec confiance (0-1)
 */
export async function isMapsScreenshotVision(
  imageBase64: string,
): Promise<MapsScreenshotDetection> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY

  if (!OPENAI_API_KEY) {
    console.warn("⚠️ [isMapsScreenshotVision] OPENAI_API_KEY non configurée")
    return { isMaps: false, confidence: 0 }
  }

  try {
    const prompt = `Tu es un classifieur spécialisé dans la détection d'interfaces Google Maps et Street View.

⚠️ IMPORTANT : NE TE BASE PAS SUR L'OCR UNIQUEMENT.
Analyse les éléments visuels typiques de Google Maps et Street View :

ÉLÉMENTS VISUELS STREET VIEW À CHERCHER :
- Style Street View (déformation caractéristique, grain, profondeur, tonalité spécifique)
- Trottoirs et routes typiques de Street View (texture, éclairage)
- Textures Google Maps (pavés, arbres, éclairage caractéristique)
- Style des bâtiments (déformation Street View spécifique)
- Perspective "bulb" caractéristique de Street View
- Qualité d'image StreetView (compression, résolution typique)
- Horizon StreetView (levelling caractéristique)
- Style des ombres (ombres Street View typiques)
- Rendu 3D StreetView (profondeur de champ, distorsion)

ÉLÉMENTS UI GOOGLE MAPS :
- Mini carte en bas à gauche
- Bandeau d'adresse en haut
- Boutons circulaires (couches, direction, zoom)
- Bordures blanches arrondies
- Blocs UI translucides
- Watermark "© Google"

Même si :
- l'UI Google Maps est recadrée
- aucun texte n'est visible
- aucun watermark Google n'apparaît
- la mini-carte n'est pas visible
- le logo Google n'est pas présent

Si tu détectes les caractéristiques visuelles Street View, c'est très probablement un screenshot Google Maps.

Retourne UNIQUEMENT un JSON :
{
  "isMaps": true/false,
  "confidence": nombre entre 0 et 1 (1 = certitude absolue)
}`

    const imageUrl = `data:image/jpeg;base64,${imageBase64}`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "MapsClassifier",
            schema: {
              type: "object",
              properties: {
                isMaps: {
                  type: "boolean",
                  description: "True si l'image est un screenshot Google Maps/Street View",
                },
                confidence: {
                  type: "number",
                  description: "Niveau de confiance entre 0 et 1",
                  minimum: 0,
                  maximum: 1,
                },
              },
              required: ["isMaps", "confidence"],
              additionalProperties: false,
            },
          },
        },
        max_tokens: 200,
        temperature: 0.1, // Faible température pour plus de cohérence
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [isMapsScreenshotVision] Erreur OpenAI: ${response.status} - ${errorText}`)
      return { isMaps: false, confidence: 0 }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      console.warn("⚠️ [isMapsScreenshotVision] Réponse OpenAI vide")
      return { isMaps: false, confidence: 0 }
    }

    // Parser le JSON de la réponse
    try {
      // Extraire le JSON de la réponse (peut contenir du markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? jsonMatch[0] : content
      const parsed = JSON.parse(jsonText)

      const result: MapsScreenshotDetection = {
        isMaps: parsed.isMaps === true,
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0)),
      }

      console.log(
        `🔍 [isMapsScreenshotVision] Détection: isMaps=${result.isMaps}, confidence=${result.confidence.toFixed(2)}`,
      )

      return result
    } catch (parseError) {
      console.error("❌ [isMapsScreenshotVision] Erreur parsing JSON:", parseError, "Contenu:", content)
      return { isMaps: false, confidence: 0 }
    }
  } catch (error: any) {
    console.error("❌ [isMapsScreenshotVision] Erreur:", error)
    return { isMaps: false, confidence: 0 }
  }
}







