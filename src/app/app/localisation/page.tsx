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
  const [selectedZone, setSelectedZone] = useState<LocalisationInput['selectedZone']>(undefined);
  const [results, setResults] = useState<LocalisationResult | null>(null);
  const [selectedHypothesis, setSelectedHypothesis] = useState<LocalisationHypothese | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [relanceCount, setRelanceCount] = useState<number>(0);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const handleMoreCandidates = async () => {
    if (!requestId) {
      toast.error('Aucune requête en cours');
      return;
    }

    if (relanceCount >= 3) {
      toast.error('Maximum de 3 relances atteint');
      return;
    }

    setIsLoadingMore(true);

    try {
      const response = await fetch('/api/localisation/more', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Erreur lors de la génération de nouveaux candidats');
      }

      const data = await response.json();

      if (!data.success || data.candidates.length === 0) {
        toast.warning(data.message || 'Aucun nouveau candidat trouvé');
        setIsLoadingMore(false);
        return;
      }

      // Transformer les nouveaux candidats
      const newHypotheses: LocalisationHypothese[] = data.candidates.map((c: any) => {
        const coords = c.coordinates || { lat: 0, lng: 0 };
        const cadastralUrl = c.visuals?.cadastralUrl || c.visuals?.cadastreUrl || null;

        return {
          id: c.id,
          adresse: c.adresse,
          codePostal: c.codePostal,
          ville: c.ville,
          coordonnees: coords,
          scoreConfiance: c.matchingScore.global,
          distanceHints: 0,
          scoreImage: c.matchingScore.details.architectureMatch,
          scorePiscine: c.matchingScore.details.piscineSimilarity,
          scoreToiture: c.matchingScore.details.orientationMatch,
          scoreTerrain: c.matchingScore.details.surfaceMatch,
          scoreHints: c.matchingScore.details.contextMatch,
          satelliteImageUrl: c.visuals?.satelliteUrl,
          cadastralUrl: cadastralUrl,
          streetViewUrl: c.visuals?.streetViewUrl,
        };
      });

      // Ajouter aux résultats existants
      if (results) {
        const updatedResult: LocalisationResult = {
          ...results,
          hypotheses: [...results.hypotheses, ...newHypotheses],
        };
        setResults(updatedResult);
        setRelanceCount(relanceCount + 1);
        toast.success(`✨ ${newHypotheses.length} nouvelle(s) hypothèse(s) trouvée(s) ! (Relance ${relanceCount + 1}/3)`);
      }
    } catch (error: any) {
      console.error('💥 Error loading more candidates:', error);
      toast.error(error.message || 'Erreur lors de la génération de nouveaux candidats');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLaunchAnalysis = async () => {
    console.log('[DEBUG] handleLaunchAnalysis - currentInput:', currentInput);
    console.log('[DEBUG] handleLaunchAnalysis - selectedZone:', selectedZone);
    
    if (!currentInput) {
      toast.error('Veuillez fournir au moins une source (image, URL ou texte)');
      return;
    }

    // Vérifier la zone : utiliser selectedZone si currentInput.selectedZone n'est pas défini
    const zoneToUse = currentInput.selectedZone || selectedZone;
    console.log('[DEBUG] handleLaunchAnalysis - zoneToUse:', zoneToUse);
    
    // S'assurer que currentInput a bien la zone
    if (!currentInput.selectedZone && zoneToUse) {
      console.log('[DEBUG] Syncing zone to currentInput');
      setCurrentInput({ ...currentInput, selectedZone: zoneToUse });
    }

    setAnalysisState('loading');
    setRequestId(null);

    try {
      // ========================================
      // NOUVELLE LOGIQUE : Appel à /api/localisation/simple
      // ========================================
      
      let imageToSend = null;

      // Convertir l'image en base64 si nécessaire
      if (currentInput.method === 'image' && currentInput.imageFile) {
        imageToSend = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(currentInput.imageFile!);
        });
      } else if (currentInput.imageUrl) {
        imageToSend = currentInput.imageUrl;
      }

      // ⚠️ PARTIE CRITIQUE - Construire le payload avec la ZONE
      const payload: any = {
        imageUrl: imageToSend,
        url: currentInput.url,
        description: currentInput.description,
      };

      // AJOUTER LA ZONE SÉLECTIONNÉE
      const zoneToSend = currentInput.selectedZone || selectedZone;
      if (zoneToSend) {
        console.log('🔴 ENVOI DE LA ZONE:', zoneToSend);
        payload.selectedZone = zoneToSend;
      } else {
        console.error('❌ AUCUNE ZONE SÉLECTIONNÉE !');
        toast.error('Veuillez sélectionner une zone de recherche');
        setAnalysisState('empty');
        return;
      }

      // AJOUTER LES HINTS
      if (currentHints && Object.keys(currentHints).length > 0) {
        console.log('🔴 ENVOI DES HINTS:', currentHints);
        payload.hints = {
          codePostal: currentHints.codePostal,
          ville: currentHints.ville,
          ...currentHints
        };
      }

      console.log('🔴🔴🔴 DEBUG AVANT APPEL API 🔴🔴🔴');
      console.log('selectedZone:', selectedZone);
      console.log('currentInput.selectedZone:', currentInput?.selectedZone);
      console.log('currentHints:', currentHints);
      console.log('📦 PAYLOAD COMPLET:', JSON.stringify(payload, null, 2));
      console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');

      const response = await fetch('/api/localisation/simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.details || errorData.error || 'Erreur inconnue');
      }

      const data = await response.json();
      console.log('✅ Success data:', data);

      // Sauvegarder le requestId pour les relances
      if (data.requestId) {
        setRequestId(data.requestId);
        console.log('📝 RequestId saved:', data.requestId);
      }

      // Transformer les données de l'API simple vers le format attendu
      const hypotheses: LocalisationHypothese[] = data.candidates.map((c: any) => {
        // Utiliser les coordonnées EXACTES
        const coords = c.coordinates || { lat: 0, lng: 0 };
        
        // Vérifier que cadastralUrl est bien défini
        const cadastralUrl = c.visuals?.cadastralUrl || c.visuals?.cadastreUrl || null;
        
        if (!cadastralUrl) {
          console.error(`❌ CRITICAL: cadastralUrl missing for candidate ${c.id} at ${coords.lat}, ${coords.lng}`);
        } else {
          console.log(`✅ Cadastral URL for candidate ${c.id}: ${cadastralUrl.substring(0, 80)}...`);
        }
        
        return {
          id: c.id,
          adresse: c.adresse,
          codePostal: c.codePostal,
          ville: c.ville,
          coordonnees: coords, // Coordonnées EXACTES
          scoreConfiance: c.matchingScore.global,
          distanceHints: 0,
          scoreImage: c.matchingScore.details.architectureMatch,
          scorePiscine: c.matchingScore.details.piscineSimilarity,
          scoreToiture: c.matchingScore.details.orientationMatch,
          scoreTerrain: c.matchingScore.details.surfaceMatch,
          scoreHints: c.matchingScore.details.contextMatch,
          satelliteImageUrl: c.visuals?.satelliteUrl,
          cadastralUrl: cadastralUrl, // OBLIGATOIRE - doit être défini
          streetViewUrl: c.visuals?.streetViewUrl,
        };
      });

      const result: LocalisationResult = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        input: currentInput,
        hypotheses,
        precisionMoyenne: data.analysis.imageAnalysis?.confidenceScore || 0,
        tempsAnalyse: 0,
      };

      setResults(result);
      setAnalysisState('results');
      setRelanceCount(0); // Réinitialiser le compteur de relances
      saveToHistory(result);
      
      toast.success(`🎯 ${hypotheses.length} adresse(s) trouvée(s) !`);

    } catch (error: any) {
      console.error('💥 Error:', error);
      const errorMsg = error.message || 'Erreur lors de l\'analyse';
      const errorDetails = error.details || 'Le traitement de votre demande a rencontré une erreur. Cela peut être dû à :\n• Des images corrompues ou dans un format non supporté\n• Une URL d\'annonce invalide ou inaccessible\n• Un problème de connexion avec les services externes\n• Une erreur dans le pipeline de traitement';
      
      setErrorMessage(errorMsg);
      setErrorDetails(errorDetails);
      toast.error(errorMsg);
      setAnalysisState('error');
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
              onZoneChange={(zone) => {
                console.log('[DEBUG] onZoneChange called with zone:', zone);
                setSelectedZone(zone || undefined);
                if (currentInput) {
                  const updatedInput = { ...currentInput, selectedZone: zone || undefined };
                  console.log('[DEBUG] Updating currentInput with zone:', updatedInput);
                  setCurrentInput(updatedInput);
                } else {
                  console.log('[DEBUG] currentInput is null, creating minimal input with zone');
                  setCurrentInput({
                    method: 'image',
                    selectedZone: zone || undefined,
                  } as LocalisationInput);
                }
              }}
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
            className="bg-white/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-12 shadow-lg"
          >
            <div className="text-center mb-6">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Erreur d'analyse</h3>
              {errorMessage && (
                <p className="text-lg text-red-600 mb-4 font-medium">
                  {errorMessage}
                </p>
              )}
              {errorDetails && (
                <div className="text-left bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {errorDetails}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => {
                  setAnalysisState('empty');
                  setErrorMessage(null);
                  setErrorDetails(null);
                  setRequestId(null);
                }}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Modifier les paramètres
              </Button>
              <Button
                onClick={handleLaunchAnalysis}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Réessayer
              </Button>
                </div>
          </motion.div>
        )}

        {analysisState === 'results' && results && (
          <div className="space-y-6">
            {results.hypotheses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/80 backdrop-blur-sm border border-yellow-200/50 rounded-2xl p-12 shadow-lg text-center"
              >
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun candidat trouvé</h3>
                <p className="text-gray-600 mb-6">
                  Aucune hypothèse de localisation n'a pu être générée. Veuillez réessayer avec d'autres paramètres.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => setAnalysisState('empty')}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Modifier les paramètres
                  </Button>
                  <Button 
                    onClick={handleLaunchAnalysis}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Réessayer
                  </Button>
                </div>
              </motion.div>
            ) : (
              <>
                <MapResults
                  hypotheses={results.hypotheses}
                  onHypothesisSelect={setSelectedHypothesis}
                  searchZone={selectedZone}
                />

                <HypothesesList
                  hypotheses={results.hypotheses}
                  onHypothesisSelect={setSelectedHypothesis}
                  onViewDetails={(h) => {
                    console.log('View details:', h);
                  }}
                  requestId={requestId}
                  onMoreCandidates={handleMoreCandidates}
                  isLoadingMore={isLoadingMore}
                  relanceCount={relanceCount}
                />

                <ComparativeImages
                  originalImageUrl={currentInput?.imageUrl}
                  hypotheses={results.hypotheses}
                />
              </>
            )}
                                          </div>
                                        )}
                                        </div>
                                      </div>
  );
}
