import type { EstimationInput, EstimationResult } from "./estimation"

/**
 * Génère une explication IA pour une estimation immobilière.
 * Retourne null si OPENAI_API_KEY n'est pas configurée.
 */
export async function generateEstimationExplanation(
  input: EstimationInput,
  estimation: EstimationResult,
  comparables: EstimationResult["comparables"]
): Promise<string | null> {
  // Si l'API OpenAI n'est pas configurée, on retourne null (optionnel)
  if (!process.env.OPENAI_API_KEY) {
    return null
  }

  try {
    // Préparer un résumé des comparables les plus proches (5-10 max)
    const topComparables = comparables.slice(0, 10).map((comp, idx) => {
      return `${idx + 1}. ${comp.type || "Bien"} de ${comp.surface} m², ${comp.rooms || "N/A"} pièces, ${comp.price.toLocaleString("fr-FR")} € (${comp.pricePerSqm.toLocaleString("fr-FR")} €/m²) - ${comp.city} ${comp.postalCode}`
    })

    const comparablesSummary = topComparables.length > 0
      ? topComparables.join("\n")
      : "Aucun bien comparable détaillé disponible."

    // Construire le prompt en français
    const prompt = `Tu es un expert en estimation immobilière. Analyse cette estimation et rédige un paragraphe explicatif court (5-8 lignes maximum) en français.

**Bien à estimer :**
- Type : ${input.type}
- Surface : ${input.surface} m²
- Nombre de pièces : ${input.rooms}
- Localisation : ${input.city} ${input.postalCode}

**Résultat de l'estimation :**
- Prix médian estimé : ${estimation.priceMedian.toLocaleString("fr-FR")} €
- Fourchette : ${estimation.priceLow.toLocaleString("fr-FR")} € - ${estimation.priceHigh.toLocaleString("fr-FR")} €
- Prix au m² médian : ${estimation.pricePerSqmMedian.toLocaleString("fr-FR")} €/m²
- Prix au m² moyen : ${estimation.pricePerSqmAverage.toLocaleString("fr-FR")} €/m²
- Nombre de comparables : ${estimation.sampleSize}
- Score de confiance : ${Math.round(estimation.confidence * 100)}%
- Stratégie de recherche : ${estimation.strategy}

**Biens comparables utilisés :**
${comparablesSummary}

**Instructions :**
- Rédige un paragraphe court (5-8 lignes maximum) expliquant pourquoi cette estimation est cohérente
- Ton neutre, professionnel et pédagogique
- Mentionne les facteurs clés (localisation, surface, prix au m², nombre de comparables)
- Termine par une phrase courte du type : "Ce n'est qu'une estimation indicative, basée sur les données disponibles."
- Pas de disclaimer juridique long, juste cette mention finale
- Réponds UNIQUEMENT avec le paragraphe explicatif, sans introduction ni conclusion supplémentaire`

    // Appel à l'API OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // ou "gpt-4-turbo" selon disponibilité
        messages: [
          {
            role: "system",
            content: "Tu es un expert en estimation immobilière. Tu rédiges des explications courtes, claires et professionnelles en français.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300, // Limite pour un paragraphe court
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Erreur API OpenAI:", response.status, errorText)
      return null
    }

    const data = await response.json()
    const explanation = data.choices?.[0]?.message?.content?.trim()

    if (!explanation) {
      console.warn("⚠️ Réponse OpenAI vide")
      return null
    }

    return explanation
  } catch (error) {
    console.error("❌ Erreur lors de la génération de l'explication IA:", error)
    return null
  }
}

