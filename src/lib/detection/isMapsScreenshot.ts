/**
 * Classifieur robuste de screenshot Google Maps utilisant OpenAI Vision
 * Détecte les captures d'écran Google Maps en analysant les éléments visuels d'interface
 */

export interface MapsScreenshotDetection {
  isMaps: boolean
  confidence: number
}

/**
 * Détecte si une image est une capture d'écran Google Maps en utilisant OpenAI Vision
 * Analyse les éléments visuels d'interface plutôt que seulement le texte OCR
 * 
 * @param imageBase64 Image encodée en base64
 * @returns Résultat de détection avec confiance (0-1)
 */
export async function isMapsScreenshot(
  imageBase64: string,
): Promise<MapsScreenshotDetection> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY

  if (!OPENAI_API_KEY) {
    console.warn("⚠️ [isMapsScreenshot] OPENAI_API_KEY non configurée")
    return { isMaps: false, confidence: 0 }
  }

  try {
    const prompt = `Tu es un classifieur spécialisé en détection de captures d'écran Google Maps.

Ta mission : détecter si l'image fournie est une capture d'écran de Google Maps.

⚠️ IMPORTANT : NE TE BASER PAS UNIQUEMENT SUR LE TEXTE OCR.
Tu dois analyser visuellement les éléments d'interface caractéristiques de Google Maps :

ÉLÉMENTS VISUELS À CHERCHER :
- Mini carte en bas à gauche (vue satellite ou plan)
- Style des labels de lieux (gris clair, police Roboto typique)
- Bandeau d'adresse en haut (barre de recherche Google Maps)
- Boutons circulaires (couches, direction, zoom in/out)
- Look des bâtiments (déformation spécifique de la vue 3D/Street View)
- Bordures blanches arrondies autour des éléments UI
- Blocs UI translucides/semi-transparents
- Curseur Street View rond avec flèche directionnelle
- Watermark "© Google" même quasi invisible
- Barre latérale avec informations de lieu
- Contrôles de navigation (flèches, zoom)
- Style de la carte (couleurs, textures Google Maps)

Si tu détectes ces éléments visuels caractéristiques, c'est très probablement un screenshot Google Maps.

Retourne un JSON strict avec :
- isMaps: true si c'est un screenshot Google Maps, false sinon
- confidence: nombre entre 0 et 1 (1 = certitude absolue, 0.5 = incertain)

Réponds UNIQUEMENT en JSON, sans texte supplémentaire.`

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
            name: "mapsDetection",
            schema: {
              type: "object",
              properties: {
                isMaps: {
                  type: "boolean",
                  description: "True si l'image est une capture d'écran Google Maps",
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
      console.error(`❌ [isMapsScreenshot] Erreur OpenAI: ${response.status} - ${errorText}`)
      return { isMaps: false, confidence: 0 }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      console.warn("⚠️ [isMapsScreenshot] Réponse OpenAI vide")
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
        `🔍 [isMapsScreenshot] Détection: isMaps=${result.isMaps}, confidence=${result.confidence.toFixed(2)}`,
      )

      return result
    } catch (parseError) {
      console.error("❌ [isMapsScreenshot] Erreur parsing JSON:", parseError, "Contenu:", content)
      return { isMaps: false, confidence: 0 }
    }
  } catch (error: any) {
    console.error("❌ [isMapsScreenshot] Erreur:", error)
    return { isMaps: false, confidence: 0 }
  }
}

