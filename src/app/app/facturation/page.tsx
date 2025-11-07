'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  mockPlans, 
  mockInvoices, 
  mockPaymentMethods, 
  mockUsage,
  type Plan 
} from '@/lib/data/mock-billing';
import { Download, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';

export default function FacturationPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const currentPlan = mockPlans.find(p => p.current);

  const handleUpgrade = (plan: Plan) => {
    setSelectedPlan(plan);
    toast.success('Changement de plan', {
      description: `Passage au plan ${plan.name} en cours...`
    });
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success('Facture téléchargée', {
      description: `Facture ${invoiceId} téléchargée au format PDF`
    });
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">💳 Facturation & Abonnement</h1>
        <p className="text-muted-foreground">
          Gérez votre abonnement, consultez vos factures et votre consommation
        </p>
      </div>

      <Tabs defaultValue="abonnement" className="space-y-6">
        <TabsList>
          <TabsTrigger value="abonnement">📊 Abonnement</TabsTrigger>
          <TabsTrigger value="factures">📄 Factures</TabsTrigger>
          <TabsTrigger value="paiement">💳 Paiement</TabsTrigger>
          <TabsTrigger value="usage">📈 Consommation</TabsTrigger>
        </TabsList>

        {/* TAB 1 : ABONNEMENT */}
        <TabsContent value="abonnement" className="space-y-6">
          {/* Plan actuel */}
          <Card>
            <CardHeader>
              <CardTitle>Votre abonnement actuel</CardTitle>
              <CardDescription>
                Vous êtes actuellement sur le plan {currentPlan?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{currentPlan?.name}</h3>
                  <p className="text-3xl font-bold text-primary">
                    {currentPlan?.price}€
                    <span className="text-sm text-muted-foreground">/mois</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Renouvellement le 1er décembre 2025
                  </p>
                </div>
                <Button variant="outline">Annuler l'abonnement</Button>
              </div>
            </CardContent>
          </Card>

          {/* Grille des plans */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Tous les plans</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockPlans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`relative ${plan.current ? 'border-primary border-2' : ''} ${plan.popular ? 'shadow-lg' : ''}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      Populaire
                    </Badge>
                  )}
                  {plan.current && (
                    <Badge className="absolute -top-3 right-4" variant="secondary">
                      Plan actuel
                    </Badge>
                  )}
                  
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="text-3xl font-bold">
                      {plan.price}€
                      <span className="text-sm text-muted-foreground">/mois</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {!plan.current && (
                      <Button 
                        className="w-full"
                        onClick={() => handleUpgrade(plan)}
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        {plan.price > (currentPlan?.price || 0) ? 'Passer à ce plan' : 'Rétrograder'}
                      </Button>
                    )}
                    
                    {plan.current && (
                      <Button className="w-full" disabled>
                        Plan actuel
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* TAB 2 : FACTURES */}
        <TabsContent value="factures">
          <Card>
            <CardHeader>
              <CardTitle>Historique de facturation</CardTitle>
              <CardDescription>
                Téléchargez vos factures au format PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold">{invoice.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(invoice.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          invoice.status === 'paid' ? 'default' :
                          invoice.status === 'pending' ? 'secondary' :
                          'destructive'
                        }
                      >
                        {invoice.status === 'paid' ? 'Payé' :
                         invoice.status === 'pending' ? 'En attente' :
                         'Échoué'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-bold">{invoice.amount}€</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3 : MOYENS DE PAIEMENT */}
        <TabsContent value="paiement">
          <Card>
            <CardHeader>
              <CardTitle>Moyens de paiement</CardTitle>
              <CardDescription>
                Gérez vos cartes bancaires et moyens de paiement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockPaymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <CreditCard className="h-8 w-8" />
                    <div>
                      <p className="font-semibold">
                        {method.brand} •••• {method.last4}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expire le {method.expiryMonth}/{method.expiryYear}
                      </p>
                    </div>
                    {method.isDefault && (
                      <Badge>Par défaut</Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm">
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button className="w-full" variant="outline">
                ➕ Ajouter une carte
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4 : CONSOMMATION */}
        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Votre consommation</CardTitle>
              <CardDescription>
                Suivez votre utilisation mensuelle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(mockUsage).map(([key, data]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold capitalize">
                      {key === 'searches' ? 'Recherches' :
                       key === 'reports' ? 'Rapports' :
                       key === 'alerts' ? 'Alertes' :
                       'Appels API'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {data.used.toLocaleString('fr-FR')}
                      {data.limit > 0 ? ` / ${data.limit.toLocaleString('fr-FR')}` : ' / Illimité'}
                    </p>
                  </div>
                  <Progress value={data.percentage} />
                  {data.percentage > 80 && data.limit > 0 && (
                    <p className="text-sm text-orange-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Vous approchez de la limite
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

