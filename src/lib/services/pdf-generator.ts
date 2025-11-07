import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Report } from '@/lib/data/mock-reports';

export function generateReportPDF(report: Report) {
  // Créer un nouveau document PDF
  const doc = new jsPDF();
  
  // HEADER - Logo et titre
  doc.setFontSize(24);
  doc.setTextColor(124, 58, 237); // Violet SACIMO
  doc.text('SACIMO', 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Rapport immobilier', 20, 27);
  
  // Ligne de séparation
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 32, 190, 32);
  
  // TITRE DU RAPPORT
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(report.title, 20, 45);
  
  // INFORMATIONS GÉNÉRALES
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`📍 ${report.location}`, 20, 55);
  
  const date = new Date(report.createdAt);
  doc.text(`📅 ${date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })}`, 20, 62);
  
  // MÉTRIQUES PRINCIPALES - Tableau
  autoTable(doc, {
    startY: 75,
    head: [['Métrique', 'Valeur']],
    body: [
      ['Prix Médian', `${report.medianPrice.toLocaleString('fr-FR')} €`],
      ['Nombre d\'annonces', report.listingsCount.toString()],
      ['Nouveaux clients', report.newClients.toString()],
      ['Part de marché', `${report.marketShare}%`],
    ],
    theme: 'striped',
    headStyles: { 
      fillColor: [124, 58, 237],
      textColor: 255,
      fontSize: 12,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 11,
      cellPadding: 5
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { cellWidth: 100 }
    }
  });
  
  // BADGES/STATUTS
  if (report.badges && report.badges.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Indicateurs', 20, finalY + 15);
    
    doc.setFontSize(11);
    let badgeY = finalY + 25;
    
    report.badges.forEach((badge) => {
      const badgeText = 
        badge === 'opportunity' ? '🔥 Opportunité détectée' :
        badge === 'trending' ? '📈 Tendance haussière' :
        badge === 'hot' ? '⚡ Marché actif' : badge;
      
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(20, badgeY - 5, 170, 10, 2, 2, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text(badgeText, 25, badgeY);
      badgeY += 15;
    });
  }
  
  // FOOTER - Informations légales
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('SACIMO - Rapport généré automatiquement', 20, pageHeight - 20);
  doc.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 20, pageHeight - 15);
  doc.text('Ce document est confidentiel', 20, pageHeight - 10);
  
  // TÉLÉCHARGER LE PDF
  const fileName = `rapport-${report.location.toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  return fileName;
}

