/**
 * Sécurité Melo.io
 * 
 * Bloque les synchronisations Melo.io en environnement local/dev
 * pour éviter les factures surprises.
 * 
 * Les syncs ne sont autorisées que si :
 * - NODE_ENV === "production"
 * - VERCEL === "1" (déployé sur Vercel)
 * - MELO_ENV === "production"
 */

/**
 * Vérifie si la synchronisation Melo est autorisée dans l'environnement actuel
 */
export function isMeloSyncAllowed(): boolean {
  const isProd = process.env.NODE_ENV === "production"
  const isVercel = process.env.VERCEL === "1"
  const isMeloProd = process.env.MELO_ENV === "production"

  return isProd && isVercel && isMeloProd
}

/**
 * Lance une erreur si la synchronisation Melo n'est pas autorisée
 * @param context - Contexte de l'appel (ex: "syncAnnonces", "searchAnnoncesWithPagination")
 */
export function assertMeloSyncAllowed(context: string): void {
  if (!isMeloSyncAllowed()) {
    const message = `MELO SYNC BLOQUÉE (${context}) : environnement non autorisé (NODE_ENV='${process.env.NODE_ENV}', VERCEL='${process.env.VERCEL}', MELO_ENV='${process.env.MELO_ENV}')`
    console.warn(`⚠️ ${message}`)
    throw new Error(message)
  }
}

/**
 * Plafond de sécurité pour le nombre de propriétés récupérées par sync
 * Même en production, on limite pour éviter les coûts excessifs
 */
export const MELO_SYNC_MAX_PROPERTIES = 10000

/**
 * Vérifie et limite le nombre de propriétés demandées
 * @param requestedLimit - Nombre de propriétés demandées
 * @returns Nombre de propriétés autorisées (plafonné)
 */
export function getSafeMeloLimit(requestedLimit?: number): number {
  const limit = requestedLimit || MELO_SYNC_MAX_PROPERTIES
  return Math.min(limit, MELO_SYNC_MAX_PROPERTIES)
}

