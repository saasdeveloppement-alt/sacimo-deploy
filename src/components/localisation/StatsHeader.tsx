'use client';

import { motion } from 'framer-motion';
import { MapPin, Target, Image as ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatsHeaderProps {
  totalLocalized?: number;
  averagePrecision?: number;
  totalAnalyzed?: number;
}

export default function StatsHeader({
  totalLocalized = 127,
  averagePrecision = 87,
  totalAnalyzed = 245,
}: StatsHeaderProps) {
  const [counters, setCounters] = useState({
    localized: 0,
    precision: 0,
    analyzed: 0,
  });

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const timers = [
      setInterval(() => {
        setCounters((prev) => ({
          localized: Math.min(prev.localized + Math.ceil(totalLocalized / steps), totalLocalized),
          precision: Math.min(prev.precision + Math.ceil(averagePrecision / steps), averagePrecision),
          analyzed: Math.min(prev.analyzed + Math.ceil(totalAnalyzed / steps), totalAnalyzed),
        }));
      }, interval),
    ];

    return () => timers.forEach(clearInterval);
  }, [totalLocalized, averagePrecision, totalAnalyzed]);

  const stats = [
    {
      label: 'Biens localisés',
      value: counters.localized,
      icon: MapPin,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Précision moyenne',
      value: `${counters.precision}%`,
      icon: Target,
      gradient: 'from-cyan-400 to-blue-500',
    },
    {
      label: 'Images analysées',
      value: counters.analyzed,
      icon: ImageIcon,
      gradient: 'from-violet-500 to-indigo-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Localisation IA
          </h1>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 text-sm font-medium">
              IA Active
            </span>
            <span className="text-gray-400 text-sm">•</span>
            <span className="text-gray-300 text-sm">Analyse en temps réel</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6 shadow-2xl shadow-purple-500/10"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.gradient} mb-4 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

