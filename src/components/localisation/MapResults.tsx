'use client';

import { useMemo, useEffect, useRef } from 'react';
import { GoogleMap, Marker, Circle, useLoadScript } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { MapPin, ExternalLink } from 'lucide-react';
import type { LocalisationHypothese, SearchZone } from '@/types/localisation';

interface MapResultsProps {
  hypotheses: LocalisationHypothese[];
  onHypothesisSelect?: (hypothesis: LocalisationHypothese) => void;
  searchZone?: SearchZone | null;
}

const libraries: ('places' | 'drawing' | 'geometry' | 'visualization')[] = ['places'];

export default function MapResults({ hypotheses, onHypothesisSelect, searchZone }: MapResultsProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const mapCenter = useMemo(() => {
    if (hypotheses.length === 0) {
      return { lat: 46.6034, lng: 1.8883 }; // Centre de la France
    }
    const avgLat = hypotheses.reduce((sum, h) => sum + h.coordonnees.lat, 0) / hypotheses.length;
    const avgLng = hypotheses.reduce((sum, h) => sum + h.coordonnees.lng, 0) / hypotheses.length;
    return { lat: avgLat, lng: avgLng };
  }, [hypotheses]);

  const getMarkerColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#3b82f6'; // blue
    if (score >= 40) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  if (loadError) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-8 text-center">
        <p className="text-red-400">Erreur de chargement de Google Maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Chargement de la carte...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
    >
      <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span>{hypotheses.length} hypothèse{hypotheses.length > 1 ? 's' : ''} de localisation</span>
            </h3>
            <p className="text-sm text-gray-600 ml-11">
              Cliquez sur un marqueur pour voir les détails
            </p>
          </div>
        </div>
      </div>

      <div className="h-[500px] relative bg-gray-50">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={mapCenter}
          zoom={hypotheses.length === 1 ? 18 : 12}
          options={{
            styles: [
              {
                featureType: 'all',
                elementType: 'geometry',
                stylers: [{ color: '#f8fafc' }],
              },
              {
                featureType: 'all',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#475569' }],
              },
              {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#e2e8f0' }],
              },
              {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#ffffff' }],
              },
              {
                featureType: 'road',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#64748b' }],
              },
            ],
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: true,
            mapTypeControl: true,
            fullscreenControl: true,
          }}
        >
          {/* Cercle de zone de recherche */}
          {searchZone && searchZone.radiusKm > 0 && (
            <Circle
              center={{ lat: searchZone.lat, lng: searchZone.lng }}
              radius={searchZone.radiusKm * 1000} // Convertir km en mètres
              options={{
                fillColor: '#8b5cf6',
                fillOpacity: 0.15,
                strokeColor: '#8b5cf6',
                strokeOpacity: 0.5,
                strokeWeight: 2,
              }}
            />
          )}

          {/* Marqueur du centre de la zone */}
          {searchZone && (
            <Marker
              position={{ lat: searchZone.lat, lng: searchZone.lng }}
              icon={{
                path: window.google?.maps?.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#8b5cf6',
                fillOpacity: 0.8,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }}
              label={{
                text: '📍',
                color: '#ffffff',
                fontSize: '16px',
              }}
            />
          )}

          {hypotheses.map((hypothesis, index) => {
            // Créer l'icône de marqueur avec un cercle
            const iconConfig = typeof window !== 'undefined' && window.google?.maps
              ? {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: getMarkerColor(hypothesis.scoreConfiance),
                  fillOpacity: 0.9,
                  strokeColor: '#ffffff',
                  strokeWeight: 3,
                }
              : undefined;

            return (
              <Marker
                key={hypothesis.id}
                position={hypothesis.coordonnees}
                icon={iconConfig}
                label={{
                  text: `${index + 1}`,
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 'bold',
                }}
                onClick={() => onHypothesisSelect?.(hypothesis)}
              />
            );
          })}
        </GoogleMap>

        {/* Légende */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="text-sm font-bold text-gray-900 mb-3">Confiance</div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm" />
              <span className="text-sm text-gray-700 font-medium">≥ 80%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
              <span className="text-sm text-gray-700 font-medium">60-79%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm" />
              <span className="text-sm text-gray-700 font-medium">40-59%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm" />
              <span className="text-sm text-gray-700 font-medium">&lt; 40%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

