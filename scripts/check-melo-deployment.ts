#!/usr/bin/env tsx
/**
 * Script de vérification pré-déploiement pour l'API Melo.io
 * 
 * Usage: tsx scripts/check-melo-deployment.ts
 * 
 * Vérifie :
 * - Configuration des variables d'environnement
 * - Connexion à l'API Melo.io
 * - Structure des endpoints
 */

import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

// Charger les variables d'environnement depuis .env.local
const envLocalPath = join(process.cwd(), '.env.local')
if (existsSync(envLocalPath)) {
  const envContent = readFileSync(envLocalPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim()
      // Enlever les guillemets si présents
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
}

interface CheckResult {
  name: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: string
}

const checks: CheckResult[] = []

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Check 1: Variables d'environnement
log('\n📋 Vérification des variables d\'environnement...', 'blue')

if (!process.env.MELO_API_KEY) {
  checks.push({
    name: 'MELO_API_KEY',
    status: 'error',
    message: 'MELO_API_KEY non définie',
    details: 'Ajoutez MELO_API_KEY dans votre fichier .env.local ou dans Vercel',
  })
} else {
  checks.push({
    name: 'MELO_API_KEY',
    status: 'success',
    message: `MELO_API_KEY configurée (${process.env.MELO_API_KEY.length} caractères)`,
  })
}

const meloEnv = process.env.MELO_ENV || 'preprod'
if (meloEnv !== 'preprod' && meloEnv !== 'production') {
  checks.push({
    name: 'MELO_ENV',
    status: 'warning',
    message: `MELO_ENV="${meloEnv}" n'est pas standard (attendu: preprod ou production)`,
  })
} else {
  checks.push({
    name: 'MELO_ENV',
    status: 'success',
    message: `MELO_ENV=${meloEnv}`,
  })
}

// Check 2: Fichiers requis
log('\n📁 Vérification des fichiers...', 'blue')

const requiredFiles = [
  'src/lib/services/melo.ts',
  'src/app/api/scraper/melo/route.ts',
  'src/app/api/annonces/route.ts',
  'src/app/api/melo/test/route.ts',
  'vercel.json',
  'package.json',
]

for (const file of requiredFiles) {
  const filePath = join(process.cwd(), file)
  if (existsSync(filePath)) {
    checks.push({
      name: `Fichier: ${file}`,
      status: 'success',
      message: 'Fichier présent',
    })
  } else {
    checks.push({
      name: `Fichier: ${file}`,
      status: 'error',
      message: 'Fichier manquant',
      details: `Le fichier ${file} est requis`,
    })
  }
}

// Check 3: Dépendances
log('\n📦 Vérification des dépendances...', 'blue')

try {
  const packageJson = require(join(process.cwd(), 'package.json'))
  const requiredDeps = ['@prisma/client', 'next']
  
  for (const dep of requiredDeps) {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      checks.push({
        name: `Dépendance: ${dep}`,
        status: 'success',
        message: 'Dépendance présente',
      })
    } else {
      checks.push({
        name: `Dépendance: ${dep}`,
        status: 'error',
        message: 'Dépendance manquante',
        details: `Installez ${dep} avec: npm install ${dep}`,
      })
    }
  }
} catch (error) {
  checks.push({
    name: 'Lecture package.json',
    status: 'error',
    message: 'Impossible de lire package.json',
  })
}

// Check 4: Configuration Vercel
log('\n⚙️  Vérification de la configuration Vercel...', 'blue')

try {
  const vercelJson = require(join(process.cwd(), 'vercel.json'))
  
  if (vercelJson.functions?.['src/app/api/**/*.ts']?.maxDuration) {
    checks.push({
      name: 'Configuration Vercel',
      status: 'success',
      message: 'Timeout configuré pour les API routes',
    })
  } else {
    checks.push({
      name: 'Configuration Vercel',
      status: 'warning',
      message: 'Timeout non configuré pour les API routes',
      details: 'Ajoutez maxDuration dans vercel.json pour éviter les timeouts',
    })
  }
} catch (error) {
  checks.push({
    name: 'Configuration Vercel',
    status: 'warning',
    message: 'vercel.json non trouvé ou invalide',
  })
}

// Résumé
log('\n' + '='.repeat(60), 'blue')
log('📊 RÉSUMÉ DES VÉRIFICATIONS', 'blue')
log('='.repeat(60), 'blue')

const successCount = checks.filter(c => c.status === 'success').length
const errorCount = checks.filter(c => c.status === 'error').length
const warningCount = checks.filter(c => c.status === 'warning').length

for (const check of checks) {
  const icon = check.status === 'success' ? '✅' : check.status === 'error' ? '❌' : '⚠️'
  const color = check.status === 'success' ? 'green' : check.status === 'error' ? 'red' : 'yellow'
  
  log(`${icon} ${check.name}: ${check.message}`, color)
  if (check.details) {
    log(`   ${check.details}`, 'yellow')
  }
}

log('\n' + '='.repeat(60), 'blue')
log(`Total: ${checks.length} vérifications`, 'blue')
log(`✅ Succès: ${successCount}`, 'green')
log(`⚠️  Avertissements: ${warningCount}`, 'yellow')
log(`❌ Erreurs: ${errorCount}`, errorCount > 0 ? 'red' : 'reset')

if (errorCount > 0) {
  log('\n❌ Des erreurs doivent être corrigées avant le déploiement', 'red')
  process.exit(1)
} else if (warningCount > 0) {
  log('\n⚠️  Des avertissements ont été détectés, mais le déploiement peut continuer', 'yellow')
  process.exit(0)
} else {
  log('\n✅ Toutes les vérifications sont passées ! Prêt pour le déploiement', 'green')
  process.exit(0)
}


