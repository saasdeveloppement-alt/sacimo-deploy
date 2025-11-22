/**
 * Badge d'origine pour afficher la plateforme source d'une annonce
 */

interface OriginBadgeProps {
  origin?: string;
}

/**
 * Couleurs associées aux plateformes
 */
const ORIGIN_COLORS: Record<string, string> = {
  leboncoin: "#FF6E14", // Orange Leboncoin
  seloger: "#0066CC", // Bleu SeLoger
  bienici: "#00A8E8", // Bleu clair Bien'ici
  pap: "#E60012", // Rouge PAP
  figaro: "#000000", // Noir Figaro
  logicimmo: "#FF6600", // Orange Logic-Immo
  avendrealouer: "#1E88E5", // Bleu A Vendre A Louer
  paruvendu: "#0066CC", // Bleu ParuVendu
  lesiteimmo: "#00BCD4", // Cyan Le Site Immo
  propriete: "#8B4513", // Marron Propriétés
  proprietes: "#8B4513", // Marron Propriétés
  default: "#6B7280", // Gris par défaut
};

/**
 * Formate le nom de la plateforme pour l'affichage
 */
function formatPlatformName(origin: string): string {
  const nameMap: Record<string, string> = {
    leboncoin: "Leboncoin",
    seloger: "SeLoger",
    bienici: "Bien'ici",
    pap: "PAP",
    figaro: "Figaro Immo",
    logicimmo: "Logic-Immo",
    avendrealouer: "A Vendre A Louer",
    paruvendu: "ParuVendu",
    lesiteimmo: "Le Site Immo",
    propriete: "Propriétés",
    proprietes: "Propriétés",
  };

  const lowerOrigin = origin.toLowerCase().trim();
  
  // Si on a un mapping, l'utiliser
  if (nameMap[lowerOrigin]) {
    return nameMap[lowerOrigin];
  }
  
  // Sinon, formater intelligemment le nom
  // Gérer les cas comme "leboncoin", "seloger", etc.
  if (lowerOrigin.includes("leboncoin") || lowerOrigin.includes("le bon coin")) {
    return "Leboncoin";
  }
  if (lowerOrigin.includes("seloger") || lowerOrigin.includes("se loger")) {
    return "SeLoger";
  }
  if (lowerOrigin.includes("bienici") || lowerOrigin.includes("bien ici")) {
    return "Bien'ici";
  }
  if (lowerOrigin.includes("pap")) {
    return "PAP";
  }
  if (lowerOrigin.includes("figaro")) {
    return "Figaro Immo";
  }
  if (lowerOrigin.includes("logic") || lowerOrigin.includes("logicimmo")) {
    return "Logic-Immo";
  }
  if (lowerOrigin.includes("avendrealouer") || lowerOrigin.includes("a vendre a louer")) {
    return "A Vendre A Louer";
  }
  if (lowerOrigin.includes("paruvendu") || lowerOrigin.includes("paru vendu")) {
    return "ParuVendu";
  }
  if (lowerOrigin.includes("lesiteimmo") || lowerOrigin.includes("le site immo")) {
    return "Le Site Immo";
  }
  
  // Par défaut, capitaliser la première lettre
  return origin.charAt(0).toUpperCase() + origin.slice(1).toLowerCase();
}

/**
 * Récupère la couleur associée à une origine
 */
function getOriginColor(origin: string): string {
  const lowerOrigin = origin.toLowerCase().trim();
  
  // Vérifier d'abord le mapping exact
  if (ORIGIN_COLORS[lowerOrigin]) {
    return ORIGIN_COLORS[lowerOrigin];
  }
  
  // Vérifier les variantes
  if (lowerOrigin.includes("leboncoin") || lowerOrigin.includes("le bon coin")) {
    return ORIGIN_COLORS.leboncoin;
  }
  if (lowerOrigin.includes("seloger") || lowerOrigin.includes("se loger")) {
    return ORIGIN_COLORS.seloger;
  }
  if (lowerOrigin.includes("bienici") || lowerOrigin.includes("bien ici")) {
    return ORIGIN_COLORS.bienici;
  }
  if (lowerOrigin.includes("pap")) {
    return ORIGIN_COLORS.pap;
  }
  if (lowerOrigin.includes("figaro")) {
    return ORIGIN_COLORS.figaro;
  }
  if (lowerOrigin.includes("logic") || lowerOrigin.includes("logicimmo")) {
    return ORIGIN_COLORS.logicimmo;
  }
  if (lowerOrigin.includes("avendrealouer") || lowerOrigin.includes("a vendre a louer")) {
    return ORIGIN_COLORS.avendrealouer;
  }
  if (lowerOrigin.includes("paruvendu") || lowerOrigin.includes("paru vendu")) {
    return ORIGIN_COLORS.paruvendu;
  }
  if (lowerOrigin.includes("lesiteimmo") || lowerOrigin.includes("le site immo")) {
    return ORIGIN_COLORS.lesiteimmo;
  }
  
  // Couleur par défaut
  return ORIGIN_COLORS.default;
}

export default function OriginBadge({ origin }: OriginBadgeProps) {
  if (!origin) {
    return null;
  }

  const normalizedOrigin = origin.toLowerCase().trim();
  const platformName = formatPlatformName(origin);
  const color = getOriginColor(origin);

  return (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="whitespace-nowrap">{platformName}</span>
    </div>
  );
}
