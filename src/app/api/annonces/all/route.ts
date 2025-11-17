import { NextRequest, NextResponse } from "next/server";
import { meloService } from "@/lib/services/melo";
import { isMeloSyncAllowed } from "@/lib/melo-safe";

export async function GET(req: NextRequest) {
  if (!isMeloSyncAllowed()) {
    return NextResponse.json(
      {
        success: false,
        error: "Sync Melo bloquée (environnement non autorisé) : exécution uniquement en production sur Vercel.",
      },
      { status: 403 }
    )
  }

  try {
    console.log("🔍 DEBUG MODE - Récupération de TOUTES les annonces Melo.io (sans filtre)")
    
    if (!process.env.MELO_API_KEY) {
      return NextResponse.json({
        status: 'error',
        message: '❌ MELO_API_KEY non configurée'
      }, { status: 500 })
    }
    
    // Appeler Melo.io SANS AUCUN filtre pour récupérer TOUT
    const annonces = await meloService.searchAnnonces({
      // Pas de paramètres = récupère tout
      itemsPerPage: 100 // Augmenter pour récupérer plus de résultats
    })
    
    console.log(`📊 TOTAL: ${annonces.length} annonces récupérées`)
    
    // Log détaillé de chaque annonce
    console.log("\n=== DÉTAIL DES ANNONCES ===")
    annonces.forEach((annonce, index) => {
      console.log(`\n[${index + 1}] ${annonce.title}`)
      console.log(`  🏙️  Ville: ${annonce.city || 'N/A'}`)
      console.log(`  📍 Code postal: ${annonce.postalCode || 'N/A'}`)
      console.log(`  💰 Prix: ${annonce.price}`)
      console.log(`  📐 Surface: ${annonce.surface || 'N/A'}`)
      console.log(`  🛏️  Pièces: ${annonce.rooms || 'N/A'}`)
      console.log(`  🔗 URL: ${annonce.url}`)
      console.log(`  📅 Publié: ${annonce.publishedAt}`)
      console.log(`  📝 Description: ${(annonce.description || '').substring(0, 100)}...`)
    })
    
    // Calculer les statistiques
    const stats = {
      total: annonces.length,
      villes: {} as Record<string, number>,
      types: {} as Record<string, number>,
      prix: {
        min: annonces.length > 0 ? Math.min(...annonces.map(a => parseInt(a.price.replace(/[^\d]/g, '')) || 0)) : 0,
        max: annonces.length > 0 ? Math.max(...annonces.map(a => parseInt(a.price.replace(/[^\d]/g, '')) || 0)) : 0,
        avg: annonces.length > 0 
          ? Math.round(annonces.reduce((sum, a) => sum + (parseInt(a.price.replace(/[^\d]/g, '')) || 0), 0) / annonces.length)
          : 0
      },
      surface: {
        min: annonces.filter(a => a.surface).length > 0
          ? Math.min(...annonces.filter(a => a.surface).map(a => parseInt(a.surface!.replace(/[^\d]/g, '')) || 0))
          : 0,
        max: annonces.filter(a => a.surface).length > 0
          ? Math.max(...annonces.filter(a => a.surface).map(a => parseInt(a.surface!.replace(/[^\d]/g, '')) || 0))
          : 0,
        avg: annonces.filter(a => a.surface).length > 0
          ? Math.round(annonces.filter(a => a.surface).reduce((sum, a) => sum + (parseInt(a.surface!.replace(/[^\d]/g, '')) || 0), 0) / annonces.filter(a => a.surface).length)
          : 0
      },
      pieces: {
        min: annonces.filter(a => a.rooms).length > 0
          ? Math.min(...annonces.filter(a => a.rooms).map(a => a.rooms!))
          : 0,
        max: annonces.filter(a => a.rooms).length > 0
          ? Math.max(...annonces.filter(a => a.rooms).map(a => a.rooms!))
          : 0,
        avg: annonces.filter(a => a.rooms).length > 0
          ? Math.round(annonces.filter(a => a.rooms).reduce((sum, a) => sum + a.rooms!, 0) / annonces.filter(a => a.rooms).length)
          : 0
      }
    }
    
    // Analyser les villes
    annonces.forEach(annonce => {
      const ville = annonce.city || 'Inconnu'
      stats.villes[ville] = (stats.villes[ville] || 0) + 1
    })
    
    // Analyser les types (depuis le titre)
    annonces.forEach(annonce => {
      const title = (annonce.title || '').toLowerCase()
      let type = 'Autre'
      if (title.includes('appartement') || title.includes('apt') || title.includes('t2') || title.includes('t3') || title.includes('t4') || title.includes('t5')) {
        type = 'Appartement'
      } else if (title.includes('maison') || title.includes('villa')) {
        type = 'Maison'
      } else if (title.includes('studio')) {
        type = 'Studio'
      } else if (title.includes('loft')) {
        type = 'Loft'
      }
      stats.types[type] = (stats.types[type] || 0) + 1
    })
    
    // Log des statistiques
    console.log("\n=== STATISTIQUES ===")
    console.log(`📊 Total: ${stats.total} annonces`)
    console.log(`\n🏙️  Villes disponibles:`)
    Object.entries(stats.villes)
      .sort((a, b) => b[1] - a[1])
      .forEach(([ville, count]) => {
        console.log(`  - ${ville}: ${count} annonce${count > 1 ? 's' : ''}`)
      })
    console.log(`\n🏠 Types disponibles:`)
    Object.entries(stats.types)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  - ${type}: ${count} annonce${count > 1 ? 's' : ''}`)
      })
    console.log(`\n💰 Prix:`)
    console.log(`  - Min: ${stats.prix.min.toLocaleString('fr-FR')}€`)
    console.log(`  - Max: ${stats.prix.max.toLocaleString('fr-FR')}€`)
    console.log(`  - Moyen: ${stats.prix.avg.toLocaleString('fr-FR')}€`)
    console.log(`\n📐 Surface:`)
    console.log(`  - Min: ${stats.surface.min}m²`)
    console.log(`  - Max: ${stats.surface.max}m²`)
    console.log(`  - Moyenne: ${stats.surface.avg}m²`)
    console.log(`\n🛏️  Pièces:`)
    console.log(`  - Min: ${stats.pieces.min}`)
    console.log(`  - Max: ${stats.pieces.max}`)
    console.log(`  - Moyenne: ${stats.pieces.avg}`)
    
    return NextResponse.json({
      status: 'success',
      total: stats.total,
      annonces: annonces,
      stats: {
        villes: Object.entries(stats.villes)
          .sort((a, b) => b[1] - a[1])
          .map(([ville, count]) => ({ ville, count })),
        types: Object.entries(stats.types)
          .sort((a, b) => b[1] - a[1])
          .map(([type, count]) => ({ type, count })),
        prix: stats.prix,
        surface: stats.surface,
        pieces: stats.pieces
      }
    })
    
  } catch (error: any) {
    console.error('❌ Erreur récupération annonces:', error)
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Erreur lors de la récupération des annonces'
    }, { status: 500 })
  }
}

