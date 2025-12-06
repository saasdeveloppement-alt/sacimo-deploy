'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2, MapPin, Camera, Image as ImageIcon, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InteractiveMapView from './InteractiveMapView';
import StreetViewPanorama from './StreetViewPanorama';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  satelliteUrl?: string;
  cadastralUrl?: string;
  streetViewUrl?: string;
  coordinates?: { lat: number; lng: number };
  address?: string;
}

type ViewType = 'satellite' | 'cadastral' | 'streetview';

export default function ImageViewerModal({
  isOpen,
  onClose,
  satelliteUrl,
  cadastralUrl,
  streetViewUrl,
  coordinates,
  address,
}: ImageViewerModalProps) {
  const [activeView, setActiveView] = useState<ViewType>('satellite');
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [streetViewLoaded, setStreetViewLoaded] = useState(false);

  // Réinitialiser le zoom et position quand on change de vue
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      
      console.log('[ImageViewerModal] Modal opened with:', {
        satelliteUrl: !!satelliteUrl,
        cadastralUrl: !!cadastralUrl,
        streetViewUrl: !!streetViewUrl,
        coordinates,
      });
      
      // Déterminer la vue par défaut selon disponibilité
      if (satelliteUrl) setActiveView('satellite');
      else if (cadastralUrl) setActiveView('cadastral');
      else if (streetViewUrl || coordinates) setActiveView('streetview');
    }
  }, [isOpen, satelliteUrl, cadastralUrl, streetViewUrl, coordinates]);

  // Gestion du zoom avec la molette
  useEffect(() => {
    if (!isOpen) return;

    const handleWheel = (e: WheelEvent) => {
      if (activeView === 'streetview') return; // Pas de zoom sur Street View
      
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.5, Math.min(5, zoom + delta));
      setZoom(newZoom);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [isOpen, zoom, activeView]);

  // Gestion du drag pour déplacer l'image
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeView === 'streetview') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || activeView === 'streetview') return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Contrôles de zoom
  const handleZoomIn = () => {
    setZoom(Math.min(5, zoom + 0.25));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(0.5, zoom - 0.25));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Charger Google Street View si disponible
  useEffect(() => {
    if (isOpen && activeView === 'streetview' && coordinates && !streetViewLoaded) {
      setStreetViewLoaded(true);
    }
  }, [isOpen, activeView, coordinates, streetViewLoaded]);

  const getCurrentImageUrl = () => {
    switch (activeView) {
      case 'satellite':
        return satelliteUrl;
      case 'cadastral':
        return cadastralUrl;
      default:
        return null;
    }
  };

  const availableViews: ViewType[] = [];
  if (satelliteUrl) availableViews.push('satellite');
  if (cadastralUrl) availableViews.push('cadastral');
  if (streetViewUrl || coordinates) availableViews.push('streetview');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 flex flex-col"
        onClick={onClose}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center gap-4">
            {/* Tabs pour changer de vue */}
            <div className="flex gap-2">
              {availableViews.map((view) => (
                <button
                  key={view}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveView(view);
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeView === view
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {view === 'satellite' && (
                    <span className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Satellite
                    </span>
                  )}
                  {view === 'cadastral' && (
                    <span className="flex items-center gap-2">
                      <Map className="w-4 h-4" />
                      Cadastral
                    </span>
                  )}
                  {view === 'streetview' && (
                    <span className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Street View
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Adresse */}
            {address && (
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{address}</span>
              </div>
            )}
          </div>

          {/* Contrôles */}
          <div className="flex items-center gap-2">
            {/* Contrôles de zoom uniquement pour la vue cadastrale (image statique) */}
            {activeView === 'cadastral' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomOut();
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-white/70 text-sm min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomIn();
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Contenu principal */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {activeView === 'satellite' && coordinates ? (
            // Google Maps interactif en mode satellite
            <div className="w-full h-full">
              <InteractiveMapView
                center={coordinates}
                zoom={20}
                markers={[{ lat: coordinates.lat, lng: coordinates.lng, label: address || '' }]}
                height="100%"
                mapTypeId="satellite"
              />
            </div>
          ) : activeView === 'streetview' && coordinates ? (
            // Google Street View Panorama interactif
            <div className="w-full h-full">
              {console.log('[ImageViewerModal] Rendering Street View with coordinates:', coordinates)}
              <StreetViewPanorama
                position={coordinates}
                heading={0}
                pitch={0}
                fov={90}
                height="100%"
              />
            </div>
          ) : activeView === 'streetview' && streetViewUrl ? (
            // Fallback : image Street View statique avec possibilité d'ouvrir dans Google Maps
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <img
                  src={streetViewUrl}
                  alt="Street View"
                  className="max-w-full max-h-full object-contain"
                />
                {coordinates && (
                  <div className="mt-4">
                    <a
                      href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${coordinates.lat},${coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      Ouvrir Street View interactif
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Images satellite et cadastrale avec zoom et pan
            <div
              className="w-full h-full flex items-center justify-center cursor-move"
              onMouseDown={handleMouseDown}
            >
              {getCurrentImageUrl() ? (
                <motion.img
                  ref={imageRef}
                  src={getCurrentImageUrl() || ''}
                  alt={activeView === 'satellite' ? 'Vue satellite' : 'Vue cadastrale'}
                  className="select-none"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    transformOrigin: 'center center',
                  }}
                  drag={false}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-white/50 text-center">
                  <p className="text-lg mb-2">Image non disponible</p>
                  <p className="text-sm">Cette vue n'est pas disponible pour cette localisation</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        {activeView === 'satellite' && (
          <div className="p-4 bg-black/50 backdrop-blur-sm border-t border-white/10 text-white/60 text-sm text-center">
            <p>
              Carte Google Maps interactive • Utilisez les contrôles pour zoomer et naviguer • Changez le type de carte avec les contrôles en haut à droite
            </p>
          </div>
        )}
        {activeView === 'streetview' && (
          <div className="p-4 bg-black/50 backdrop-blur-sm border-t border-white/10 text-white/60 text-sm text-center">
            <p>
              Street View interactif • Cliquez et glissez pour naviguer à 360° • Utilisez les flèches pour vous déplacer dans la rue
            </p>
          </div>
        )}
        {activeView === 'cadastral' && (
          <div className="p-4 bg-black/50 backdrop-blur-sm border-t border-white/10 text-white/60 text-sm text-center">
            <p>
              Utilisez la molette pour zoomer • Cliquez et glissez pour déplacer • Double-clic pour réinitialiser
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

