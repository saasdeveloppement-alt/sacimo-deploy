"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Search } from "lucide-react"

export default function TestScrapingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [connectorHealth, setConnectorHealth] = useState<Record<string, boolean>>({})

  const checkConnectors = async () => {
    try {
      const response = await fetch('/api/scrape')
      const data = await response.json()
      
      if (data.success) {
        setConnectorHealth(data.data.connectors)
      }
    } catch (error) {
      console.error('Erreur vérification connecteurs:', error)
    }
  }

  const runScraping = async () => {
    setIsLoading(true)
    setResults(null)
    
    try {
      // Utiliser la recherche de test (ID de la recherche créée dans la base)
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchId: 's1' }) // ID de la recherche de test
      })
      
      const data = await response.json()
      setResults(data)
      
    } catch (error) {
      console.error('Erreur scraping:', error)
      setResults({
        success: false,
        message: 'Erreur lors du scraping',
        error: error
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test du Système de Scraping</h1>
          <p className="text-gray-600">Testez le scraping LeBonCoin et autres sources</p>
        </div>

        {/* État des connecteurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              État des Connecteurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Button onClick={checkConnectors} variant="outline">
                Vérifier les connecteurs
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(connectorHealth).map(([name, isHealthy]) => (
                <div key={name} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{name}</span>
                  <Badge variant={isHealthy ? "default" : "destructive"}>
                    {isHealthy ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        En ligne
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Hors ligne
                      </>
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test de scraping */}
        <Card>
          <CardHeader>
            <CardTitle>Test de Scraping</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={runScraping} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scraping en cours...
                  </>
                ) : (
                  'Lancer le scraping'
                )}
              </Button>

              {results && (
                <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-semibold mb-2">Résultats du scraping :</h3>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}





