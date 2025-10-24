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
    // Utiliser ZENROWS_KEY ou ZENROWS_API_KEY
    this.zenrowsApiKey = process.env.ZENROWS_API_KEY || process.env.ZENROWS_KEY || '';
    
    // Debug: Afficher toutes les variables d'environnement liées à ZenRows
    console.log("🔑 Clé ZenRows détectée :", !!process.env.ZENROWS_KEY);
    console.log('🔍 Variables d\'environnement ZenRows:');
    console.log('  ZENROWS_API_KEY:', process.env.ZENROWS_API_KEY ? '✅ Configurée' : '❌ Non configurée');
    console.log('  ZENROWS_KEY:', process.env.ZENROWS_KEY ? '✅ Configurée' : '❌ Non configurée');
    console.log('  Valeur utilisée:', this.zenrowsApiKey ? this.zenrowsApiKey.substring(0, 10) + '...' : 'undefined');
    
    if (!this.zenrowsApiKey) {
      console.warn('⚠️ ZENROWS_API_KEY non configurée, utilisation du mode fallback');
    } else {
      console.log('✅ Clé API ZenRows configurée et prête à l\'emploi !');
    }
  }
  
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private buildSearchUrl(params: LeBonCoinSearchParams, page = 1): string {
    // Construction d'URL optimisée pour éviter les erreurs 422
    const searchParams = new URLSearchParams();
    
    // Paramètres obligatoires
    searchParams.set('category', '9'); // Immobilier
    searchParams.set('real_estate_type', '2'); // Vente
    
    // Localisation (obligatoire)
    if (params.ville) {
      searchParams.set('locations', params.ville);
    }
    
    // Filtres de prix (seulement si spécifiés)
    if (params.minPrix && params.maxPrix) {
      searchParams.set('price', `${params.minPrix}-${params.maxPrix}`);
    } else if (params.minPrix) {
      searchParams.set('price', `${params.minPrix}-`);
    } else if (params.maxPrix) {
      searchParams.set('price', `-${params.maxPrix}`);
    }
    
    // Filtres de surface (seulement si spécifiés)
    if (params.minSurface && params.maxSurface) {
      searchParams.set('square', `${params.minSurface}-${params.maxSurface}`);
    } else if (params.minSurface) {
      searchParams.set('square', `${params.minSurface}-`);
    } else if (params.maxSurface) {
      searchParams.set('square', `-${params.maxSurface}`);
    }
    
    // Type de bien (seulement si spécifié)
    if (params.typeBien) {
      const typeMapping = {
        'appartement': '1',
        'maison': '2',
        'studio': '3',
        'loft': '4',
        'penthouse': '5'
      };
      const typeCode = typeMapping[params.typeBien];
      if (typeCode) {
        searchParams.set('real_estate_type', typeCode);
      }
    }
    
    // Pagination
    if (page > 1) {
      searchParams.set('page', page.toString());
    }
    
    const url = `${this.baseUrl}/recherche?${searchParams.toString()}`;
    console.log(`🔗 URL de recherche optimisée: ${url}`);
    return url;
  }

  private async fetchWithZenRows(url: string): Promise<string> {
    if (!this.zenrowsApiKey) {
      throw new Error('ZENROWS_API_KEY non configurée');
    }

    // Paramètres optimaux pour éviter les erreurs 422 et charger le contenu React
    const zenrowsUrl = `https://api.zenrows.com/v1/?apikey=${this.zenrowsApiKey}&url=${encodeURIComponent(url)}&js_render=true&premium_proxy=true&proxy_country=fr&wait=10000&wait_for=body&custom_headers=true&original_status=true`;
    
    console.log(`🔒 Utilisation de ZenRows avec paramètres optimaux...`);
    console.log(`📡 URL ZenRows: ${zenrowsUrl.substring(0, 100)}...`);
    
    const response = await fetch(zenrowsUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1',
      },
    });
    
    const html = await response.text();

// 🧠 Debug : afficher un extrait du HTML pour vérifier le contenu reçu
console.log("✅ HTML reçu :", html.slice(0, 1000));

    


    console.log(`📡 Response status: ${response.status}`);
    console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error(`❌ Erreur ZenRows ${response.status}: ${response.statusText}`);
      throw new Error(`Erreur ZenRows: ${response.status} ${response.statusText}`);
    }

    console.log(`✅ HTML reçu: ${html.length} caractères`);
    
    // Debug: Afficher les 500 premiers caractères du HTML
    console.log("✅ HTML reçu (premiers 500 caractères):", html.substring(0, 500));
    
    // Vérifier que le contenu n'est pas vide
    if (html.length < 1000) {
      console.warn(`⚠️ HTML très court (${html.length} caractères), possible problème de rendu`);
    }

    return html;
  }

  private parseAnnonceFromHtml(html: string): LeBonCoinAnnonce[] {
    const $ = cheerio.load(html);
    const annonces: LeBonCoinAnnonce[] = [];

    console.log(`📄 Parsing HTML avec ZenRows, longueur: ${html.length} caractères`);
    
    // Debug: Afficher plus d'informations sur la structure HTML
    console.log(`🔍 HTML reçu (premiers 1000 caractères):`, html.substring(0, 1000));
    
    // Debug: Analyser les balises principales
    console.log(`🔍 Balises principales trouvées:`, {
      title: $('title').text().substring(0, 100),
      body: $('body').length > 0 ? 'Présent' : 'Absent',
      articles: $('article').length,
      divs: $('div').length,
      links: $('a').length,
      scripts: $('script').length
    });

    // Sélecteurs LeBonCoin 2024 - optimisés pour React et DataDome
    const selectors = [
      // Sélecteurs principaux LeBonCoin 2024
      '[data-qa-id="aditem_container"]',
      '[data-testid="aditem_container"]',
      '[data-test-id="aditem_container"]',
      '.aditem_container',
      '.aditem',
      '.ad-listitem',
      
      // Sélecteurs de liens d'annonces
      'a[href*="/ventes_immobilieres/"]',
      'a[href*="/ventes/"]',
      'a[href*="/annonces/"]',
      
      // Sélecteurs génériques pour React
      'article[data-qa-id*="ad"]',
      'article[data-testid*="ad"]',
      'article[data-test-id*="ad"]',
      'div[data-qa-id*="ad"]',
      'div[data-testid*="ad"]',
      'div[data-test-id*="ad"]',
      
      // Sélecteurs de fallback
      'article',
      '[class*="aditem"]',
      '[class*="ad-card"]',
      '[class*="ad-card"]',
      '[class*="listing"]',
      '[class*="property"]',
      '[class*="real-estate"]',
      
      // Sélecteurs très génériques
      '[data-qa-id*="ad"]',
      '[data-testid*="ad"]',
      '[data-test-id*="ad"]',
      '[class*="ad"]',
      '[class*="card"]',
      '[class*="item"]'
    ];

    let foundElements = 0;
    let workingSelector = '';

    for (const selector of selectors) {
      const elements = $(selector);
      console.log(`🔍 Sélecteur "${selector}": ${elements.length} éléments trouvés`);
      
      // Debug: Si des éléments sont trouvés, afficher leurs classes et attributs
      if (elements.length > 0) {
        console.log(`✅ Éléments trouvés avec le sélecteur "${selector}":`);
        elements.slice(0, 3).each((index, element) => {
          const $el = $(element);
          console.log(`  - Élément ${index + 1}:`, {
            tag: element.type === 'tag' ? element.name : 'unknown',
            classes: $el.attr('class'),
            id: $el.attr('id'),
            'data-qa-id': $el.attr('data-qa-id'),
            'data-testid': $el.attr('data-testid'),
            text: $el.text().substring(0, 100)
          });
        });
        foundElements = elements.length;
        workingSelector = selector;
        break;
      }
    }

    if (foundElements === 0) {
      console.log('❌ Aucun élément d\'annonce trouvé avec les sélecteurs standards');
      
      // Debug: Analyser tous les liens pour trouver des annonces
      const allLinks = $('a[href*="/ventes_immobilieres/"], a[href*="/ventes/"], a[href*="/annonces/"]');
      console.log(`🔍 Liens d'annonces potentiels trouvés: ${allLinks.length}`);
      
      if (allLinks.length > 0) {
        console.log('📋 Exemples de liens trouvés:');
        allLinks.slice(0, 5).each((index, element) => {
          const $el = $(element);
          console.log(`  - Lien ${index + 1}:`, {
            href: $el.attr('href'),
            text: $el.text().substring(0, 100),
            classes: $el.attr('class'),
            parent: $el.parent().attr('class')
          });
        });
      }
      
      // Debug: Analyser les divs avec des classes suspectes
      const suspectDivs = $('div[class*="ad"], div[class*="card"], div[class*="item"], div[class*="listing"]');
      console.log(`🔍 Divs suspects trouvés: ${suspectDivs.length}`);
      
      if (suspectDivs.length > 0) {
        console.log('📋 Exemples de divs suspects:');
        suspectDivs.slice(0, 3).each((index, element) => {
          const $el = $(element);
          console.log(`  - Div ${index + 1}:`, {
            classes: $el.attr('class'),
            text: $el.text().substring(0, 100)
          });
        });
      }
      
      return annonces;
    }

    console.log(`✅ Utilisation du sélecteur: ${workingSelector}`);

    $(workingSelector).each((index, element) => {
      try {
        const $el = $(element);
        
        // Titre - sélecteurs basés sur l'analyse HTML réelle
        const title = $el.find('h3').text().trim() || 
                      $el.find('a[aria-label*="Voir l\'annonce"]').attr('aria-label') ||
                      $el.find('a').text().trim() ||
                      $el.find('[class*="title"]').text().trim() ||
                      $el.text().trim().split('\n')[0];
        
        if (!title || title.length < 10) return;

        // Prix - extraction depuis le texte complet
        const fullText = $el.text();
        const priceMatch = fullText.match(/(\d+[\s,]*€)/);
        const price = priceMatch ? parseInt(priceMatch[1].replace(/[^\d]/g, '')) : 0;
        if (price === 0) return;

        // URL - sélecteurs multiples et robustes
        const relativeUrl = $el.find('a').attr('href') || 
                           $el.attr('href') ||
                           $el.find('[href]').attr('href');
        const url = relativeUrl ? 
          (relativeUrl.startsWith('http') ? relativeUrl : `${this.baseUrl}${relativeUrl}`) : '';

        if (!url || !url.includes('leboncoin.fr')) return;

        // Surface et pièces - extraction depuis le texte complet
        const surfaceMatch = fullText.match(/(\d+)\s*mètres?\s*carre?s?/i);
        const roomsMatch = fullText.match(/(\d+)\s*pièces?/i);
        
        const surface = surfaceMatch ? parseInt(surfaceMatch[1]) : undefined;
        const rooms = roomsMatch ? parseInt(roomsMatch[1]) : undefined;

        // Localisation - extraction depuis le texte complet
        const locationMatch = fullText.match(/(\d{5}\s+[A-Za-z\s]+)/);
        const location = locationMatch ? locationMatch[1] : '';
        
        const city = location.split(' ').slice(1).join(' ') || location.split(' ')[0] || '';
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
        console.log(`✅ Annonce trouvée: ${title} - ${price}€ - ${city}`);

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
