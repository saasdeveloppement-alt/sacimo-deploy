'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Rocket, AlertCircle, Zap, MapPin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { GoogleMap, Marker, Circle, useLoadScript } from '@react-google-maps/api';
import { toast } from 'sonner';
import ZoneSelectionStep from './ZoneSelectionStep';

type AnalysisState = 'empty' | 'image-uploaded' | 'country-selection' | 'zone-selection' | 'loading' | 'results' | 'error';

interface PicartaResult {
  location: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    coordinates: { lat: number; lng: number };
  };
  confidence: number;
  properties: {
    hasPool?: boolean;
    roofType?: string;
    architecture?: string;
  };
}

interface SearchZone {
  center: { lat: number; lng: number };
  radius: number; // en km
  country: string;
}

export default function LocalisationProPage() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>('empty');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [results, setResults] = useState<PicartaResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // États pour le workflow Picarta
  const [selectedCountry, setSelectedCountry] = useState<string>('France');
  const [searchZone, setSearchZone] = useState<SearchZone | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 46.2276, lng: 2.2137 }); // Centre de la France
  const [radiusKm, setRadiusKm] = useState<number>(5); // Rayon par défaut en km

  const handleImageUpload = (file: File) => {
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Format non supporté. Utilisez JPG, PNG ou WEBP');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image trop volumineuse (max 10MB)');
      return;
    }

    setSelectedImage(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    toast.success('Image chargée');
    // Passer à l'étape de sélection du pays
    setAnalysisState('country-selection');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleImageUpload(file);
      } else {
        toast.error('Veuillez déposer une image (JPG, PNG ou WEBP)');
      }
    }
  };

  const handleCountryConfirm = () => {
    // Passer à l'étape de sélection de zone
    setAnalysisState('zone-selection');
    
    // Centrer la carte sur le pays sélectionné
    const countryCenters: { [key: string]: { lat: number; lng: number } } = {
      'France': { lat: 46.2276, lng: 2.2137 },
      'Belgique': { lat: 50.5039, lng: 4.4699 },
      'Suisse': { lat: 46.8182, lng: 8.2275 },
      'Espagne': { lat: 40.4637, lng: -3.7492 },
      'Italie': { lat: 41.8719, lng: 12.5674 },
      'Allemagne': { lat: 51.1657, lng: 10.4515 },
      'Portugal': { lat: 39.3999, lng: -8.2245 },
    };
    
    if (countryCenters[selectedCountry]) {
      setMapCenter(countryCenters[selectedCountry]);
    }
  };

  const handleZoneConfirm = () => {
    if (!mapCenter) {
      toast.error('Veuillez sélectionner une zone sur la carte');
      return;
    }
    
    setSearchZone({
      center: mapCenter,
      radius: radiusKm,
      country: selectedCountry,
    });
    
    // Lancer l'analyse
    handleAnalyze();
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (!searchZone) {
      toast.error('Veuillez définir une zone de recherche');
      return;
    }

    setAnalysisState('loading');
    setResults(null);
    setErrorMessage(null);

    try {
      // Convertir en base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedImage);
      });

      console.log('🚀 Appel API Picarta...');
      console.log('📍 Zone de recherche:', searchZone);

      const response = await fetch('/api/localisation/picarta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: base64,
          country: searchZone.country,
          searchZone: {
            center: searchZone.center,
            radius: searchZone.radius, // en km
          },
        }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `Erreur HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.error || `Erreur API Picarta (${response.status})`);
      }

      const data = await response.json();
      console.log('✅ Résultats Picarta:', data);

      // Vérifier si c'est un mock (pour informer l'utilisateur)
      if (data.location?.address === '123 Rue de Test') {
        toast.info('Mode démo : L\'API Picarta n\'est pas disponible, résultats de test affichés');
      } else {
        toast.success('Localisation réussie avec Picarta AI !');
      }

      setResults(data);
      setAnalysisState('results');

    } catch (error: any) {
      console.error('❌ Erreur complète:', error);
      
      let errorMsg = 'Erreur lors de l\'analyse';
      
      // Gérer les erreurs réseau spécifiquement
      if (error.message?.includes('fetch failed') || error.message?.includes('Failed to fetch')) {
        errorMsg = 'Erreur de connexion. Vérifiez votre connexion internet ou que le serveur est démarré.';
      } else if (error.message?.includes('Zone de recherche requise')) {
        errorMsg = 'Veuillez définir une zone de recherche avant de lancer l\'analyse.';
        // Revenir à l'étape de sélection de zone
        setAnalysisState('zone-selection');
        toast.error(errorMsg);
        return;
      } else if (error.message) {
        errorMsg = error.message;
      } else if (error instanceof TypeError) {
        errorMsg = 'Erreur de communication avec le serveur. Vérifiez que le serveur est démarré.';
      } else {
        errorMsg = `Erreur inconnue: ${error.toString()}`;
      }
      
      setErrorMessage(errorMsg);
      setAnalysisState('error');
      toast.error(errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec badge PRO */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Localisation PRO</h1>
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
            Powered by Picarta AI
          </span>
        </div>
        <p className="text-purple-100">
          Géolocalisation ultra-précise par intelligence artificielle avancée
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne gauche - Upload */}
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-purple-600" />
              Image du bien
            </h3>
            
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileInputChange}
              className="hidden"
              id="image-upload-pro"
            />
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all ${
                isDragging
                  ? 'border-purple-500 bg-purple-200 scale-105 shadow-lg'
                  : 'border-purple-300 bg-purple-50 hover:border-purple-500 hover:bg-purple-100'
              }`}
            >
              <label
                htmlFor="image-upload-pro"
                className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
              >
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <p className="text-white font-medium">Changer l'image</p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6">
                  <Zap className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium mb-2">
                    Glissez-déposez une image ou cliquez pour sélectionner
                  </p>
                  <p className="text-sm text-gray-500">
                    JPG, PNG ou WEBP (max 10MB)
                  </p>
                </div>
              )}
              </label>
              {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center bg-purple-500/20 rounded-xl pointer-events-none z-10">
                  <div className="text-center">
                    <Zap className="w-12 h-12 text-purple-600 mx-auto mb-2 animate-bounce" />
                    <p className="text-purple-700 font-semibold text-lg">Déposez l'image ici</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Colonne droite - Workflow Picarta */}
        <div className="space-y-6">
          {analysisState === 'empty' && (
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-12 shadow-lg text-center">
              <Zap className="w-20 h-20 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Prêt pour l'analyse PRO
              </h3>
              <p className="text-gray-600">
                Uploadez une image pour une géolocalisation ultra-précise
              </p>
            </div>
          )}

          {/* ÉTAPE 1 : Sélection du pays */}
          {analysisState === 'country-selection' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Confirmez le pays
                  </h3>
                  <p className="text-sm text-gray-600">
                    Dans quel pays se trouve ce bien ?
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays
                  </label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="w-full h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="France">🇫🇷 France</SelectItem>
                      <SelectItem value="Belgique">🇧🇪 Belgique</SelectItem>
                      <SelectItem value="Suisse">🇨🇭 Suisse</SelectItem>
                      <SelectItem value="Espagne">🇪🇸 Espagne</SelectItem>
                      <SelectItem value="Italie">🇮🇹 Italie</SelectItem>
                      <SelectItem value="Allemagne">🇩🇪 Allemagne</SelectItem>
                      <SelectItem value="Portugal">🇵🇹 Portugal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleCountryConfirm}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  Confirmer et continuer
                </Button>
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 2 : Sélection de la zone avec carte */}
          {analysisState === 'zone-selection' && (
            <ZoneSelectionStep
              mapCenter={mapCenter}
              setMapCenter={setMapCenter}
              radiusKm={radiusKm}
              setRadiusKm={setRadiusKm}
              country={selectedCountry}
              onConfirm={handleZoneConfirm}
            />
          )}

          {analysisState === 'loading' && (
            <div className="bg-white/90 backdrop-blur-sm border border-purple-200/50 rounded-2xl p-12 shadow-lg text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="inline-block mb-6"
              >
                <Zap className="w-20 h-20 text-purple-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Analyse Picarta AI en cours...
              </h3>
              <p className="text-gray-600">
                Intelligence artificielle avancée en action
              </p>
            </div>
          )}

          {analysisState === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/90 backdrop-blur-sm border border-red-200/50 rounded-2xl p-8 shadow-lg"
            >
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Erreur d'analyse
              </h3>
              <p className="text-red-600 text-center">{errorMessage}</p>
              <Button
                onClick={() => setAnalysisState('empty')}
                className="w-full mt-6"
                variant="outline"
              >
                Réessayer
              </Button>
            </motion.div>
          )}

          {analysisState === 'results' && results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Card résultat principal */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">
                    Localisation identifiée
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Adresse</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {results.location.address}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Ville</p>
                      <p className="font-semibold text-gray-900">
                        {results.location.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Code postal</p>
                      <p className="font-semibold text-gray-900">
                        {results.location.postalCode}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Score de confiance</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 h-3 rounded-full transition-all"
                        style={{ width: `${results.confidence}%` }}
                      />
                    </div>
                    <p className="text-right text-sm font-semibold text-purple-600 mt-1">
                      {results.confidence}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Card propriétés détectées */}
              {results.properties && (
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Caractéristiques détectées
                  </h4>
                  <div className="space-y-2">
                    {results.properties.hasPool !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${results.properties.hasPool ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-sm text-gray-700">
                          Piscine : {results.properties.hasPool ? 'Oui' : 'Non'}
                        </span>
                      </div>
                    )}
                    {results.properties.roofType && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm text-gray-700">
                          Toiture : {results.properties.roofType}
                        </span>
                      </div>
                    )}
                    {results.properties.architecture && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <span className="text-sm text-gray-700">
                          Style : {results.properties.architecture}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Carte Google Maps */}
              {results.location.coordinates.lat && results.location.coordinates.lng && (
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${results.location.coordinates.lat},${results.location.coordinates.lng}&zoom=18&size=600x400&maptype=satellite&markers=color:purple|${results.location.coordinates.lat},${results.location.coordinates.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}`}
                    alt="Carte"
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      // Fallback si la clé API n'est pas configurée
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-64 flex items-center justify-center bg-gray-100 text-gray-500">
                            <p class="text-sm">Carte non disponible (clé API Google Maps requise)</p>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

