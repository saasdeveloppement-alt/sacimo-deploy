import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configuration optimisée pour Vercel/serverless et développement local
// Sur Vercel et avec Neon (serverless), chaque fonction peut créer une nouvelle instance
// Il faut optimiser le pool de connexions
const prismaClientOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Optimisations pour bases serverless (Neon, Vercel Postgres, etc.)
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
}

function createPrismaClient() {
  return new PrismaClient(prismaClientOptions)
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// En développement, réutiliser l'instance pour éviter trop de connexions
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Helper pour exécuter une requête avec retry en cas de connexion fermée
export async function withPrismaRetry<T>(
  operation: (client: PrismaClient) => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Vérifier si la connexion est active
      await prisma.$queryRaw`SELECT 1`
      
      // Exécuter l'opération
      return await operation(prisma)
    } catch (error: any) {
      lastError = error
      
      // Vérifier si c'est une erreur de connexion fermée
      const isConnectionError = 
        error.message?.includes('closed the connection') ||
        error.message?.includes('connection') ||
        error.code === 'P1001' || // Prisma connection error
        error.code === 'P1008'    // Prisma operations timed out
      
      if (isConnectionError && attempt < maxRetries) {
        console.warn(`⚠️ [Prisma] Tentative ${attempt}/${maxRetries} échouée, reconnexion...`, error.message)
        
        // Fermer la connexion actuelle
        try {
          await prisma.$disconnect()
        } catch (disconnectError) {
          // Ignorer les erreurs de déconnexion
        }
        
        // Attendre un peu avant de réessayer
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        
        // Recréer le client Prisma
        if (globalForPrisma.prisma) {
          globalForPrisma.prisma = createPrismaClient()
        }
        
        continue
      }
      
      // Si ce n'est pas une erreur de connexion ou si on a épuisé les tentatives, lancer l'erreur
      throw error
    }
  }
  
  throw lastError || new Error('Échec après plusieurs tentatives')
}