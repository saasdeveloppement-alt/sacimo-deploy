import { MetricCard } from '@/components/rapports/MetricCard';
import { PriceChart } from '@/components/rapports/PriceChart';
import { mockMetrics, mockPriceEvolution, mockReports } from '@/lib/data/mock-reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function RapportsPage() {
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
            <Button>
              ➕ Nouveau rapport
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                {/* Titre et localisation */}
                <div className="flex-1">
                  <h3 className="font-semibold">{report.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    📍 {report.location}
                  </p>
                </div>

                {/* Métriques */}
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    💰 {report.medianPrice.toLocaleString('fr-FR')}€
                  </div>
                  <div>
                    📊 {report.listingsCount} annonces
                  </div>
                  <div>
                    👥 {report.newClients} clients
                  </div>
                  <div>
                    📈 {report.marketShare}% marché
                  </div>
                </div>

                {/* Badges */}
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

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    👁️ Voir
                  </Button>
                  <Button variant="outline" size="sm">
                    📊 Analyser
                  </Button>
                  <Button variant="outline" size="sm">
                    📥 Télécharger
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
