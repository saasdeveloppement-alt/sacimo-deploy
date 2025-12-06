'use client';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { MapPin } from 'lucide-react';

interface RadiusSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function RadiusSlider({ value, onChange, disabled = false }: RadiusSliderProps) {
  const handleChange = (newValue: number[]) => {
    onChange(newValue[0]);
  };

  const getRadiusLabel = (km: number) => {
    if (km === 0) return 'Strictement dans la commune';
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km} km`;
  };

  return (
    <div className="space-y-3">
      <Label className="text-gray-700 flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        Rayon de recherche
      </Label>
      <div className="px-2">
        <Slider
          value={[value]}
          onValueChange={handleChange}
          min={0}
          max={30}
          step={0.5}
          disabled={disabled}
          className="w-full"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">0 km</span>
          <span className="text-sm font-semibold text-purple-600">
            {getRadiusLabel(value)}
          </span>
          <span className="text-xs text-gray-500">30 km</span>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        {value === 0
          ? 'La recherche sera limitée strictement à la commune sélectionnée'
          : `La recherche s'étendra dans un rayon de ${value} km autour de la zone`}
      </p>
    </div>
  );
}

