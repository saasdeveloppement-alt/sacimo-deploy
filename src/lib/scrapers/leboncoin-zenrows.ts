import * as cheerio from 'cheerio';

export interface LeBonCoinSearchParams {
  ville: string;
  minPrix?: number;
  maxPrix?: number;
  minSurface?: number;
  maxSurface?: number;
  typeBien?: 'appartement' | 'maison' | 'studio' | 'loft' | 'penthouse';
  pieces?: number;
  pages?: number;
}

export interface LeBonCoinAnnonce {
  title: string;
  price: number;
  surface?: number;
  rooms?: number;
  postalCode?: string;
  city: string;
  url: string;
  publishedAt: Date;
  images: string[];
  description?: string;
}

export class LeBonCoinZenRowsScraper {
  private baseUrl = 'https://www.leboncoin.fr';
  private zenrowsApiKey: string;
  
  constructor() {
    this.zenrowsApiKey = process.env.ZENROWS_API_KEY || '';
    if (!this.zenrowsApiKey) {
      console.warn('⚠️ ZENROWS_API_KEY non configurée, utilisation du mode fallback');
    }
  }
  
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private buildSearchUrl(params: LeBonCoinSearchParams, page = 1): string {
    // URL simplifiée pour éviter les blocages
    let url = `${this.baseUrl}/recherche?category=9&real_estate_type=2`;
    
    // Localisation simple
    if (params.ville) {
      url += `&locations=${encodeURIComponent(params.ville)}`;
    }
    
    // Prix simple
    if (params.minPrix && params.maxPrix) {
      url += `&price=${params.minPrix}-${params.maxPrix}`;
    } else if (params.minPrix) {
      url += `&price=${params.minPrix}-`;
    } else if (params.maxPrix) {
      url += `&price=-${params.maxPrix}`;
    }
    
    // Pagination
    if (page > 1) {
      url += `&page=${page}`;
    }
    
    console.log(`🔗 URL simplifiée: ${url}`);
    return url;
  }

  private async fetchWithZenRows(url: string): Promise<string> {
    if (!this.zenrowsApiKey) {
      throw new Error('ZENROWS_API_KEY non configurée');
    }

    const zenrowsUrl = `https://api.zenrows.com/v1/?apikey=${this.zenrowsApiKey}&url=${encodeURIComponent(url)}&js_render=true&premium_proxy=true&proxy_country=fr`;
    
    console.log(`🔒 Utilisation de ZenRows pour contourner DataDome...`);
    
    const response = await fetch(zenrowsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erreur ZenRows ${response.status}:`, errorText);
      throw new Error(`Erreur ZenRows: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.text();
  }

  private parseAnnonceFromHtml(html: string): LeBonCoinAnnonce[] {
    const $ = cheerio.load(html);
    const annonces: LeBonCoinAnnonce[] = [];

    console.log(`📄 Parsing HTML avec ZenRows, longueur: ${html.length} caractères`);
    
    // Debug: sauvegarder le HTML pour inspection
    if (html.length > 1000) {
      console.log(`🔍 HTML reçu (premiers 500 caractères): ${html.substring(0, 500)}...`);
    }

    // Sélecteurs LeBonCoin (mis à jour 2024 - basés sur l'analyse HTML)
    const selectors = [
      '[data-qa-id="aditem_container"]', // Sélecteur principal confirmé
      '.aditem_container', // Classe CSS confirmée
      'a[href*="/ventes_immobilieres/"]', // Liens vers annonces
      '[data-qa-id="aditem"]',
      '.aditem',
      '.ad-listitem',
      '[data-test-id="aditem_container"]',
      'article[data-qa-id="aditem"]',
      '.aditem[data-qa-id="aditem"]',
      '[data-testid="aditem"]',
      '.aditem[data-testid="aditem"]'
    ];

    let foundElements = 0;
    let workingSelector = '';

    for (const selector of selectors) {
      const elements = $(selector);
      console.log(`🔍 Sélecteur "${selector}": ${elements.length} éléments trouvés`);
      if (elements.length > 0) {
        foundElements = elements.length;
        workingSelector = selector;
        break;
      }
    }

    if (foundElements === 0) {
      console.log('❌ Aucun élément d\'annonce trouvé');
      return annonces;
    }

    console.log(`✅ Utilisation du sélecteur: ${workingSelector}`);

    $(workingSelector).each((index, element) => {
      try {
        const $el = $(element);
        
        // Titre
        const title = $el.find('[data-qa-id="aditem_title"]').text().trim() || 
                     $el.find('.aditem_title').text().trim() ||
                     $el.find('.AdCardWith-title').text().trim() ||
                     $el.find('h2').text().trim() ||
                     $el.find('h3').text().trim() ||
                     $el.find('a[data-qa-id="aditem_title"]').text().trim() ||
                     $el.text().trim().split('\n')[0];
        
        if (!title || title.length < 10) return;

        // Prix
        const priceText = $el.find('[data-qa-id="aditem_price"]').text().trim() ||
                         $el.find('.aditem_price').text().trim() ||
                         $el.find('.AdCardWith-price').text().trim() ||
                         $el.find('.price').text().trim() ||
                         $el.find('[data-qa-id="aditem_price"]').text().trim();
        const price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
        if (price === 0) return;

        // URL
        const relativeUrl = $el.find('a').attr('href') || $el.attr('href');
        const url = relativeUrl ? 
          (relativeUrl.startsWith('http') ? relativeUrl : `${this.baseUrl}${relativeUrl}`) : '';

        // Surface et pièces
        const details = $el.find('[data-qa-id="aditem_criteria"]').text() ||
                       $el.find('.aditem_criteria').text() ||
                       $el.find('.criteria').text();
        
        const surfaceMatch = details.match(/(\d+)\s*m²/);
        const roomsMatch = details.match(/(\d+)\s*pièce/);
        
        const surface = surfaceMatch ? parseInt(surfaceMatch[1]) : undefined;
        const rooms = roomsMatch ? parseInt(roomsMatch[1]) : undefined;

        // Localisation
        const location = $el.find('[data-qa-id="aditem_location"]').text().trim() ||
                        $el.find('.aditem_location').text().trim() ||
                        $el.find('.location').text().trim();
        
        const city = location.split(' ')[0] || '';
        const postalCodeMatch = location.match(/(\d{5})/);
        const postalCode = postalCodeMatch ? postalCodeMatch[1] : undefined;

        // Images
        const images: string[] = [];
        $el.find('img').each((_, img) => {
          const src = $(img).attr('src');
          if (src && !src.includes('placeholder') && !src.includes('data:')) {
            images.push(src.startsWith('http') ? src : `${this.baseUrl}${src}`);
          }
        });

        // Date de publication
        const publishedAt = new Date();

        const annonce: LeBonCoinAnnonce = {
          title,
          price,
          surface,
          rooms,
          postalCode,
          city,
          url,
          publishedAt,
          images,
          description: title,
        };

        annonces.push(annonce);
        console.log(`✅ Annonce trouvée: ${title} - ${price}€`);

      } catch (error) {
        console.error('Erreur lors du parsing d\'une annonce:', error);
      }
    });

    console.log(`🎉 Total: ${annonces.length} annonces parsées`);
    return annonces;
  }

  async scrapeAnnonces(params: LeBonCoinSearchParams): Promise<LeBonCoinAnnonce[]> {
    const allAnnonces: LeBonCoinAnnonce[] = [];
    const maxPages = params.pages || 3;

    console.log(`🔍 Début du scraping LeBonCoin avec ZenRows pour ${params.ville}...`);

    for (let page = 1; page <= maxPages; page++) {
      try {
        console.log(`📄 Scraping page ${page}/${maxPages}...`);
        
        const searchUrl = this.buildSearchUrl(params, page);
        
        const html = await this.fetchWithZenRows(searchUrl);
        const annonces = this.parseAnnonceFromHtml(html);
        
        console.log(`✅ ${annonces.length} annonces trouvées sur la page ${page}`);
        allAnnonces.push(...annonces);

        // Délai entre les pages
        if (page < maxPages) {
          const delay = 2000 + Math.random() * 3000;
          console.log(`⏳ Attente de ${Math.round(delay)}ms...`);
          await this.delay(delay);
        }

      } catch (error) {
        console.error(`❌ Erreur sur la page ${page}:`, error);
        // Continue avec la page suivante
      }
    }

    console.log(`🎉 Scraping ZenRows terminé ! ${allAnnonces.length} annonces au total`);
    return allAnnonces;
  }
}

export const leboncoinZenRowsScraper = new LeBonCoinZenRowsScraper();
