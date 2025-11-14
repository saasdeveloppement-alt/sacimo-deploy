import { NextResponse } from 'next/server';

export async function POST() {
  console.log('🌱 Seed API désactivée → aucune donnée mock créée');
  
  return NextResponse.json({
    success: false,
    message: 'Seed désactivé. Branche Melo.io ou active ENABLE_SACIMO_DEMO pour autoriser le seed.',
    timestamp: new Date().toISOString()
  }, { status: 403 });
}










