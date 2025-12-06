'use client';

import { useMemo } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';

interface InteractiveMapViewProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{ lat: number; lng: number; label?: string }>;
  height?: string;
  mapTypeId?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
}

const libraries: ('places' | 'drawing' | 'geometry' | 'visualization')[] = ['places'];

export default function InteractiveMapView({
  center,
  zoom = 15,
  markers = [],
  height = '600px',
  mapTypeId = 'satellite',
}: InteractiveMapViewProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      clickableIcons: true,
      scrollwheel: true,
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: true,
      rotateControl: true,
      fullscreenControl: true,
      mapTypeId: mapTypeId,
    }),
    [mapTypeId]
  );

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 mb-2">Erreur de chargement de Google Maps</p>
          <p className="text-sm text-gray-600">Vérifiez votre clé API Google Maps</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={zoom}
        options={mapOptions}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={{ lat: marker.lat, lng: marker.lng }}
            label={marker.label}
          />
        ))}
      </GoogleMap>
    </div>
  );
}

