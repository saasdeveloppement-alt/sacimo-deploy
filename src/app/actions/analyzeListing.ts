"use server"

import { openai } from "@/lib/openai"
import type { NormalizedListing } from "@/lib/piges/normalize"

export interface ListingAnalysis {
  score_opportunite: number
  prix_position: "sous-évalué" | "correct" | "surévalué"
  delta_prix: number
  historique: string
  resume: string
  red_flags: string[]
  recommandation_agent: string
}

/**
 * Analyse une annonce immobilière avec l'IA
 * @param listing - L'annonce à analyser
 * @returns L'analyse structurée ou null en cas d'erreur
 */
export async function analyzeListing(
  listing: NormalizedListing
): Promise<ListingAnalysis | null> {
  try {
    // Construire le prompt avec toutes les données disponibles
    const prompt = `Tu es un expert immobilier avec 20 ans d'expérience.
Fais une analyse rapide et précise de cette annonce immobilière.

STRUCTURE ATTENDUE : réponds STRICTEMENT en JSON valide (pas de markdown, pas de texte avant/après) :

{
  "score_opportunite": <nombre entre 0 et 100>,
  "prix_position": "<'sous-évalué' | 'correct' | 'surévalué'>",
  "delta_prix": <pourcentage positif ou négatif, ex: -5 pour 5% sous le marché>,
  "historique": "<description textuelle de l'historique si disponible, sinon 'Aucun historique disponible'>",
  "resume": "<résumé concis de l'annonce en 2-3 phrases>",
  "red_flags": ["<signal d'alerte 1>", "<signal d'alerte 2>", ...],
  "recommandation_agent": "<phrase clé pour l'agent immobilier, max 100 caractères>"
}

DONNÉES DE L'ANNONCE :

Titre : ${listing.title || "Non spécifié"}
Description : ${listing.description || "Aucune description"}
Prix : ${listing.price ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(listing.price) : "Non spécifié"}
Surface : ${listing.surface ? `${listing.surface} m²` : "Non spécifiée"}
Pièces : ${listing.rooms ? `${listing.rooms} pièce${listing.rooms > 1 ? "s" : ""}` : "Non spécifié"}
Ville : ${listing.city || "Non spécifiée"}
Code postal : ${listing.postalCode || "Non spécifié"}
Source : ${listing.origin || listing.provider || "Inconnue"}
Type de vendeur : ${listing.isPro ? "Professionnel" : "Particulier"}
Date de publication : ${listing.publishedAt ? new Date(listing.publishedAt).toLocaleDateString("fr-FR") : "Inconnue"}
URL : ${listing.url}

CONTEXTE :
- Prix au m² : ${listing.price && listing.surface ? Math.round(listing.price / listing.surface) : "N/A"} €/m²
- Vendeur ${listing.isPro ? "professionnel" : "particulier"}
- Source : ${listing.origin || "Hubimo"}

INSTRUCTIONS :
1. Le score_opportunite doit refléter la qualité globale de l'opportunité (prix, localisation, description, etc.)
2. Le prix_position doit être basé sur une estimation rapide du marché (sans données DVF, utilise ton expertise)
3. Le delta_prix est un pourcentage estimé vs marché moyen (ex: -10 = 10% sous le marché, +15 = 15% au-dessus)
4. Les red_flags doivent être des signaux d'alerte concrets (prix suspect, description vague, répétitions, etc.)
5. La recommandation_agent doit être actionnable et concise

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Utilisation de gpt-4o-mini pour réduire les coûts, peut être changé en gpt-4o si besoin
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Tu es un expert immobilier français. Tu analyses des annonces immobilières et fournis des analyses structurées en JSON strict."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      console.error("❌ OpenAI n'a pas retourné de contenu")
      return null
    }

    // Parser le JSON (peut contenir du markdown, on nettoie)
    let jsonContent = content.trim()
    // Enlever le markdown code block si présent
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    const analysis = JSON.parse(jsonContent) as ListingAnalysis

    // Validation et normalisation
    return {
      score_opportunite: Math.max(0, Math.min(100, analysis.score_opportunite || 50)),
      prix_position: analysis.prix_position || "correct",
      delta_prix: analysis.delta_prix || 0,
      historique: analysis.historique || "Aucun historique disponible",
      resume: analysis.resume || "Analyse non disponible",
      red_flags: Array.isArray(analysis.red_flags) ? analysis.red_flags : [],
      recommandation_agent: analysis.recommandation_agent || "Analyse en cours",
    }
  } catch (error: any) {
    console.error("❌ Erreur lors de l'analyse IA:", error)
    return null
  }
}




