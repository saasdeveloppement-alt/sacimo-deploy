'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Link, FileText, X, MapPin, Home, Ruler, Euro, Bed, Waves, TreePine, Eye, Car, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import type { LocalisationInput, LocalisationHints, SearchZone } from '@/types/localisation';
import { toast } from 'sonner';
import GooglePlacesAutocomplete from './GooglePlacesAutocomplete';
import RadiusSlider from './RadiusSlider';
import ZoneTag from './ZoneTag';

interface LocalisationFormProps {
  onInputChange: (input: LocalisationInput | null) => void;
  onHintsChange: (hints: LocalisationHints) => void;
  onZoneChange?: (zone: SearchZone | null) => void;
}

export default function LocalisationForm({ onInputChange, onHintsChange, onZoneChange }: LocalisationFormProps) {
  // État pour la méthode d'entrée
  const [activeTab, setActiveTab] = useState<'image' | 'url'>('image');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // État pour les hints
  const [hints, setHints] = useState<LocalisationHints>({
    caracteristiques: {},
  });

  // État pour les zones de recherche (plusieurs zones possibles)
  const [selectedZones, setSelectedZones] = useState<SearchZone[]>([]);
  const [radiusKm, setRadiusKm] = useState(0);

  // Debug: surveiller les changements de selectedZones
  useEffect(() => {
    console.log('[DEBUG] selectedZones changed:', selectedZones);
    console.log('[DEBUG] selectedZones.length:', selectedZones.length);
    if (selectedZones.length > 0) {
      console.log('[DEBUG] First zone:', selectedZones[0]);
    }
  }, [selectedZones]);

  // Calcul du pourcentage de complétion
  const calculateCompletion = () => {
    let filled = 0;
    let total = 0;

    // Input principal
    total += 1;
    if (activeTab === 'image' && imageFiles.length > 0) filled += 1;
    else if (activeTab === 'url' && url && validateUrl(url)) filled += 1;

    // Zone de recherche (obligatoire)
    total += 1;
    if (selectedZones.length > 0) filled += 1;

    // Hints
    total += 2;
    if (hints.codePostal) filled += 1;
    if (hints.ville) filled += 1;

    total += 1;
    if (hints.typeBien) filled += 1;

    total += 2;
    if (hints.surfaceMin || hints.surfaceMax) filled += 1;
    if (hints.prixMin || hints.prixMax) filled += 1;

    total += 1;
    if (hints.pieces) filled += 1;

    total += 1;
    if (Object.values(hints.caracteristiques || {}).some(v => v)) filled += 1;

    return Math.round((filled / total) * 100);
  };

  const completion = calculateCompletion();

  const updateInput = useCallback((method: 'image' | 'url', data: Partial<LocalisationInput>) => {
    // Toujours inclure la zone sélectionnée si elle existe
    const input: LocalisationInput = {
      method,
      ...data,
      // Utiliser selectedZone depuis data si fourni, sinon depuis selectedZones
      selectedZone: data.selectedZone || (selectedZones.length > 0 ? selectedZones[0] : undefined),
    };
    console.log('[DEBUG] updateInput called:', { method, data, selectedZones: selectedZones.length, selectedZone: input.selectedZone });
    onInputChange(input);
  }, [onInputChange, selectedZones]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    // Valider et préparer les fichiers
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`Format d'image non supporté pour ${file.name}. Utilisez JPG, PNG ou WEBP`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`L'image ${file.name} est trop volumineuse (max 10Mo)`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    // Lire les previews
    let loadedCount = 0;
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        loadedCount++;
        newPreviews.push(reader.result as string);
        
        // Quand tous les fichiers sont lus
        if (loadedCount === validFiles.length) {
          setImageFiles((prev) => {
            const newFiles = [...prev, ...validFiles];
            setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
            
            const allUrls = newFiles.map(f => URL.createObjectURL(f));
            updateInput('image', { 
              imageFile: newFiles[0],
              imageFiles: newFiles,
              imageUrl: allUrls[0],
              imageUrls: allUrls
            });
            return newFiles;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  }, [updateInput]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) handleFileSelect(files);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const updateHints = (updates: Partial<LocalisationHints>) => {
    const newHints = { ...hints, ...updates };
    setHints(newHints);
    onHintsChange(newHints);
  };

  // Gérer la sélection d'une zone (ajout à la liste)
  const handleZoneSelect = (zone: SearchZone) => {
    console.log('[DEBUG] handleZoneSelect called with zone:', zone);
    console.log('[DEBUG] Current selectedZones:', selectedZones);
    
    // Vérifier si la zone n'est pas déjà sélectionnée
    const exists = selectedZones.some(z => z.placeId === zone.placeId);
    if (exists) {
      console.log('[DEBUG] Zone already exists, skipping');
      toast.info('Cette zone est déjà sélectionnée');
      return;
    }

    const zoneWithRadius = { ...zone, radiusKm };
    const newZones = [...selectedZones, zoneWithRadius];
    
    console.log('[DEBUG] Setting new selectedZones:', newZones);
    setSelectedZones(newZones);
    
    // Pour l'API, on utilise la première zone (ou on fusionne les zones)
    // On peut aussi envoyer toutes les zones et laisser le backend gérer
    const primaryZone = newZones[0];
    console.log('[DEBUG] Primary zone:', primaryZone);
    
    // Appeler onZoneChange AVANT de mettre à jour l'input pour que la page parente soit synchronisée
    onZoneChange?.(primaryZone);
    
    // Mettre à jour l'input avec la zone principale (même si pas d'image/URL encore)
    // Cela garantit que currentInput.selectedZone est toujours à jour
    if (activeTab === 'image' && imageFiles.length > 0) {
      updateInput('image', {
        imageFile: imageFiles[0],
        imageUrl: imagePreviews[0],
        selectedZone: primaryZone,
      });
    } else if (activeTab === 'url' && url) {
      updateInput('url', {
        url,
        selectedZone: primaryZone,
      });
    } else {
      // Même sans image/URL, mettre à jour l'input avec la zone pour que la validation fonctionne
      // On crée un input minimal avec juste la zone
      const minimalInput: LocalisationInput = {
        method: activeTab,
        selectedZone: primaryZone,
      };
      console.log('[DEBUG] Updating input with zone only (no image/URL yet):', minimalInput);
      onInputChange(minimalInput);
    }
    
    toast.success(`Zone "${zone.label}" ajoutée`);
  };

  // Gérer la sélection de plusieurs zones (code postal avec plusieurs villes)
  const handleMultipleZonesSelect = (zones: SearchZone[]) => {
    // Ajouter toutes les zones qui ne sont pas déjà sélectionnées
    const newZones = zones.filter(
      zone => !selectedZones.some(z => z.placeId === zone.placeId)
    );
    
    if (newZones.length === 0) {
      toast.info('Toutes ces villes sont déjà sélectionnées');
      return;
    }

    const zonesWithRadius = newZones.map(z => ({ ...z, radiusKm }));
    const updatedZones = [...selectedZones, ...zonesWithRadius];
    setSelectedZones(updatedZones);
    
    // Utiliser la première zone comme zone principale
    const primaryZone = updatedZones[0];
    onZoneChange?.(primaryZone);
    
    toast.success(`${zonesWithRadius.length} ville(s) ajoutée(s)`);
    
    // Mettre à jour l'input
    if (activeTab === 'image' && imageFiles.length > 0) {
      updateInput('image', {
        imageFile: imageFiles[0],
        imageUrl: imagePreviews[0],
        selectedZone: primaryZone,
      });
    } else if (activeTab === 'url' && url) {
      updateInput('url', {
        url,
        selectedZone: primaryZone,
      });
    }
  };

  // Gérer le changement de rayon (appliqué à toutes les zones)
  const handleRadiusChange = (newRadius: number) => {
    setRadiusKm(newRadius);
    if (selectedZones.length > 0) {
      const updatedZones = selectedZones.map(z => ({ ...z, radiusKm: newRadius }));
      setSelectedZones(updatedZones);
      
      const primaryZone = updatedZones[0];
      onZoneChange?.(primaryZone);
      
      // Mettre à jour l'input
      if (activeTab === 'image' && imageFiles.length > 0) {
        updateInput('image', {
          imageFile: imageFiles[0],
          imageUrl: imagePreviews[0],
          selectedZone: primaryZone,
        });
      } else if (activeTab === 'url' && url) {
        updateInput('url', {
          url,
          selectedZone: primaryZone,
        });
      }
    }
  };

  // Supprimer une zone spécifique
  const handleRemoveZone = (zoneToRemove: SearchZone) => {
    const updatedZones = selectedZones.filter(z => z.placeId !== zoneToRemove.placeId);
    setSelectedZones(updatedZones);
    
    if (updatedZones.length === 0) {
      setRadiusKm(0);
      onZoneChange?.(null);
      
      // Mettre à jour l'input
      if (activeTab === 'image' && imageFiles.length > 0) {
        updateInput('image', {
          imageFile: imageFiles[0],
          imageUrl: imagePreviews[0],
        });
      } else if (activeTab === 'url' && url) {
        updateInput('url', { url });
      }
    } else {
      const primaryZone = updatedZones[0];
      onZoneChange?.(primaryZone);
      
      if (activeTab === 'image' && imageFiles.length > 0) {
        updateInput('image', {
          imageFile: imageFiles[0],
          imageUrl: imagePreviews[0],
          selectedZone: primaryZone,
        });
      } else if (activeTab === 'url' && url) {
        updateInput('url', {
          url,
          selectedZone: primaryZone,
        });
      }
    }
  };

  const validateUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-8">
      {/* INPUT FILE GLOBAL - DOIT ÊTRE HORS ANIMATEPRESENCE */}
      <input
        id="localisation-file-upload"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        ref={fileInputRef}
        onChange={(e) => {
          const files = e.target.files;
          console.log('[DEBUG] files selected:', files);
          if (files && files.length > 0) {
            handleFileSelect(files);
          }
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Header avec barre de progression */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Localisation IA
            </h1>
            <p className="text-gray-600">
              Remplissez le maximum d'informations pour une localisation précise
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600 mb-1">{completion}%</div>
            <div className="text-sm text-gray-500">Complétion</div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${completion}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {completion < 50 && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              <strong>Astuce :</strong> Plus vous remplissez de champs, plus la localisation sera précise. 
              Ajoutez au minimum une image ou une URL, ainsi que la ville ou le code postal.
            </p>
          </div>
        )}
      </div>

      {/* Section 1 : Méthode d'entrée principale */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-purple-600" />
          1. Source principale <span className="text-red-500">*</span>
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Choisissez au moins une méthode pour localiser le bien
        </p>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'image' | 'url')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
            <TabsTrigger value="image" className="data-[state=active]:bg-white data-[state=active]:text-purple-600">
              <Upload className="w-4 h-4 mr-2" />
              Image
            </TabsTrigger>
            <TabsTrigger value="url" className="data-[state=active]:bg-white data-[state=active]:text-purple-600">
              <Link className="w-4 h-4 mr-2" />
              URL
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="image" className="mt-0">
              {/* Container avec pointer-events-auto pour forcer l'interactivité */}
              <div className="relative z-20 pointer-events-auto">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="relative"
                >
                  <label
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={(e) => {
                      console.log("[CLICK] Dropzone clicked");
                      e.preventDefault();
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer block ${
                      isDragging
                        ? 'border-purple-400 bg-purple-50'
                        : 'border-gray-300 hover:border-purple-400 bg-gray-50'
                    }`}
                  >
                {imagePreviews.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-32 object-cover rounded-lg border border-gray-200" 
                          />
                          <button
                            onClick={() => {
                              const newFiles = imageFiles.filter((_, i) => i !== index);
                              const newPreviews = imagePreviews.filter((_, i) => i !== index);
                              setImageFiles(newFiles);
                              setImagePreviews(newPreviews);
                              if (newFiles.length === 0) {
                                onInputChange(null);
                              } else {
                                updateInput('image', { 
                                  imageFile: newFiles[0], 
                                  imageUrl: URL.createObjectURL(newFiles[0]) 
                                });
                              }
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="text-center">
                      <button
                        type="button"
                        className="inline-block px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-all text-sm text-gray-700 relative z-10"
                        onClick={(e) => {
                          console.log("[CLICK] Add more photos button clicked");
                          e.preventDefault();
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        Ajouter d'autres photos
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-700 mb-2">Glissez des photos du bien ou cliquez pour parcourir</p>
                    <p className="text-sm text-gray-500 mb-4">JPG, PNG, WEBP (max 10Mo par image)</p>
                    <span
                      className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg cursor-pointer hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md text-white font-medium"
                      onClick={(e) => {
                        console.log("[CLICK] Choisir des fichiers button clicked");
                        e.preventDefault();
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Choisir des fichiers
                    </span>
                  </div>
                )}
                  </label>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="url" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-700 mb-2 block">URL de l'annonce</Label>
                    <Input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        if (e.target.value && validateUrl(e.target.value)) {
                          updateInput('url', { url: e.target.value });
                        } else {
                          onInputChange(null);
                        }
                      }}
                      placeholder="https://www.leboncoin.fr/..."
                      className="bg-white border-gray-300 text-gray-900"
                    />
                    {url && !validateUrl(url) && (
                      <p className="text-sm text-red-500 mt-2">L'URL fournie n'est pas valide</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>

      {/* Section 2 : Informations de localisation */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-purple-600" />
          2. Localisation <span className="text-red-500">*</span>
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Sélectionnez une zone géographique pour limiter la recherche
        </p>

        <div className="space-y-6">
          {/* Autocomplétion Google Places */}
          <GooglePlacesAutocomplete
            onPlaceSelect={handleZoneSelect}
            onMultiplePlacesSelect={handleMultipleZonesSelect}
            placeholder="Rechercher une ville ou un code postal..."
          />

          {/* Tags des zones sélectionnées */}
          {selectedZones.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {selectedZones.map((zone, index) => (
                <ZoneTag
                  key={`${zone.placeId}-${index}-${zone.lat}-${zone.lng}`}
                  zone={zone}
                  onRemove={() => handleRemoveZone(zone)}
                />
              ))}
            </div>
          )}

          {/* Slider de rayon */}
          {selectedZones.length > 0 && (
            <RadiusSlider
              value={radiusKm}
              onChange={handleRadiusChange}
              disabled={selectedZones.length === 0}
            />
          )}

          {selectedZones.length === 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium">
                <Info className="w-4 h-4 inline mr-2" />
                Veuillez sélectionner une zone de recherche pour continuer
              </p>
              <p className="text-xs text-red-600 mt-2">
                Tapez un code postal (ex: 33360) ou une ville, puis cliquez sur une suggestion dans la liste déroulante.
              </p>
            </div>
          )}
          
          {/* Debug info (à retirer en production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-2 bg-gray-100 rounded text-xs text-gray-600">
              <strong>Debug:</strong> selectedZones.length = {selectedZones.length}
              {selectedZones.length > 0 && (
                <div className="mt-1">
                  Zones: {selectedZones.map(z => z.label).join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Section 3 : Caractéristiques du bien */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-purple-600" />
          3. Caractéristiques du bien
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Plus vous précisez, plus la localisation sera exacte
        </p>

        <div className="space-y-6">
          {/* Type de bien */}
          <div>
            <Label className="text-gray-700 mb-2 block">Type de bien</Label>
            <Select
              value={hints.typeBien || ''}
              onValueChange={(value) => updateHints({ typeBien: value as any })}
            >
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Sélectionner le type de bien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appartement">Appartement</SelectItem>
                <SelectItem value="maison">Maison</SelectItem>
                <SelectItem value="terrain">Terrain</SelectItem>
                <SelectItem value="commerce">Commerce</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Surface */}
          <div>
            <Label className="text-gray-700 mb-2 block flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Surface habitable (m²)
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="number"
                  value={hints.surfaceMin || ''}
                  onChange={(e) => updateHints({ surfaceMin: parseInt(e.target.value) || undefined })}
                  placeholder="Min (ex: 50)"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div>
                <Input
                  type="number"
                  value={hints.surfaceMax || ''}
                  onChange={(e) => updateHints({ surfaceMax: parseInt(e.target.value) || undefined })}
                  placeholder="Max (ex: 120)"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Prix */}
          <div>
            <Label className="text-gray-700 mb-2 block flex items-center gap-2">
              <Euro className="w-4 h-4" />
              Prix (€)
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="number"
                  value={hints.prixMin || ''}
                  onChange={(e) => updateHints({ prixMin: parseInt(e.target.value) || undefined })}
                  placeholder="Min (ex: 200000)"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div>
                <Input
                  type="number"
                  value={hints.prixMax || ''}
                  onChange={(e) => updateHints({ prixMax: parseInt(e.target.value) || undefined })}
                  placeholder="Max (ex: 500000)"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Nombre de pièces */}
          <div>
            <Label className="text-gray-700 mb-2 block flex items-center gap-2">
              <Bed className="w-4 h-4" />
              Nombre de pièces
            </Label>
            <Select
              value={hints.pieces?.toString() || ''}
              onValueChange={(value) => updateHints({ pieces: parseInt(value) || undefined })}
            >
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Sélectionner le nombre de pièces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 pièce</SelectItem>
                <SelectItem value="2">2 pièces</SelectItem>
                <SelectItem value="3">3 pièces</SelectItem>
                <SelectItem value="4">4 pièces</SelectItem>
                <SelectItem value="5">5+ pièces</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Section 4 : Caractéristiques supplémentaires */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-purple-600" />
          4. Caractéristiques supplémentaires
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Cochez toutes les caractéristiques qui s'appliquent
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'piscine', label: 'Piscine', icon: Waves },
            { key: 'jardin', label: 'Jardin', icon: TreePine },
            { key: 'vueMer', label: 'Vue mer', icon: Eye },
            { key: 'balcon', label: 'Balcon', icon: Eye },
            { key: 'parking', label: 'Parking', icon: Car },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer"
              onClick={() => updateHints({
                caracteristiques: {
                  ...hints.caracteristiques,
                  [key]: !hints.caracteristiques?.[key as keyof typeof hints.caracteristiques],
                },
              })}
            >
              <Checkbox
                checked={hints.caracteristiques?.[key as keyof typeof hints.caracteristiques] || false}
                onCheckedChange={(checked) =>
                  updateHints({
                    caracteristiques: {
                      ...hints.caracteristiques,
                      [key]: checked,
                    },
                  })
                }
                className="border-gray-300"
              />
              <Icon className="w-5 h-5 text-gray-600" />
              <Label className="text-gray-700 cursor-pointer flex-1">{label}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

