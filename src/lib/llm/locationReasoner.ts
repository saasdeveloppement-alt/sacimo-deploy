/**
 * Module de raisonnement LLM pour géolocalisation
 * Utilise GPT-4o-mini Vision en dernier recours avec explications structurées
 */

import type { LLMLocationContext, EvidenceItem } from "@/types/location"

export interface LLMReasoningResult {
  latitude: number | null
  longitude: number | null
  address: string | null
  confidence: number
  evidences: EvidenceItem[]
}

/**
 * Raisonne sur la localisation d'une image avec GPT-4o-mini Vision
 * Retourne les coordonnées, l'adresse et des explications structurées
 */
export async function reasonLocationWithLLM(
  imageBase64: string,
  context: LLMLocationContext & {
    ocrShopNames?: string[]
    ocrStreetCandidates?: string[]
    visualIndices?: string[]
  },
): Promise<LLMReasoningResult | null> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY

  if (!OPENAI_API_KEY) {
    console.warn("⚠️ [reasonLocationWithLLM] OPENAI_API_KEY non configurée")
    return null
  }

  try {
    // Construire le prompt avec tous les indices
    const ocrIndices: string[] = []
    if (context.ocrShopNames && context.ocrShopNames.length > 0) {
      ocrIndices.push(`Enseignes détectées dans l'image : ${context.ocrShopNames.join(", ")}`)
    }
    if (context.ocrStreetCandidates && context.ocrStreetCandidates.length > 0) {
      ocrIndices.push(`Fragments de noms de rues détectés : ${context.ocrStreetCandidates.join(", ")}`)
    }
    if (context.visualIndices && context.visualIndices.length > 0) {
      ocrIndices.push(`Indices visuels : ${context.visualIndices.join(", ")}`)
    }

    const ocrIndicesText = ocrIndices.length > 0 ? `\n\nIndices OCR et visuels détectés :\n${ocrIndices.join("\n")}` : ""

    const additionalInfo: string[] = []
    if (context.city) additionalInfo.push(`- Ville : ${context.city}`)
    if (context.postalCode) additionalInfo.push(`- Code postal : ${context.postalCode}`)
    if (context.categories && context.categories.length > 0) {
      additionalInfo.push(`- Types d'endroit : ${context.categories.join(", ")}`)
    }
    if (context.notes) additionalInfo.push(`- Notes utilisateur : ${context.notes}`)

    const additionalInfoText = additionalInfo.length > 0
      ? `\n\nInformations supplémentaires :\n${additionalInfo.join("\n")}`
      : ""

    const prompt = `Tu es un expert humain en géolocalisation d'images en France.

🚨 CONTRAINTE ABSOLUE - DÉPARTEMENT VERROUILLÉ 🚨

Le bien se trouve OBLIGATOIREMENT et EXCLUSIVEMENT dans :
- Code département : ${context.departementCode}
- Nom département : ${context.departementName}${additionalInfoText}${ocrIndicesText}

⚠️ RÈGLES STRICTES :
1. Le lieu DOIT être dans CE département UNIQUEMENT. Aucune exception.
2. Même si l'image ressemble fortement à un endroit d'un autre pays (Barcelone, Londres, etc.), tu DOIS proposer le lieu le plus similaire DANS ce département uniquement.
3. NE SORS JAMAIS du département, même si l'image ressemble fortement à un autre pays.
4. Si l'image est manifestement hors département, donne l'endroit du département qui ressemble le plus visuellement.

ANALYSE DÉTAILLÉE REQUISE :
- Architecture (style haussmannien, moderne, etc.)
- Largeur de la rue
- Type de pavage (pavés, asphalte, etc.)
- Enseignes visibles (utilise les indices OCR fournis si disponibles)
- Marquages au sol
- Végétation (types d'arbres, espaces verts)
- Style des bâtiments (hauteur, fenêtres, balcons)
- Monuments visibles au fond (Arc de Triomphe, Tour Eiffel, etc.)
- Mobilier urbain (lampadaires, bancs, etc.)

Si des enseignes sont détectées (ex: FNAC, SEPHORA), oriente-toi vers les grandes avenues commerciales du département.
Si des fragments de noms de rues sont détectés (ex: "Av. des C..."), essaie de compléter avec les rues connues du département.

Retourne UNIQUEMENT un JSON strict :
{
  "latitude": number|null,
  "longitude": number|null,
  "address": string|null,
  "confidence": number,
  "evidences": [
    {
      "type": "SHOP_SIGN" | "ROAD_MARKING" | "ARCHITECTURE_STYLE" | "LANDMARK" | "LLM_REASONING" | "DEPARTMENT_LOCK",
      "label": string,
      "detail": string,
      "weight": number
    }
  ]
}

Les evidences doivent expliquer POURQUOI tu as choisi cette localisation.
Exemples :
- {"type": "SHOP_SIGN", "label": "Enseigne FNAC détectée", "detail": "L'enseigne FNAC est visible dans l'image, caractéristique des grandes avenues commerciales", "weight": 0.7}
- {"type": "ROAD_MARKING", "label": "Fragment de nom de rue détecté", "detail": "Texte OCR : 'Av. des C...' suggère Avenue des Champs-Élysées", "weight": 0.8}
- {"type": "ARCHITECTURE_STYLE", "label": "Style architectural haussmannien", "detail": "Bâtiments parisiens typiques avec balcons en fer forgé", "weight": 0.6}
- {"type": "DEPARTMENT_LOCK", "label": "Département verrouillé", "detail": "Localisation forcée dans le département ${context.departementCode} (${context.departementName})", "weight": 0.5}

Ne fais AUCUN texte en dehors du JSON.`

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
            name: "LocationReasoning",
            schema: {
              type: "object",
              properties: {
                latitude: { type: "number" },
                longitude: { type: "number" },
                address: { type: "string" },
                confidence: { type: "number", minimum: 0, maximum: 1 },
                evidences: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: {
                        type: "string",
                        enum: ["SHOP_SIGN", "ROAD_MARKING", "ARCHITECTURE_STYLE", "LANDMARK", "LLM_REASONING", "DEPARTMENT_LOCK"],
                      },
                      label: { type: "string" },
                      detail: { type: "string" },
                      weight: { type: "number", minimum: 0, maximum: 1 },
                    },
                    required: ["type", "label", "detail", "weight"],
                  },
                },
              },
              required: ["latitude", "longitude", "address", "confidence", "evidences"],
            },
          },
        },
        max_tokens: 1000,
        temperature: 0.2, // Faible température pour plus de cohérence
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [reasonLocationWithLLM] Erreur OpenAI: ${response.status} - ${errorText}`)
      return null
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      console.warn("⚠️ [reasonLocationWithLLM] Réponse OpenAI vide")
      return null
    }

    // Parser le JSON de la réponse
    try {
      // Extraire le JSON de la réponse (peut contenir du markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? jsonMatch[0] : content
      const parsed = JSON.parse(jsonText)

      // Valider que les coordonnées sont dans le département (vérification de base)
      if (parsed.latitude && parsed.longitude) {
        // Les coordonnées seront vérifiées avec isInsideDepartment dans le pipeline principal
      }

      return {
        latitude: parsed.latitude || null,
        longitude: parsed.longitude || null,
        address: parsed.address || null,
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
        evidences: (parsed.evidences || []).map((e: any) => ({
          type: e.type || "LLM_REASONING",
          label: e.label || "",
          detail: e.detail || "",
          weight: Math.max(0, Math.min(1, e.weight || 0.5)),
        })),
      }
    } catch (parseError) {
      console.error("❌ [reasonLocationWithLLM] Erreur parsing JSON:", parseError, "Contenu:", content)
      return null
    }
  } catch (error: any) {
    console.error("❌ [reasonLocationWithLLM] Erreur:", error)
    return null
  }
}


