/**
 * Filtrage local des annonces par état du bien
 * Ne doit JAMAIS être envoyé à l'API MoteurImmo
 */

import type { NormalizedListing } from "./normalize";
import { STATE_MAPPING } from "./stateMapping";

/**
 * Filtre les annonces selon les états sélectionnés
 * Recherche dans plusieurs champs possibles (property_state, building_state, condition, characteristics.state, description, title)
 * @param ads Liste des annonces à filtrer
 * @param selectedStates Liste des états sélectionnés (ex: ["neuf", "ancien"])
 * @returns Liste filtrée des annonces correspondant aux états sélectionnés
 */
export function filterByState(
  ads: NormalizedListing[],
  selectedStates: string[]
): NormalizedListing[] {
  if (!selectedStates || selectedStates.length === 0) {
    return ads;
  }

  return ads.filter(ad => {
    // Récupérer l'état depuis l'annonce normalisée
    // L'état est déjà extrait dans normalize.ts depuis ad.property.condition ou ad.tags
    const rawState = (ad as any).state?.toLowerCase() || "";

    // Si on a un état dans le champ state (déjà normalisé), l'utiliser
    if (rawState) {
      return selectedStates.some(stateKey => {
        const category = stateKey.toLowerCase() as keyof typeof STATE_MAPPING;
        const variations = STATE_MAPPING[category] || [];
        return variations.some(keyword => rawState.includes(keyword));
      });
    }

    // Sinon, chercher dans la description et le titre (fallback)
    const description = (ad.description || "").toLowerCase();
    const title = (ad.title || "").toLowerCase();
    const fullText = `${title} ${description}`;

    // Vérifier si l'un des mots-clés de l'état sélectionné est présent dans le texte
    return selectedStates.some(stateKey => {
      const category = stateKey.toLowerCase() as keyof typeof STATE_MAPPING;
      const variations = STATE_MAPPING[category] || [];
      return variations.some(keyword => fullText.includes(keyword));
    });
  });
}

