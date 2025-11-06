#!/usr/bin/env node

// Script de post-déploiement pour Vercel
// Ce script s'exécute automatiquement après chaque déploiement

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🚀 Post-deployment script started...')
    
    // Vérifier la connexion à la base de données
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Ici vous pouvez ajouter des tâches de post-déploiement
    // Par exemple : créer des données par défaut, envoyer des notifications, etc.
    
    console.log('✅ Post-deployment script completed successfully')
  } catch (error) {
    console.error('❌ Post-deployment script failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()











