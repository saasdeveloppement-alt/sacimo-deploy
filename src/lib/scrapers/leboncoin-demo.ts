import { LeBonCoinAnnonce } from './leboncoin-optimized';

// Données de démonstration réalistes pour LeBonCoin
const demoAnnonces: LeBonCoinAnnonce[] = [
  {
    titre: "Appartement 3 pièces 75m² - Rénové",
    prix: "450000",
    localisation: "75011 Paris",
    surface: "75",
    pieces: "3",
    url: "https://www.leboncoin.fr/ventes_immobilieres/1234567890.htm"
  },
  {
    titre: "Studio 25m² - Proche métro",
    prix: "280000",
    localisation: "75012 Paris",
    surface: "25",
    pieces: "1",
    url: "https://www.leboncoin.fr/ventes_immobilieres/1234567891.htm"
  },
  {
    titre: "Maison 4 pièces 120m² - Jardin",
    prix: "650000",
    localisation: "75015 Paris",
    surface: "120",
    pieces: "4",
    url: "https://www.leboncoin.fr/ventes_immobilieres/1234567892.htm"
  },
  {
    titre: "Appartement 2 pièces 45m² - Balcon",
    prix: "320000",
    localisation: "75013 Paris",
    surface: "45",
    pieces: "2",
    url: "https://www.leboncoin.fr/ventes_immobilieres/1234567893.htm"
  },
  {
    titre: "Loft 80m² - Exposé sud",
    prix: "520000",
    localisation: "75010 Paris",
    surface: "80",
    pieces: "2",
    url: "https://www.leboncoin.fr/ventes_immobilieres/1234567894.htm"
  },
  {
    titre: "Appartement 5 pièces 140m² - Haussmannien",
    prix: "850000",
    localisation: "75016 Paris",
    surface: "140",
    pieces: "5",
    url: "https://www.leboncoin.fr/ventes_immobilieres/1234567895.htm"
  },
  {
    titre: "Studio 20m² - Meublé",
    prix: "220000",
    localisation: "75018 Paris",
    surface: "20",
    pieces: "1",
    url: "https://www.leboncoin.fr/ventes_immobilieres/1234567896.htm"
  },
  {
    titre: "Appartement 3 pièces 90m² - Terrasse",
    prix: "580000",
    localisation: "75009 Paris",
    surface: "90",
    pieces: "3",
    url: "https://www.leboncoin.fr/ventes_immobilieres/1234567897.htm"
  },
  {
    titre: "Maison 6 pièces 180m² - Garage",
    prix: "950000",
    localisation: "75017 Paris",
    surface: "180",
    pieces: "6",
    url: "https://www.leboncoin.fr/ventes_immobilieres/1234567898.htm"
  },
  {
    titre: "Appartement 2 pièces 55m² - Rénové",
    prix: "380000",
    localisation: "75014 Paris",
    surface: "55",
    pieces: "2",
    url: "https://www.leboncoin.fr/ventes_immobilieres/1234567899.htm"
  }
];

export async function scrapeLeBonCoinDemo(ville = "Paris"): Promise<{
  success: boolean;
  totalFound?: number;
  annonces?: LeBonCoinAnnonce[];
  error?: string;
}> {
  try {
    console.log(`🎭 Scraping démo LeBonCoin pour ${ville}...`);
    
    // Simuler un délai de scraping
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Filtrer par ville si nécessaire
    let annonces = demoAnnonces;
    if (ville !== "Paris") {
      // Simuler des annonces pour d'autres villes
      annonces = demoAnnonces.map(annonce => ({
        ...annonce,
        localisation: annonce.localisation.replace("Paris", ville),
        url: annonce.url.replace("Paris", ville.toLowerCase())
      }));
    }
    
    console.log(`✅ Scraping démo terminé : ${annonces.length} annonces`);
    
    return {
      success: true,
      totalFound: annonces.length,
      annonces
    };
    
  } catch (error: any) {
    console.error("❌ Erreur scraping démo :", error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
}
