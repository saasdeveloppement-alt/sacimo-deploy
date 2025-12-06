'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, MapPin, Home, Ruler, Euro, Bed, Waves, TreePine, Eye, Car } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import type { LocalisationHints } from '@/types/localisation';

interface HintsPanelProps {
  onHintsChange?: (hints: LocalisationHints) => void;
}

export default function HintsPanel({ onHintsChange }: HintsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hints, setHints] = useState<LocalisationHints>({
    caracteristiques: {},
  });

  const updateHints = (updates: Partial<LocalisationHints>) => {
    const newHints = { ...hints, ...updates };
    setHints(newHints);
    onHintsChange?.(newHints);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className=""
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-purple-600" />
          Indices complémentaires
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      <p className="text-sm text-gray-600 mb-6">
        Plus vous donnez d'indices, plus la localisation sera précise
      </p>

      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <div className="space-y-6">
          {/* Localisation */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Localisation
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700">Code postal</Label>
                <Input
                  value={hints.codePostal || ''}
                  onChange={(e) => updateHints({ codePostal: e.target.value })}
                  placeholder="Ex: 75001"
                  maxLength={5}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div>
                <Label className="text-gray-700">Ville</Label>
                <Input
                  value={hints.ville || ''}
                  onChange={(e) => updateHints({ ville: e.target.value })}
                  placeholder="Ex: Paris"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Type de bien */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Home className="w-4 h-4" />
              Type de bien
            </h4>
            <Select
              value={hints.typeBien || ''}
              onValueChange={(value) => updateHints({ typeBien: value as any })}
            >
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appartement">Appartement</SelectItem>
                <SelectItem value="maison">Maison</SelectItem>
                <SelectItem value="terrain">Terrain</SelectItem>
                <SelectItem value="commerce">Commerce</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Surface */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Surface (m²)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Min</Label>
                <Input
                  type="number"
                  value={hints.surfaceMin || ''}
                  onChange={(e) => updateHints({ surfaceMin: parseInt(e.target.value) || undefined })}
                  placeholder="0"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div>
                <Label className="text-gray-300">Max</Label>
                <Input
                  type="number"
                  value={hints.surfaceMax || ''}
                  onChange={(e) => updateHints({ surfaceMax: parseInt(e.target.value) || undefined })}
                  placeholder="0"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Prix */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Euro className="w-4 h-4" />
              Prix (€)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Min</Label>
                <Input
                  type="number"
                  value={hints.prixMin || ''}
                  onChange={(e) => updateHints({ prixMin: parseInt(e.target.value) || undefined })}
                  placeholder="0"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div>
                <Label className="text-gray-300">Max</Label>
                <Input
                  type="number"
                  value={hints.prixMax || ''}
                  onChange={(e) => updateHints({ prixMax: parseInt(e.target.value) || undefined })}
                  placeholder="0"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Nombre de pièces */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Bed className="w-4 h-4" />
              Nombre de pièces
            </h4>
            <Select
              value={hints.pieces?.toString() || ''}
              onValueChange={(value) => updateHints({ pieces: parseInt(value) || undefined })}
            >
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 pièce</SelectItem>
                <SelectItem value="2">2 pièces</SelectItem>
                <SelectItem value="3">3 pièces</SelectItem>
                <SelectItem value="4">4 pièces</SelectItem>
                <SelectItem value="5">5+ pièces</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Caractéristiques */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-300">Caractéristiques</h4>
            <div className="space-y-3">
              {[
                { key: 'piscine', label: 'Piscine', icon: Waves },
                { key: 'jardin', label: 'Jardin', icon: TreePine },
                { key: 'vueMer', label: 'Vue mer', icon: Eye },
                { key: 'balcon', label: 'Balcon', icon: Eye },
                { key: 'parking', label: 'Parking', icon: Car },
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center gap-3">
                  <Checkbox
                    checked={hints.caracteristiques?.[key as keyof typeof hints.caracteristiques] || false}
                    onCheckedChange={(checked) =>
                      updateHints({
                        caracteristiques: {
                          ...hints.caracteristiques,
                          [key]: checked,
                        },
                      })
                    }
                    className="border-white/20"
                  />
                  <Icon className="w-4 h-4 text-gray-400" />
                  <Label className="text-gray-700 cursor-pointer">{label}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

