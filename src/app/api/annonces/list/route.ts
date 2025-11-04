import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const annonces = await prisma.annonceScrape.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Limite pour éviter de tout charger
    });

    return NextResponse.json({
      success: true,
      count: annonces.length,
      annonces,
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des annonces:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la récupération des annonces',
      error: error.message,
    }, { status: 500 });
  }
}
