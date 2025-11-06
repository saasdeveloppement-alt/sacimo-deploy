import { NextRequest, NextResponse } from "next/server";
import { meloService } from "@/lib/services/melo";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("🔍 Scraper Melo.io - Paramètres:", body)
    
    const annonces = await meloService.searchAnnonces(body)
    
    console.log(`✅ ${annonces.length} annonces récupérées depuis Melo.io`)
    
    // Sauvegarder en base (même logique que leboncoin)
    let savedCount = 0
    let updatedCount = 0
    let skippedCount = 0
    
    for (const annonce of annonces) {
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
              source: 'MELO',
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
      status: 'success',
      count: annonces.length,
      saved: savedCount,
      updated: updatedCount,
      skipped: skippedCount,
      source: 'melo.io'
    })
    
  } catch (error: any) {
    console.error('❌ Erreur Melo:', error)
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 })
  }
}

