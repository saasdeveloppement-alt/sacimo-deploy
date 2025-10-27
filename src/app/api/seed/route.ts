import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('Début du seed de données...');
    
    // Créer une agence de test
    const agency = await prisma.agency.create({
      data: {
        name: 'Agence Test SACIMO',
        email: 'test@sacimo.com',
        phone: '+33123456789',
        address: '123 Rue de Test, 75001 Paris',
        siret: '12345678901234',
        isActive: true,
      },
    });
    
    // Créer un utilisateur de test
    const user = await prisma.user.create({
      data: {
        email: 'test@sacimo.com',
        name: 'Utilisateur Test',
        role: 'OWNER',
        agencyId: agency.id,
        emailVerified: new Date(),
      },
    });
    
    // Créer quelques recherches de test
    await prisma.search.createMany({
      data: [
        {
          name: 'Appartement Paris 15ème',
          location: 'Paris 15ème',
          minPrice: 300000,
          maxPrice: 500000,
          minSurface: 30,
          maxSurface: 60,
          propertyType: 'APARTMENT',
          userId: user.id,
          isActive: true,
        },
        {
          name: 'Maison proche métro',
          location: 'Région parisienne',
          minPrice: 400000,
          maxPrice: 700000,
          minSurface: 80,
          maxSurface: 120,
          propertyType: 'HOUSE',
          userId: user.id,
          isActive: true,
        },
      ],
    });
    
    console.log('Seed terminé avec succès');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Données de test créées avec succès !', 
      agency: agency.name,
      user: user.name,
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    console.error('Erreur lors du seed:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur lors du seed', 
      error: error.message,
      timestamp: new Date().toISOString() 
    }, { status: 500 });
  }
}




