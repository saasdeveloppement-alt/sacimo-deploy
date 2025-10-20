#!/usr/bin/env node

// Génère un secret sécurisé pour NextAuth
const crypto = require('crypto')

function generateSecret() {
  return crypto.randomBytes(32).toString('hex')
}

const secret = generateSecret()
console.log('🔐 NextAuth Secret généré :')
console.log(secret)
console.log('\n📋 Copiez cette valeur dans vos variables d\'environnement Vercel :')
console.log(`NEXTAUTH_SECRET=${secret}`)

