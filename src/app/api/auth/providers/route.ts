import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      providers: authOptions.providers.map(provider => ({
        id: provider.id,
        name: provider.name,
        type: provider.type,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des providers:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString() 
    }, { status: 500 });
  }
}


