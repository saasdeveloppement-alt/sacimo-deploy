import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Endpoint de nettoyage des annonces Melo.io
 * 
 * POST /api/melo/clean
 * 
 * Supprime toutes les annonces et listings provenant de Melo.io
 */
export async function POST(req: NextRequest) {
  try {
    console.log('🧹 Démarrage du nettoyage des annonces Melo.io...');
    
    // Supprimer toutes les annonces Melo.io
    const deletedScrape = await prisma.annonceScrape.deleteMany({
      where: { source: 'MELO' }
    });
    
    console.log(`✅ ${deletedScrape.count} annonces AnnonceScrape supprimées`);
    
    // Supprimer tous les listings Melo.io
    const deletedListing = await prisma.listing.deleteMany({
      where: { source: 'MELO' }
    });
    
    console.log(`✅ ${deletedListing.count} listings supprimés`);
    
    return NextResponse.json({
      success: true,
      message: `Nettoyage terminé : ${deletedScrape.count} annonces et ${deletedListing.count} listings supprimés`,
      deleted: {
        annonceScrape: deletedScrape.count,
        listing: deletedListing.count
      }
    });
  } catch (error: any) {
    console.error('❌ Erreur lors du nettoyage:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Erreur lors du nettoyage'
    }, { status: 500 });
  }
}


