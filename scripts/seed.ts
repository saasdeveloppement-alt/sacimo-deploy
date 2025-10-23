import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const mockListings = [
  {
    source: 'LEBONCOIN' as const,
    isPrivateSeller: true,
    title: 'Appartement 3 pièces',
    price: 450000,
    type: 'APARTMENT' as const,
    surface: 75,
    rooms: 3,
    photos: ['/placeholder1.jpg'],
    city: 'Paris',
    postalCode: '75015',
    geo: { lat: 48.8566, lng: 2.3522 },
    publishedAt: new Date('2024-01-15T10:30:00Z'),
    url: 'https://leboncoin.fr/ventes_immobilieres/1234567890',
    description: 'Bel appartement 3 pièces dans le 15e arrondissement...'
  },
  {
    source: 'SELOGER' as const,
    isPrivateSeller: false,
    title: 'Maison 4 pièces avec jardin',
    price: 680000,
    type: 'HOUSE' as const,
    surface: 120,
    rooms: 4,
    photos: ['/placeholder2.jpg'],
    city: 'Boulogne-Billancourt',
    postalCode: '92100',
    geo: { lat: 48.8356, lng: 2.2413 },
    publishedAt: new Date('2024-01-15T09:15:00Z'),
    url: 'https://seloger.com/annonces/achat/maison/1234567890',
    description: 'Maison familiale avec jardin privé...'
  },
  {
    source: 'PAP' as const,
    isPrivateSeller: true,
    title: 'Studio meublé',
    price: 280000,
    type: 'STUDIO' as const,
    surface: 25,
    rooms: 1,
    photos: ['/placeholder3.jpg'],
    city: 'Paris',
    postalCode: '75011',
    geo: { lat: 48.8566, lng: 2.3522 },
    publishedAt: new Date('2024-01-15T08:45:00Z'),
    url: 'https://pap.fr/annonces/studio-meuble-paris-11e-1234567890',
    description: 'Studio entièrement meublé...'
  },
  {
    source: 'ORPI' as const,
    isPrivateSeller: false,
    title: 'Loft 2 pièces',
    price: 520000,
    type: 'LOFT' as const,
    surface: 65,
    rooms: 2,
    photos: ['/placeholder4.jpg'],
    city: 'Paris',
    postalCode: '75020',
    geo: { lat: 48.8566, lng: 2.3522 },
    publishedAt: new Date('2024-01-15T07:20:00Z'),
    url: 'https://orpi.com/annonces/loft-paris-20e-1234567890',
    description: 'Loft moderne dans ancien atelier...'
  },
  {
    source: 'CENTURY21' as const,
    isPrivateSeller: true,
    title: 'Appartement 5 pièces',
    price: 890000,
    type: 'APARTMENT' as const,
    surface: 140,
    rooms: 5,
    photos: ['/placeholder5.jpg'],
    city: 'Paris',
    postalCode: '75012',
    geo: { lat: 48.8566, lng: 2.3522 },
    publishedAt: new Date('2024-01-15T06:30:00Z'),
    url: 'https://century21.fr/annonces/appartement-paris-12e-1234567890',
    description: 'Grand appartement familial...'
  }
]

const mockCompetitors = [
  {
    name: 'Century21 Paris 15e',
    zone: 'Paris 15e',
    lastSeenAt: new Date('2024-01-15T14:30:00Z')
  },
  {
    name: 'Orpi Boulogne',
    zone: 'Boulogne-Billancourt',
    lastSeenAt: new Date('2024-01-15T12:15:00Z')
  },
  {
    name: 'Guy Hoquet Paris 11e',
    zone: 'Paris 11e',
    lastSeenAt: new Date('2024-01-14T16:45:00Z')
  },
  {
    name: 'Immonot Paris Centre',
    zone: 'Paris 1er-4e',
    lastSeenAt: new Date('2024-01-13T09:20:00Z')
  }
]

const mockTags = [
  { name: 'À contacter', color: '#3B82F6' },
  { name: 'Prioritaire', color: '#EF4444' },
  { name: 'En cours', color: '#F59E0B' },
  { name: 'Contacté', color: '#10B981' },
  { name: 'Intéressant', color: '#8B5CF6' },
  { name: 'À revoir', color: '#F97316' }
]

async function main() {
  console.log('🌱 Début du seeding...')

  // Créer une agence de test
  const agency = await prisma.agency.upsert({
    where: { id: 'test-agency-1' },
    update: {},
    create: {
      id: 'test-agency-1',
      name: 'Agence Immobilière Test',
      billingTier: 'PRO',
      seats: 5
    }
  })

  // Créer un utilisateur de test
  const user = await prisma.user.upsert({
    where: { email: 'test@sacimo.com' },
    update: {},
    create: {
      email: 'test@sacimo.com',
      name: 'Utilisateur Test',
      role: 'OWNER',
      agencyId: agency.id
    }
  })

  // Créer des recherches de test
  const searches = await Promise.all([
    prisma.search.upsert({
      where: { id: 'search-1' },
      update: {},
      create: {
        id: 'search-1',
        agencyId: agency.id,
        name: '75_2P_<500k',
        params: {
          postalCodes: ['75001', '75002', '75003', '75004', '75005'],
          priceMax: 500000,
          roomsMin: 2,
          roomsMax: 2,
          types: ['APARTMENT']
        },
        isActive: true
      }
    }),
    prisma.search.upsert({
      where: { id: 'search-2' },
      update: {},
      create: {
        id: 'search-2',
        agencyId: agency.id,
        name: 'Maisons_92_<800k',
        params: {
          postalCodes: ['92000', '92100', '92200'],
          priceMax: 800000,
          types: ['HOUSE']
        },
        isActive: true
      }
    })
  ])

  // Créer des concurrents
  const competitors = await Promise.all(
    mockCompetitors.map((competitor, index) =>
      prisma.competitor.upsert({
        where: { id: `competitor-${index + 1}` },
        update: {},
        create: {
          id: `competitor-${index + 1}`,
          name: competitor.name,
          zone: competitor.zone,
          lastSeenAt: competitor.lastSeenAt
        }
      })
    )
  )

  // Créer des tags
  const tags = await Promise.all(
    mockTags.map((tag, index) =>
      prisma.tag.upsert({
        where: { id: `tag-${index + 1}` },
        update: {},
        create: {
          id: `tag-${index + 1}`,
          name: tag.name,
          color: tag.color
        }
      })
    )
  )

  // Créer des annonces
  const listings = await Promise.all(
    mockListings.map((listing, index) =>
      prisma.listing.upsert({
        where: { id: `listing-${index + 1}` },
        update: {},
        create: {
          id: `listing-${index + 1}`,
          ...listing,
          competitorId: index < competitors.length ? competitors[index].id : null
        }
      })
    )
  )

  // Créer des rapports de test
  const reports = await Promise.all([
    prisma.report.upsert({
      where: { id: 'report-1' },
      update: {},
      create: {
        id: 'report-1',
        agencyId: agency.id,
        date: new Date('2024-01-15'),
        listingsCount: 47,
        privateCount: 32,
        proCount: 15,
        isSent: true,
        fileUrlPdf: '/reports/report-2024-01-15.pdf',
        fileUrlCsv: '/reports/report-2024-01-15.csv'
      }
    }),
    prisma.report.upsert({
      where: { id: 'report-2' },
      update: {},
      create: {
        id: 'report-2',
        agencyId: agency.id,
        date: new Date('2024-01-14'),
        listingsCount: 38,
        privateCount: 28,
        proCount: 10,
        isSent: true,
        fileUrlPdf: '/reports/report-2024-01-14.pdf',
        fileUrlCsv: '/reports/report-2024-01-14.csv'
      }
    })
  ])

  console.log('✅ Seeding terminé !')
  console.log(`📊 Données créées:`)
  console.log(`   - 1 agence`)
  console.log(`   - 1 utilisateur`)
  console.log(`   - ${searches.length} recherches`)
  console.log(`   - ${competitors.length} concurrents`)
  console.log(`   - ${tags.length} tags`)
  console.log(`   - ${listings.length} annonces`)
  console.log(`   - ${reports.length} rapports`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



