'use client';

import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SearchZone } from '@/types/localisation';

interface ZoneTagProps {
  zone: SearchZone;
  onRemove: () => void;
}

export default function ZoneTag({ zone, onRemove }: ZoneTagProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-300 rounded-lg text-sm font-medium text-gray-900"
    >
      <span>{zone.label}</span>
      {zone.radiusKm > 0 && (
        <span className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded-full">
          ±{zone.radiusKm} km
        </span>
      )}
      <button
        onClick={onRemove}
        className="ml-1 p-0.5 hover:bg-purple-200 rounded-full transition-colors"
        aria-label="Supprimer la zone"
      >
        <X className="w-4 h-4 text-gray-600" />
      </button>
    </motion.div>
  );
}

