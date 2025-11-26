/**
 * Mapping officiel entre les valeurs API MoteurImmo et les catégories UI
 * pour le filtre "État du bien"
 */

export const STATE_MAPPING = {
  ancien: [
    "ancien",
    "old",
    "ancienne construction",
    "ancienneté",
    "anciennete",
    "ancienne",
    "anciennes",
    "à rénover",
    "a renover",
    "travaux",
    "bon état",
    "rénové",
    "renove",
    "rafraîchir",
    "rafraichir",
    "to renovate",
    "ancienneté",
    "anciennete",
  ],
  neuf: [
    "neuf",
    "new",
    "programme neuf",
    "programme_neuf",
    "construction neuve",
    "neuf_fraichement",
    "neuf_programme",
    "neuf_programmé",
    "nouveau",
    "nouvelle",
  ],
  recent: [
    "récent",
    "recent",
    "renove",
    "renové",
    "remis à neuf",
    "remis_a_neuf",
    "modernisé",
    "modernise",
    "rénovation",
    "renovation",
    "refait à neuf",
    "refait_a_neuf",
  ],
  vefa: [
    "vefa",
    "vente en état futur d'achèvement",
    "vente_en_etat_future_achevement",
    "program",
    "future",
    "achevement",
    "achèvement",
    "à construire",
    "a construire",
    "en construction",
  ],
  travaux: [
    "travaux",
    "to renovate",
    "renovation",
    "rénovation",
    "à rénover",
    "a renover",
    "gros travaux",
    "nécessite travaux",
    "necessite travaux",
    "travaux à prévoir",
    "travaux a prevoir",
    "travaux à faire",
    "travaux a faire",
  ],
} as const;

export type StateCategory = keyof typeof STATE_MAPPING;

/**
 * Normalise une valeur d'état brute de l'API vers une catégorie UI
 */
export function normalizeStateToCategory(rawState: string | null | undefined): StateCategory | null {
  if (!rawState) return null;

  const normalized = rawState.toLowerCase().trim();

  // Parcourir chaque catégorie et vérifier si la valeur brute correspond
  for (const [category, variations] of Object.entries(STATE_MAPPING)) {
    if (variations.some(variation => normalized.includes(variation))) {
      return category as StateCategory;
    }
  }

  return null;
}

/**
 * Vérifie si une annonce correspond à une ou plusieurs catégories d'état sélectionnées
 */
export function matchesStateFilter(
  rawState: string | null | undefined,
  selectedStates: string[]
): boolean {
  if (!selectedStates || selectedStates.length === 0) return true;
  if (!rawState) return false;

  const normalized = rawState.toLowerCase().trim();

  return selectedStates.some(state => {
    const category = state.toLowerCase() as StateCategory;
    const variations = STATE_MAPPING[category] || [];
    return variations.some(variation => normalized.includes(variation));
  });
}

