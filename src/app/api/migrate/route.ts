import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    console.log('Début de la migration Prisma...');
    
    // Générer le client Prisma
    await execAsync('npx prisma generate', { cwd: process.cwd() });
    console.log('Client Prisma généré');
    
    // Pousser le schéma vers la base de données
    const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss', { cwd: process.cwd() });
    console.log('Migration Prisma terminée');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migration Prisma exécutée avec succès !', 
      stdout,
      stderr,
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    console.error('Erreur lors de la migration Prisma:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur lors de la migration Prisma', 
      error: error.message,
      timestamp: new Date().toISOString() 
    }, { status: 500 });
  }
}




