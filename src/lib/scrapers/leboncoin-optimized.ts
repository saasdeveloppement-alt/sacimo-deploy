import axios from "axios";
import * as cheerio from "cheerio";

export interface LeBonCoinAnnonce {
  titre: string;
  prix: string;
  localisation: string;
  surface: string;
  pieces: string;
  url: string;
}

export async function scrapeLeBonCoin(ville = "Paris"): Promise<{
  success: boolean;
  totalFound?: number;
  annonces?: LeBonCoinAnnonce[];
  error?: string;
}> {
  const ZENROWS_KEY = process.env.ZENROWS_API_KEY;
  const baseUrl = "https://api.zenrows.com/v1/";
  const targetUrl = `https://www.leboncoin.fr/recherche?category=9&locations=${encodeURIComponent(ville)}`;

  if (!ZENROWS_KEY) {
    return { success: false, error: "ZENROWS_API_KEY non configurée" };
  }

  try {
    console.log(`🔍 Scraping LeBonCoin pour ${ville}...`);
    console.log(`📡 URL cible: ${targetUrl}`);

    const { data: html } = await axios.get(baseUrl, {
      params: {
        apikey: ZENROWS_KEY,
        url: targetUrl,
        js_render: "true",
        premium_proxy: "true",
        wait: "5000"
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    console.log(`✅ HTML reçu: ${html.length} caractères`);

    const $ = cheerio.load(html);
    const annonces: LeBonCoinAnnonce[] = [];

    // Utiliser le sélecteur principal qui fonctionne
    $('a[data-qa-id="aditem_container"]').each((i, el) => {
      try {
        const $el = $(el);
        
        const titre = $el.find('[data-qa-id="aditem_title"]').text().trim();
        const prix = $el.find('[data-qa-id="aditem_price"]').text().trim();
        const localisation = $el.find('[data-qa-id="aditem_location"]').text().trim();
        const surface = $el.find('[data-qa-id="aditem_surface"]').text().trim();
        const pieces = $el.find('[data-qa-id="aditem_rooms"]').text().trim();
        const url = $el.attr("href");

        console.log(`🔍 Annonce ${i + 1}:`, {
          titre: titre.substring(0, 50) + (titre.length > 50 ? '...' : ''),
          prix,
          localisation,
          surface,
          pieces,
          url: url?.substring(0, 50) + (url && url.length > 50 ? '...' : '')
        });

        if (titre) {
          annonces.push({
            titre,
            prix,
            localisation,
            surface,
            pieces,
            url: url?.startsWith("http") ? url : `https://www.leboncoin.fr${url}`
          });
        }
      } catch (error) {
        console.error(`❌ Erreur parsing annonce ${i + 1}:`, error);
      }
    });

    console.log(`🎉 Total annonces trouvées: ${annonces.length}`);

    if (annonces.length === 0) {
      console.log("⚠️ Aucune annonce détectée — voici un extrait du HTML :");
      console.log(html.substring(0, 1200));
      
      // Debug: analyser les sélecteurs disponibles
      console.log("🔍 Analyse des sélecteurs disponibles:");
      console.log(`- a[data-qa-id="aditem_container"]: ${$('a[data-qa-id="aditem_container"]').length}`);
      console.log(`- [data-qa-id="aditem_title"]: ${$('[data-qa-id="aditem_title"]').length}`);
      console.log(`- [data-qa-id="aditem_price"]: ${$('[data-qa-id="aditem_price"]').length}`);
      console.log(`- [data-qa-id="aditem_location"]: ${$('[data-qa-id="aditem_location"]').length}`);
      console.log(`- [data-qa-id="aditem_surface"]: ${$('[data-qa-id="aditem_surface"]').length}`);
      console.log(`- [data-qa-id="aditem_rooms"]: ${$('[data-qa-id="aditem_rooms"]').length}`);
    }

    return {
      success: true,
      totalFound: annonces.length,
      annonces
    };

  } catch (err: any) {
    console.error("❌ Erreur scraping :", err.response?.status, err.message);
    return { 
      success: false, 
      error: err.message,
      details: err.response?.data 
    };
  }
}


