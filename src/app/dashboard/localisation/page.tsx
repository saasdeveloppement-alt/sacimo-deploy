'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function LocalisationPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // État pour les hints
  const [hints, setHints] = useState({
    codePostal: '',
    ville: '',
  });

  // Fonction pour convertir File en base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Gestion de l'upload d'image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification du format
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Format non supporté. Utilisez JPG, PNG ou WEBP');
      return;
    }

    // Vérification de la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image trop volumineuse (max 10MB)');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setSelectedImage(base64);
      toast.success('Image chargée avec succès');
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'image');
    }
  };

  // Lancement de l'analyse
  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error('Veuillez d\'abord sélectionner une image');
      return;
    }

    setIsAnalyzing(true);
    setResults(null);

    try {
      console.log('🚀 Lancement de l\'analyse...');
      
      const response = await fetch('/api/localisation/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: selectedImage,
          hints: {
            codePostal: hints.codePostal || undefined,
            ville: hints.ville || undefined,
          }
        }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.details || errorData.error || 'Erreur inconnue');
      }

      const data = await response.json();
      console.log('✅ Success:', data);

      setResults(data);
      toast.success(`${data.candidates.length} adresse(s) trouvée(s) !`);

    } catch (error) {
      console.error('💥 Erreur:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Une erreur est survenue lors de l\'analyse'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Localisation IA
        </h1>
        <p className="text-gray-600">
          Analysez une photo pour localiser un bien immobilier
        </p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Colonne gauche - Inputs */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Upload d'image */}
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Image du bien
            </h3>
            
            <label className="block">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-500 transition-colors"
              >
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2">📸</div>
                    <p className="text-gray-600">
                      Cliquez pour sélectionner une image
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      JPG, PNG ou WEBP (max 10MB)
                    </p>
                  </div>
                )}
              </label>
            </label>
          </div>

          {/* Hints */}
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Indices (optionnel)
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  value={hints.codePostal}
                  onChange={(e) => setHints({ ...hints, codePostal: e.target.value })}
                  placeholder="Ex: 75008"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={hints.ville}
                  onChange={(e) => setHints({ ...hints, ville: e.target.value })}
                  placeholder="Ex: Paris"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Bouton d'analyse */}
          <button
            onClick={handleAnalyze}
            disabled={!selectedImage || isAnalyzing}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                🚀 Lancer la localisation
              </>
            )}
          </button>
        </div>

        {/* Colonne droite - Résultats */}
        <div className="lg:col-span-2">
          
          {!results && !isAnalyzing && (
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">📍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Lancez votre première localisation
              </h3>
              <p className="text-gray-600">
                Sélectionnez une image et cliquez sur "Lancer la localisation"
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Analyse en cours...
              </h3>
              <p className="text-gray-600">
                L'IA analyse votre image et recherche les correspondances
              </p>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              {/* Header résultats */}
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  🎯 {results.candidates.length} adresse(s) trouvée(s)
                </h2>
                <p className="text-gray-600">
                  Score de confiance: {results.analysis.imageAnalysis?.confidenceScore || 0}%
                </p>
              </div>

              {/* Candidats */}
              {results.candidates.map((candidate: any, index: number) => (
                <div
                  key={candidate.id}
                  className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-medium mb-2">
                          ⭐ #{index + 1} • Score: {candidate.matchingScore.global}%
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {candidate.adresse}
                        </h3>
                        <p className="text-gray-600">
                          {candidate.codePostal} {candidate.ville}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Explication */}
                  <div className="p-6 bg-purple-50/50">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      📍 Pourquoi cette adresse ?
                    </h4>
                    <p className="text-gray-700">
                      {candidate.explanation}
                    </p>
                  </div>

                  {/* Visuels */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Vue satellite */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          Vue satellite
                        </h5>
                        <img
                          src={candidate.visuals.satelliteUrl}
                          alt="Vue satellite"
                          className="w-full rounded-lg border border-gray-200"
                        />
                      </div>

                      {/* Street View */}
                      {candidate.visuals.streetViewUrl && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            Street View
                          </h5>
                          <img
                            src={candidate.visuals.streetViewUrl}
                            alt="Street View"
                            className="w-full rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
