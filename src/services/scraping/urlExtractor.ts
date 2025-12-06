/**
 * Service d'extraction de données depuis URLs d'annonces immobilières
 */

import type { UrlExtractionResult } from '@/types/localisation-advanced';

/**
 * Détecte la source de l'URL
 */
function detectSource(url: string): UrlExtractionResult['source'] {
  if (url.includes('leboncoin.fr')) return 'leboncoin';
  if (url.includes('seloger.com')) return 'seloger';
  if (url.includes('pap.fr')) return 'pap';
  if (url.includes('bienici.com')) return 'bienici';
  return 'autre';
}

/**
 * Scrape LeBonCoin
 */
async function scrapeLeboncoin(url: string): Promise<UrlExtractionResult> {
  try {
    // Utiliser l'API proxy interne pour éviter CORS
    const response = await fetch('/api/scrape-leboncoin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Scraping failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      source: 'leboncoin',
      localisation: {
        ville: data.city || data.location?.city,
        codePostal: data.postalCode || data.location?.postalCode,
        departement: data.department,
        region: data.region,
      },
      caracteristiques: {
        surface: data.surface,
        pieces: data.rooms,
        chambres: data.bedrooms,
        typeBien: data.propertyType,
        prix: data.price,
      },
      description: data.description || data.text,
      images: data.images || data.pictures || [],
      coordinates: data.coordinates ? {
        lat: data.coordinates.lat || data.coordinates.latitude,
        lng: data.coordinates.lng || data.coordinates.longitude,
      } : undefined,
    };
  } catch (error) {
    console.error('LeBonCoin scraping error:', error);
    return {
      source: 'leboncoin',
    };
  }
}

/**
 * Scrape SeLoger
 */
async function scrapeSeLoger(url: string): Promise<UrlExtractionResult> {
  // TODO: Implémenter le scraping SeLoger
  return {
    source: 'seloger',
  };
}

/**
 * Fonction principale d'extraction depuis URL
 */
export async function extractFromUrl(url: string): Promise<UrlExtractionResult> {
  console.log('[UrlExtractor] Extracting from URL:', url);

  const source = detectSource(url);

  switch (source) {
    case 'leboncoin':
      return scrapeLeboncoin(url);
    case 'seloger':
      return scrapeSeLoger(url);
    default:
      console.warn('[UrlExtractor] Unsupported source:', source);
      return {
        source: 'autre',
      };
  }
}

