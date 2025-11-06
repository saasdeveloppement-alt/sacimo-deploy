import { NextRequest, NextResponse } from "next/server";
import { smartScraper } from "@/lib/services/smart-scraper";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("🔍 Scraper LeBonCoin - Paramètres reçus:", body);
    
    const { annonces: data, source } = await smartScraper.scrape(body);
    
    console.log(`✅ Scraper terminé: ${data.length} annonces trouvées (source: ${source})`);
    
    // Sauvegarder les annonces en base de données
    let savedCount = 0
    let updatedCount = 0
    let skippedCount = 0
    
    for (const annonce of data) {
      try {
        // Vérifier si l'annonce existe déjà par URL
        const existing = await prisma.annonceScrape.findUnique({
          where: { url: annonce.url }
        })
        
        if (existing) {
          // Mettre à jour l'annonce existante
          await prisma.annonceScrape.update({
            where: { url: annonce.url },
            data: {
              title: annonce.title,
              price: parseInt(annonce.price.replace(/[^\d]/g, '')) || 0,
              surface: annonce.surface ? parseInt(annonce.surface.replace(/[^\d]/g, '')) : null,
              rooms: annonce.rooms || null,
              postalCode: annonce.postalCode || null,
              city: annonce.city || 'Paris',
              publishedAt: annonce.publishedAt,
              images: annonce.images || [],
              description: annonce.description || null,
              isNew: false,
              lastScrapedAt: new Date()
            }
          })
          updatedCount++
        } else {
          // Créer une nouvelle annonce
          await prisma.annonceScrape.create({
            data: {
              title: annonce.title,
              price: parseInt(annonce.price.replace(/[^\d]/g, '')) || 0,
              surface: annonce.surface ? parseInt(annonce.surface.replace(/[^\d]/g, '')) : null,
              rooms: annonce.rooms || null,
              postalCode: annonce.postalCode || null,
              city: annonce.city || 'Paris',
              url: annonce.url,
              publishedAt: annonce.publishedAt,
              images: annonce.images || [],
              description: annonce.description || null,
              source: source === 'melo' ? 'MELO' : 'LEBONCOIN',
              isNew: true,
              lastScrapedAt: new Date()
            }
          })
          savedCount++
        }
      } catch (error: any) {
        // Gérer les erreurs de validation (ex: prix invalide)
        if (error.code === 'P2002') {
          // URL déjà existante (doublon) - skip silencieusement
          skippedCount++
          console.log(`⚠️ Doublon détecté: ${annonce.url.substring(0, 50)}...`)
        } else {
          console.error(`❌ Erreur sauvegarde annonce:`, error.message)
          skippedCount++
        }
      }
    }
    
    console.log(`💾 Base de données: ${savedCount} nouvelles, ${updatedCount} mises à jour, ${skippedCount} ignorées`)
    
    return NextResponse.json({ 
      status: "success", 
      count: data.length,
      source: source,
      saved: savedCount,
      updated: updatedCount,
      skipped: skippedCount,
      annonces: data,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("❌ Scraper error:", err);
    return NextResponse.json({ 
      status: "error", 
      message: String(err),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}






