'use client';

import { useMemo, useRef, useEffect } from 'react';
import { StreetViewPanorama as GoogleStreetViewPanorama, useLoadScript } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';

interface StreetViewPanoramaProps {
  position: { lat: number; lng: number };
  heading?: number;
  pitch?: number;
  fov?: number;
  height?: string;
}

export default function StreetViewPanorama({
  position,
  heading = 0,
  pitch = 0,
  fov = 90,
  height = '100%',
}: StreetViewPanoramaProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);

  const streetViewOptions = useMemo(
    () => ({
      position,
      pov: {
        heading,
        pitch,
      },
      zoom: 1,
      visible: true,
      addressControl: true,
      linksControl: true,
      panControl: true,
      enableCloseButton: false,
      showRoadLabels: true,
      zoomControl: true,
      fullscreenControl: true,
    }),
    [position, heading, pitch]
  );

  useEffect(() => {
    if (panoramaRef.current) {
      panoramaRef.current.setPosition(position);
      panoramaRef.current.setPov({
        heading,
        pitch,
      });
    }
  }, [position, heading, pitch]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg">
        <div className="text-center text-white">
          <p className="text-red-400 mb-2">Erreur de chargement de Street View</p>
          <p className="text-sm text-gray-400">Vérifiez votre clé API Google Maps</p>
          {loadError && (
            <p className="text-xs text-gray-500 mt-2">{loadError.message}</p>
          )}
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-2" />
          <p className="text-sm">Chargement de Street View...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden bg-gray-900">
      <GoogleStreetViewPanorama
        onLoad={(panorama) => {
          panoramaRef.current = panorama;
          console.log('✅ Street View Panorama loaded at:', position);
          
          // Vérifier la disponibilité
          const status = panorama.getStatus();
          if (status !== 'OK') {
            console.warn('⚠️ Street View status:', status);
          }
        }}
        onError={(error) => {
          console.error('❌ Street View error:', error);
        }}
        options={streetViewOptions}
      />
    </div>
  );
}

