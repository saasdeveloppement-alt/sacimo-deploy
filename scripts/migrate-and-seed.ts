import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateAndSeed() {
  try {
    console.log('🔄 Starting migration and seed process...')
    
    // Test de connexion
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Vérifier si les tables existent déjà
    const userCount = await prisma.user.count()
    console.log(`📊 Found ${userCount} existing users`)
    
    if (userCount === 0) {
      console.log('🌱 No data found, seeding database...')
      
      // Créer une agence de test
      const agency = await prisma.agency.create({
        data: {
          name: 'Agence Immobilière Demo',
          billingTier: 'PRO',
          seats: 5
        }
      })
      console.log(`✅ Created agency: ${agency.name}`)
      
      // Créer un utilisateur admin
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@sacimo.com',
          name: 'Administrateur SACIMO',
          role: 'OWNER',
          agencyId: agency.id
        }
      })
      console.log(`✅ Created admin user: ${adminUser.email}`)
      
      // Créer des recherches de test
      const search1 = await prisma.search.create({
        data: {
          agencyId: agency.id,
          name: 'Paris_2P_<500k',
          params: {
            postalCodes: ['75001', '75002', '75003', '75004', '75005'],
            priceMax: 500000,
            roomsMin: 2,
            roomsMax: 2,
            types: ['APARTMENT']
          },
          isActive: true
        }
      })
      console.log(`✅ Created search: ${search1.name}`)
      
      // Créer des tags
      const tags = await Promise.all([
        prisma.tag.create({ data: { name: 'À contacter', color: '#3B82F6' } }),
        prisma.tag.create({ data: { name: 'Prioritaire', color: '#EF4444' } }),
        prisma.tag.create({ data: { name: 'En cours', color: '#F59E0B' } }),
        prisma.tag.create({ data: { name: 'Contacté', color: '#10B981' } })
      ])
      console.log(`✅ Created ${tags.length} tags`)
      
      console.log('🎉 Database seeded successfully!')
    } else {
      console.log('✅ Database already has data, skipping seed')
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateAndSeed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })





