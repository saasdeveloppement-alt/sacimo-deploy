'use client';

import { useState } from 'react';
import { MetricCard } from '@/components/rapports/MetricCard';
import { PriceChart } from '@/components/rapports/PriceChart';
import { mockMetrics, mockPriceEvolution, mockReports, type Report } from '@/lib/data/mock-reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { generateReportPDF } from '@/lib/services/pdf-generator';

export default function RapportsPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  const handleAnalyzeReport = (report: Report) => {
    toast.info('Analyse en cours de développement', {
      description: `Analyse détaillée du rapport "${report.title}" bientôt disponible.`
    });
  };

  const handleDownloadReport = (report: Report) => {
    try {
      const fileName = generateReportPDF(report);
      
      toast.success('Rapport PDF téléchargé', {
        description: `Le rapport "${report.title}" a été téléchargé : ${fileName}`
      });
    } catch (error) {
      toast.error('Erreur lors du téléchargement', {
        description: 'Impossible de générer le PDF. Veuillez réessayer.'
      });
    }
  };

  const handleCreateReport = () => {
    toast.success('Rapport en cours de génération', {
      description: 'Votre nouveau rapport sera disponible dans quelques instants.'
    });
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">📊 Rapports</h1>
        <p className="text-muted-foreground">
          Analysez vos performances et générez des rapports détaillés
        </p>
      </div>

      {/* 4 Cartes Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon="📈"
          title="Nouvelles Annonces"
          value={mockMetrics.newListings.value.toString()}
          subtitle={mockMetrics.newListings.subtitle}
          trend={mockMetrics.newListings.trend}
          trendDirection={mockMetrics.newListings.trendDirection}
        />
        
        <MetricCard
          icon="💰"
          title="Prix Médian"
          value={mockMetrics.medianPrice.value}
          subtitle={mockMetrics.medianPrice.subtitle}
          trend={mockMetrics.medianPrice.trend}
          trendDirection={mockMetrics.medianPrice.trendDirection}
        />
        
        <MetricCard
          icon="⚡"
          title="Bonnes Affaires"
          value={mockMetrics.opportunities.value.toString()}
          subtitle={mockMetrics.opportunities.subtitle}
          badge={mockMetrics.opportunities.badge}
        />
        
        <MetricCard
          icon="🔔"
          title="Alertes"
          value={mockMetrics.alerts.value.toString()}
          subtitle={mockMetrics.alerts.subtitle}
        />
      </div>

      {/* Graphique Évolution Prix */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>📈 Évolution Prix Moyen (30 derniers jours)</CardTitle>
        </CardHeader>
        <CardContent>
          <PriceChart data={mockPriceEvolution} />
        </CardContent>
      </Card>

      {/* Tableau des Rapports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>📋 Vos rapports générés</CardTitle>
            
            {/* Dialog Créer Rapport */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>➕ Nouveau rapport</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau rapport</DialogTitle>
                  <DialogDescription>
                    Configurez les paramètres de votre rapport
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ville</label>
                    <select className="w-full p-2 border rounded">
                      <option>Paris</option>
                      <option>Lyon</option>
                      <option>Marseille</option>
                      <option>Bordeaux</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Période</label>
                    <select className="w-full p-2 border rounded">
                      <option>7 derniers jours</option>
                      <option>30 derniers jours</option>
                      <option>90 derniers jours</option>
                    </select>
                  </div>
                  <Button onClick={handleCreateReport} className="w-full">
                    Générer le rapport
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{report.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    📍 {report.location}
                  </p>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div>💰 {report.medianPrice.toLocaleString('fr-FR')}€</div>
                  <div>📊 {report.listingsCount} annonces</div>
                  <div>👥 {report.newClients} clients</div>
                  <div>📈 {report.marketShare}% marché</div>
                </div>

                {report.badges && report.badges.length > 0 && (
                  <div className="flex gap-2">
                    {report.badges.includes('opportunity') && (
                      <Badge variant="default">🔥 Opportunité</Badge>
                    )}
                    {report.badges.includes('trending') && (
                      <Badge variant="secondary">📈 Tendance</Badge>
                    )}
                    {report.badges.includes('hot') && (
                      <Badge variant="destructive">⚡ Hot</Badge>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewReport(report)}
                  >
                    👁️ Voir
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAnalyzeReport(report)}
                  >
                    📊 Analyser
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadReport(report)}
                  >
                    📥 Télécharger
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog Voir Rapport */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>
              📍 {selectedReport?.location}
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Prix médian</p>
                  <p className="text-2xl font-bold">
                    {selectedReport.medianPrice.toLocaleString('fr-FR')}€
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Annonces</p>
                  <p className="text-2xl font-bold">{selectedReport.listingsCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nouveaux clients</p>
                  <p className="text-2xl font-bold">{selectedReport.newClients}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Part de marché</p>
                  <p className="text-2xl font-bold">{selectedReport.marketShare}%</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Évolution des prix</h3>
                <PriceChart data={mockPriceEvolution} height={200} />
              </div>
              
              {selectedReport.badges && selectedReport.badges.length > 0 && (
                <div className="flex gap-2">
                  {selectedReport.badges.map(badge => (
                    <Badge key={badge}>{badge}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
