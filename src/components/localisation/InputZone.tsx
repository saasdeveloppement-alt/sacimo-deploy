'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Link, FileText, X, Image as ImageIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { LocalisationInput } from '@/types/localisation';
import { toast } from 'sonner';

interface InputZoneProps {
  onInputChange: (input: LocalisationInput | null) => void;
}

export default function InputZone({ onInputChange }: InputZoneProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'url' | 'text'>('image');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Format d\'image non supporté. Utilisez JPG, PNG ou WEBP');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('L\'image est trop volumineuse (max 10Mo)');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    updateInput('image', { imageFile: file, imageUrl: URL.createObjectURL(file) });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
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

  const updateInput = (method: 'image' | 'url' | 'text', data: Partial<LocalisationInput>) => {
    const input: LocalisationInput = {
      method,
      ...data,
    };
    onInputChange(input);
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
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Méthode d'entrée</h3>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'image' | 'url' | 'text')} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100">
          <TabsTrigger value="image" className="data-[state=active]:bg-white data-[state=active]:text-purple-600">
            <Upload className="w-4 h-4 mr-2" />
            Image
          </TabsTrigger>
          <TabsTrigger value="url" className="data-[state=active]:bg-white data-[state=active]:text-purple-600">
            <Link className="w-4 h-4 mr-2" />
            URL
          </TabsTrigger>
          <TabsTrigger value="text" className="data-[state=active]:bg-white data-[state=active]:text-purple-600">
            <FileText className="w-4 h-4 mr-2" />
            Texte
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="image" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragging
                  ? 'border-purple-400 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400 bg-gray-50'
              }`}
            >
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg mb-4" />
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      onInputChange(null);
                    }}
                    className="absolute top-0 right-0 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 mb-2">Glissez une photo du bien ou cliquez pour parcourir</p>
                  <p className="text-sm text-gray-500 mb-4">JPG, PNG, WEBP (max 10Mo)</p>
                  <label className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg cursor-pointer hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md">
                    <span className="text-white font-medium">Choisir un fichier</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                    />
                  </label>
                </>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="url" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL de l'annonce</label>
                  <input
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
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                {url && !validateUrl(url) && (
                  <p className="text-sm text-red-500">L'URL fournie n'est pas valide</p>
                )}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="text" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description du bien</label>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (e.target.value.length >= 20) {
                        updateInput('text', { description: e.target.value });
                      } else {
                        onInputChange(null);
                      }
                    }}
                    placeholder="Ex: Maison avec jardin, 3 chambres, près de la plage..."
                    rows={6}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {description.length}/20 caractères minimum
                  </p>
                  {description.length > 0 && description.length < 20 && (
                    <p className="text-sm text-yellow-600 mt-1">
                      La description est trop courte (min. 20 caractères)
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

