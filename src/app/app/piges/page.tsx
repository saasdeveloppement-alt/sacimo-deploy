import { redirect } from "next/navigation"

/**
 * Redirection vers la page Annonces unifiée
 * L'ancienne page Piges redirige maintenant vers /app/annonces
 * qui utilise MoteurImmo comme unique provider
 */
export default function PigesRedirectPage() {
  redirect("/app/annonces")
}
