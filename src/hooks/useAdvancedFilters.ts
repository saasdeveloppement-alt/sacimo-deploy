import { useState, useCallback } from 'react';

export interface AdvancedFilters {
  cities: string[];
  types: string[];
  minPrice: string;
  maxPrice: string;
  minSurface: string;
  maxSurface: string;
  rooms: string;
  sellerType: string; // 'all' | 'private' | 'professional'
  dateFrom: string; // ISO date string
}

export const initialFilters: AdvancedFilters = {
  cities: [],
  types: [],
  minPrice: '',
  maxPrice: '',
  minSurface: '',
  maxSurface: '',
  rooms: '',
  sellerType: 'all',
  dateFrom: '',
};

export function useAdvancedFilters(initial: AdvancedFilters = initialFilters) {
  const [filters, setFilters] = useState<AdvancedFilters>(initial);

  const updateFilter = useCallback((key: keyof AdvancedFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();

    // Villes (array)
    if (filters.cities.length > 0) {
      filters.cities.forEach((city) => {
        params.append('cities', city);
      });
    }

    // Types (array)
    if (filters.types.length > 0) {
      filters.types.forEach((type) => {
        params.append('types', type);
      });
    }

    // Prix
    if (filters.minPrice) {
      params.append('minPrice', filters.minPrice);
    }
    if (filters.maxPrice) {
      params.append('maxPrice', filters.maxPrice);
    }

    // Surface
    if (filters.minSurface) {
      params.append('minSurface', filters.minSurface);
    }
    if (filters.maxSurface) {
      params.append('maxSurface', filters.maxSurface);
    }

    // Nombre de pièces
    if (filters.rooms) {
      params.append('rooms', filters.rooms);
    }

    // Type de vendeur
    if (filters.sellerType !== 'all') {
      params.append('sellerType', filters.sellerType);
    }

    // Date de publication
    if (filters.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }

    return params.toString();
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    applyFilters,
    setFilters,
  };
}

