import { NextRequest, NextResponse } from "next/server";
import { meloService } from "@/lib/services/melo";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Récupérer les paramètres de l'interface
    const ville = searchParams.get('ville') || undefined;
    const typeLogement = searchParams.get('type') as 'appartement' | 'maison' | undefined;
    const budget = searchParams.get('budget');
    const surface = searchParams.get('surface');
    const chambres = searchParams.get('chambres');
    const pieces = searchParams.get('pieces');
    const transactionType = searchParams.get('transactionType') as 'vente' | 'location' | undefined;
    const itemsPerPage = searchParams.get('itemsPerPage');
    
    // Parser les valeurs numériques
    const minPrix = budget ? parseInt(budget) : undefined;
    const maxPrix = budget ? parseInt(budget) : undefined; // Si budget seul, utiliser comme max
    const minSurface = surface ? parseInt(surface) : undefined;
    const chambresNum = chambres ? parseInt(chambres) : undefined;
    const piecesNum = pieces ? parseInt(pieces) : undefined;
    const itemsPerPageNum = itemsPerPage ? parseInt(itemsPerPage) : 50;
    
    console.log('🔍 API /annonces - Paramètres reçus:', {
      ville,
      typeLogement,
      budget,
      surface,
      chambres,
      pieces,
      transactionType,
      itemsPerPage: itemsPerPageNum
    });
    
    // Appeler le service Melo.io
    const annonces = await meloService.searchAnnonces({
      ville,
      typeBien: typeLogement,
      minPrix,
      maxPrix,
      minSurface,
      chambres: chambresNum,
      pieces: piecesNum,
      transactionType: transactionType || 'vente',
      itemsPerPage: itemsPerPageNum
    });
    
    console.log(`✅ API /annonces - ${annonces.length} annonces retournées`);
    
    return NextResponse.json({
      success: true,
      total: annonces.length,
      annonces: annonces.map(annonce => ({
        id: annonce.url, // Utiliser l'URL comme ID unique
        titre: annonce.title,
        prix: parseInt(annonce.price.replace(/[^\d]/g, '')) || 0,
        ville: annonce.city,
        codePostal: annonce.postalCode || '',
        surface: annonce.surface ? parseInt(annonce.surface.replace(/[^\d]/g, '')) : 0,
        pieces: annonce.rooms || 0,
        chambres: annonce.rooms || 0, // Approximation
        type: annonce.title.toLowerCase().includes('maison') ? 'Maison' : 'Appartement',
        description: annonce.description || '',
        images: annonce.images || [],
        url: annonce.url,
        datePublication: annonce.publishedAt.toISOString()
      }))
    });
    
  } catch (error: any) {
    console.error('❌ Erreur API /annonces:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur lors de la récupération des annonces',
      annonces: []
    }, { status: 500 });
  }
}

