'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';
import type { SearchZone } from '@/types/localisation';

interface GooglePlacesAutocompleteProps {
  onPlaceSelect: (zone: SearchZone) => void;
  onMultiplePlacesSelect?: (zones: SearchZone[]) => void;
  placeholder?: string;
}

declare global {
  interface Window {
    google: any;
    initGooglePlaces: () => void;
  }
}

export default function GooglePlacesAutocomplete({
  onPlaceSelect,
  onMultiplePlacesSelect,
  placeholder = 'Rechercher une ville ou un code postal...',
}: GooglePlacesAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchZone[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const autocompleteInstanceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const inputTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fermer les suggestions si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSuggestions]);

  // Charger Google Places API
  useEffect(() => {
    if (typeof window === 'undefined' || window.google?.maps?.places) {
      initializeAutocomplete();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeAutocomplete();
    };
    document.head.appendChild(script);

    return () => {
      if (autocompleteInstanceRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteInstanceRef.current);
      }
    };
  }, []);

  // Rechercher toutes les villes par code postal
  // Utilise d'abord l'API data.gouv.fr pour obtenir toutes les communes, puis Google pour les coordonnées
  const searchByPostalCode = async (postalCode: string) => {
    if (!postalCode || postalCode.length !== 5) {
      return;
    }

    setIsLoading(true);
    setShowSuggestions(false);

    try {
      // Étape 1 : Récupérer toutes les communes du code postal via API data.gouv.fr
      const communesResponse = await fetch(
        `https://geo.api.gouv.fr/communes?codePostal=${postalCode}&fields=nom,code,codeDepartement,codeRegion,centre,contour`
      );

      if (!communesResponse.ok) {
        throw new Error('Erreur lors de la récupération des communes');
      }

      const communes = await communesResponse.json();

      if (!communes || communes.length === 0) {
        setIsLoading(false);
        return;
      }

      // Étape 2 : Pour chaque commune, obtenir les détails via Google Geocoding
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('Google Maps API key not found');
        setIsLoading(false);
        return;
      }

      // Traiter toutes les communes en parallèle
      const zonesPromises = communes.map(async (commune: any) => {
        try {
          // Utiliser le nom de la commune + code postal pour obtenir les coordonnées précises
          const geocodeResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?` +
            `address=${encodeURIComponent(commune.nom)},${postalCode},France` +
            `&key=${apiKey}` +
            `&components=postal_code:${postalCode}|country:FR`
          );

          const geocodeData = await geocodeResponse.json();

          if (geocodeData.status === 'OK' && geocodeData.results && geocodeData.results.length > 0) {
            const result = geocodeData.results[0];
            const lat = result.geometry.location.lat;
            const lng = result.geometry.location.lng;
            const placeId = result.place_id;

            const bounds = result.geometry.viewport
              ? {
                  north: result.geometry.viewport.northeast.lat,
                  south: result.geometry.viewport.southwest.lat,
                  east: result.geometry.viewport.northeast.lng,
                  west: result.geometry.viewport.southwest.lng,
                }
              : commune.contour
                ? {
                    // Utiliser les bounds de l'API française si disponibles
                    north: Math.max(...commune.contour.coordinates[0].map((c: number[]) => c[1])),
                    south: Math.min(...commune.contour.coordinates[0].map((c: number[]) => c[1])),
                    east: Math.max(...commune.contour.coordinates[0].map((c: number[]) => c[0])),
                    west: Math.min(...commune.contour.coordinates[0].map((c: number[]) => c[0])),
                  }
                : commune.centre
                  ? {
                      // Fallback : créer un petit bounding box autour du centre
                      north: commune.centre.coordinates[1] + 0.01,
                      south: commune.centre.coordinates[1] - 0.01,
                      east: commune.centre.coordinates[0] + 0.01,
                      west: commune.centre.coordinates[0] - 0.01,
                    }
                  : undefined;

            return {
              placeId,
              label: `${commune.nom} (${postalCode})`,
              lat: commune.centre?.coordinates?.[1] || lat,
              lng: commune.centre?.coordinates?.[0] || lng,
              radiusKm: 0,
              bounds,
            };
          } else {
            // Fallback : utiliser les coordonnées de l'API française
            if (commune.centre?.coordinates) {
              return {
                placeId: `commune-${commune.code}`,
                label: `${commune.nom} (${postalCode})`,
                lat: commune.centre.coordinates[1],
                lng: commune.centre.coordinates[0],
                radiusKm: 0,
                bounds: commune.contour
                  ? {
                      north: Math.max(...commune.contour.coordinates[0].map((c: number[]) => c[1])),
                      south: Math.min(...commune.contour.coordinates[0].map((c: number[]) => c[1])),
                      east: Math.max(...commune.contour.coordinates[0].map((c: number[]) => c[0])),
                      west: Math.min(...commune.contour.coordinates[0].map((c: number[]) => c[0])),
                    }
                  : undefined,
              };
            }
            return null;
          }
        } catch (error) {
          console.warn(`Erreur pour la commune ${commune.nom}:`, error);
          // Fallback : utiliser les données de l'API française uniquement
          if (commune.centre?.coordinates) {
            return {
              placeId: `commune-${commune.code}`,
              label: `${commune.nom} (${postalCode})`,
              lat: commune.centre.coordinates[1],
              lng: commune.centre.coordinates[0],
              radiusKm: 0,
              bounds: commune.contour
                ? {
                    north: Math.max(...commune.contour.coordinates[0].map((c: number[]) => c[1])),
                    south: Math.min(...commune.contour.coordinates[0].map((c: number[]) => c[1])),
                    east: Math.max(...commune.contour.coordinates[0].map((c: number[]) => c[0])),
                    west: Math.min(...commune.contour.coordinates[0].map((c: number[]) => c[0])),
                  }
                : undefined,
            };
          }
          return null;
        }
      });

      // Attendre toutes les requêtes
      const zonesResults = await Promise.all(zonesPromises);
      const zones = zonesResults.filter((z): z is SearchZone => z !== null);

      // Trier par nom de ville
      zones.sort((a, b) => a.label.localeCompare(b.label));

      if (zones.length > 0) {
        setSuggestions(zones);
        setShowSuggestions(true);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error searching by postal code:', error);
      setIsLoading(false);
    }
  };

  // Gérer la sélection d'une zone
  const handleSelectZone = (zone: SearchZone) => {
    console.log('[GooglePlacesAutocomplete] Zone sélectionnée:', zone);
    setInputValue('');
    setShowSuggestions(false);
    setSuggestions([]);
    console.log('[GooglePlacesAutocomplete] Appel de onPlaceSelect avec:', zone);
    onPlaceSelect(zone);
  };

  // Gérer les changements dans l'input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Si c'est un code postal (5 chiffres), rechercher les villes
    if (/^\d{5}$/.test(value.trim())) {
      if (inputTimeoutRef.current) {
        clearTimeout(inputTimeoutRef.current);
      }
      
      inputTimeoutRef.current = setTimeout(() => {
        searchByPostalCode(value.trim());
      }, 300); // Attendre 300ms après la dernière frappe
    } else if (value.trim().length === 0) {
      // Si l'input est vide, fermer les suggestions
      setShowSuggestions(false);
      setSuggestions([]);
    } else if (value.trim().length < 5) {
      // Si moins de 5 caractères, fermer les suggestions
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const initializeAutocomplete = () => {
    if (!autocompleteRef.current || !window.google?.maps?.places) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      autocompleteRef.current,
      {
        types: ['(cities)'],
        componentRestrictions: { country: 'fr' },
        fields: ['place_id', 'formatted_address', 'geometry', 'address_components'],
      }
    );

    autocompleteInstanceRef.current = autocomplete;

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (!place.geometry || !place.geometry.location) {
        return;
      }

      setIsLoading(true);

      // Extraire les informations
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const placeId = place.place_id;

      // Extraire le code postal et la ville
      let postalCode = '';
      let city = '';
      
      place.address_components?.forEach((component: any) => {
        if (component.types.includes('postal_code')) {
          postalCode = component.long_name;
        }
        if (component.types.includes('locality')) {
          city = component.long_name;
        }
      });

      // Obtenir les bounds
      const bounds = place.geometry.viewport
        ? {
            north: place.geometry.viewport.getNorthEast().lat(),
            south: place.geometry.viewport.getSouthWest().lat(),
            east: place.geometry.viewport.getNorthEast().lng(),
            west: place.geometry.viewport.getSouthWest().lng(),
          }
        : undefined;

      const zone: SearchZone = {
        placeId,
        label: city ? `${city}${postalCode ? ` (${postalCode})` : ''}` : place.formatted_address,
        lat,
        lng,
        radiusKm: 0,
        bounds,
      };

      setInputValue('');
      setIsLoading(false);
      handleSelectZone(zone);
    });
  };

  return (
    <div className="relative">
      <Label className="text-gray-700 mb-2 block">Zone de recherche</Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
        <Input
          ref={autocompleteRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="bg-white border-gray-300 text-gray-900 pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
      </div>
      
      {/* Menu déroulant avec toutes les villes pour le code postal */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="mt-2 border-2 border-purple-200 rounded-xl bg-white shadow-xl max-h-60 overflow-y-auto z-30"
        >
          <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200 sticky top-0">
            <p className="text-sm font-bold text-purple-700">
              {suggestions.length} ville{suggestions.length > 1 ? 's' : ''} trouvée{suggestions.length > 1 ? 's' : ''} pour ce code postal
            </p>
            <p className="text-xs text-gray-600 mt-1">
              👆 Cliquez sur une ville ci-dessous pour l'ajouter à votre recherche
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {suggestions.map((zone) => (
              <button
                key={zone.placeId}
                type="button"
                onClick={() => handleSelectZone(zone)}
                className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all flex items-center gap-3 group cursor-pointer active:bg-purple-100"
              >
                <div className="w-8 h-8 rounded-full bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-colors">
                  <MapPin className="w-4 h-4 text-purple-600 group-hover:text-purple-700 transition-colors" />
                </div>
                <span className="text-sm text-gray-900 font-semibold group-hover:text-purple-700 transition-colors flex-1">
                  {zone.label}
                </span>
                <span className="text-xs text-gray-400 group-hover:text-purple-600 transition-colors">
                  Cliquer pour ajouter →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-1">
        Tapez un code postal (5 chiffres) pour voir toutes les villes disponibles, puis cliquez sur celle que vous souhaitez
      </p>
    </div>
  );
}

