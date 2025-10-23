'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TestResult {
  success: boolean;
  totalAnnonces: number;
  testParams: any;
  annonces: any[];
  summary: {
    averagePrice: number;
    averageSurface: number;
    citiesFound: string[];
    totalWithImages: number;
  };
}

export default function TestIndividualAdsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Paramètres de test
  const [ville, setVille] = useState('Paris');
  const [minPrix, setMinPrix] = useState('200000');
  const [maxPrix, setMaxPrix] = useState('500000');
  const [minSurface, setMinSurface] = useState('20');
  const [maxSurface, setMaxSurface] = useState('60');
  const [typeBien, setTypeBien] = useState('appartement');
  const [pages, setPages] = useState('1');

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-individual-ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ville,
          minPrix: minPrix ? Number(minPrix) : undefined,
          maxPrix: maxPrix ? Number(maxPrix) : undefined,
          minSurface: minSurface ? Number(minSurface) : undefined,
          maxSurface: maxSurface ? Number(maxSurface) : undefined,
          typeBien,
          pages: Number(pages)
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Erreur inconnue');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const runQuickTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-individual-ads');
      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Erreur inconnue');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Test Annonces Individuelles</h1>
        <p className="text-gray-600">Test du scraper ZenRows pour récupérer les annonces LeBonCoin</p>
      </div>

      {/* Test rapide */}
      <Card>
        <CardHeader>
          <CardTitle>Test Rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Test avec les paramètres par défaut (Paris, appartement, 200k-500k€, 20-60m²)
          </p>
          <Button 
            onClick={runQuickTest} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Test en cours...' : 'Lancer le test rapide'}
          </Button>
        </CardContent>
      </Card>

      {/* Test personnalisé */}
      <Card>
        <CardHeader>
          <CardTitle>Test Personnalisé</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ville">Ville</Label>
              <Input
                id="ville"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                placeholder="Paris"
              />
            </div>
            <div>
              <Label htmlFor="typeBien">Type de bien</Label>
              <Select value={typeBien} onValueChange={setTypeBien}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appartement">Appartement</SelectItem>
                  <SelectItem value="maison">Maison</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="loft">Loft</SelectItem>
                  <SelectItem value="penthouse">Penthouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="minPrix">Prix minimum (€)</Label>
              <Input
                id="minPrix"
                type="number"
                value={minPrix}
                onChange={(e) => setMinPrix(e.target.value)}
                placeholder="200000"
              />
            </div>
            <div>
              <Label htmlFor="maxPrix">Prix maximum (€)</Label>
              <Input
                id="maxPrix"
                type="number"
                value={maxPrix}
                onChange={(e) => setMaxPrix(e.target.value)}
                placeholder="500000"
              />
            </div>
            <div>
              <Label htmlFor="minSurface">Surface minimum (m²)</Label>
              <Input
                id="minSurface"
                type="number"
                value={minSurface}
                onChange={(e) => setMinSurface(e.target.value)}
                placeholder="20"
              />
            </div>
            <div>
              <Label htmlFor="maxSurface">Surface maximum (m²)</Label>
              <Input
                id="maxSurface"
                type="number"
                value={maxSurface}
                onChange={(e) => setMaxSurface(e.target.value)}
                placeholder="60"
              />
            </div>
            <div>
              <Label htmlFor="pages">Nombre de pages</Label>
              <Input
                id="pages"
                type="number"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="1"
                min="1"
                max="5"
              />
            </div>
          </div>
          <Button 
            onClick={runTest} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Test en cours...' : 'Lancer le test personnalisé'}
          </Button>
        </CardContent>
      </Card>

      {/* Résultats */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-800">
              ✅ Test réussi - {result.totalAnnonces} annonces trouvées
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Résumé */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{result.totalAnnonces}</div>
                <div className="text-sm text-gray-600">Annonces</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{result.summary.averagePrice.toLocaleString()}€</div>
                <div className="text-sm text-gray-600">Prix moyen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{result.summary.averageSurface}m²</div>
                <div className="text-sm text-gray-600">Surface moyenne</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{result.summary.totalWithImages}</div>
                <div className="text-sm text-gray-600">Avec images</div>
              </div>
            </div>

            {/* Villes trouvées */}
            <div>
              <h3 className="font-semibold mb-2">Villes trouvées:</h3>
              <div className="flex flex-wrap gap-2">
                {result.summary.citiesFound.map((city, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {city}
                  </span>
                ))}
              </div>
            </div>

            {/* Liste des annonces */}
            <div>
              <h3 className="font-semibold mb-2">Annonces trouvées:</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {result.annonces.map((annonce, index) => (
                  <div key={index} className="border rounded p-3 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{annonce.title}</h4>
                        <div className="text-xs text-gray-600 mt-1">
                          <span className="font-semibold text-green-600">{annonce.price.toLocaleString()}€</span>
                          {annonce.surface && <span> • {annonce.surface}m²</span>}
                          {annonce.rooms && <span> • {annonce.rooms} pièces</span>}
                          {annonce.city && <span> • {annonce.city}</span>}
                          {annonce.imageCount > 0 && <span> • 📷 {annonce.imageCount} images</span>}
                        </div>
                      </div>
                      <a 
                        href={annonce.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        Voir
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
