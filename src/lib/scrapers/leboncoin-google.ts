import axios from "axios";
import * as cheerio from "cheerio";

export interface LeBonCoinAnnonce {
  titre: string;
  prix: string;
  localisation: string;
  surface: string;
  pieces: string;
  url: string;
  description?: string;
  images?: string[];
}

export interface LeBonCoinSearchResult {
  success: boolean;
  totalFound?: number;
  annonces?: LeBonCoinAnnonce[];
  error?: string;
}

/**
 * 1️⃣ Recherche les URLs d'annonces LeBonCoin via Google Search
 */
export async function searchLeBonCoin(ville = "Paris"): Promise<{
  success: boolean;
  urls?: string[];
  error?: string;
}> {
  const ZENROWS_KEY = process.env.ZENROWS_API_KEY;
  
  if (!ZENROWS_KEY) {
    return { success: false, error: "ZENROWS_API_KEY non configurée" };
  }

  try {
    console.log(`🔍 Recherche Google pour LeBonCoin ${ville}...`);
    
    // Construire la requête Google pour LeBonCoin
    const googleQuery = `site:leboncoin.fr ventes immobilieres ${ville} appartement maison`;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(googleQuery)}&num=20`;
    
    console.log(`📡 URL Google: ${googleUrl}`);

    const { data: html } = await axios.get("https://api.zenrows.com/v1/", {
      params: {
        apikey: ZENROWS_KEY,
        url: googleUrl,
        js_render: "true",
        premium_proxy: "true",
        wait: "5000",
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    console.log(`✅ HTML Google reçu: ${html.length} caractères`);

    const $ = cheerio.load(html);
    const urls: string[] = [];

    // Extraire les URLs LeBonCoin depuis les résultats Google
    $('a[href*="leboncoin.fr/ventes_immobilieres/"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('/ventes_immobilieres/')) {
        // Nettoyer l'URL Google
        const cleanUrl = href.replace(/^\/url\?q=/, '').split('&')[0];
        if (cleanUrl.startsWith('https://www.leboncoin.fr/')) {
          urls.push(cleanUrl);
        }
      }
    });

    // Supprimer les doublons
    const uniqueUrls = [...new Set(urls)];
    
    console.log(`🎉 ${uniqueUrls.length} URLs LeBonCoin trouvées via Google`);
    
    return {
      success: true,
      urls: uniqueUrls.slice(0, 10) // Limiter à 10 annonces pour la démo
    };

  } catch (error: any) {
    console.error("❌ Erreur recherche Google :", error.response?.status, error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * 2️⃣ Scrape les détails de chaque annonce individuelle
 */
export async function getAnnonceDetails(urls: string[]): Promise<LeBonCoinSearchResult> {
  const ZENROWS_KEY = process.env.ZENROWS_API_KEY;
  
  if (!ZENROWS_KEY) {
    return { success: false, error: "ZENROWS_API_KEY non configurée" };
  }

  try {
    console.log(`🔍 Scraping ${urls.length} annonces individuelles...`);
    
    const annonces: LeBonCoinAnnonce[] = [];
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`📄 Scraping annonce ${i + 1}/${urls.length}: ${url.substring(0, 60)}...`);
      
      try {
        const { data: html } = await axios.get("https://api.zenrows.com/v1/", {
          params: {
            apikey: ZENROWS_KEY,
            url: url,
            js_render: "true",
            premium_proxy: "true",
            wait: "5000",
          },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          }
        });

        const $ = cheerio.load(html);
        
        // Extraire les informations de l'annonce
        const titre = $('h1[data-qa-id="adview_title"]').text().trim() || 
                     $('h1').first().text().trim() ||
                     $('[data-qa-id="adview_title"]').text().trim();
        
        const prix = $('[data-qa-id="adview_price"]').text().trim() ||
                    $('.price').text().trim() ||
                    $('[class*="price"]').text().trim();
        
        const localisation = $('[data-qa-id="adview_location"]').text().trim() ||
                           $('.location').text().trim() ||
                           $('[class*="location"]').text().trim();
        
        const surface = $('[data-qa-id="adview_surface"]').text().trim() ||
                       $('[class*="surface"]').text().trim();
        
        const pieces = $('[data-qa-id="adview_rooms"]').text().trim() ||
                      $('[class*="rooms"]').text().trim() ||
                      $('[class*="pieces"]').text().trim();
        
        const description = $('[data-qa-id="adview_description"]').text().trim() ||
                           $('.description').text().trim() ||
                           $('[class*="description"]').text().trim();
        
        // Extraire les images
        const images: string[] = [];
        $('img[data-qa-id="adview_image"]').each((_, img) => {
          const src = $(img).attr('src');
          if (src && !src.includes('placeholder')) {
            images.push(src.startsWith('http') ? src : `https://www.leboncoin.fr${src}`);
          }
        });

        if (titre && prix) {
          annonces.push({
            titre,
            prix,
            localisation,
            surface,
            pieces,
            url,
            description: description.substring(0, 200),
            images: images.slice(0, 5) // Limiter à 5 images
          });
          
          console.log(`✅ Annonce ${i + 1} extraite: ${titre.substring(0, 50)}...`);
        } else {
          console.log(`⚠️ Annonce ${i + 1} incomplète, ignorée`);
        }
        
        // Délai entre les requêtes pour éviter le rate limiting
        if (i < urls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
        }
        
      } catch (error: any) {
        console.error(`❌ Erreur scraping annonce ${i + 1}:`, error.message);
        // Continuer avec l'annonce suivante
      }
    }
    
    console.log(`🎉 Scraping terminé: ${annonces.length} annonces extraites`);
    
    return {
      success: true,
      totalFound: annonces.length,
      annonces
    };

  } catch (error: any) {
    console.error("❌ Erreur scraping détails :", error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * 🚀 Fonction principale : Pipeline complet Google → LeBonCoin
 */
export async function scrapeLeBonCoinComplete(ville = "Paris"): Promise<LeBonCoinSearchResult> {
  try {
    console.log(`🚀 Début du scraping complet LeBonCoin pour ${ville}`);
    
    // Étape 1: Rechercher les URLs via Google
    const searchResult = await searchLeBonCoin(ville);
    if (!searchResult.success || !searchResult.urls || searchResult.urls.length === 0) {
      return {
        success: false,
        error: `Aucune URL trouvée via Google: ${searchResult.error}`
      };
    }
    
    console.log(`✅ ${searchResult.urls.length} URLs trouvées via Google`);
    
    // Étape 2: Scraper chaque annonce individuellement
    const detailsResult = await getAnnonceDetails(searchResult.urls);
    
    if (detailsResult.success) {
      console.log(`🎉 Scraping complet terminé: ${detailsResult.totalFound} annonces`);
    }
    
    return detailsResult;
    
  } catch (error: any) {
    console.error("❌ Erreur scraping complet :", error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
}




