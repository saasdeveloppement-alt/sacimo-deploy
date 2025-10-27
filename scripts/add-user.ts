import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addUser() {
  try {
    console.log('👤 Adding new user...')
    
    // Remplacer par votre vraie adresse email
    const userEmail = 'votre-email@exemple.com' // ← Changez ceci
    const userName = 'Votre Nom' // ← Changez ceci
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail }
    })
    
    if (existingUser) {
      console.log(`✅ User ${userEmail} already exists`)
      return
    }
    
    // Trouver l'agence demo
    const agency = await prisma.agency.findFirst({
      where: { name: 'Agence Immobilière Demo' }
    })
    
    if (!agency) {
      console.error('❌ Demo agency not found')
      return
    }
    
    // Créer le nouvel utilisateur
    const newUser = await prisma.user.create({
      data: {
        email: userEmail,
        name: userName,
        role: 'OWNER',
        agencyId: agency.id
      }
    })
    
    console.log(`✅ User created successfully: ${newUser.email}`)
    console.log(`📧 You can now login with: ${userEmail}`)
    
  } catch (error) {
    console.error('❌ Error creating user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addUser()





