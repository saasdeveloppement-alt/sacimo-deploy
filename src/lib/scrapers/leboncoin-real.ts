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

export class LeBonCoinRealScraper {
  private baseUrl = 'https://www.leboncoin.fr';
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(url: string, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
        });

        if (response.ok) {
          return response;
        }
      } catch (error) {
        console.log(`Tentative ${i + 1} échouée pour ${url}`);
        if (i === retries - 1) throw error;
        await this.delay(2000 * (i + 1)); // Délai progressif
      }
    }
    throw new Error('Toutes les tentatives ont échoué');
  }

  private buildSearchUrl(params: LeBonCoinSearchParams, page = 1): string {
    const searchParams = new URLSearchParams();
    
    // Catégorie immobilier
    searchParams.set('category', '9'); // Immobilier
    searchParams.set('real_estate_type', '2'); // Vente
    
    // Localisation
    searchParams.set('locations', params.ville);
    
    // Prix
    if (params.minPrix) searchParams.set('price', `${params.minPrix}`);
    if (params.maxPrix) searchParams.set('price', `${params.minPrix || 0}-${params.maxPrix}`);
    
    // Surface
    if (params.minSurface) searchParams.set('square', `${params.minSurface}`);
    if (params.maxSurface) searchParams.set('square', `${params.minSurface || 0}-${params.maxSurface}`);
    
    // Type de bien
    if (params.typeBien) {
      const typeMap: Record<string, string> = {
        'appartement': '1',
        'maison': '2',
        'studio': '3',
        'loft': '4',
        'penthouse': '5'
      };
      searchParams.set('real_estate_type', typeMap[params.typeBien] || '1');
    }
    
    // Pièces
    if (params.pieces) searchParams.set('rooms', params.pieces.toString());
    
    // Pagination
    searchParams.set('page', page.toString());
    
    return `${this.baseUrl}/recherche?${searchParams.toString()}`;
  }

  private parseAnnonceFromHtml(html: string): LeBonCoinAnnonce[] {
    const $ = cheerio.load(html);
    const annonces: LeBonCoinAnnonce[] = [];

    $('[data-qa-id="aditem_container"]').each((index, element) => {
      try {
        const $el = $(element);
        
        // Titre
        const title = $el.find('[data-qa-id="aditem_title"]').text().trim();
        if (!title) return;

        // Prix
        const priceText = $el.find('[data-qa-id="aditem_price"]').text().trim();
        const price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
        if (price === 0) return;

        // URL
        const relativeUrl = $el.find('a').attr('href');
        const url = relativeUrl ? `${this.baseUrl}${relativeUrl}` : '';

        // Surface et pièces
        const details = $el.find('[data-qa-id="aditem_criteria"]').text();
        const surfaceMatch = details.match(/(\d+)\s*m²/);
        const roomsMatch = details.match(/(\d+)\s*pièce/);
        
        const surface = surfaceMatch ? parseInt(surfaceMatch[1]) : undefined;
        const rooms = roomsMatch ? parseInt(roomsMatch[1]) : undefined;

        // Localisation
        const location = $el.find('[data-qa-id="aditem_location"]').text().trim();
        const city = location.split(' ')[0] || '';
        const postalCodeMatch = location.match(/(\d{5})/);
        const postalCode = postalCodeMatch ? postalCodeMatch[1] : undefined;

        // Images
        const images: string[] = [];
        $el.find('img').each((_, img) => {
          const src = $(img).attr('src');
          if (src && !src.includes('placeholder')) {
            images.push(src.startsWith('http') ? src : `${this.baseUrl}${src}`);
          }
        });

        // Date de publication (approximative)
        const publishedAt = new Date();

        annonces.push({
          title,
          price,
          surface,
          rooms,
          postalCode,
          city,
          url,
          publishedAt,
          images,
          description: title, // Description basique
        });

      } catch (error) {
        console.error('Erreur lors du parsing d\'une annonce:', error);
      }
    });

    return annonces;
  }

  async scrapeAnnonces(params: LeBonCoinSearchParams): Promise<LeBonCoinAnnonce[]> {
    const allAnnonces: LeBonCoinAnnonce[] = [];
    const maxPages = params.pages || 3;

    console.log(`🔍 Début du scraping LeBonCoin pour ${params.ville}...`);

    for (let page = 1; page <= maxPages; page++) {
      try {
        console.log(`📄 Scraping page ${page}/${maxPages}...`);
        
        const searchUrl = this.buildSearchUrl(params, page);
        console.log(`🌐 URL: ${searchUrl}`);

        const response = await this.fetchWithRetry(searchUrl);
        const html = await response.text();
        
        const annonces = this.parseAnnonceFromHtml(html);
        console.log(`✅ ${annonces.length} annonces trouvées sur la page ${page}`);
        
        allAnnonces.push(...annonces);

        // Délai entre les pages pour simuler un humain
        if (page < maxPages) {
          const delay = 2000 + Math.random() * 3000; // 2-5 secondes
          console.log(`⏳ Attente de ${Math.round(delay)}ms...`);
          await this.delay(delay);
        }

      } catch (error) {
        console.error(`❌ Erreur sur la page ${page}:`, error);
        // Continue avec la page suivante
      }
    }

    console.log(`🎉 Scraping terminé ! ${allAnnonces.length} annonces au total`);
    return allAnnonces;
  }
}

export const leboncoinRealScraper = new LeBonCoinRealScraper();
