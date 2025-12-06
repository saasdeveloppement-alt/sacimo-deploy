'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GoogleMap, Marker, Circle, useLoadScript } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { MapPin, Navigation } from 'lucide-react';

interface ZoneSelectionStepProps {
  mapCenter: { lat: number; lng: number };
  setMapCenter: (center: { lat: number; lng: number }) => void;
  radiusKm: number;
  setRadiusKm: (radius: number) => void;
  country: string;
  onConfirm: () => void;
}

const libraries: ('places' | 'drawing' | 'geometry' | 'visualization')[] = ['places'];

export default function ZoneSelectionStep({
  mapCenter,
  setMapCenter,
  radiusKm,
  setRadiusKm,
  country,
  onConfirm,
}: ZoneSelectionStepProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newCenter = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setMapCenter(newCenter);
    }
  }, [setMapCenter]);

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      clickableIcons: true,
      scrollwheel: true,
      zoomControl: true,
      streetViewControl: true,
      mapTypeControl: true,
      fullscreenControl: true,
    }),
    []
  );

  // Convertir km en mètres pour le cercle
  const radiusMeters = radiusKm * 1000;

  if (loadError) {
    return (
      <div className="bg-white/90 backdrop-blur-sm border border-red-200/50 rounded-2xl p-8 shadow-lg">
        <p className="text-red-600 text-center">Erreur de chargement de Google Maps</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-lg space-y-6"
    >
      <div className="flex items-center gap-3">
        <MapPin className="w-8 h-8 text-purple-600" />
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Définissez la zone de recherche
          </h3>
          <p className="text-sm text-gray-600">
            Cliquez sur la carte pour centrer la zone, puis ajustez le rayon
          </p>
        </div>
      </div>

      {/* Carte interactive */}
      <div className="h-[400px] rounded-xl overflow-hidden border border-gray-200">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={12}
            options={mapOptions}
            onClick={handleMapClick}
          >
            <Marker
              position={mapCenter}
              title="Centre de la zone de recherche"
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="12" fill="#9333ea" stroke="white" stroke-width="2"/>
                    <circle cx="16" cy="16" r="4" fill="white"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(32, 32),
              }}
            />
            <Circle
              center={mapCenter}
              radius={radiusMeters}
              options={{
                fillColor: '#9333ea',
                fillOpacity: 0.2,
                strokeColor: '#9333ea',
                strokeOpacity: 0.8,
                strokeWeight: 3,
                clickable: false,
              }}
            />
          </GoogleMap>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Chargement de la carte...</p>
            </div>
          </div>
        )}
      </div>

      {/* Contrôles */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Rayon de recherche
            </label>
            <span className="text-lg font-bold text-purple-600">
              {radiusKm} km
            </span>
          </div>
          <Slider
            value={[radiusKm]}
            onValueChange={(value) => setRadiusKm(value[0])}
            min={1}
            max={30}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 km</span>
            <span>15 km</span>
            <span>30 km</span>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Navigation className="w-5 h-5 text-purple-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Zone de recherche définie
              </p>
              <p className="text-xs text-gray-600">
                Pays : <strong>{country}</strong> • Centre : {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)} • Rayon : {radiusKm} km
              </p>
              <p className="text-xs text-purple-700 mt-2 font-medium">
                ⚠️ La recherche se fera UNIQUEMENT dans cette zone
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={onConfirm}
          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
        >
          Confirmer la zone et lancer l'analyse
        </Button>
      </div>
    </motion.div>
  );
}

