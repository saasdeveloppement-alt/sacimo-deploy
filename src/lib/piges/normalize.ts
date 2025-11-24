/**
 * Normalisation des résultats MoteurImmo
 * Convertit les données brutes en format standardisé pour SACIMO
 */

import type { MoteurImmoAd } from "@/lib/providers/moteurimmoClient";

export interface NormalizedListing {
  id: string;
  title: string;
  price: number | null;
  surface: number | null;
  rooms: number | null;
  city: string;
  postalCode: string;
  publishedAt: Date | null;
  url: string;
  provider: "moteurimmo";
  description?: string;
  images?: string[];
  origin?: string; // Plateforme source (leboncoin, seloger, bienici, etc.)
  publisher?: string; // Nom du vendeur/agence
  isPro: boolean; // true si vendeur professionnel, false si particulier (toujours défini)
}

/**
 * Normalise une annonce MoteurImmo vers le format standard SACIMO
 */
export function normalizeMoteurImmo(ad: MoteurImmoAd): NormalizedListing {
  // Gérer la date de publication (creationDate ou lastChangeDate)
  let publishedAt: Date | null = null;
  const dateStr = ad.lastChangeDate || ad.creationDate;
  if (dateStr) {
    publishedAt = new Date(dateStr);
  }

  // Gérer les images (pictureUrl ou pictureUrls)
  const images: string[] = [];
  if (ad.pictureUrl) {
    images.push(ad.pictureUrl);
  }
  if (ad.pictureUrls && Array.isArray(ad.pictureUrls)) {
    images.push(...ad.pictureUrls);
  }

  // Déterminer si c'est un vendeur professionnel ou particulier
  // Les agences ont généralement un nom de publisher, les particuliers non
  const publisher = ad.publisher?.name || "";
  const origin = ad.origin?.toLowerCase() || "";
  const title = (ad.title || "").toLowerCase();
  const description = (ad.description || "").toLowerCase();
  const fullText = `${title} ${description} ${publisher}`.toLowerCase();
  
  // Si pas de publisher, considérer comme particulier par défaut
  let isPro: boolean = false; // Par défaut, on considère comme particulier
  
  // Liste étendue des mots-clés indiquant un professionnel
  const proKeywords = [
    // Mots génériques
    "immobilier", "agence", "immo", "real estate", "realty", "property", 
    "consultant", "expert", "gestion", "syndic", "promoteur",
    // Réseaux d'agences connus
    "century", "orpi", "foncia", "laforêt", "guy hoquet", "safti", 
    "seloger", "bienici", "logic-immo", "figaro", "etreproprio", 
    "greenacres", "paruvendu", "era", "kaufman", "barnes", "engel",
    // Patterns professionnels dans les noms
    "sarl", "sas", "sci", "sas", "eurl", "sa", "sarl", "gestion",
    "immobilier", "real estate", "property", "consulting", "expertise",
    // Indicateurs dans le texte
    "exclusivité", "exclusivite", "mandat", "expertise", "courtage",
    "professionnel", "pro", "agence immobilière", "agence immobiliere"
  ];
  
  // Liste des mots-clés indiquant un particulier
  const particulierKeywords = [
    "pap", "particulier", "privé", "private", "particuliers",
    "propriétaire", "proprietaire", "vendeur particulier"
  ];
  
  // 1. Vérifier d'abord dans le texte complet (description + titre) pour des indicateurs explicites
  const hasExplicitPro = fullText.includes("pro") && (
    fullText.includes("professionnel") || 
    fullText.includes("agence") ||
    fullText.includes("exclusivité") ||
    fullText.includes("exclusivite") ||
    fullText.includes("mandat")
  );
  
  const hasExplicitParticulier = fullText.includes("particulier") || 
    fullText.includes("pap") ||
    fullText.includes("propriétaire") ||
    fullText.includes("proprietaire");
  
  if (hasExplicitPro && !hasExplicitParticulier) {
    isPro = true;
  } else if (hasExplicitParticulier) {
    isPro = false;
  } else if (publisher.length > 0) {
    // 2. Vérifier dans le publisher
    const publisherLower = publisher.toLowerCase();
    
    // Vérifier si c'est un particulier d'abord
    const isParticulier = particulierKeywords.some(keyword => 
      publisherLower.includes(keyword)
    );
    
    if (isParticulier) {
      isPro = false;
    } else {
      // Vérifier si c'est un professionnel
      const hasProKeyword = proKeywords.some(keyword => publisherLower.includes(keyword));
      
      // Patterns spécifiques pour les noms d'agences (majuscules, plusieurs mots, etc.)
      const hasProPattern = /^[A-Z][A-Z\s\.]+$/.test(publisher) && publisher.length > 5 && 
        !publisherLower.includes("particulier");
      
      // Si le publisher contient "gestion" ou des patterns d'agence
      const hasGestionPattern = publisherLower.includes("gestion") || 
        publisherLower.includes("immobilier") ||
        publisherLower.match(/\b(sarl|sas|sci|sa|eurl)\b/i);
      
      isPro = hasProKeyword || hasProPattern || hasGestionPattern;
    }
  } else {
    // 3. Pas de publisher, vérifier l'origine et le contenu
    const proOrigins = ["seloger", "bienici", "logic-immo", "figaro", "paruvendu", "greenacres"];
    
    if (proOrigins.includes(origin)) {
      isPro = true;
    } else if (origin === "leboncoin") {
      // Pour Leboncoin, analyser le contenu pour détecter les pros
      const hasProIndicators = proKeywords.some(keyword => fullText.includes(keyword)) ||
        fullText.includes("exclusivité") ||
        fullText.includes("exclusivite") ||
        fullText.includes("mandat") ||
        fullText.includes("agence immobilière") ||
        fullText.includes("agence immobiliere");
      
      const hasParticulierIndicators = particulierKeywords.some(keyword => fullText.includes(keyword));
      
      if (hasProIndicators && !hasParticulierIndicators) {
        isPro = true;
      } else {
        isPro = false; // Par défaut pour Leboncoin sans indicateur clair
      }
    } else {
      isPro = false; // Par défaut, particulier
    }
  }

  return {
    id: ad.uniqueId,
    title: ad.title || "Bien immobilier",
    price: ad.price ?? null,
    surface: ad.surface ?? null,
    rooms: ad.rooms ?? null,
    city: ad.location?.city || "",
    postalCode: ad.location?.postalCode || "",
    publishedAt,
    url: ad.url,
    provider: "moteurimmo",
    description: ad.description,
    images: images.length > 0 ? images : undefined,
    origin: ad.origin ? ad.origin.toLowerCase().trim() : undefined,
    publisher: publisher || undefined,
    isPro, // Toujours défini maintenant (true ou false)
  };
}

/**
 * Normalise un tableau d'annonces MoteurImmo
 */
export function normalizeMoteurImmoListings(
  ads: MoteurImmoAd[]
): NormalizedListing[] {
  return ads.map(normalizeMoteurImmo);
}

