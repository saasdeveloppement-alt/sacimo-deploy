'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, TrendingUp, Eye, ExternalLink, ChevronRight, ChevronDown, Image as ImageIcon, Map, Camera, ZoomIn, X, RefreshCw } from 'lucide-react';
import type { LocalisationHypothese } from '@/types/localisation';
import ImageViewerModal from './ImageViewerModal';
import InteractiveMapView from './InteractiveMapView';
import { Button } from '@/components/ui/button';

interface HypothesesListProps {
  hypotheses: LocalisationHypothese[];
  onHypothesisSelect?: (hypothesis: LocalisationHypothese) => void;
  onViewDetails?: (hypothesis: LocalisationHypothese) => void;
  requestId?: string | null;
  onMoreCandidates?: () => void;
  isLoadingMore?: boolean;
  relanceCount?: number;
}

export default function HypothesesList({
  hypotheses,
  onHypothesisSelect,
  onViewDetails,
  requestId,
  onMoreCandidates,
  isLoadingMore = false,
  relanceCount = 0,
}: HypothesesListProps) {
  const sortedHypotheses = [...hypotheses].sort((a, b) => b.scoreConfiance - a.scoreConfiance);
  const [openDetails, setOpenDetails] = useState<Record<string, boolean>>({});
  const [viewerModal, setViewerModal] = useState<{
    isOpen: boolean;
    hypothesis: LocalisationHypothese | null;
  }>({ isOpen: false, hypothesis: null });
  const [expandedMap, setExpandedMap] = useState<string | null>(null);

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-green-500', text: 'text-green-700', border: 'border-green-200' };
    if (score >= 60) return { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-200' };
    if (score >= 40) return { bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-200' };
    return { bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-200' };
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return 'Très élevée';
    if (score >= 60) return 'Élevée';
    if (score >= 40) return 'Moyenne';
    return 'Faible';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span>Hypothèses de localisation</span>
        </h3>
        
        {requestId && onMoreCandidates && relanceCount < 3 && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onMoreCandidates();
            }}
            disabled={isLoadingMore}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          >
            {isLoadingMore ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Recherche en cours...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Trouver d'autres hypothèses ({relanceCount}/3)
              </>
            )}
          </Button>
        )}
        
        {relanceCount >= 3 && (
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span>Maximum de relances atteint</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {sortedHypotheses.map((hypothesis, index) => {
          const colors = getConfidenceColor(hypothesis.scoreConfiance);
          
          return (
            <motion.div
              key={hypothesis.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => onHypothesisSelect?.(hypothesis)}
            >
              <div className="flex items-start gap-4">
                {/* Numéro */}
                <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                  {index + 1}
                </div>

                {/* Contenu principal */}
                <div className="flex-1 min-w-0">
                  {/* Adresse */}
                  <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                    {hypothesis.adresse}
                  </h4>
                  
                  {/* Localisation */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      {hypothesis.codePostal} {hypothesis.ville}
                    </span>
                    {hypothesis.distanceHints > 0 && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500">{hypothesis.distanceHints.toFixed(1)} km des indices</span>
                      </>
                    )}
                  </div>

                  {/* Barre de progression */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">
                        {getConfidenceLabel(hypothesis.scoreConfiance)}
                      </span>
                      <span className={`text-sm font-bold ${colors.text}`}>
                        {Math.round(hypothesis.scoreConfiance)}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${colors.bg}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${hypothesis.scoreConfiance}%` }}
                        transition={{ duration: 0.8, delay: index * 0.05 }}
                      />
                    </div>
                  </div>

                  {/* Scores détaillés */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {hypothesis.scoreImage !== undefined && (
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Image</div>
                        <div className="text-sm font-bold text-gray-900">{Math.round(hypothesis.scoreImage)}%</div>
                      </div>
                    )}
                    {hypothesis.scorePiscine !== undefined && (
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Piscine</div>
                        <div className="text-sm font-bold text-gray-900">{Math.round(hypothesis.scorePiscine)}%</div>
                      </div>
                    )}
                    {hypothesis.scoreToiture !== undefined && (
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Toiture</div>
                        <div className="text-sm font-bold text-gray-900">{Math.round(hypothesis.scoreToiture)}%</div>
                      </div>
                    )}
                    {hypothesis.scoreHints !== undefined && (
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Indices</div>
                        <div className="text-sm font-bold text-gray-900">{Math.round(hypothesis.scoreHints)}%</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Comparaison visuelle - TOUJOURS VISIBLE */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.2 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base">
                  <Eye className="w-5 h-5 text-purple-600" />
                  Comparaison visuelle
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Vue satellite */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-700 flex items-center gap-2 uppercase tracking-wide">
                      <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                      Vue satellite
                    </div>
                    {hypothesis.satelliteImageUrl ? (
                      <div 
                        className="relative group cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewerModal({ isOpen: true, hypothesis });
                        }}
                      >
                        <img
                          src={hypothesis.satelliteImageUrl}
                          alt="Vue satellite"
                          className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 hover:border-purple-400 transition-all shadow-sm hover:shadow-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'flex flex-col items-center justify-center bg-gray-50 text-gray-400 h-40 rounded-lg border-2 border-gray-200 text-xs';
                              placeholder.innerHTML = '<svg class="w-6 h-6 mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><span>Non disponible</span>';
                              parent.appendChild(placeholder);
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg" />
                        <div className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                          <ZoomIn className="w-4 h-4 text-gray-700" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center bg-gray-50 text-gray-400 h-40 rounded-lg border-2 border-gray-200 text-xs">
                        <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                        <span>Non disponible</span>
                      </div>
                    )}
                  </div>

                  {/* Vue cadastrale */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-700 flex items-center gap-2 uppercase tracking-wide">
                      <Map className="w-3.5 h-3.5 text-indigo-600" />
                      Vue cadastrale
                    </div>
                    {hypothesis.cadastralUrl ? (
                      <div 
                        className="relative group cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewerModal({ isOpen: true, hypothesis });
                        }}
                      >
                        <img
                          src={hypothesis.cadastralUrl}
                          alt="Vue cadastrale"
                          className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 hover:border-indigo-400 transition-all shadow-sm hover:shadow-md bg-gray-100"
                          onError={(e) => {
                            console.error(`[HypothesesList] Failed to load cadastral image: ${hypothesis.cadastralUrl}`);
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.cadastral-placeholder')) {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'cadastral-placeholder flex flex-col items-center justify-center bg-gray-50 text-gray-400 h-40 rounded-lg border-2 border-gray-200 text-xs';
                              placeholder.innerHTML = '<svg class="w-6 h-6 mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg><span>Erreur de chargement</span>';
                              parent.appendChild(placeholder);
                            }
                          }}
                          onLoad={() => {
                            console.log(`[HypothesesList] ✅ Cadastral image loaded: ${hypothesis.cadastralUrl?.substring(0, 80)}...`);
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg" />
                        <div className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                          <ZoomIn className="w-4 h-4 text-gray-700" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center bg-gray-50 text-gray-400 h-40 rounded-lg border-2 border-gray-200 text-xs">
                        <Map className="w-6 h-6 mb-1 opacity-50" />
                        <span>Non disponible</span>
                        <span className="text-xs mt-1 text-gray-300">URL manquante</span>
                      </div>
                    )}
                  </div>

                  {/* Street View */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-700 flex items-center gap-2 uppercase tracking-wide">
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      Street View
                    </div>
                    {hypothesis.streetViewUrl ? (
                      <div 
                        className="relative group cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewerModal({ isOpen: true, hypothesis });
                        }}
                      >
                        <img
                          src={hypothesis.streetViewUrl}
                          alt="Street View"
                          className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'flex flex-col items-center justify-center bg-gray-50 text-gray-400 h-40 rounded-lg border-2 border-gray-200 text-xs';
                              placeholder.innerHTML = '<svg class="w-6 h-6 mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg><span>Non disponible</span>';
                              parent.appendChild(placeholder);
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg" />
                        <div className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                          <ZoomIn className="w-4 h-4 text-gray-700" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center bg-gray-50 text-gray-400 h-40 rounded-lg border-2 border-gray-200 text-xs">
                        <Camera className="w-6 h-6 mb-1 opacity-50" />
                        <span>Non disponible</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onHypothesisSelect?.(hypothesis);
                    // Toggle la carte interactive
                    setExpandedMap(expandedMap === hypothesis.id ? null : hypothesis.id);
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all text-sm font-medium flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  {expandedMap === hypothesis.id ? 'Masquer la carte' : 'Voir sur carte'}
                </button>
                {hypothesis.streetViewUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewerModal({ isOpen: true, hypothesis });
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium flex items-center gap-2"
                    title="Ouvrir Street View"
                  >
                    <Camera className="w-4 h-4" />
                    Street View
                  </button>
                )}
              </div>

              {/* Carte interactive expandable */}
              <AnimatePresence>
                {expandedMap === hypothesis.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="bg-gray-50 rounded-lg border-2 border-purple-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-purple-600" />
                          Carte interactive - {hypothesis.adresse}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedMap(null);
                          }}
                          className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <div className="rounded-lg overflow-hidden border border-gray-300 shadow-lg">
                        <InteractiveMapView
                          center={hypothesis.coordonnees}
                          zoom={18}
                          markers={[
                            {
                              lat: hypothesis.coordonnees.lat,
                              lng: hypothesis.coordonnees.lng,
                              label: `${hypothesis.adresse}, ${hypothesis.codePostal} ${hypothesis.ville}`,
                            },
                          ]}
                          height="600px"
                          mapTypeId="satellite"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {sortedHypotheses.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Aucune hypothèse disponible</p>
        </div>
      )}

      {/* Modal de visualisation */}
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
    </motion.div>
  );
}

