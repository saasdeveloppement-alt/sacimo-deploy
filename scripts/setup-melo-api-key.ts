#!/usr/bin/env tsx
/**
 * Script pour configurer la clé API Melo.io
 * 
 * Usage: tsx scripts/setup-melo-api-key.ts [API_KEY] [ENV]
 * 
 * Exemples:
 *   tsx scripts/setup-melo-api-key.ts votre-cle-api production
 *   tsx scripts/setup-melo-api-key.ts votre-cle-api preprod
 */

import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Récupérer les arguments
const apiKey = process.argv[2]
const environment = process.argv[3] || 'production'

if (!apiKey) {
  log('\n❌ Erreur: Clé API manquante', 'red')
  log('\nUsage:', 'yellow')
  log('  tsx scripts/setup-melo-api-key.ts [API_KEY] [ENV]', 'cyan')
  log('\nExemples:', 'yellow')
  log('  tsx scripts/setup-melo-api-key.ts votre-cle-api production', 'cyan')
  log('  tsx scripts/setup-melo-api-key.ts votre-cle-api preprod', 'cyan')
  process.exit(1)
}

if (environment !== 'production' && environment !== 'preprod') {
  log('\n⚠️  Avertissement: ENV doit être "production" ou "preprod"', 'yellow')
  log(`   Utilisation de "${environment}" quand même...`, 'yellow')
}

const envLocalPath = join(process.cwd(), '.env.local')
const envExamplePath = join(process.cwd(), 'env.example')

log('\n🔧 Configuration de la clé API Melo.io...', 'blue')

// Lire le fichier .env.local existant ou créer depuis env.example
let envContent = ''

if (existsSync(envLocalPath)) {
  log('📄 Fichier .env.local existant trouvé', 'cyan')
  envContent = readFileSync(envLocalPath, 'utf-8')
} else if (existsSync(envExamplePath)) {
  log('📄 Création de .env.local depuis env.example', 'cyan')
  envContent = readFileSync(envExamplePath, 'utf-8')
} else {
  log('📄 Création d\'un nouveau fichier .env.local', 'cyan')
  envContent = `# Variables d'environnement SACIMO
# Généré automatiquement le ${new Date().toISOString()}
`
}

// Mettre à jour ou ajouter MELO_API_KEY
if (envContent.includes('MELO_API_KEY=')) {
  log('✏️  Mise à jour de MELO_API_KEY...', 'cyan')
  envContent = envContent.replace(
    /MELO_API_KEY=".*"/,
    `MELO_API_KEY="${apiKey}"`
  )
} else {
  log('➕ Ajout de MELO_API_KEY...', 'cyan')
  // Chercher la section MELO.IO ou l'ajouter à la fin
  if (envContent.includes('# API MELO.IO')) {
    envContent = envContent.replace(
      /MELO_API_KEY=".*"/,
      `MELO_API_KEY="${apiKey}"`
    )
  } else {
    // Ajouter la section si elle n'existe pas
    const meloSection = `\n# ============================================
# API MELO.IO (OBLIGATOIRE)
# ============================================
# Clé API Melo.io (sandbox ou production)
MELO_API_KEY="${apiKey}"

# Environnement Melo.io: 'preprod' (sandbox) ou 'production'
MELO_ENV="${environment}"
`
    envContent += meloSection
  }
}

// Mettre à jour ou ajouter MELO_ENV
if (envContent.includes('MELO_ENV=')) {
  log('✏️  Mise à jour de MELO_ENV...', 'cyan')
  envContent = envContent.replace(
    /MELO_ENV=".*"/,
    `MELO_ENV="${environment}"`
  )
} else if (!envContent.includes('MELO_ENV=')) {
  // Si MELO_API_KEY existe mais pas MELO_ENV, l'ajouter après
  envContent = envContent.replace(
    /MELO_API_KEY=".*"/,
    `MELO_API_KEY="${apiKey}"\nMELO_ENV="${environment}"`
  )
}

// Écrire le fichier
writeFileSync(envLocalPath, envContent, 'utf-8')

log('\n✅ Configuration terminée !', 'green')
log(`\n📝 Fichier: .env.local`, 'cyan')
log(`   MELO_API_KEY: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`, 'cyan')
log(`   MELO_ENV: ${environment}`, 'cyan')

log('\n📋 Prochaines étapes:', 'blue')
log('1. Vérifier la configuration:', 'yellow')
log('   npm run check:melo', 'cyan')
log('\n2. Tester l\'API localement:', 'yellow')
log('   npm run dev', 'cyan')
log('   Puis ouvrir: http://localhost:3000/api/melo/test', 'cyan')
log('\n3. Configurer Vercel:', 'yellow')
log('   - Allez dans Settings → Environment Variables', 'cyan')
log(`   - Ajoutez MELO_API_KEY="${apiKey}"`, 'cyan')
log(`   - Ajoutez MELO_ENV="${environment}"`, 'cyan')
log('   - Cochez Production, Preview, Development', 'cyan')

log('\n⚠️  Important:', 'yellow')
log('   - Le fichier .env.local est dans .gitignore (ne sera pas commité)', 'cyan')
log('   - N\'oubliez pas de configurer les variables dans Vercel pour la production', 'cyan')

log('\n✅ Tout est prêt !', 'green')

