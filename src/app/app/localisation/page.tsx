'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import LocalisationForm from '@/components/localisation/LocalisationForm';
import HistoryPanel, { saveToHistory } from '@/components/localisation/HistoryPanel';
import MapResults from '@/components/localisation/MapResults';
import HypothesesList from '@/components/localisation/HypothesesList';
import ComparativeImages from '@/components/localisation/ComparativeImages';
import LoadingAnalysis from '@/components/localisation/LoadingAnalysis';
import EmptyState from '@/components/localisation/EmptyState';
import type { LocalisationInput, LocalisationHints, LocalisationResult, LocalisationHypothese } from '@/types/localisation';

type AnalysisState = 'empty' | 'input' | 'loading' | 'results' | 'error';

export default function LocalisationPage() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>('empty');
  const [currentInput, setCurrentInput] = useState<LocalisationInput | null>(null);
  const [currentHints, setCurrentHints] = useState<LocalisationHints>({});
  const [results, setResults] = useState<LocalisationResult | null>(null);
  const [selectedHypothesis, setSelectedHypothesis] = useState<LocalisationHypothese | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  

  const handleLaunchAnalysis = async () => {
    if (!currentInput) {
      toast.error('Veuillez fournir au moins une source (image, URL ou texte)');
      return;
    }

    setAnalysisState('loading');
    setRequestId(null);

    try {
      // Préparer les données pour l'API
      const payload: any = {
        multiCandidates: true,
      };

      if (currentInput.method === 'image' && currentInput.imageFile) {
        // Convertir l'image en base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          payload.images = [base64];
          await sendRequest(payload);
        };
        reader.readAsDataURL(currentInput.imageFile);
      } else if (currentInput.method === 'url' && currentInput.url) {
        payload.url = currentInput.url;
        await sendRequest(payload);
      } else if (currentInput.method === 'text' && currentInput.description) {
        payload.text = currentInput.description;
        await sendRequest(payload);
      }
    } catch (error: any) {
      console.error('Error launching analysis:', error);
      toast.error(error.message || 'Erreur lors du lancement de l\'analyse');
      setAnalysisState('error');
    }
  };

  const sendRequest = async (payload: any) => {
    // Ajouter les hints
    if (currentHints.codePostal) payload.hintPostalCode = currentHints.codePostal;
    if (currentHints.ville) payload.hintCity = currentHints.ville;
    if (Object.keys(currentHints).length > 0) {
      payload.userHints = currentHints;
    }

    const response = await fetch('/api/localisation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Erreur lors de la création de la requête');
    }

    setRequestId(data.requestId);

    // Polling pour récupérer les résultats
    pollResults(data.requestId);
  };

  const pollResults = async (reqId: string, attempts = 0) => {
    const maxAttempts = 30; // 30 tentatives = ~30 secondes max
    const delay = 1000; // 1 seconde entre chaque tentative

    if (attempts >= maxAttempts) {
      toast.error('Timeout: L\'analyse prend trop de temps');
      setAnalysisState('error');
      return;
    }

    try {
      const response = await fetch(`/api/localisation?requestId=${reqId}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération des résultats');
      }

      // Si la requête est toujours en cours
      if (data.request.status === 'PENDING' || data.request.status === 'RUNNING') {
        setTimeout(() => pollResults(reqId, attempts + 1), delay);
        return;
      }

      // Si terminée
      if (data.request.status === 'DONE' && data.candidates && data.candidates.length > 0) {
        const hypotheses: LocalisationHypothese[] = data.candidates.map((c: any) => ({
          id: c.id,
          adresse: c.address,
          codePostal: c.postalCode || '',
          ville: c.city || '',
          coordonnees: { lat: c.latitude, lng: c.longitude },
          scoreConfiance: c.confidence || 0,
          distanceHints: 0, // TODO: Calculer depuis les hints
          scoreImage: c.scoreImage,
          scorePiscine: c.scorePiscine,
          scoreToiture: c.scoreToiture,
          scoreTerrain: c.scoreTerrain,
          scoreHints: c.scoreHints,
          satelliteImageUrl: c.satelliteImageUrl,
          streetViewUrl: c.streetViewUrl,
        }));

        const result: LocalisationResult = {
          id: reqId,
          timestamp: new Date(),
          input: currentInput!,
          hypotheses,
          precisionMoyenne: hypotheses.reduce((sum, h) => sum + h.scoreConfiance, 0) / hypotheses.length,
          tempsAnalyse: attempts * delay,
        };

        setResults(result);
        setAnalysisState('results');
        saveToHistory(result);
        toast.success(`🎯 Localisation réussie ! ${hypotheses.length} hypothèse${hypotheses.length > 1 ? 's' : ''} trouvée${hypotheses.length > 1 ? 's' : ''}`);
      } else {
        throw new Error('Aucun résultat trouvé');
      }
    } catch (error: any) {
      console.error('Error polling results:', error);
      if (attempts < maxAttempts) {
        setTimeout(() => pollResults(reqId, attempts + 1), delay);
      } else {
        toast.error('Erreur lors de la récupération des résultats');
        setAnalysisState('error');
      }
    }
  };

  const canLaunch = currentInput !== null;

  return (
    <div className="space-y-6">
      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Formulaire complet */}
        <div className="lg:col-span-2 space-y-6">
          {/* Formulaire unifié */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-lg">
            <LocalisationForm
              onInputChange={setCurrentInput}
              onHintsChange={setCurrentHints}
            />
          </div>
                  
          {/* Bouton Lancer */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleLaunchAnalysis}
              disabled={!canLaunch || analysisState === 'loading'}
              className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analysisState === 'loading' ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block mr-2"
                  >
                    <Rocket className="w-5 h-5" />
                  </motion.div>
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5 mr-2" />
                  Lancer la localisation IA
                </>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Colonne droite - Historique */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card Historique */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
            <HistoryPanel />
          </div>
        </div>
      </div>

      {/* Zone de résultats (pleine largeur) */}
      <div className="space-y-6">
        {analysisState === 'empty' && (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-12 shadow-lg text-center">
            <EmptyState />
          </div>
        )}

        {analysisState === 'loading' && (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-12 shadow-lg">
            <LoadingAnalysis />
          </div>
        )}

        {analysisState === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-12 shadow-lg text-center"
          >
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Erreur d'analyse</h3>
            <p className="text-gray-600 mb-6">
              Une erreur s'est produite lors de l'analyse. Veuillez réessayer.
            </p>
            <Button
              onClick={() => setAnalysisState('empty')}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Réessayer
            </Button>
          </motion.div>
        )}

        {analysisState === 'results' && results && (
          <div className="space-y-6">
            <MapResults
              hypotheses={results.hypotheses}
              onHypothesisSelect={setSelectedHypothesis}
            />

            <HypothesesList
              hypotheses={results.hypotheses}
              onHypothesisSelect={setSelectedHypothesis}
              onViewDetails={(h) => {
                // TODO: Ouvrir modal avec détails
                console.log('View details:', h);
              }}
            />

            <ComparativeImages
              originalImageUrl={currentInput?.imageUrl}
              hypotheses={results.hypotheses}
            />
          </div>
        )}
      </div>
    </div>
  );
}
