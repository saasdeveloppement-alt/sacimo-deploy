/**
 * Composant d'affichage des résultats de localisation
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Image as ImageIcon, Map, Camera, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { PropertyCandidate } from '@/types/localisation-advanced';

interface ResultsDisplayProps {
  candidates: PropertyCandidate[];
}

/**
 * Composant de radar de scores
 */
function ScoreRadar({ scores }: { scores: PropertyCandidate['matchingScore']['details'] }) {
  const maxScore = 100;
  const scoresArray = [
    { label: 'Architecture', value: scores.architectureMatch },
    { label: 'Piscine', value: scores.piscineSimilarity },
    { label: 'Végétation', value: scores.vegetationMatch },
    { label: 'Surface', value: scores.surfaceMatch },
    { label: 'Orientation', value: scores.orientationMatch },
    { label: 'Contexte', value: scores.contextMatch },
  ];

  return (
    <div className="w-32 h-32">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Grille */}
        {[20, 40, 60, 80, 100].map((r) => (
          <circle
            key={r}
            cx="50"
            cy="50"
            r={r / 2}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
        ))}
        {/* Axes */}
        {scoresArray.map((_, i) => {
          const angle = (i * 360) / scoresArray.length - 90;
          const rad = (angle * Math.PI) / 180;
          return (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={50 + 50 * Math.cos(rad)}
              y2={50 + 50 * Math.sin(rad)}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          );
        })}
        {/* Polygone des scores */}
        <polygon
          points={scoresArray
            .map((score, i) => {
              const angle = (i * 360) / scoresArray.length - 90;
              const rad = (angle * Math.PI) / 180;
              const r = (score.value / maxScore) * 50;
              return `${50 + r * Math.cos(rad)},${50 + r * Math.sin(rad)}`;
            })
            .join(' ')}
          fill="rgba(139, 92, 246, 0.2)"
          stroke="rgba(139, 92, 246, 0.8)"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

/**
 * Carte visuelle
 */
function VisualCard({
  title,
  icon,
  imageUrl,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  imageUrl: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-purple-400 transition-all hover:shadow-lg"
    >
      <div className="aspect-video bg-gray-100 relative">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-image.png';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 text-white text-sm font-medium">
            {icon}
            <span>{title}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Ligne de détail
 */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}

/**
 * Composant principal
 */
export function ResultsDisplay({ candidates }: ResultsDisplayProps) {
  const [expandedCandidates, setExpandedCandidates] = useState<Set<string>>(new Set());
  const [selectedVisual, setSelectedVisual] = useState<{
    candidateId: string;
    type: 'satellite' | 'streetview' | 'cadastre' | 'orthophoto';
  } | null>(null);

  const toggleDetails = (candidateId: string) => {
    const newExpanded = new Set(expandedCandidates);
    if (newExpanded.has(candidateId)) {
      newExpanded.delete(candidateId);
    } else {
      newExpanded.add(candidateId);
    }
    setExpandedCandidates(newExpanded);
  };

  const openModal = (type: string, candidateId: string) => {
    setSelectedVisual({
      candidateId,
      type: type as any,
    });
  };

  const openInteractiveMap = (coordinates: { lat: number; lng: number }) => {
    const url = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
    window.open(url, '_blank');
  };

  if (candidates.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-12 text-center">
        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Aucun résultat trouvé
        </h3>
        <p className="text-gray-600">
          Essayez d'ajouter plus d'informations (code postal, ville) pour affiner la recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec nombre de résultats */}
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🎯 {candidates.length} adresse{candidates.length > 1 ? 's' : ''} trouvée{candidates.length > 1 ? 's' : ''}
        </h2>
        <p className="text-gray-600">
          Classées par score de correspondance décroissant
        </p>
      </div>

      {/* Liste des candidats */}
      <div className="space-y-4">
        {candidates.map((candidate, index) => {
          const isExpanded = expandedCandidates.has(candidate.id);

          return (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Header du candidat */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Ranking badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-medium mb-3">
                      <Star className="w-4 h-4" />
                      #{index + 1} • Score: {candidate.matchingScore.global}%
                    </div>

                    {/* Adresse */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {candidate.adresse}
                    </h3>
                    <p className="text-gray-600">
                      {candidate.codePostal} {candidate.ville}
                    </p>

                    {/* Parcelles cadastrales */}
                    {candidate.cadastre && candidate.cadastre.parcelles.length > 0 && (
                      <div className="mt-2 text-sm text-gray-500">
                        Parcelles: {candidate.cadastre.parcelles.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Score breakdown */}
                  <div className="ml-4">
                    <ScoreRadar scores={candidate.matchingScore.details} />
                  </div>
                </div>
              </div>

              {/* Explication détaillée */}
              <div className="p-6 bg-gradient-to-r from-purple-50/50 to-blue-50/50">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  Pourquoi cette adresse ?
                </h4>
                <p className="text-gray-700 leading-relaxed">{candidate.explanation}</p>
              </div>

              {/* Visuels */}
              <div className="p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Vue satellite */}
                  <VisualCard
                    title="Vue satellite"
                    icon={<ImageIcon className="w-4 h-4" />}
                    imageUrl={candidate.visuals.satellite.url}
                    onClick={() => openModal('satellite', candidate.id)}
                  />

                  {/* Street View */}
                  {candidate.visuals.streetView && (
                    <VisualCard
                      title="Street View"
                      icon={<Camera className="w-4 h-4" />}
                      imageUrl={candidate.visuals.streetView.url}
                      onClick={() => openModal('streetview', candidate.id)}
                    />
                  )}

                  {/* Cadastre */}
                  {candidate.visuals.cadastre && (
                    <VisualCard
                      title="Plan cadastral"
                      icon={<Map className="w-4 h-4" />}
                      imageUrl={candidate.visuals.cadastre.url}
                      onClick={() => openModal('cadastre', candidate.id)}
                    />
                  )}

                  {/* Orthophoto */}
                  {candidate.visuals.orthophoto && (
                    <VisualCard
                      title="Orthophoto IGN"
                      icon={<ImageIcon className="w-4 h-4" />}
                      imageUrl={candidate.visuals.orthophoto.url}
                      onClick={() => openModal('orthophoto', candidate.id)}
                    />
                  )}
                </div>

                {/* Bouton voir sur carte interactive */}
                <button
                  onClick={() => openInteractiveMap(candidate.coordinates)}
                  className="mt-4 w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Voir sur la carte interactive
                </button>
              </div>

              {/* Détails supplémentaires (collapsible) */}
              <details
                className="border-t border-gray-100"
                open={isExpanded}
                onToggle={() => toggleDetails(candidate.id)}
              >
                <summary className="p-4 cursor-pointer hover:bg-gray-50 text-gray-700 font-medium flex items-center justify-between">
                  <span>Détails techniques</span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </summary>
                <div className="p-6 bg-gray-50 text-sm space-y-2">
                  <DetailRow
                    label="Coordonnées GPS"
                    value={`${candidate.coordinates.lat.toFixed(6)}, ${candidate.coordinates.lng.toFixed(6)}`}
                  />
                  {candidate.cadastre?.surfaceTerrain && (
                    <DetailRow
                      label="Surface terrain"
                      value={`${Math.round(candidate.cadastre.surfaceTerrain)} m²`}
                    />
                  )}
                  {candidate.dvf?.derniereVente && (
                    <>
                      <DetailRow
                        label="Dernière vente"
                        value={new Date(candidate.dvf.derniereVente.date).toLocaleDateString('fr-FR')}
                      />
                      <DetailRow
                        label="Prix"
                        value={`${candidate.dvf.derniereVente.prix.toLocaleString('fr-FR')} €`}
                      />
                    </>
                  )}
                </div>
              </details>
            </motion.div>
          );
        })}
      </div>

      {/* Modal pour les visuels (TODO: Implémenter) */}
      {selectedVisual && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVisual(null)}
        >
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6">
            <p className="text-gray-600">Modal de visualisation (à implémenter)</p>
          </div>
        </div>
      )}
    </div>
  );
}

