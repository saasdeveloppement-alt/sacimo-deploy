/**
 * Configuration de désactivation de Melo.ai
 * 
 * ⚠️ IMPORTANT: Melo.ai est désactivé pour utiliser MoteurImmo comme unique provider
 * Tous les appels à Melo doivent être protégés par cette constante
 */

export const MELO_DISABLED = true;

/**
 * Vérifie si Melo est désactivé
 */
export function isMeloDisabled(): boolean {
  return MELO_DISABLED;
}

/**
 * Lance une erreur si on tente d'utiliser Melo alors qu'il est désactivé
 */
export function assertMeloDisabled(context: string): void {
  if (MELO_DISABLED) {
    throw new Error(
      `❌ Melo.ai est désactivé (${context}). Utilisez MoteurImmo comme provider.`
    );
  }
}



