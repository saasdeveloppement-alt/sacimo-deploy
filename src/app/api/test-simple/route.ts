import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test simple de connexion PostgreSQL sans Prisma
    const { Client } = require('pg');
    
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    
    await client.connect();
    const result = await client.query('SELECT 1 as test');
    await client.end();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Connexion PostgreSQL directe réussie !', 
      test: result.rows[0],
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    console.error('Erreur de connexion PostgreSQL:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur de connexion PostgreSQL', 
      error: error.message,
      timestamp: new Date().toISOString() 
    }, { status: 500 });
  }
}
