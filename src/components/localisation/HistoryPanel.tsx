'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Clock, MapPin, RefreshCw, Trash2 } from 'lucide-react';
import type { LocalisationResult } from '@/types/localisation';

const STORAGE_KEY = 'sacimo_localisation_history';
const MAX_HISTORY = 50;

export default function HistoryPanel() {
  const [history, setHistory] = useState<LocalisationResult[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHistory(parsed.slice(0, MAX_HISTORY));
      } catch (error) {
        console.error('Error parsing history:', error);
      }
    }
  }, []);

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return d.toLocaleDateString('fr-FR');
  };

  const clearHistory = () => {
    if (confirm('Voulez-vous vraiment effacer l\'historique ?')) {
      localStorage.removeItem(STORAGE_KEY);
      setHistory([]);
    }
  };

  const reloadAnalysis = (result: LocalisationResult) => {
    // TODO: Implémenter la reprise d'analyse
    console.log('Reload analysis:', result);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className=""
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <History className="w-5 h-5 text-purple-600" />
          Historique
        </h3>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Effacer l'historique"
          >
            <Trash2 className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Aucune recherche récente</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {history.slice(0, 5).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="relative overflow-hidden rounded-xl bg-white border border-gray-200 p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => reloadAnalysis(item)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30">
                    {item.input.method === 'image' && (
                      <img
                        src={item.input.imageUrl || '/placeholder-image.jpg'}
                        alt="Preview"
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    {item.input.method === 'url' && (
                      <div className="w-12 h-12 rounded bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                    )}
                    {item.input.method === 'text' && (
                      <div className="w-12 h-12 rounded bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {item.hypotheses[0]?.adresse || 'Localisation'}
                      </span>
                      {item.hypotheses[0] && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                          {Math.round(item.hypotheses[0].scoreConfiance)}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(item.timestamp)}</span>
                      {item.hypotheses.length > 1 && (
                        <>
                          <span>•</span>
                          <span>{item.hypotheses.length} hypothèses</span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      reloadAnalysis(item);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Recharger cette analyse"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

// Fonction utilitaire pour sauvegarder dans l'historique
export function saveToHistory(result: LocalisationResult) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const history: LocalisationResult[] = stored ? JSON.parse(stored) : [];
    const newHistory = [result, ...history.filter((h) => h.id !== result.id)].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Error saving to history:', error);
  }
}

