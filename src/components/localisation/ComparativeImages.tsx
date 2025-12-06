'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, ZoomIn, X } from 'lucide-react';
import type { LocalisationHypothese } from '@/types/localisation';
import ImageViewerModal from './ImageViewerModal';

interface ComparativeImagesProps {
  originalImageUrl?: string;
  hypotheses?: LocalisationHypothese[];
}

export default function ComparativeImages({ originalImageUrl, hypotheses = [] }: ComparativeImagesProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [viewerModal, setViewerModal] = useState<{
    isOpen: boolean;
    hypothesis: LocalisationHypothese | null;
    imageUrl?: string;
  }>({ isOpen: false, hypothesis: null });

  if (!originalImageUrl && hypotheses.length === 0) {
    return null;
  }

  const images = [
    ...(originalImageUrl ? [{ url: originalImageUrl, label: 'Image originale', similarity: 100 }] : []),
    ...hypotheses
      .filter((h) => h.satelliteImageUrl || h.images?.[0])
      .slice(0, 4)
      .map((h) => ({
        url: h.satelliteImageUrl || h.images?.[0] || '',
        label: h.adresse,
        similarity: h.similarieteVisuelle || 0,
      })),
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <span>Comparaison visuelle</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="relative group cursor-pointer rounded-xl overflow-hidden bg-gray-50 border-2 border-gray-200 hover:border-purple-300 transition-all shadow-sm hover:shadow-md"
              onClick={() => {
                // Trouver l'hypothèse correspondante si c'est une image satellite
                const hypothesis = hypotheses.find(h => h.satelliteImageUrl === img.url || h.images?.[0] === img.url);
                if (hypothesis) {
                  setViewerModal({ isOpen: true, hypothesis, imageUrl: img.url });
                } else {
                  // Pour l'image originale, utiliser la lightbox simple
                  setLightboxImage(img.url);
                }
              }}
            >
              <div className="aspect-square relative">
                <img
                  src={img.url}
                  alt={img.label}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform bg-black/80">
                  <div className="text-sm font-semibold text-white mb-1 truncate">{img.label}</div>
                  {img.similarity > 0 && (
                    <div className="text-xs text-gray-200">
                      Similarité: <span className="font-bold text-white">{Math.round(img.similarity)}%</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                <ZoomIn className="w-4 h-4 text-gray-700" />
              </div>
            </motion.div>
          ))}
        </div>

        {images.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aucune image disponible</p>
          </div>
        )}
      </motion.div>

      {/* Lightbox simple pour image originale */}
      {lightboxImage && !viewerModal.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative max-w-7xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 rounded-full hover:bg-black/80 transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img
              src={lightboxImage}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </motion.div>
        </motion.div>
      )}

      {/* Modal interactive pour les hypothèses */}
      {viewerModal.hypothesis && (
        <ImageViewerModal
          isOpen={viewerModal.isOpen}
          onClose={() => setViewerModal({ isOpen: false, hypothesis: null })}
          satelliteUrl={viewerModal.hypothesis.satelliteImageUrl}
          cadastralUrl={viewerModal.hypothesis.cadastralUrl}
          streetViewUrl={viewerModal.hypothesis.streetViewUrl}
          coordinates={viewerModal.hypothesis.coordonnees}
          address={`${viewerModal.hypothesis.adresse}, ${viewerModal.hypothesis.codePostal} ${viewerModal.hypothesis.ville}`}
        />
      )}
    </>
  );
}

