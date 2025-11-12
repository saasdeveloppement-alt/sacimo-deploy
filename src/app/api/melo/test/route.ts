import { NextRequest, NextResponse } from "next/server";
import { meloService } from "@/lib/services/melo";

/**
 * Endpoint de test pour vérifier la configuration et la connexion à l'API Melo.io
 * 
 * GET /api/melo/test
 * 
 * Retourne :
 * - Statut de la configuration
 * - Test de connexion à l'API
 * - Exemple de requête simple
 */
export async function GET(req: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    config: {
      hasApiKey: !!process.env.MELO_API_KEY,
      environment: process.env.MELO_ENV || 'preprod',
      baseUrl: process.env.MELO_ENV === 'production' 
        ? 'https://api.notif.immo' 
        : 'https://preprod-api.notif.immo',
    },
    tests: [] as Array<{
      name: string;
      status: 'success' | 'error' | 'warning';
      message: string;
      details?: any;
    }>,
  };

  // Test 1: Vérifier la configuration
  if (!process.env.MELO_API_KEY) {
    results.tests.push({
      name: 'Configuration API Key',
      status: 'error',
      message: 'MELO_API_KEY non configurée',
    });
    return NextResponse.json(results, { status: 500 });
  }

  results.tests.push({
    name: 'Configuration API Key',
    status: 'success',
    message: 'MELO_API_KEY configurée',
    details: {
      keyLength: process.env.MELO_API_KEY.length,
      keyPrefix: process.env.MELO_API_KEY.substring(0, 8) + '...',
    },
  });

  // Test 2: Vérifier l'environnement
  const env = process.env.MELO_ENV || 'preprod';
  if (env !== 'preprod' && env !== 'production') {
    results.tests.push({
      name: 'Configuration Environment',
      status: 'warning',
      message: `MELO_ENV="${env}" n'est pas une valeur standard (preprod/production)`,
    });
  } else {
    results.tests.push({
      name: 'Configuration Environment',
      status: 'success',
      message: `Environnement: ${env}`,
    });
  }

  // Test 3: Test de connexion à l'API (requête simple)
  try {
    const testParams = {
      ville: 'Paris',
      typeBien: 'appartement' as const,
      minPrix: 100000,
      maxPrix: 500000,
      itemsPerPage: 5, // Limiter à 5 pour le test
    };

    console.log('🧪 Test API Melo.io - Requête de test:', testParams);

    const annonces = await meloService.searchAnnonces(testParams);

    results.tests.push({
      name: 'Test de connexion API',
      status: 'success',
      message: `Connexion réussie - ${annonces.length} annonces récupérées`,
      details: {
        annoncesCount: annonces.length,
        sampleAnnonce: annonces.length > 0 ? {
          title: annonces[0].title?.substring(0, 50),
          city: annonces[0].city,
          price: annonces[0].price,
        } : null,
      },
    });
  } catch (error: any) {
    results.tests.push({
      name: 'Test de connexion API',
      status: 'error',
      message: `Erreur de connexion: ${error.message}`,
      details: {
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    });
  }

  // Résumé
  const successCount = results.tests.filter(t => t.status === 'success').length;
  const errorCount = results.tests.filter(t => t.status === 'error').length;
  const warningCount = results.tests.filter(t => t.status === 'warning').length;

  const summary = {
    total: results.tests.length,
    success: successCount,
    errors: errorCount,
    warnings: warningCount,
    overall: errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'success',
  };

  return NextResponse.json({
    ...results,
    summary,
  }, {
    status: errorCount > 0 ? 500 : 200,
  });
}


