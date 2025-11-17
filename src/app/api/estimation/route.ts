import { NextResponse } from "next/server"
import { estimationInputSchema, estimateFromComparables } from "@/lib/services/estimation"
import { estimateFromPublicAPI } from "@/lib/services/estimation-api"
import { generateEstimationExplanation } from "@/lib/services/estimation-explainer"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("📥 Requête estimation reçue:", body)

    // Validation Zod
    const parsed = estimationInputSchema.safeParse(body)
    if (!parsed.success) {
      console.error("❌ Validation Zod échouée:", parsed.error.format())
      return NextResponse.json(
        { success: false, error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      )
    }
    
    console.log("✅ Validation Zod réussie:", parsed.data)

    // Appel du service d'estimation
    // Priorité : Base locale (vraies données avec ajustements), puis fallback sur API publique
    console.log("🔄 Tentative estimation via base locale (vraies données avec ajustements)...")
    let result
    let savedAdjustments: string[] | undefined = undefined
    let savedAdjustmentFactor = 1.0
    
    try {
      result = await estimateFromComparables(parsed.data)
      console.log("✅ Estimation via base locale réussie:", {
        comparables: result.comparables.length,
        strategy: result.strategy,
        adjustmentsCount: result.adjustments?.length || 0
      })
      
      // Sauvegarder les ajustements calculés localement
      savedAdjustments = result.adjustments
      
      // Si on a moins de 3 comparables, essayer l'API publique en complément
      if (result.comparables.length < 3) {
        console.log("⚠️ Peu de comparables locaux, tentative API publique en complément...")
        try {
          const apiResult = await estimateFromPublicAPI(parsed.data)
          if (apiResult.comparables.length > result.comparables.length) {
            console.log("✅ API publique fournit plus de comparables, fusion des résultats...")
            // L'API publique calcule déjà les ajustements, on garde son résultat
            result = apiResult
          }
        } catch (apiError) {
          console.log("ℹ️ API publique non disponible, on garde les comparables locaux")
        }
      }
    } catch (localError) {
      console.warn("⚠️ Base locale indisponible, fallback sur API publique:", localError)
      console.log("🔄 Appel estimateFromPublicAPI...")
      result = await estimateFromPublicAPI(parsed.data)
      // L'API publique calcule maintenant aussi les ajustements
      console.log("✅ API publique utilisée avec ajustements calculés")
    }
    console.log("✅ Résultat estimation final:", { 
      priceMedian: result.priceMedian,
      confidence: result.confidence,
      sampleSize: result.sampleSize,
      strategy: result.strategy,
      adjustmentsCount: result.adjustments?.length || 0,
      adjustments: result.adjustments,
      adjustmentsType: typeof result.adjustments,
      adjustmentsIsArray: Array.isArray(result.adjustments),
    })

    // Génération de l'explication IA (optionnelle, ne bloque pas si échec)
    let explanation: string | null = null
    try {
      console.log("🤖 Génération de l'explication IA...")
      explanation = await generateEstimationExplanation(parsed.data, result, result.comparables)
      if (explanation) {
        console.log("✅ Explication IA générée")
      } else {
        console.log("ℹ️ Explication IA non disponible (OPENAI_API_KEY non configurée ou erreur)")
      }
    } catch (err) {
      console.warn("⚠️ Erreur lors de la génération de l'explication IA (non bloquant):", err)
      // On continue même si l'explication échoue
    }

    // Ajouter l'explication au résultat
    const resultWithExplanation = {
      ...result,
      explanation,
    }

    return NextResponse.json({
      success: true,
      estimation: resultWithExplanation,
    })
  } catch (err) {
    console.error("❌ API estimation error :", err)
    
    // Gestion spécifique des erreurs
    if (err instanceof Error) {
      if (err.message === "NOT_ENOUGH_COMPARABLES") {
        return NextResponse.json(
          {
            success: false,
            error: "Pas assez de biens comparables dans cette zone pour générer une estimation fiable. Essayez avec une autre ville ou un code postal différent.",
          },
          { status: 400 }
        )
      }
      
      // Autres erreurs avec message détaillé
      return NextResponse.json(
        {
          success: false,
          error: err.message || "Erreur lors de l'estimation",
        },
        { status: 500 }
      )
    }
    
    // Erreur générique
    return NextResponse.json(
      {
        success: false,
        error: "Erreur interne lors de l'estimation",
      },
      { status: 500 }
    )
  }
}

